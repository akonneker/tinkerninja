import type { Point } from './curves';
import type { Geometry } from './geometry';
export const gravity = 9.81;
export const physicsPages = [
  {
    id: 'brachistochrone',
    title: 'Brachistochrone: the fastest descent',
    summary:
      'Race beads along a cycloid, a straight ramp, and a parabola between the same endpoints.',
  },
  {
    id: 'catenary-parabola',
    title: 'From catenary to parabola',
    summary:
      'Change the load on a hanging cable and watch its equilibrium shape change.',
  },
  {
    id: 'ballistics',
    title: 'A cannon, gravity & air',
    summary:
      'Launch a projectile, compare two flight models, and meet the calculations behind early computers.',
  },
];
// A symmetric cable: y'' = lambda[(1-m) sqrt(1+y'^2) + m].
// Shoot from the lowest point y(0)=y'(0)=0; choose lambda to hold the sag fixed.
export function cableShape(mix: number, sag: number, count = 240) {
  function integrate(lambda: number, keep = false) {
    let y = 0,
      p = 0;
    const h = 1 / count,
      points: Point[] = [{ x: 0, y: 0, t: 0, segment: 0 }];
    const f = (v: number) => lambda * ((1 - mix) * Math.hypot(1, v) + mix);
    for (let i = 1; i <= count; i++) {
      const k1 = f(p),
        k2 = f(p + (h * k1) / 2),
        k3 = f(p + (h * k2) / 2),
        k4 = f(p + h * k3);
      y +=
        (h *
          (p +
            2 * (p + (h * k1) / 2) +
            2 * (p + (h * k2) / 2) +
            (p + h * k3))) /
        6;
      p += (h * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
      if (keep) points.push({ x: i * h, y, t: i * h, segment: 0 });
    }
    return { y, points };
  }
  let lo = 0,
    hi = 2 * sag;
  for (let i = 0; i < 42; i++) {
    const mid = (lo + hi) / 2;
    if (integrate(mid).y > sag) hi = mid;
    else lo = mid;
  }
  const lambda = (lo + hi) / 2,
    half = integrate(lambda, true).points;
  return {
    lambda,
    points: [
      ...half
        .slice(1)
        .reverse()
        .map((p) => ({ ...p, x: -p.x, t: -p.t })),
      ...half,
    ],
  };
}
export type LaunchSettings = { speed: number; angle: number; drag: number };
export function trajectory(
  { speed, angle, drag }: LaunchSettings,
  dt = 0.01,
): Point[] {
  const theta = (angle * Math.PI) / 180;
  let state = [0, 1, speed * Math.cos(theta), speed * Math.sin(theta)],
    t = 0;
  const points: Point[] = [{ x: 0, y: 1, t: 0, segment: 0 }];
  const derivative = (s: number[]) => {
    const v = Math.hypot(s[2], s[3]);
    return [s[2], s[3], -drag * v * s[2], -gravity - drag * v * s[3]];
  };
  const add = (a: number[], b: number[], f: number) =>
    a.map((v, i) => v + f * b[i]);
  for (let i = 0; i < 20000; i++) {
    const k1 = derivative(state),
      k2 = derivative(add(state, k1, dt / 2)),
      k3 = derivative(add(state, k2, dt / 2)),
      k4 = derivative(add(state, k3, dt));
    const next = state.map(
      (v, j) => v + (dt * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])) / 6,
    );
    if (next[1] <= 0) {
      const fraction = state[1] / (state[1] - next[1]);
      points.push({
        x: state[0] + fraction * (next[0] - state[0]),
        y: 0,
        t: t + fraction * dt,
        segment: 0,
      });
      break;
    }
    t += dt;
    state = next;
    points.push({ x: state[0], y: state[1], t, segment: 0 });
  }
  return points;
}
export function atTime(points: Point[], t: number): Point {
  if (t <= points[0].t) return points[0];
  if (t >= points[points.length - 1].t) return points[points.length - 1];
  let lo = 1,
    hi = points.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (points[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  const p = points[lo - 1],
    q = points[lo],
    f = (t - p.t) / (q.t - p.t);
  return { x: p.x + f * (q.x - p.x), y: p.y + f * (q.y - p.y), t, segment: 0 };
}
export function onPath(g: Geometry, progress: number): Point {
  const target = Math.max(0, Math.min(1, progress)) * g.length;
  let lo = 1,
    hi = g.points.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (g.distances[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const p = g.points[lo - 1],
    q = g.points[lo],
    f =
      (target - g.distances[lo - 1]) /
      (g.distances[lo] - g.distances[lo - 1] || 1);
  return {
    x: p.x + f * (q.x - p.x),
    y: p.y + f * (q.y - p.y),
    t: p.t + f * (q.t - p.t),
    segment: 0,
  };
}

// Frictionless point beads released from rest, with y measured upward.
export function descentTracks(width: number, drop: number, count = 600) {
  let lo = 1e-6,
    hi = 2 * Math.PI - 1e-6;
  for (let i = 0; i < 60; i++) {
    const a = (lo + hi) / 2;
    if ((a - Math.sin(a)) / (1 - Math.cos(a)) < width / drop) lo = a;
    else hi = a;
  }
  const theta = (lo + hi) / 2,
    radius = drop / (1 - Math.cos(theta));
  const lineTime = Math.sqrt(
    (2 * (width * width + drop * drop)) / (gravity * drop),
  );
  const cycloid: Point[] = [],
    line: Point[] = [],
    parabola: Point[] = [];
  // Set u=q² to remove the integrable release-from-rest singularity.
  const rate = (q: number) =>
    (2 * Math.hypot(width, 2 * drop * (1 - q * q))) /
    Math.sqrt(2 * gravity * drop * (2 - q * q));
  let time = 0;
  for (let i = 0; i <= count; i++) {
    const q = i / count,
      u = q * q,
      a = theta * q;
    cycloid.push({
      x: radius * (a - Math.sin(a)),
      y: -radius * (1 - Math.cos(a)),
      t: a * Math.sqrt(radius / gravity),
      segment: 0,
    });
    line.push({ x: width * u, y: -drop * u, t: lineTime * q, segment: 0 });
    if (i)
      time +=
        (rate((i - 1) / count) + 4 * rate((i - 0.5) / count) + rate(q)) /
        (6 * count);
    parabola.push({
      x: width * u,
      y: -drop * (2 * u - u * u),
      t: time,
      segment: 0,
    });
  }
  return { radius, theta, cycloid, line, parabola };
}
