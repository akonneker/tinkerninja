import type { Curve, Point } from './curves';
export type Geometry = { points: Point[]; distances: number[]; length: number };
export function measure(points: Point[]): Geometry {
  const distances = [0];
  for (let i = 1; i < points.length; i++) {
    const p = points[i],
      q = points[i - 1];
    distances.push(
      distances[i - 1] +
        (p.segment === q.segment ? Math.hypot(p.x - q.x, p.y - q.y) : 0),
    );
  }
  return { points, distances, length: distances[distances.length - 1] ?? 0 };
}
export function pointAt(
  g: Geometry,
  progress: number,
  curve: Curve,
  a: number,
  preferredSegment?: number,
): Point {
  const { points, distances, length } = g;
  const target = Math.max(0, Math.min(1, progress)) * length;
  // Disconnected endpoints share a distance. Preserve the endpoint being dragged.
  if (preferredSegment !== undefined) {
    const endpoint = points.findIndex(
      (p, i) =>
        p.segment === preferredSegment &&
        Math.abs(distances[i] - target) <= length * 1e-12 &&
        (points[i - 1]?.segment !== preferredSegment ||
          points[i + 1]?.segment !== preferredSegment),
    );
    if (endpoint >= 0) return points[endpoint];
  }
  if (progress <= 0) return points[0];
  if (progress >= 1) return points[points.length - 1];
  let lo = 0,
    hi = points.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (distances[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo),
    p = points[i - 1],
    q = points[i];
  if (p.segment !== q.segment) return q;
  const f =
      (target - distances[i - 1]) / (distances[i] - distances[i - 1] || 1),
    t = p.t + f * (q.t - p.t);
  if (curve.fractal)
    return {
      x: p.x + f * (q.x - p.x),
      y: p.y + f * (q.y - p.y),
      t,
      segment: q.segment,
    };
  const [x, y] = curve.fn(t, a);
  return { x, y, t, segment: q.segment };
}
export function nearestProgress(
  g: Geometry,
  x: number,
  y: number,
  current = 0,
): number {
  let best = Infinity,
    progress = current;
  for (let i = 1; i < g.points.length; i++) {
    const p = g.points[i - 1],
      q = g.points[i];
    if (p.segment !== q.segment) continue;
    const dx = q.x - p.x,
      dy = q.y - p.y,
      l = dx * dx + dy * dy;
    if (!l) continue;
    const f = Math.max(0, Math.min(1, ((x - p.x) * dx + (y - p.y) * dy) / l));
    const distance = (x - p.x - f * dx) ** 2 + (y - p.y - f * dy) ** 2;
    const next = (g.distances[i - 1] + f * Math.sqrt(l)) / g.length;
    if (
      distance < best - 1e-12 ||
      (Math.abs(distance - best) < 1e-12 &&
        Math.abs(next - current) < Math.abs(progress - current))
    ) {
      best = distance;
      progress = next;
    }
  }
  return progress;
}

/** Follow the current arc; spatially nearby loops are never drag candidates. */
export function dragProgress(
  g: Geometry,
  current: number,
  segment: number,
  from: { x: number; y: number },
  to: { x: number; y: number },
  maxStep: number,
): number {
  const travel = Math.hypot(to.x - from.x, to.y - from.y);
  if (!travel || !g.length || !(maxStep > 0)) return current;
  const first = g.points.findIndex((p) => p.segment === segment),
    last = g.points.findLastIndex((p) => p.segment === segment);
  if (first < 0 || last <= first) return current;
  const branchStart = g.distances[first],
    branchEnd = g.distances[last],
    branchLength = branchEnd - branchStart;
  if (!branchLength) return current;
  const closed =
    Math.hypot(
      g.points[first].x - g.points[last].x,
      g.points[first].y - g.points[last].y,
    ) <=
    Math.max(1, branchLength) * 1e-10;
  // Subdivide coarse pointer events so they follow the same local path as fine ones.
  const steps = Math.ceil(travel / Math.min(maxStep, branchLength / 4)),
    budget = travel / steps;
  let distanceAlong = current * g.length;
  for (let step = 1; step <= steps; step++) {
    const x = from.x + ((to.x - from.x) * step) / steps,
      y = from.y + ((to.y - from.y) * step) / steps,
      lower = distanceAlong - budget,
      upper = distanceAlong + budget;
    let best = Infinity,
      next = distanceAlong;
    // Adjacent copies of a closed arc make its seam an ordinary interior point.
    // Compare unwrapped distances so the movement budget still applies at the seam.
    for (const offset of closed ? [-branchLength, 0, branchLength] : [0]) {
      const rangeStart = Math.max(branchStart, lower - offset),
        rangeEnd = Math.min(branchEnd, upper - offset);
      if (rangeStart > rangeEnd) continue;
      let lo = first,
        hi = last;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (g.distances[mid] < rangeStart) lo = mid + 1;
        else hi = mid;
      }
      for (let i = Math.max(first + 1, lo); i <= last; i++) {
        const start = g.distances[i - 1],
          end = g.distances[i];
        if (start > rangeEnd) break;
        const p = g.points[i - 1],
          q = g.points[i];
        if (p.segment !== segment || q.segment !== segment || end <= start)
          continue;
        const dx = q.x - p.x,
          dy = q.y - p.y,
          edgeLength = end - start,
          f = Math.max(
            Math.max(0, (rangeStart - start) / edgeLength),
            Math.min(
              Math.min(1, (rangeEnd - start) / edgeLength),
              ((x - p.x) * dx + (y - p.y) * dy) / (dx * dx + dy * dy),
            ),
          ),
          error = (x - p.x - f * dx) ** 2 + (y - p.y - f * dy) ** 2,
          candidate = start + f * edgeLength + offset;
        if (
          error < best ||
          (error === best &&
            Math.abs(candidate - distanceAlong) <
              Math.abs(next - distanceAlong))
        ) {
          best = error;
          next = candidate;
        }
      }
    }
    distanceAlong = next;
    if (closed && (next < branchStart || next > branchEnd)) {
      distanceAlong =
        branchStart +
        ((((next - branchStart) % branchLength) + branchLength) % branchLength);
    }
  }
  return distanceAlong / g.length;
}
export function toCSV(rows: (string | number)[][]): string {
  return (
    rows
      .map((row) =>
        row
          .map((v) =>
            typeof v === 'number' ? String(v) : `"${v.replaceAll('"', '""')}"`,
          )
          .join(','),
      )
      .join('\r\n') + '\r\n'
  );
}
export function curveCSV(
  curve: Curve,
  a: number,
  depth: number,
  g: Geometry,
): string {
  return toCSV([
    [
      'curve',
      'scale_a',
      'fractal_order',
      'branch',
      't',
      'distance_approx',
      'x',
      'y',
      'settings_json',
    ],
    ...g.points.map((p, i) => [
      curve.name,
      a,
      curve.fractal ? depth : '',
      p.segment + 1,
      p.t,
      g.distances[i],
      p.x,
      p.y,
      JSON.stringify(curve.settings ?? {}),
    ]),
  ]);
}

// Convert a parameter position to the same sampled distance used by tracing.
export function progressAtParameter(
  g: Geometry,
  t: number,
  segment = 0,
): number {
  for (let i = 1; i < g.points.length; i++) {
    const p = g.points[i - 1],
      q = g.points[i];
    if (p.segment !== segment || q.segment !== segment) continue;
    if (t >= Math.min(p.t, q.t) && t <= Math.max(p.t, q.t)) {
      const f = (t - p.t) / (q.t - p.t || 1);
      return (
        (g.distances[i - 1] + f * (g.distances[i] - g.distances[i - 1])) /
        g.length
      );
    }
  }
  return t <= g.points[0].t ? 0 : 1;
}
