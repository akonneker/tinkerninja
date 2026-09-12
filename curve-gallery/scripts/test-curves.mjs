import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
const folder = mkdtempSync(join(tmpdir(), 'curve-atlas-tests-'));
try {
  writeFileSync(join(folder, 'package.json'), '{"type":"module"}');
  for (const name of [
    'curves',
    'catalog',
    'fractals',
    'geometry',
    'curve-controls',
    'curve-families',
    'rolling-map',
    'physics',
  ]) {
    const src = readFileSync(
      new URL(`../lib/${name}.ts`, import.meta.url),
      'utf8',
    );
    const output = ts
      .transpileModule(src, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ES2022,
        },
      })
      .outputText.replace(/from '(\.\/[^']+)'/g, "from '$1.js'");
    writeFileSync(join(folder, name + '.js'), output);
  }
  const { curves, sampleCurve, svgPath } = await import(
    pathToFileURL(join(folder, 'curves.js'))
  );
  const { measure, pointAt, nearestProgress, dragProgress, curveCSV, toCSV } =
    await import(pathToFileURL(join(folder, 'geometry.js')));
  const {
    configureCurve,
    defaultFigures,
    lissajousPresets,
    rollingState,
    rollingSpec,
    rollingBounds,
  } = await import(pathToFileURL(join(folder, 'curve-controls.js')));
  const { maximumOrder } = await import(
    pathToFileURL(join(folder, 'fractals.js'))
  );
  const { progressAtParameter } = await import(
    pathToFileURL(join(folder, 'geometry.js'))
  );
  const byId = (id) => {
    const c = curves.find((c) => c.id === id);
    assert(c, `Missing ${id}`);
    return c;
  };
  const near = (a, b, tol = 1e-7) =>
    assert(Math.abs(a - b) < tol, `${a} differs from ${b}`);
  assert.equal(curves.length, 64);
  assert.equal(new Set(curves.map((c) => c.id)).size, 64);
  for (const c of curves) {
    for (const a of [0.5, 1, 3]) {
      const points = sampleCurve(c, a, 1600, 3),
        g = measure(points);
      assert(points.length >= 2, c.id);
      assert(g.length > 0, c.id);
      for (const p of points)
        assert(
          Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.t),
          `${c.id}: non-finite sample`,
        );
      assert(!/NaN|Infinity/.test(svgPath(points)), c.id);
      assert.equal(
        (svgPath(points).match(/M/g) || []).length,
        new Set(points.map((p) => p.segment)).size,
        `${c.id}: branch joins`,
      );
      for (const s of [0, 0.001, 0.125, 0.5, 0.999, 1]) {
        const p = pointAt(g, s, c, a);
        assert(Number.isFinite(p.x) && Number.isFinite(p.y), c.id);
        if (!c.fractal) {
          const [x, y] = c.fn(p.t, a);
          near(p.x, x);
          near(p.y, y);
        }
      }
      assert.deepEqual(pointAt(g, 0, c, a), points[0]);
      assert.deepEqual(pointAt(g, 1, c, a), points.at(-1));
      const csv = curveCSV(c, a, 3, g);
      assert.equal(csv.trim().split('\r\n').length, points.length + 1);
      assert(csv.startsWith('"curve","scale_a"'));
    }
  }
  const identities = {
    circle: (x, y, a) => x * x + y * y - a * a,
    ellipse: (x, y, a) => (x * x) / (4 * a * a) + (y * y) / (a * a) - 1,
    lemniscate: (x, y, a) => (x * x + y * y) ** 2 - a * a * (x * x - y * y),
    folium: (x, y, a) => x ** 3 + y ** 3 - 3 * a * x * y,
    cissoid: (x, y, a) => y * y * (2 * a - x) - x ** 3,
    strophoid: (x, y, a) => y * y * (a - x) - x * x * (a + x),
    trisectrix: (x, y, a) => x * (x * x + y * y) - a * (y * y - 3 * x * x),
    cassini: (x, y, a) =>
      ((x - a) ** 2 + y * y) * ((x + a) ** 2 + y * y) - (1.2 * a) ** 4,
    lame: (x, y, a) => (x / a) ** 4 + (y / (0.7 * a)) ** 4 - 1,
    kappa: (x, y, a) => y * y * (x * x + y * y) - a * a * x * x,
    piriform: (x, y, a) => a * a * y * y - x ** 3 * (2 * a - x),
    bicorn: (x, y, a) =>
      y * y * (a * a - x * x) - (x * x + 2 * a * y - a * a) ** 2,
    'rectangular-hyperbola': (x, y, a) => x * y - a * a,
  };
  for (const [id, test] of Object.entries(identities))
    for (const a of [0.5, 1, 3])
      for (const p of sampleCurve(byId(id), a, 300))
        near(test(p.x, p.y, a), 0, 2e-7);
  const circle = byId('circle'),
    g = measure(sampleCurve(circle, 1, 4000));
  near(g.length, 2 * Math.PI, 1e-6);
  near(pointAt(g, 0.25, circle, 1).x, 0);
  near(pointAt(g, 0.25, circle, 1).y, 1);
  near(nearestProgress(g, 0, 1), 0.25);
  const separated = measure([
    { x: 0, y: 0, t: 0, segment: 0 },
    { x: 1, y: 0, t: 1, segment: 0 },
    { x: 100, y: 100, t: 2, segment: 1 },
    { x: 101, y: 100, t: 3, segment: 1 },
  ]);
  near(separated.length, 2);
  near(nearestProgress(separated, 100.5, 100), 0.75);
  // Nearby returning arcs must not be selected during an existing drag.
  const hairpin = measure([
    { x: 0, y: 0, t: 0, segment: 0 },
    { x: 10, y: 0, t: 1, segment: 0 },
    { x: 10, y: 0.01, t: 2, segment: 0 },
    { x: 0, y: 0.01, t: 3, segment: 0 },
  ]);
  const start = 2 / hairpin.length;
  assert(nearestProgress(hairpin, 2, 0.01, start) > 0.8);
  near(
    dragProgress(hairpin, start, 0, { x: 2, y: 0 }, { x: 2, y: 0.01 }, 0.02),
    start,
  );
  near(
    dragProgress(hairpin, start, 0, { x: 2, y: 0 }, { x: 8, y: 0 }, 0.02) *
      hairpin.length,
    8,
  );
  near(
    dragProgress(hairpin, start, 0, { x: 2, y: 0 }, { x: 1, y: 0 }, 0.02) *
      hairpin.length,
    1,
  );
  near(
    dragProgress(hairpin, start, 0, { x: 2, y: 5 }, { x: 2, y: 5 }, 0.02),
    start,
  );
  // Even a single large event cannot cross a disconnected branch boundary.
  near(
    dragProgress(
      separated,
      0.25,
      0,
      { x: 0.5, y: 0 },
      { x: 101, y: 100 },
      0.02,
    ),
    0.5,
  );
  near(
    dragProgress(
      separated,
      0.75,
      1,
      { x: 100.5, y: 100 },
      { x: 0, y: 0 },
      0.02,
    ),
    0.5,
  );
  assert.deepEqual(pointAt(separated, 0.5, circle, 1, 0), separated.points[1]);
  assert.deepEqual(pointAt(separated, 0.5, circle, 1, 1), separated.points[2]);
  // Follow both directions through the lemniscate's crossing, including noisy
  // cursor positions nearer the other traversal of the origin.
  const lemniscate = byId('lemniscate'),
    lemniscateGeometry = measure(sampleCurve(lemniscate, 1, 1600));
  for (const direction of [-1, 1]) {
    let t = Math.PI / 2 - direction * 0.2;
    let progress = progressAtParameter(lemniscateGeometry, t);
    let [x, y] = lemniscate.fn(t, 1);
    for (let i = 1; i <= 100; i++) {
      t += direction * 0.004;
      const [cx, cy] = lemniscate.fn(t, 1);
      const target = { x: cx + 0.002, y: cy - 0.001 };
      const next = dragProgress(
        lemniscateGeometry,
        progress,
        0,
        { x, y },
        target,
        0.01,
      );
      assert(
        Math.abs(next - progress) * lemniscateGeometry.length <=
          Math.hypot(target.x - x, target.y - y) + 1e-10,
      );
      assert(
        Math.abs(pointAt(lemniscateGeometry, next, lemniscate, 1).t - t) <
          0.015,
      );
      progress = next;
      ({ x, y } = target);
    }
  }
  // Closed curves wrap in either direction without weakening the local arc budget.
  for (const c of [circle, lemniscate]) {
    const loop = measure(sampleCurve(c, 1, 1600));
    for (const direction of [-1, 1]) {
      for (const initial of [0, 1]) {
        let progress = initial;
        let t = initial * 2 * Math.PI;
        let previous = pointAt(loop, progress, c, 1);
        for (let i = 0; i < 1300; i++) {
          t += direction * 0.01;
          const [x, y] = c.fn(t, 1);
          const next = dragProgress(
            loop,
            progress,
            0,
            previous,
            { x, y },
            0.00625,
          );
          const delta = ((next - progress + 1.5) % 1) - 0.5;
          assert(direction * delta > 0, `${c.id}: stopped or reversed at seam`);
          assert(
            Math.abs(delta) * loop.length <=
              Math.hypot(x - previous.x, y - previous.y) + 1e-9,
          );
          const actual = pointAt(loop, next, c, 1);
          assert(
            Math.hypot(actual.x - x, actual.y - y) < 0.004,
            `${c.id}: drift after repeated wrapping`,
          );
          progress = next;
          previous = { x, y };
        }
      }
    }
  }
  // A closed component wraps within its own distance interval, not other branches.
  const component = measure([
    { x: 0, y: 0, t: 0, segment: 0 },
    { x: 1, y: 0, t: 1, segment: 0 },
    ...[
      [100, 100],
      [101, 100],
      [101, 101],
      [100, 101],
      [100, 100],
    ].map(([x, y], t) => ({ x, y, t, segment: 1 })),
    { x: 200, y: 0, t: 0, segment: 2 },
    { x: 201, y: 0, t: 1, segment: 2 },
  ]);
  near(
    dragProgress(
      component,
      1 / 6,
      1,
      { x: 100, y: 100 },
      { x: 100, y: 100.2 },
      0.01,
    ),
    4.8 / 6,
  );
  near(
    dragProgress(
      component,
      5 / 6,
      1,
      { x: 100, y: 100 },
      { x: 100.2, y: 100 },
      0.01,
    ),
    1.2 / 6,
  );
  // Dense fractal arcs obey the same movement budget, even at maximum order.
  const dense = measure(
    sampleCurve(byId('hilbert'), 1, 100, maximumOrder('hilbert')),
  );
  const densePoint = pointAt(dense, 0.4, byId('hilbert'), 1);
  const denseNext = dragProgress(
    dense,
    0.4,
    0,
    densePoint,
    { x: densePoint.x + 0.2, y: densePoint.y + 0.15 },
    0.00625,
  );
  assert(Math.abs(denseNext - 0.4) * dense.length <= 0.25 + 1e-10);
  for (let n = 1; n <= 6; n++) {
    const p = sampleCurve(byId('hilbert'), 1, 20, n);
    assert.equal(p.length, 4 ** n);
    assert.equal(new Set(p.map((p) => p.x + ',' + p.y)).size, p.length);
    for (let i = 1; i < p.length; i++)
      near(Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y), 1 / 2 ** n);
    const m = sampleCurve(byId('moore'), 1, 20, n);
    assert.equal(m.length, 4 ** n + 1);
    near(m[0].x, m.at(-1).x);
    near(m[0].y, m.at(-1).y);
    assert.equal(
      new Set(m.slice(0, -1).map((p) => p.x.toFixed(8) + ',' + p.y.toFixed(8)))
        .size,
      4 ** n,
    );
    if (n <= 4) {
      const p = sampleCurve(byId('peano'), 1, 20, n);
      assert.equal(p.length, 9 ** n);
      assert.equal(
        new Set(p.map((p) => p.x.toFixed(8) + ',' + p.y.toFixed(8))).size,
        p.length,
      );
      for (let i = 1; i < p.length; i++)
        near(
          Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y),
          1 / (3 ** n - 1),
        );
    }
    for (const id of ['sierpinski-knopp', 'cantor', 'lebesgue']) {
      const p = sampleCurve(byId(id), 1, 20, n);
      for (const q of p)
        assert(
          q.x >= -1e-8 && q.x <= 1 + 1e-8 && q.y >= -1e-8 && q.y <= 1 + 1e-8,
        );
    }
  }
  assert.equal(toCSV([['a,b', 'a"b', -1]]), '"a,b","a""b",-1\r\n');

  // Independent construction checks: the rolling arm meets the curve, circles
  // are tangent, and the material velocity at contact vanishes (no slipping).
  for (const c of curves.filter((c) => c.family === 'Rolling curves')) {
    assert(rollingSpec(c.id), `${c.id}: missing construction`);
    for (const a of [0.5, 1, 3])
      for (const t of [0, 0.1, Math.PI / 2, Math.PI, 5.9]) {
        const r = rollingState(c.id, t, a),
          [x, y] = c.fn(t, a);
        near(r.tip.x, x);
        near(r.tip.y, y);
        near(
          Math.hypot(r.contact.x - r.center.x, r.contact.y - r.center.y),
          r.radius,
        );
        if (r.kind === 'line') near(r.contact.y, 0);
        else
          near(
            Math.hypot(r.contact.x - r.origin.x, r.contact.y - r.origin.y),
            r.fixedRadius,
          );
        const h = 1e-5,
          r0 = rollingState(c.id, t - h, a),
          r1 = rollingState(c.id, t + h, a);
        const vx = (r1.center.x - r0.center.x) / (2 * h),
          vy = (r1.center.y - r0.center.y) / (2 * h),
          omega = (r1.angle - r0.angle) / (2 * h);
        near(vx - omega * (r.contact.y - r.center.y), 0, 1e-7);
        near(vy + omega * (r.contact.x - r.center.x), 0, 1e-7);
        const b = rollingBounds(c, a);
        assert(b.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
      }
  }
  for (const preset of lissajousPresets) {
    const c = configureCurve(byId('lissajous'), {
      ...defaultFigures,
      ...preset,
    });
    for (const a of [0.5, 1, 3]) {
      const p = sampleCurve(c, a, 1600);
      near(p[0].x, p.at(-1).x);
      near(p[0].y, p.at(-1).y);
      for (const q of p) {
        if (preset.name === 'Circle') near(q.x * q.x + q.y * q.y, a * a);
        if (preset.name === 'Ellipse')
          near((q.x / a) ** 2 + (q.y / (a * 0.5)) ** 2, 1);
        if (preset.name === 'Line') near(q.x, q.y);
      }
      const g = measure(p),
        csv = curveCSV(c, a, 3, g);
      assert(csv.includes('settings_json'));
      assert(csv.includes('phase_degrees'));
    }
  }
  for (let fx = 1; fx <= 9; fx++)
    for (let fy = 1; fy <= 9; fy++) {
      const c = configureCurve(byId('lissajous'), {
        ...defaultFigures,
        fx,
        fy,
        phase: 37,
        amplitude: 0.4,
      });
      const end = c.fn(c.ranges[0][1], 1),
        start = c.fn(0, 1);
      near(end[0], start[0]);
      near(end[1], start[1]);
    }
  for (let k = 1; k <= 12; k++) {
    const c = configureCurve(byId('rose'), { ...defaultFigures, petals: k });
    const p = sampleCurve(c, 1, 1000);
    near(p[0].x, p.at(-1).x);
    near(p[0].y, p.at(-1).y);
  }
  const specialCircle = configureCurve(byId('limacon'), {
    ...defaultFigures,
    limacon: 0,
  });
  for (const p of sampleCurve(specialCircle, 2, 100))
    near(p.x * p.x + p.y * p.y, 4);
  for (const c of curves.filter((c) => c.fractal))
    for (let n = c.id === 'moore' ? 1 : 0; n <= maximumOrder(c.id); n++) {
      const p = sampleCurve(c, 1, 100, n),
        g = measure(p);
      assert(g.length > 0, `${c.id}: order ${n}`);
      assert(p.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
      if (c.id === 'sierpinski-knopp') assert.equal(p.length, 2 ** n + 1);
      const mid = pointAt(g, 0.43, c, 1);
      near(progressAtParameter(g, mid.t), 0.43, 1e-5);
    }
  for (const c of curves.filter((c) => c.family === 'Rolling curves')) {
    const g = measure(sampleCurve(c));
    for (const u of [0.02, 0.26, 0.5, 0.99]) {
      const p = pointAt(g, u, c, 1);
      near(progressAtParameter(g, p.t), u);
    }
  }
  const {
    curveFamilies,
    familyPresets,
    familyDefaults,
    buildFamilyCurve,
    initialFamilySettings,
  } = await import(pathToFileURL(join(folder, 'curve-families.js')));
  const {
    parametersAt,
    positionFor,
    radiusLimit,
    mapFrame,
    integerRatioPoints,
  } = await import(pathToFileURL(join(folder, 'rolling-map.js')));
  assert.equal(integerRatioPoints('line').length, 0);
  for (const mode of ['inside', 'outside']) {
    const guides = integerRatioPoints(mode);
    assert(guides.every((guide) => guide.parameters.offset > 0));
    for (const guide of guides) {
      near(1 / guide.parameters.radius, guide.ratio);
      assert(Number.isInteger(guide.ratio));
      assert(
        guide.parameters.radius >= 0.1 &&
          guide.parameters.radius <= radiusLimit(mode),
      );
      const result = buildFamilyCurve('rolling', {
        ...familyDefaults,
        mode,
        ...guide.parameters,
      });
      assert(
        result.status.startsWith('Closed after 1 orbit') ||
          result.status.startsWith('Straight-line motion'),
      );
    }
    assert(guides.some((g) => g.ratio === 7 && g.parameters.offset === 1));
  }
  for (const mode of ['inside', 'outside', 'line']) {
    // Dragging beyond either edge stays within a valid rolling construction.
    assert.deepEqual(parametersAt(-500, -500, mode), {
      radius: 0.1,
      offset: 2,
    });
    assert.deepEqual(parametersAt(1000, 1000, mode), {
      radius: radiusLimit(mode),
      offset: 0,
    });
    const center = parametersAt(
      mapFrame.left + mapFrame.width / 2,
      mapFrame.top + mapFrame.height / 2,
      mode,
    );
    near(center.offset, 1);
    assert(
      Math.abs(center.radius - Math.sqrt(0.1 * radiusLimit(mode))) <= 0.0000005,
    );
    // Equal multiplicative steps have equal spacing; the dense 9:1 and 10:1
    // settings must be separated more than they were on a linear radius axis.
    const x = (radius) => positionFor({ radius, offset: 1 }, mode).x;
    near(x(0.2) - x(0.1), x(0.4) - x(0.2));
    near(x(0.4) - x(0.2), x(0.8) - x(0.4));
    const oldGap = ((1 / 9 - 0.1) / (radiusLimit(mode) - 0.1)) * mapFrame.width;
    assert(x(1 / 9) - x(0.1) > 2 * oldGap);
    for (const radius of [
      0.1,
      1 / 9,
      1 / 7,
      0.2,
      1 / 3,
      0.5,
      radiusLimit(mode),
    ]) {
      const dragged = parametersAt(x(radius), mapFrame.top, mode);
      assert(Math.abs(dragged.radius - radius) <= 0.0000005);
    }
    for (const preset of familyPresets.rolling.filter(
      (p) => p.values.mode === mode,
    )) {
      const point = positionFor(preset.values, mode);
      assert(
        point.x >= mapFrame.left && point.x <= mapFrame.left + mapFrame.width,
      );
      assert(
        point.y >= mapFrame.top && point.y <= mapFrame.top + mapFrame.height,
      );
      const dragged = parametersAt(point.x, point.y, mode);
      assert(Math.abs(dragged.radius - preset.values.radius) <= 0.0005);
      near(dragged.offset, preset.values.offset);
      // Marker selection must retain rational radii instead of rounded drag values.
      const result = buildFamilyCurve('rolling', {
        ...familyDefaults,
        ...preset.values,
      });
      if (preset.curve) assert(result.matches.includes(preset.curve));
    }
  }
  console.log(
    'PASS: rolling parameter-map bounds, axis directions, rim line, and named marker coordinates in all three modes.',
  );
  assert.deepEqual(initialFamilySettings('rolling'), familyDefaults);
  assert.equal(initialFamilySettings('roses', 'rose').petals, 5);
  assert.equal(initialFamilySettings('rolling', 'deltoid').radius, 1 / 3);
  assert.equal(initialFamilySettings('lissajous').phase, 90);
  for (const family of curveFamilies) {
    assert(byId(family.thumbnail));
    for (const member of family.members) assert(byId(member));
    for (const preset of familyPresets[family.id]) {
      const result = buildFamilyCurve(family.id, {
        ...familyDefaults,
        ...preset.values,
      });
      if (preset.curve)
        assert(
          result.matches.includes(preset.curve),
          `${family.id}: ${preset.name} link`,
        );
      const points = sampleCurve(
        result.curve,
        1,
        result.curve.sampleCount ?? 1600,
        3,
      );
      assert(points.length > 1);
      assert(
        points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
        `${family.id}: ${preset.name} invalid geometry`,
      );
      if (family.id === 'rolling' && preset.curve) {
        const canonical = rollingSpec(preset.curve);
        for (const t of [0, 0.31, 1.7, 4.2]) {
          const expected = rollingState(preset.curve, t, 1).tip;
          const divisor = canonical.fixedRadius || 1;
          const [x, y] = result.curve.fn(t, 1);
          near(x, (expected.x - canonical.origin.x) / divisor);
          near(y, (expected.y - canonical.origin.y) / divisor);
        }
      }
    }
  }
  for (const e of [0, 0.6, 0.99, 1, 1.01, Math.SQRT2, 2]) {
    const { curve } = buildFamilyCurve('conics', {
      ...familyDefaults,
      eccentricity: e,
    });
    const pts = sampleCurve(curve, 1, 300);
    for (const { x, y } of pts)
      near((1 - e * e) * x * x + y * y + 2 * e * x - 1, 0, 1e-6);
    assert.equal(new Set(pts.map((p) => p.segment)).size, e > 1 ? 2 : 1);
  }
  for (const mode of ['inside', 'outside', 'line']) {
    for (const radius of [0.1, 0.11, 1 / 3, 0.37, 0.5, 0.73, 0.95]) {
      for (const offset of [0, 0.5, 1, 2]) {
        const { curve } = buildFamilyCurve('rolling', {
          ...familyDefaults,
          mode,
          radius,
          offset,
        });
        for (const p of sampleCurve(curve, 1, 100)) {
          const state = rollingState(curve, p.t, 1);
          near(
            Math.hypot(p.x - state.center.x, p.y - state.center.y),
            radius * offset,
          );
          near(
            Math.hypot(
              state.contact.x - state.center.x,
              state.contact.y - state.center.y,
            ),
            radius,
          );
        }
      }
    }
  }
  const closedRolling = buildFamilyCurve('rolling', {
    ...familyDefaults,
    radius: 0.4,
  }).curve;
  const [ax, ay] = closedRolling.fn(0, 1),
    [bx, by] = closedRolling.fn(closedRolling.ranges[0][1], 1);
  near(ax, bx);
  near(ay, by);
  assert(
    buildFamilyCurve('rolling', {
      ...familyDefaults,
      radius: 0.37,
    }).status.includes('First 12'),
  );
  assert(
    buildFamilyCurve('rolling', {
      ...familyDefaults,
      radius: 0.75,
    }).matches.includes('astroid'),
  );
  assert(
    buildFamilyCurve('rolling', {
      ...familyDefaults,
      radius: 0.5,
      offset: 0.5,
    }).matches.includes('ellipse'),
  );
  assert(
    buildFamilyCurve('spirals', { ...familyDefaults, exponent: 1.25 }).matches
      .length === 0,
  );
  const { cableShape, trajectory, atTime, onPath, gravity } = await import(
    pathToFileURL(join(folder, 'physics.js'))
  );
  for (const sag of [0.2, 0.85, 1.4]) {
    for (const mix of [0, 0.25, 0.5, 0.75, 1]) {
      const { points, lambda } = cableShape(mix, sag);
      near(points[0].y, sag, 1e-8);
      near(points.at(-1).y, sag, 1e-8);
      for (const p of points) {
        near(p.y, atTime(points, -p.x).y, 1e-8);
        if (mix === 0) near(p.y, (Math.cosh(lambda * p.x) - 1) / lambda, 1e-8);
        if (mix === 1) near(p.y, sag * p.x * p.x, 1e-8);
      }
      for (let i = 2; i < points.length - 2; i++) {
        const h = points[i].x - points[i - 1].x;
        const slope = (points[i + 1].y - points[i - 1].y) / (2 * h);
        const curvature =
          (points[i + 1].y - 2 * points[i].y + points[i - 1].y) / (h * h);
        near(
          curvature,
          lambda * ((1 - mix) * Math.hypot(1, slope) + mix),
          0.001,
        );
      }
    }
  }
  const mixed = cableShape(0.5, 1.4),
    cat = cableShape(0, 1.4),
    par = cableShape(1, 1.4);
  assert(
    Math.abs(
      atTime(mixed.points, 0.5).y -
        (atTime(cat.points, 0.5).y + atTime(par.points, 0.5).y) / 2,
    ) > 1e-5,
  );
  for (const speed of [8, 22, 35])
    for (const angle of [10, 45, 80]) {
      const ideal = trajectory({ speed, angle, drag: 0 });
      const vx = speed * Math.cos((angle * Math.PI) / 180),
        vy = speed * Math.sin((angle * Math.PI) / 180);
      const impact = (vy + Math.sqrt(vy * vy + 2 * gravity)) / gravity;
      near(ideal.at(-1).t, impact, 0.0002);
      near(ideal.at(-1).x, vx * impact, 0.003);
      for (const p of ideal.slice(0, -1)) {
        near(p.x, vx * p.t, 1e-8);
        near(p.y, 1 + vy * p.t - (gravity * p.t * p.t) / 2, 1e-8);
      }
      for (const drag of [0.006, 0.012, 0.04]) {
        const path = trajectory({ speed, angle, drag }),
          fine = trajectory({ speed, angle, drag }, 0.005);
        assert(path.every((p) => Number.isFinite(p.x) && p.y >= 0));
        assert.equal(path.at(-1).y, 0);
        assert(path.at(-1).x < ideal.at(-1).x);
        near(path.at(-1).x, fine.at(-1).x, 0.003);
        const g = measure(path);
        assert.deepEqual(atTime(path, 100), path.at(-1));
        near(onPath(g, 0).y, 1);
        near(onPath(g, 1).y, 0);
        for (const f of [0.1, 0.5, 0.9])
          near(progressAtParameter(g, onPath(g, f).t), f);
      }
    }
  const { descentTracks } = await import(
    pathToFileURL(join(folder, 'physics.js'))
  );
  for (const width of [1, 2, 4, 8])
    for (const drop of [0.5, 1, 2, 5]) {
      const race = descentTracks(width, drop),
        end = race.cycloid.at(-1);
      for (const points of [race.cycloid, race.line, race.parabola]) {
        near(points[0].x, 0);
        near(points[0].y, 0);
        near(points[0].t, 0);
        near(points.at(-1).x, width, 1e-8);
        near(points.at(-1).y, -drop, 1e-8);
        assert(
          points.every(
            (p, i) =>
              Number.isFinite(p.t) && p.y <= 0 && (!i || p.t > points[i - 1].t),
          ),
        );
      }
      near(end.t, race.theta * Math.sqrt(race.radius / gravity), 1e-10);
      near(
        race.line.at(-1).t,
        Math.sqrt((2 * (width * width + drop * drop)) / (gravity * drop)),
        1e-10,
      );
      assert(end.t < race.line.at(-1).t);
      assert(end.t < race.parabola.at(-1).t);
      assert(measure(race.cycloid).length > Math.hypot(width, drop));
      near(
        race.parabola.at(-1).t,
        descentTracks(width, drop, 1200).parabola.at(-1).t,
        1e-8,
      );
      for (let i = 1; i < race.cycloid.length - 1; i++) {
        const p = race.cycloid[i - 1],
          q = race.cycloid[i + 1],
          c = race.cycloid[i];
        near(
          Math.hypot(q.x - p.x, q.y - p.y) / (q.t - p.t),
          Math.sqrt(-2 * gravity * c.y),
          0.0002,
        );
      }
    }
  const dipRace = descentTracks(8, 0.5);
  assert(dipRace.theta > Math.PI);
  assert(Math.min(...dipRace.cycloid.map((p) => p.y)) < -0.5);
  console.log(
    'PASS: brachistochrone endpoints, analytic arrival times, energy-consistent motion, faster-than-ramp comparisons, and parabolic quadrature convergence.',
  );
  console.log(
    'PASS: physical cable equilibrium, exact catenary/parabola limits, symmetric fixed supports, mixed-load differential equation; ballistic vacuum solution, ground impacts, drag convergence, and coordinate tracing.',
  );
  console.log(
    'PASS: seven family explorers; all preset links and samples; rolling presets agree with the named constructions up to scale and translation; no-slip tangency across radius and offset ranges; closed and partial orbits; conic equations and branch separation.',
  );
  console.log(
    'PASS: 64 curves at three scales; 13 implicit identities; arc length and nearest-point tracing; continuous dragging through crossings, nearby arcs and disconnected endpoints; bidirectional closed-curve wrapping over multiple laps; branch separation; CSV metadata; Hilbert, Moore and Peano coverage; fractal bounds through maximum order; rolling tangency, no-slip motion and arm positions; Lissajous presets and all 81 frequency ratios; rose and limaçon special cases; parameter/distance round trips.',
  );
} finally {
  rmSync(folder, { recursive: true, force: true });
}
