import { build } from "vite";
import ts from "typescript";
import { readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
// Zola owns static/; this subtree is generated solely from this workspace.
const base = "/curves/";
const output = resolve(root, "../static/curves");
await build({
  configFile: resolve(root, "standalone/vite.config.ts"),
  base,
  define: {
    "import.meta.env.VITE_CURVE_ATLAS_BASE_PATH": JSON.stringify(
      base === "/" ? "" : base.slice(0, -1),
    ),
  },
  build: { outDir: output, emptyOutDir: true },
});

// Export ordinary JSON as a companion, while executable curve formulas stay
// in the TypeScript modules and compiled browser bundle.
const scratch = await mkdtemp(join(tmpdir(), "curve-atlas-export-"));
try {
  await writeFile(join(scratch, "package.json"), '{"type":"module"}');
  for (const name of [
    "curves",
    "catalog",
    "fractals",
    "curve-controls",
    "curve-families",
    "references",
    "reference-links",
    "physics",
    "geometry",
  ]) {
    const source = await readFile(resolve(root, `lib/${name}.ts`), "utf8");
    const js = ts
      .transpileModule(source, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ES2022,
        },
      })
      .outputText.replace(/from '(\.\/[^']+)'/g, "from '$1.js'");
    await writeFile(join(scratch, `${name}.js`), js);
  }
  const load = (name) => import(pathToFileURL(join(scratch, name + ".js")).href);
  const { curves } = await load("curves");
  const { curveFamilies, familyDefaults, familyPresets } = await load("curve-families");
  const { references, readingForCurve } = await load("references");
  const { wikipediaArticles, people, peopleForCurve } = await load("reference-links");
  const { physicsPages } = await load("physics");
  const { defaultFigures, lissajousPresets } = await load("curve-controls");
  const json = async (name, value) => {
    const path = join(output, "data", name);
    await mkdir(resolve(path, ".."), { recursive: true });
    await writeFile(path, JSON.stringify(value) + "\n");
  };
  await json(
    "curves.json",
    curves.map(({ fn: _fn, ...curve }) => curve),
  );
  await json("families.json", {
    families: curveFamilies,
    defaults: familyDefaults,
    presets: familyPresets,
  });
  await json("references.json", {
    references,
    wikipediaArticles,
    people,
    peopleForCurve,
    readingByCurve: Object.fromEntries(
      [...curves.map((c) => c.id), ...curveFamilies.map((f) => `family-${f.id}`)].map((id) => [
        id,
        readingForCurve(id),
      ]),
    ),
  });
  await json("physics.json", physicsPages);
  await json("controls.json", { defaultFigures, lissajousPresets });
  const routes = [
    "/",
    ...curveFamilies.map((f) => `/families/${f.id}/`),
    "/physics/",
    ...physicsPages.map((p) => `/physics/${p.id}/`),
    "/references/",
  ];
  const html = await readFile(join(output, "index.html"), "utf8");
  for (const route of routes.filter((r) => r !== "/")) {
    await mkdir(join(output, route), { recursive: true });
    await writeFile(join(output, route, "index.html"), html);
  }
  await writeFile(join(output, "404.html"), html);
  await json("manifest.json", {
    schemaVersion: 1,
    basePath: base,
    curveCount: curves.length,
    routes,
    files: ["curves.json", "families.json", "references.json", "physics.json", "controls.json"],
    samples: [],
  });
  console.log(
    `\nStatic atlas: ${output}\n${routes.length} HTML routes; ${curves.length} curve metadata entries. Coordinates are computed in the browser.\nNo server, login, API key, or external script host required.`,
  );
} finally {
  await rm(scratch, { recursive: true, force: true });
}
