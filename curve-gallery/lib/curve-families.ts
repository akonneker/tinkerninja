import { curves } from './curves';
import type { Curve } from './curves';
import { configureCurve, defaultFigures, rollingState } from './curve-controls';
export type FamilyId =
  | 'rolling'
  | 'conics'
  | 'lissajous'
  | 'roses'
  | 'limacons'
  | 'spirals'
  | 'fractals';
export type CurveFamily = {
  id: FamilyId;
  title: string;
  summary: string;
  mechanism: string;
  history: string;
  uses: string;
  source: string;
  members: string[];
  thumbnail: string;
};
const mac = 'https://mathshistory.st-andrews.ac.uk/Curves/';
export const curveFamilies: CurveFamily[] = [
  {
    id: 'rolling',
    title: 'Rolling circles',
    thumbnail: 'astroid',
    summary: 'One rolling circle, a whole family of cycloids and trochoids.',
    mechanism:
      'Keep the fixed radius R at 1 and vary the rolling radius r. Inside motion produces hypocycloids; outside motion produces epicycloids. A point on the rim has d/r = 1. Moving it away from the rim gives a trochoid. A circle rolling along a line produces the ordinary cycloid and its curtate or prolate relatives.',
    history:
      'Dürer, Huygens, the Bernoullis, and Euler all studied rolling-circle curves. Their apparently different named shapes share the same no-slip construction.',
    uses: 'These constructions connect gear geometry, linkage design, and drawing mechanisms. The radius ratio determines how many turns are needed to close a figure; rational ratios close, while irrational ratios do not.',
    source: mac + 'Hypocycloid/',
    members: [
      'cycloid',
      'trochoid',
      'hypocycloid',
      'hypotrochoid',
      'epicycloid',
      'epitrochoid',
      'astroid',
      'deltoid',
      'cardioid',
      'nephroid',
    ],
  },
  {
    id: 'conics',
    title: 'Conic sections',
    thumbnail: 'ellipse',
    summary: 'Travel from circle to ellipse, parabola, and hyperbola.',
    mechanism:
      'Eccentricity e unites the conics. A circle has e = 0, an ellipse 0 < e < 1, a parabola e = 1, and a hyperbola e > 1. Here the focus is the origin and the semi-latus rectum is 1 before scaling. The polar equation r = a/(1 + e cos t) shows how the same relation changes shape.',
    history:
      'Ancient Greek geometers developed conic sections, and Apollonius gave the parabola its name. The focus and directrix later provided another way to characterize these curves.',
    uses: 'Conics describe idealized orbits and reflective surfaces. Changing e separates bounded ellipses from unbounded parabolic and hyperbolic paths.',
    source: mac + 'Parabola/',
    members: [
      'circle',
      'ellipse',
      'parabola',
      'hyperbola',
      'rectangular-hyperbola',
    ],
  },
  {
    id: 'lissajous',
    title: 'Lissajous figures',
    thumbnail: 'lissajous',
    summary: 'Combine two oscillations by frequency, phase, and amplitude.',
    mechanism:
      'One sine wave controls x and another controls y. Integer frequency ratios close the path; relative phase changes the crossings and symmetry. Equal frequencies give ellipses, with a circle as a special case and a line when the oscillations are in phase.',
    history:
      'Nathaniel Bowditch considered these figures in 1815; Jules-Antoine Lissajous studied them independently in greater detail in 1857.',
    uses: 'They make frequency ratios and phase differences visible, notably when comparing signals on an oscilloscope.',
    source: mac + 'Lissajous/',
    members: ['lissajous', 'circle', 'ellipse'],
  },
  {
    id: 'roses',
    title: 'Polar roses',
    thumbnail: 'rose',
    summary: 'Change one frequency to grow a different number of petals.',
    mechanism:
      'In r = a cos(kt), the radial distance oscillates as the angle turns. For positive integer k, odd values produce k petals and even values produce 2k. The four-petal case is the quadrifolium, up to rotation; k = 1 traces a circle.',
    history:
      'Guido Grandi named rhodonea curves in the 1720s for their resemblance to roses. Their simple equations make rotational symmetry especially clear.',
    uses: 'Roses are useful for studying polar coordinates, symmetry, and repeating decorative paths. Negative radial values are part of the construction, not gaps in the curve.',
    source: mac + 'Rhodonea/',
    members: ['rose', 'quadrifolium', 'circle'],
  },
  {
    id: 'limacons',
    title: 'Limaçons & cardioids',
    thumbnail: 'limacon',
    summary: 'Watch an oval develop a dimple, a cusp, then an inner loop.',
    mechanism:
      'The polar family r = a(1 + k cos t) has a constant part and an oscillating part. k = 0 is a circle; 0 < k ≤ 0.5 is convex; 0.5 < k < 1 is dimpled; k = 1 makes the cardioid cusp; k > 1 creates an inner loop.',
    history:
      'The limaçon is associated with Étienne Pascal and was named by Roberval, although Dürer had already described a construction. Its name refers to a snail-like form.',
    uses: 'The family connects polar patterns, circle-based constructions, and caustics. The cardioid also appears in the rolling-circle explorer as an epicycloid with equal radii.',
    source: mac + 'Limacon/',
    members: ['limacon', 'cardioid', 'circle'],
  },
  {
    id: 'spirals',
    title: 'Spiral growth laws',
    thumbnail: 'spiral',
    summary: 'Compare constant spacing, power growth, and exponential growth.',
    mechanism:
      'A spiral is specified by how radius changes with angle. This explorer compares power laws r = a(t/2π)^p with logarithmic growth r = a exp(bt). p = 1 gives the Archimedean spiral, p = 1/2 a Fermat branch, p = −1 the hyperbolic spiral, and p = −1/2 a lituus branch. These are related growth laws, not every curve called a spiral.',
    history:
      'Archimedes studied uniform radial motion combined with rotation. Descartes and Torricelli later investigated the logarithmic spiral; Jacob Bernoulli celebrated its self-similarity.',
    uses: 'Constant turn spacing is useful in winding and toolpaths. Logarithmic growth preserves shape under a change of scale and makes equal angles with radial lines.',
    source: mac + 'Equiangular/',
    members: [
      'spiral',
      'log-spiral',
      'fermat',
      'hyperbolic-spiral',
      'lituus',
      'circle',
    ],
  },
  {
    id: 'fractals',
    title: 'Recursive constructions',
    thumbnail: 'hilbert',
    summary:
      'Compare recursive rules and raise the order of each construction.',
    mechanism:
      'Choose a construction, then change its order on the drawing board. Each increase replaces a coarse path with a more detailed one. Hilbert, Peano, and related constructions approach space-filling limits; Koch curves and other fractals have different limiting geometry. The visible drawing is always a finite approximation.',
    history:
      'Peano and Hilbert showed how continuous curves could fill a region. Sagan’s Space-Filling Curves develops these constructions and their mathematical context.',
    uses: 'Space-filling orders are useful for organizing multidimensional data. Comparing constructions also reveals how local replacement rules determine a global shape.',
    source: 'https://doi.org/10.1007/978-1-4612-0871-6',
    members: curves.filter((c) => c.fractal).map((c) => c.id),
  },
];
export const namedCurve = (id: string): Curve => {
  const c = curves.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown curve: ${id}`);
  return c;
};
export const familiesForCurve = (id: string) =>
  curveFamilies.filter((f) => f.members.includes(id));
export type FamilySettings = typeof defaultFigures & {
  mode: 'inside' | 'outside' | 'line';
  radius: number;
  offset: number;
  eccentricity: number;
  growth: 'power' | 'log';
  exponent: number;
  rate: number;
  construction: string;
};
export const familyDefaults: FamilySettings = {
  ...defaultFigures,
  mode: 'inside',
  radius: 0.25,
  offset: 1,
  eccentricity: 0.6,
  growth: 'power',
  exponent: 1,
  rate: 0.15,
  construction: 'hilbert',
};
export type FamilyPreset = {
  name: string;
  values: Partial<FamilySettings>;
  curve?: string;
};
export const familyPresets: Record<FamilyId, FamilyPreset[]> = {
  rolling: [
    {
      name: 'Astroid',
      curve: 'astroid',
      values: { mode: 'inside', radius: 1 / 4, offset: 1 },
    },
    {
      name: 'Deltoid',
      curve: 'deltoid',
      values: { mode: 'inside', radius: 1 / 3, offset: 1 },
    },
    {
      name: 'Straight line',
      values: { mode: 'inside', radius: 1 / 2, offset: 1 },
    },
    {
      name: 'Cardioid',
      curve: 'cardioid',
      values: { mode: 'outside', radius: 1, offset: 1 },
    },
    {
      name: 'Nephroid',
      curve: 'nephroid',
      values: { mode: 'outside', radius: 1 / 2, offset: 1 },
    },
    {
      name: 'Cycloid',
      curve: 'cycloid',
      values: { mode: 'line', radius: 1, offset: 1 },
    },
    {
      name: 'Hypocycloid',
      curve: 'hypocycloid',
      values: { mode: 'inside', radius: 0.2, offset: 1 },
    },
    {
      name: 'Hypotrochoid',
      curve: 'hypotrochoid',
      values: { mode: 'inside', radius: 0.4, offset: 1.5 },
    },
    {
      name: 'Epicycloid',
      curve: 'epicycloid',
      values: { mode: 'outside', radius: 0.2, offset: 1 },
    },
    {
      name: 'Epitrochoid',
      curve: 'epitrochoid',
      values: { mode: 'outside', radius: 1 / 3, offset: 2 },
    },
    {
      name: 'Trochoid',
      curve: 'trochoid',
      values: { mode: 'line', radius: 1, offset: 1.5 },
    },
  ],
  conics: [
    { name: 'Circle', curve: 'circle', values: { eccentricity: 0 } },
    { name: 'Ellipse', curve: 'ellipse', values: { eccentricity: 0.6 } },
    { name: 'Parabola', curve: 'parabola', values: { eccentricity: 1 } },
    { name: 'Hyperbola', curve: 'hyperbola', values: { eccentricity: 1.5 } },
    {
      name: 'Rectangular hyperbola',
      curve: 'rectangular-hyperbola',
      values: { eccentricity: Math.SQRT2 },
    },
  ],
  lissajous: [
    {
      name: '3:2 weave',
      curve: 'lissajous',
      values: { fx: 3, fy: 2, phase: 90, amplitude: 1 },
    },
    {
      name: 'Circle',
      curve: 'circle',
      values: { fx: 1, fy: 1, phase: 90, amplitude: 1 },
    },
    {
      name: 'Ellipse',
      curve: 'ellipse',
      values: { fx: 1, fy: 1, phase: 90, amplitude: 0.5 },
    },
    { name: 'Line', values: { fx: 1, fy: 1, phase: 0, amplitude: 1 } },
    { name: 'Figure eight', values: { fx: 1, fy: 2, phase: 0, amplitude: 1 } },
  ],
  roses: [1, 2, 3, 4, 5, 8].map((k) => ({
    name:
      k === 1
        ? 'Circle'
        : k === 2
          ? 'Quadrifolium'
          : `${k % 2 ? k : 2 * k} petals`,
    curve: k === 1 ? 'circle' : k === 2 ? 'quadrifolium' : 'rose',
    values: { petals: k },
  })),
  limacons: [
    { name: 'Circle', curve: 'circle', values: { limacon: 0 } },
    { name: 'Convex', values: { limacon: 0.4 } },
    { name: 'Dimpled', values: { limacon: 0.75 } },
    { name: 'Cardioid', curve: 'cardioid', values: { limacon: 1 } },
    { name: 'Inner loop', curve: 'limacon', values: { limacon: 2 } },
  ],
  spirals: [
    {
      name: 'Archimedean',
      curve: 'spiral',
      values: { growth: 'power', exponent: 1 },
    },
    {
      name: 'Fermat',
      curve: 'fermat',
      values: { growth: 'power', exponent: 0.5 },
    },
    {
      name: 'Hyperbolic',
      curve: 'hyperbolic-spiral',
      values: { growth: 'power', exponent: -1 },
    },
    {
      name: 'Lituus',
      curve: 'lituus',
      values: { growth: 'power', exponent: -0.5 },
    },
    {
      name: 'Logarithmic',
      curve: 'log-spiral',
      values: { growth: 'log', rate: 0.15 },
    },
  ],
  fractals: curves
    .filter((c) => c.fractal)
    .map((c) => ({
      name: c.name,
      curve: c.id,
      values: { construction: c.id },
    })),
};
export function initialFamilySettings(
  id: FamilyId,
  curve?: string,
): FamilySettings {
  const choices = curve
    ? familyPresets[id].filter((p) => p.curve === curve)
    : [];
  const preset =
    choices.find((p) =>
      Object.entries(p.values).every(
        ([key, value]) => familyDefaults[key as keyof FamilySettings] === value,
      ),
    ) ?? choices[0];
  return { ...familyDefaults, ...preset?.values };
}
const near = (x: number, y: number) => Math.abs(x - y) < 1e-8;
export function buildFamilyCurve(
  id: FamilyId,
  s: FamilySettings,
): { curve: Curve; matches: string[]; status: string } {
  const family = curveFamilies.find((f) => f.id === id)!;
  let curve = namedCurve(family.thumbnail),
    matches: string[] = [],
    status = '';
  if (id === 'rolling') {
    const r = s.radius,
      d = r * s.offset,
      R = s.mode === 'line' ? 0 : 1;
    let period: number | undefined;
    for (let n = 1; n <= 100; n++)
      if (near(n / r, Math.round(n / r))) {
        period = n;
        break;
      }
    const turns = s.mode === 'line' ? 2 : Math.min(period ?? 12, 12);
    const type =
      s.mode === 'line'
        ? near(s.offset, 1)
          ? 'cycloid'
          : 'trochoid'
        : s.mode === 'inside'
          ? near(s.offset, 1)
            ? 'hypocycloid'
            : 'hypotrochoid'
          : near(s.offset, 1)
            ? 'epicycloid'
            : 'epitrochoid';
    matches = [type];
    if (s.mode !== 'line' && near(d, 0)) matches = ['circle'];
    if (
      s.mode === 'inside' &&
      near(r, 0.5) &&
      !near(s.offset, 1) &&
      !near(d, 0)
    )
      matches = ['ellipse'];
    if (near(s.offset, 1)) {
      if (s.mode === 'inside' && (near(r, 1 / 4) || near(r, 3 / 4)))
        matches.unshift('astroid');
      if (s.mode === 'inside' && (near(r, 1 / 3) || near(r, 2 / 3)))
        matches.unshift('deltoid');
      if (s.mode === 'outside' && near(r, 1)) matches.unshift('cardioid');
      if (s.mode === 'outside' && near(r, 0.5)) matches.unshift('nephroid');
    }
    status =
      s.mode === 'line'
        ? 'Two repeating arches shown; the full path continues along the line.'
        : period && period <= 12
          ? `Closed after ${period} orbit${period === 1 ? '' : 's'} of the rolling center.`
          : `First 12 orbits shown${period ? `; closure requires ${period}` : '; no short closing period found'}.`;
    if (s.mode === 'inside' && near(r, 0.5) && near(s.offset, 1))
      status =
        'Straight-line motion: the Tusi couple. The point travels back and forth along a diameter.';
    curve = {
      ...namedCurve(type),
      id: 'family-rolling',
      name: matches[0] ? namedCurve(matches[0]).name : 'Rolling-circle curve',
      rolling: {
        kind: s.mode,
        fixedRadius: R,
        radius: r,
        offset: d,
        origin: { x: 0, y: 0 },
      },
      settings: {
        fixed_radius: R,
        rolling_radius: r,
        tracing_offset: d,
        rolling_mode: s.mode === 'inside' ? -1 : s.mode === 'outside' ? 1 : 0,
      },
      ranges: [[0, 2 * Math.PI * turns]],
      sampleCount: Math.max(1600, Math.ceil(160 * turns * (1 + R / r))),
      equation:
        s.mode === 'line'
          ? `x = a(${r}t − ${d} sin t); y = a(${r} − ${d} cos t)`
          : s.mode === 'inside'
            ? 'x = a[(R−r)cos t + d cos((R/r−1)t)]; y = a[(R−r)sin t − d sin((R/r−1)t)]'
            : 'x = a[(R+r)cos t − d cos((R/r+1)t)]; y = a[(R+r)sin t − d sin((R/r+1)t)]',
      fn: () => [0, 0],
      note: `R = ${R}, r = ${r.toFixed(4)}, d/r = ${s.offset}. ${status}`,
    };
    const spec = curve.rolling!;
    curve.fn = (t, a) => {
      const p = rollingState({ ...curve, rolling: spec }, t, a)!.tip;
      return [p.x, p.y];
    };
  } else if (id === 'conics') {
    const e = s.eccentricity;
    matches = [
      near(e, 0)
        ? 'circle'
        : near(e, 1)
          ? 'parabola'
          : e < 1
            ? 'ellipse'
            : near(e, Math.SQRT2)
              ? 'rectangular-hyperbola'
              : 'hyperbola',
    ];
    const angle = e > 1 ? Math.acos(-1 / e) : Math.PI;
    const ranges: [number, number][] =
      e < 1
        ? [[0, 2 * Math.PI]]
        : near(e, 1)
          ? [[-Math.PI + 0.3, Math.PI - 0.3]]
          : [
              [-angle + 0.12, angle - 0.12],
              [angle + 0.12, 2 * Math.PI - angle - 0.12],
            ];
    status =
      e < 1
        ? 'The complete closed conic is shown.'
        : 'Finite portions shown; the curve extends to infinity. Hyperbola branches remain separate.';
    curve = {
      ...namedCurve(matches[0]),
      id: 'family-conics',
      equation: `r = a/(1 + ${e.toFixed(4)} cos t)`,
      settings: { eccentricity: e },
      ranges,
      fn: (t, a) => {
        const r = a / (1 + e * Math.cos(t));
        return [r * Math.cos(t), r * Math.sin(t)];
      },
      note: status,
    };
  } else if (id === 'lissajous' || id === 'roses' || id === 'limacons') {
    curve = configureCurve(
      namedCurve(
        id === 'roses' ? 'rose' : id === 'limacons' ? 'limacon' : 'lissajous',
      ),
      s,
    );
    matches = [curve.id];
    if (id === 'roses')
      matches = [
        s.petals === 1 ? 'circle' : s.petals === 2 ? 'quadrifolium' : 'rose',
      ];
    if (id === 'limacons')
      matches = [
        near(s.limacon, 0)
          ? 'circle'
          : near(s.limacon, 1)
            ? 'cardioid'
            : 'limacon',
      ];
    if (id === 'lissajous' && s.fx === s.fy && s.phase !== 0 && s.phase !== 180)
      matches.unshift(
        near(s.phase, 90) && near(s.amplitude, 1) ? 'circle' : 'ellipse',
      );
    status = curve.note ?? '';
  } else if (id === 'spirals') {
    const p = s.exponent,
      b = s.rate;
    matches =
      s.growth === 'log'
        ? ['log-spiral']
        : near(p, 1)
          ? ['spiral']
          : near(p, 0.5)
            ? ['fermat']
            : near(p, -1)
              ? ['hyperbolic-spiral']
              : near(p, -0.5)
                ? ['lituus']
                : near(p, 0)
                  ? ['circle']
                  : [];
    status =
      'A finite positive-angle branch is shown. Negative powers exclude the origin; these spiral paths generally continue beyond the drawing.';
    curve = {
      ...namedCurve('spiral'),
      id: 'family-spirals',
      name: matches.length ? namedCurve(matches[0]).name : 'Power-law spiral',
      settings: {
        power: p,
        growth_rate: b,
        logarithmic: s.growth === 'log' ? 1 : 0,
      },
      equation: s.growth === 'log' ? `r = a exp(${b}t)` : `r = a(t/2π)^${p}`,
      ranges: [[p < 0 && s.growth === 'power' ? 0.5 : 0, 6 * Math.PI]],
      fn: (t, a) => {
        const r =
          a *
          (s.growth === 'log'
            ? Math.exp(b * t)
            : p === 0
              ? 1
              : (t / (2 * Math.PI)) ** p);
        return [r * Math.cos(t), r * Math.sin(t)];
      },
      note: status,
    };
  } else {
    curve = namedCurve(s.construction);
    matches = [curve.id];
    status =
      'Choose an order on the drawing board to compare successive finite constructions.';
  }
  if (id !== 'fractals')
    curve = {
      ...curve,
      description: family.summary,
      history: family.history,
      uses: family.uses,
      source: family.source,
      page: 'Family overview',
    };
  return { curve, matches, status };
}
