---
name: ciudad-justa-design
description: Use this skill to generate well-branded interfaces and assets for Ciudad Justa — the civic platform that maps exclusion-by-design (hostile architecture, urban green deficit, missing services) in Spanish cities. Contains the "Contradiseño" design guidelines (dark riso-punk / activist-forensic), colors, type, fonts, assets, and a web UI kit for prototyping. Good for landing pages, dossiers, campaign material, map UIs, slides and throwaway mocks in the Ciudad Justa brand.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and
create static HTML files for the user to view. If working on production code, you can copy
assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_
production code, depending on the need.

## Quick orientation

- **`README.md`** — context, sources, CONTENT FUNDAMENTALS (tone of voice — read this, the
  copy is half the brand), VISUAL FOUNDATIONS, ICONOGRAPHY, and the file index.
- **`colors_and_type.css`** — the single source of truth for tokens (color, type, spacing,
  radii, hard-offset shadows, motifs: `.riso-grain`, `.offset-print`, `.sawtooth`,
  `.reg-mark`, mechanical motion). Link it and add `class="cj"` to your root to inherit the
  semantic defaults.
- **`preview/`** — 16 specimen cards (color, type, spacing, components, brand).
- **`assets/`** — original brand marks (legacy favicon / og-card) for reference.
- **`ui_kits/web/`** — high-fidelity recreation of the redesigned dossier (React + Babel),
  with both visual directions (A · Cartel / C · Editorial) toggleable. Lift components from
  `primitives.jsx` and `Sections.jsx`.

## Non-negotiables (project values → design rules)

- **Dark, raw, radical.** Near-black ink base, flat fluorescent signal inks (red `#FF3B12`,
  yellow `#FFE000`, cyan `#00E5FF`), condensed poster type (Anton), machine mono (Space Mono),
  technical body (Space Grotesk). No serif, no soft glow, no blue-purple gradients, hard 0px
  corners, hard-offset shadows.
- **The enemy is the design and the policy — never the person.** Never write “indigentes”,
  “okupas”, “incívicos”, “limpiar”. Speak of *barriers, exclusion by design, ghost amenities*.
  Spanish (Spain), grave and adult, no emoji in product. Cite every figure.
- **Accessibility is a red line.** WCAG 2.1 AA: ≥4.5:1 text contrast, visible focus
  (yellow ring), keyboard nav, `prefers-reduced-motion`. A tool about inclusion cannot have an
  excluding interface.

When in doubt, match the cards in `preview/` and the components in `ui_kits/web/`.
