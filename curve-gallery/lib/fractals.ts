import type { Point } from './curves';
type XY = [number, number];
function turtle(
  axiom: string,
  rules: Record<string, string>,
  depth: number,
  angle: number,
): XY[] {
  let word = axiom;
  for (let n = 0; n < depth; n++)
    word = Array.from(word, (c) => rules[c] ?? c).join('');
  let x = 0,
    y = 0,
    h = 0;
  const p: XY[] = [[x, y]];
  for (const c of word) {
    if (c === 'F') {
      x += Math.cos(h);
      y += Math.sin(h);
      p.push([x, y]);
    } else if (c === '+') h += angle;
    else if (c === '-') h -= angle;
  }
  return p;
}
function normalize(p: XY[]): XY[] {
  let xmin = Infinity,
    xmax = -Infinity,
    ymin = Infinity,
    ymax = -Infinity;
  for (const [x, y] of p) {
    xmin = Math.min(xmin, x);
    xmax = Math.max(xmax, x);
    ymin = Math.min(ymin, y);
    ymax = Math.max(ymax, y);
  }
  const d = Math.max(xmax - xmin, ymax - ymin, 1e-10);
  return p.map(([x, y]) => [(x - xmin) / d, (y - ymin) / d]);
}
function hilbert(n: number): XY[] {
  const side = 2 ** n;
  return Array.from({ length: side * side }, (_, d) => {
    let x = 0,
      y = 0,
      t = d;
    for (let s = 1; s < side; s *= 2) {
      const rx = 1 & (t >> 1),
        ry = 1 & (t ^ rx);
      if (ry === 0) {
        if (rx === 1) {
          x = s - 1 - x;
          y = s - 1 - y;
        }
        [x, y] = [y, x];
      }
      x += s * rx;
      y += s * ry;
      t = Math.floor(t / 4);
    }
    return [(x + 0.5) / side, (y + 0.5) / side];
  });
}
function triangular(a: XY, b: XY, c: XY, n: number): XY[] {
  if (n === 0) return [a, b];
  const m: XY = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return [
    ...triangular(a, c, m, n - 1).slice(0, -1),
    ...triangular(c, b, m, n - 1),
  ];
}
function cantor(n: number): XY[] {
  if (n === 0)
    return [
      [0, 0],
      [1, 1],
    ];
  const prev = cantor(n - 1);
  return [
    ...prev.map(([x, y]): XY => [x / 3, y / 2]),
    ...prev.map(([x, y]): XY => [(x + 2) / 3, (y + 1) / 2]),
  ];
}
export function maximumOrder(id: string): number {
  return id === 'peano'
    ? 4
    : id.startsWith('koch')
      ? 5
      : id === 'sierpinski-knopp'
        ? 12
        : 6;
}
export function fractalPoints(id: string, depth: number, a: number): Point[] {
  const n = Math.max(0, Math.min(maximumOrder(id), Math.round(depth)));
  let p: XY[] = [];
  if (n === 0) {
    p =
      id === 'koch-snowflake'
        ? normalize(turtle('F--F--F', {}, 0, Math.PI / 3))
        : id === 'moore'
          ? [
              [0, 0],
              [0, 1],
              [1, 1],
              [1, 0],
              [0, 0],
            ]
          : id === 'sierpinski-knopp' ||
              id === 'peano' ||
              id === 'lebesgue' ||
              id === 'cantor'
            ? [
                [0, 0],
                [1, 1],
              ]
            : [
                [0, 0],
                [1, 0],
              ];
  } else if (id === 'hilbert') p = hilbert(n);
  else if (id === 'peano')
    p = normalize(
      turtle(
        'X',
        { X: 'XFYFX+F+YFXFY-F-XFYFX', Y: 'YFXFY-F-XFYFX+F+YFXFY' },
        Math.min(n, 4),
        Math.PI / 2,
      ),
    );
  else if (id === 'moore') {
    p = normalize(
      turtle(
        'LFL+F+LFL',
        { L: '-RF+LFL+FR-', R: '+LF-RFR-FL+' },
        n - 1,
        Math.PI / 2,
      ),
    );
    p.push(p[0]);
  } else if (id === 'sierpinski-knopp')
    p = triangular([0, 0], [1, 1], [0, 1], n);
  else if (id === 'koch' || id === 'koch-snowflake')
    p = normalize(
      turtle(
        id === 'koch' ? 'F' : 'F--F--F',
        { F: 'F+F--F+F' },
        Math.min(n, 5),
        Math.PI / 3,
      ),
    );
  else if (id === 'cantor') p = cantor(n);
  else if (id === 'lebesgue') {
    const points: Point[] = [];
    for (let i = 0; i < 4 ** n; i++) {
      let x = 0,
        y = 0,
        t = 0;
      for (let j = 0; j < 2 * n; j++) {
        const digit = (i >> (2 * n - j - 1)) & 1;
        t += (2 * digit) / 3 ** (j + 1);
        if (j % 2 === 0) x += digit / 2 ** (Math.floor(j / 2) + 1);
        else y += digit / 2 ** (Math.floor(j / 2) + 1);
      }
      points.push(
        { x: a * x, y: a * y, t, segment: 0 },
        {
          x: a * (x + 2 ** -n),
          y: a * (y + 2 ** -n),
          t: t + 3 ** (-2 * n),
          segment: 0,
        },
      );
    }
    return points;
  }
  return p.map(([x, y], i) => ({
    x: a * x,
    y: a * y,
    t: id === 'cantor' ? x : i / (p.length - 1),
    segment: 0,
  }));
}
