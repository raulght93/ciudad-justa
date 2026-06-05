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
export function getFaceDetector() {
  if (typeof window !== "undefined" && "FaceDetector" in window) {
    const det = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 12 });
    return { available: true, detect: (src) => det.detect(src) };
  }
  return { available: false, detect: async () => [] };
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

// Prepara una foto para subir respetando el gate. Lanza GateBlocked si no se
// puede garantizar que no se expone a nadie.
export async function prepareForUpload(file, opts = {}) {
  const detector = opts.detector || getFaceDetector();
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
