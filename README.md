# Tinkerninja

This repository is the source of truth for both the Zola site and the Curve Atlas at `/curves/`.

## Build and publish

Use Node.js 22 (22.13 or newer) and Zola 0.20.0. From the repository root:

```sh
npm ci
npm run build
```

The build compiles `curve-gallery/` into `static/curves/`, then Zola creates `public/`. Netlify installs the npm workspace dependencies and runs the same build. Deploy previews also build the atlas before applying the preview base URL. Publishing still happens through the repository's normal Netlify deployment.

`static/curves/`, `public/`, and `node_modules/` are generated and ignored by Git. Commit the source files and root `package-lock.json`; do not manually edit or copy exported atlas files.

## Work on the Curve Atlas

```sh
npm run dev:curves
npm run check:curves
npm run test:curves
npm run build:curves
```

The development server prints its local URL, mounted at `/curves/`. `npm run build:curves` builds the atlas without requiring Zola. To preview the complete site after building the atlas, run `zola serve` from the repository root.

See [the gallery guide](curve-gallery/README.md) for source organization. Future curve work belongs here; the earlier `curve_gallery/site` project is retained only as a historical copy.
