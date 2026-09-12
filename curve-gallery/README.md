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

The generated `static/curves/` contains the complete collection, seven family explorers, three physics explorers, and reference shelf. It includes compact metadata JSON under `data/`. Coordinates are computed in the browser; sampled coordinate files and debugging source maps are omitted. Each route has an `index.html`, so production hosting requires no catch-all redirect. The build replaces this generated subtree.

All runtime assets are local. Reference links point to their original sources; the books themselves are not bundled. An optional `?embed=1` view is still available, but the complete atlas is accessed directly at `/curves/`.
