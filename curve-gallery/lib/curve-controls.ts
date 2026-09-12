import { aligned } from './equations';
import type { Curve, Point } from './curves';
export type FigureSettings = {
  fx: number;
  fy: number;
  phase: number;
  amplitude: number;
  petals: number;
  limacon: number;
};
export const defaultFigures: FigureSettings = {
  fx: 3,
  fy: 2,
  phase: 90,
  amplitude: 1,
  petals: 5,
  limacon: 2,
};
export const lissajousPresets = [
  { name: '3:2 weave', fx: 3, fy: 2, phase: 90, amplitude: 1 },
  { name: 'Circle', fx: 1, fy: 1, phase: 90, amplitude: 1 },
  { name: 'Ellipse', fx: 1, fy: 1, phase: 90, amplitude: 0.5 },
  { name: 'Line', fx: 1, fy: 1, phase: 0, amplitude: 1 },
  { name: 'Figure eight', fx: 1, fy: 2, phase: 0, amplitude: 1 },
];
function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}
export function configureCurve(base: Curve, s: FigureSettings): Curve {
  if (base.id === 'lissajous') {
    const { fx, fy, phase, amplitude } = s,
      phi = (phase * Math.PI) / 180;
    return {
      ...base,
      settings: {
        x_frequency: fx,
        y_frequency: fy,
        phase_degrees: phase,
        y_amplitude_ratio: amplitude,
      },
      equation: `x = a sin(${fx}t + ${phase}°); y = ${amplitude}a sin(${fy}t)`,
      equationTex: aligned(
        String.raw`x&=a\sin\left(${fx}t+\frac{${phase}\pi}{180}\right)`,
        String.raw`y&=${amplitude}a\sin(${fy}t)`,
      ),
      ranges: [[0, (2 * Math.PI) / gcd(fx, fy)]],
      fn: (t, a) => [
        a * Math.sin(fx * t + phi),
        a * amplitude * Math.sin(fy * t),
      ],
      description:
        'Two perpendicular oscillations. Adjust their frequencies, relative phase, and amplitude to discover new figures.',
      note: `Frequency ratio ${fx}:${fy}; phase ${phase}° (${(phi / Math.PI).toFixed(3)}π radians); vertical amplitude ${amplitude}a. The shortest common parameter period is shown.`,
    };
  }
  if (base.id === 'rose') {
    const k = s.petals,
      petalCount = k % 2 ? k : 2 * k;
    return {
      ...base,
      settings: { rose_k: k },
      equation: `r = a cos(${k}t)`,
      equationTex: String.raw`r=a\cos(${k}t)`,
      ranges: [[0, k % 2 ? Math.PI : 2 * Math.PI]],
      fn: (t, a) => [
        a * Math.cos(k * t) * Math.cos(t),
        a * Math.cos(k * t) * Math.sin(t),
      ],
      description: `A ${petalCount}-petal rose formed by a polar cosine. Change k to explore the family.`,
      note: `k = ${k}. Odd k gives k petals; even k gives 2k. The complete figure is shown.`,
    };
  }
  if (base.id === 'limacon') {
    const k = s.limacon,
      shape =
        k === 0
          ? 'circle'
          : k === 1
            ? 'cardioid'
            : k > 1
              ? 'inner loop'
              : k > 0.5
                ? 'dimpled oval'
                : 'convex oval';
    return {
      ...base,
      settings: { limacon_ratio: k },
      equation: `r = a(1 + ${k} cos t)`,
      equationTex: String.raw`r=a(1+${k}\cos t)`,
      fn: (t, a) => [
        a * (1 + k * Math.cos(t)) * Math.cos(t),
        a * (1 + k * Math.cos(t)) * Math.sin(t),
      ],
      description: `This limaçon is a ${shape}. Change the ratio to move between its special cases.`,
      note: `Cosine coefficient ${k}; constant term 1. A ratio of 0 produces a circle, 1 a cardioid, and values above 1 an inner loop.`,
    };
  }
  return base;
}
type XY = { x: number; y: number };
export type RollingSpec = {
  kind: 'inside' | 'outside' | 'line';
  fixedRadius: number;
  radius: number;
  offset: number;
  origin: XY;
};
const specs: Record<string, RollingSpec> = {
  astroid: {
    kind: 'inside',
    fixedRadius: 1,
    radius: 0.25,
    offset: 0.25,
    origin: { x: 0, y: 0 },
  },
  cardioid: {
    kind: 'outside',
    fixedRadius: 0.5,
    radius: 0.5,
    offset: 0.5,
    origin: { x: -0.5, y: 0 },
  },
  cycloid: {
    kind: 'line',
    fixedRadius: 0,
    radius: 1,
    offset: 1,
    origin: { x: 0, y: 0 },
  },
  deltoid: {
    kind: 'inside',
    fixedRadius: 3,
    radius: 1,
    offset: 1,
    origin: { x: 0, y: 0 },
  },
  nephroid: {
    kind: 'outside',
    fixedRadius: 2,
    radius: 1,
    offset: 1,
    origin: { x: 0, y: 0 },
  },
  epicycloid: {
    kind: 'outside',
    fixedRadius: 5,
    radius: 1,
    offset: 1,
    origin: { x: 0, y: 0 },
  },
  hypocycloid: {
    kind: 'inside',
    fixedRadius: 5,
    radius: 1,
    offset: 1,
    origin: { x: 0, y: 0 },
  },
  epitrochoid: {
    kind: 'outside',
    fixedRadius: 3,
    radius: 1,
    offset: 2,
    origin: { x: 0, y: 0 },
  },
  hypotrochoid: {
    kind: 'inside',
    fixedRadius: 5,
    radius: 2,
    offset: 3,
    origin: { x: 0, y: 0 },
  },
  trochoid: {
    kind: 'line',
    fixedRadius: 0,
    radius: 1,
    offset: 1.5,
    origin: { x: 0, y: 0 },
  },
};
export function rollingSpec(curve: string | Curve) {
  return typeof curve === 'string'
    ? specs[curve]
    : (curve.rolling ?? specs[curve.id]);
}
export function rollingState(curve: string | Curve, t: number, a: number) {
  const s = rollingSpec(curve);
  if (!s) return undefined;
  const radius = s.radius * a,
    R = s.fixedRadius * a,
    origin = { x: s.origin.x * a, y: s.origin.y * a };
  const d = s.kind === 'inside' ? R - radius : R + radius;
  const center =
    s.kind === 'line'
      ? { x: radius * t, y: radius }
      : { x: origin.x + d * Math.cos(t), y: origin.y + d * Math.sin(t) };
  const angle =
    s.kind === 'line'
      ? -t - Math.PI / 2
      : s.kind === 'inside'
        ? -(d / radius) * t
        : (d / radius) * t + Math.PI;
  const tip = {
    x: center.x + s.offset * a * Math.cos(angle),
    y: center.y + s.offset * a * Math.sin(angle),
  };
  const rim = {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
  const contact =
    s.kind === 'line'
      ? { x: center.x, y: 0 }
      : { x: origin.x + R * Math.cos(t), y: origin.y + R * Math.sin(t) };
  return {
    center,
    tip,
    rim,
    contact,
    radius,
    fixedRadius: R,
    origin,
    kind: s.kind,
    angle,
  };
}
export function rollingBounds(curve: Curve, a: number): Point[] {
  const s = rollingSpec(curve);
  if (!s) return [];
  const reach =
    s.kind === 'inside' ? s.fixedRadius : s.fixedRadius + 2 * s.radius;
  const range =
    s.kind === 'line'
      ? {
          x0: a * (curve.ranges[0][0] * s.radius - s.radius),
          x1: a * (curve.ranges[0][1] * s.radius + s.radius),
          y0: 0,
          y1: 2 * s.radius * a,
        }
      : {
          x0: (s.origin.x - reach) * a,
          x1: (s.origin.x + reach) * a,
          y0: (s.origin.y - reach) * a,
          y1: (s.origin.y + reach) * a,
        };
  return [
    { x: range.x0, y: range.y0, t: 0, segment: 0 },
    { x: range.x1, y: range.y1, t: 0, segment: 0 },
  ];
}
