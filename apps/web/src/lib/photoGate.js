// Blur-gate de subida de fotos (E1d, docs/03 §3.6 + docs/06 §6.6).
//
// Línea roja: la imagen SIN difuminar nunca sale del dispositivo. El difuminado
// de rostros es un GATE, no una recomendación:
//   · si hay rostro y se puede difuminar → se difumina y se sube;
//   · si hay rostro y NO se puede difuminar → se bloquea (no se sube);
//   · si NO se puede verificar (sin detector) → se bloquea por defecto.
//
// El detector facial es la parte "cara" (modelo ML) y va DESACOPLADO: por
// defecto usa la Shape Detection API del navegador (FaceDetector) si existe;
// si no, el gate falla de forma segura. Se puede inyectar face-api.js/MediaPipe
// en el futuro sin tocar la política.

export class GateBlocked extends Error {
  constructor(message, reason) {
    super(message);
    this.name = "GateBlocked";
    this.reason = reason;
  }
}

// --- Política del gate (pura, testeable sin canvas ni DOM) ---
export function decideGate({ detectorAvailable, faces }) {
  if (!detectorAvailable) return { action: "block", reason: "no-detector" };
  const n = Array.isArray(faces) ? faces.length : 0;
  if (n > 0) return { action: "blur", reason: `faces:${n}` };
  return { action: "upload", reason: "clear" };
}

// --- Detector facial desacoplado ---
// (1) Shape Detection API nativa del navegador (rápida, sin descargas).
export function getFaceDetector() {
  if (typeof window !== "undefined" && "FaceDetector" in window) {
    const det = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 12 });
    return { available: true, detect: (src) => det.detect(src) };
  }
  return { available: false, detect: async () => [] };
}

let _detector; // cache del detector resuelto
// Cadena: API nativa → MediaPipe (lazy, modelo desde CDN) → no disponible.
export async function getDetector() {
  if (_detector) return _detector;
  const native = getFaceDetector();
  if (native.available) { _detector = native; return _detector; }
  try {
    const { FilesetResolver, FaceDetector } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
    const fd = await FaceDetector.createFromOptions(vision, {
      baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite" },
      runningMode: "IMAGE",
    });
    _detector = {
      available: true,
      detect: (canvas) => (fd.detect(canvas).detections || []).map((d) => ({
        boundingBox: { x: d.boundingBox.originX, y: d.boundingBox.originY, width: d.boundingBox.width, height: d.boundingBox.height },
      })),
    };
  } catch {
    _detector = { available: false, detect: async () => [] };
  }
  return _detector;
}

// --- Pipeline (navegador): reencoda (quita EXIF) → detecta → difumina → blob ---
async function toCanvas(file) {
  const bitmap = await createImageBitmap(file); // descarta EXIF/orientación de metadatos
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0);
  return { canvas, ctx, bitmap };
}

function blurBoxes(ctx, canvas, boxes, pad = 0.25) {
  for (const b of boxes) {
    const px = Math.max(0, b.x - b.width * pad);
    const py = Math.max(0, b.y - b.height * pad);
    const pw = Math.min(canvas.width - px, b.width * (1 + pad * 2));
    const ph = Math.min(canvas.height - py, b.height * (1 + pad * 2));
    ctx.save();
    ctx.filter = `blur(${Math.ceil(Math.max(pw, ph) / 6)}px)`;
    // Redibuja sólo la región del rostro, difuminada, sobre sí misma.
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }
}

// Solo reencoda (quita EXIF) sin detección — para la PREVIEW de demo cuando el
// navegador no trae FaceDetector. Marca unverified: hay que difuminar a mano
// antes de publicar.
export async function stripOnly(file) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  return { blob, blurred: false, facesFound: 0, unverified: true };
}

// Prepara una foto para subir respetando el gate. Lanza GateBlocked si no se
// puede garantizar que no se expone a nadie.
export async function prepareForUpload(file, opts = {}) {
  const detector = opts.detector || (await getDetector());
  const { canvas, ctx } = await toCanvas(file);

  let faces = [];
  if (detector.available) {
    try {
      faces = (await detector.detect(canvas)) || [];
    } catch {
      throw new GateBlocked("No se pudo analizar la imagen; la foto no se sube.", "detect-error");
    }
  }

  const decision = decideGate({ detectorAvailable: detector.available, faces });
  if (decision.action === "block") {
    throw new GateBlocked(
      "No se pudo verificar que no aparezcan personas. La foto no se sube; fotografía solo el objeto.",
      decision.reason
    );
  }
  if (decision.action === "blur") {
    blurBoxes(ctx, canvas, faces.map((f) => f.boundingBox));
  }

  const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  return { blob, blurred: decision.action === "blur", facesFound: faces.length };
}
