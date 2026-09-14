# Curve Atlas

This workspace is the authoritative source for Tinkerninja's complete curve gallery, served at `/curves/`. It is a static React/TypeScript app built with Vite; no Sites service, server runtime, login, or API key is required.

Run commands from the repository root:

- `npm ci`: install the versions pinned by the root lockfile.
- `npm run dev:curves`: start the gallery development server at `/curves/`.
- `npm run check:curves`: check TypeScript.
- `npm run test:curves`: verify curve geometry, continuous tracing, special cases, family explorers, fractals, and physics.
- `npm run build:curves`: regenerate `static/curves/`.
- `npm run build`: regenerate the gallery and build the full Zola site.

## Source layout

- `standalone/main.tsx`: browser entry and routes.
- `app/`: collection, physics index, reference shelf, and shared atlas styles.
- `components/`: interactive explorers and the six UI primitives they use.
- `lib/`: equations, geometry, family presets, physics, history, and references.
- `scripts/export-static.mjs`: production bundle, real HTML route files, and compact JSON exports.
- `scripts/test-curves.mjs`: mathematical and interaction-geometry checks.
- `public/favicon.svg`: local icon.

The CSS build scans only atlas pages and components. If adding a UI primitive, update the explicit UI source list in `standalone/styles.css` to include it and its local dependencies.

## Output

Named curve links such as `/curves/?curve=lemniscate` open a dedicated, full-page explorer. The collection uses ordinary links, so browser Back, bookmarks, and opening a curve in a new tab work naturally.

The generated `static/curves/` contains the complete collection, seven family explorers, three physics explorers, and reference shelf. It includes compact metadata JSON under `data/`. Coordinates are computed in the browser; sampled coordinate files and debugging source maps are omitted. Each route has an `index.html`, so production hosting requires no catch-all redirect. The build replaces this generated subtree.

All runtime assets are local. Reference links point to their original sources; the books themselves are not bundled. An optional `?embed=1` view is still available, but the complete atlas is accessed directly at `/curves/`.

## Equations

`lib/equations.ts` contains LaTeX display metadata for the named curves and physics formulas. `equation` retains the plain-text form; `equationTex` supplies the typeset version. Fractal constructions remain prose. When an explorer overrides an equation for changed parameters, update both fields in `lib/curve-controls.ts` or `lib/curve-families.ts`.

`MathEquation` loads KaTeX and its CSS when a formula enters the viewport. All fonts are local WOFF2 files; duplicate legacy formats and source maps are excluded. Wide equations scroll within their panel. The output includes MathML for assistive technology, and plain text remains available while loading or if rendering fails. The formula syntax and dynamic presets are checked by `npm run test:curves`.

Inline equations in explanatory text use `MathText`. The explicit annotations in `lib/prose-math.ts` map readable source phrases to LaTeX, including a narrow set of numeric parameter assignments. The JSON exports remain plain text. Add an annotation for a new prose formula; the tests check curve and family prose for unformatted math and verify that every fallback preserves the original text exactly. Live numeric inputs, coordinate readouts, and SVG axis labels remain native text.
