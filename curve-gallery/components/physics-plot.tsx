'use client';
import { useMemo, useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import type { Point } from '@/lib/curves';
import { measure, nearestProgress, dragProgress } from '@/lib/geometry';
import { onPath } from '@/lib/physics';
export type Projection = {
  x: (n: number) => number;
  y: (n: number) => number;
  scale: number;
};
export function PhysicsPlot({
  paths,
  points,
  progress,
  onChange,
  label,
  unit = '',
  minimumY,
  decoration,
  markers = [],
}: {
  paths: { points: Point[]; color: string; dashed?: boolean }[];
  points: Point[];
  progress: number;
  onChange: (n: number) => void;
  label: string;
  unit?: string;
  minimumY?: number;
  decoration?: (p: Projection) => ReactNode;
  markers?: { point: Point; color: string }[];
}) {
  const svg = useRef<SVGSVGElement>(null),
    session = useRef<{
      x: number;
      y: number;
      progress: number;
      pointerId: number;
      offsetX: number;
      offsetY: number;
    } | null>(null);
  const g = useMemo(() => measure(points), [points]),
    point = onPath(g, progress);
  const projection = useMemo(() => {
    const all = paths.flatMap((p) => p.points);
    let x0 = Infinity,
      x1 = -Infinity,
      y0 = minimumY ?? Infinity,
      y1 = -Infinity;
    for (const p of all) {
      x0 = Math.min(x0, p.x);
      x1 = Math.max(x1, p.x);
      y0 = Math.min(y0, p.y);
      y1 = Math.max(y1, p.y);
    }
    const scale = Math.min(
      530 / Math.max(x1 - x0, 0.1),
      260 / Math.max(y1 - y0, 0.1),
    );
    return {
      x: (n: number) => 320 + (n - (x0 + x1) / 2) * scale,
      y: (n: number) => 175 - (n - (y0 + y1) / 2) * scale,
      scale,
      x0,
      x1,
      y0,
      y1,
    };
  }, [paths, minimumY]);
  const { x, y, scale } = projection;
  function local(e: PointerEvent<SVGSVGElement>) {
    const m = svg.current?.getScreenCTM();
    return m
      ? new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
      : null;
  }
  const ticks = (lo: number, hi: number) =>
    Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);
  return (
    <div className="physics-plot">
      <svg
        ref={svg}
        viewBox="0 0 640 370"
        aria-label={label}
        onPointerDown={(e) => {
          if (e.button !== 0 || session.current) return;
          const p = local(e);
          if (!p) return;
          const handle = (e.target as Element).hasAttribute('data-handle');
          const offsetX = handle ? p.x - x(point.x) : 0,
            offsetY = handle ? p.y - y(point.y) : 0;
          const target = {
            x: (p.x - offsetX - x(0)) / scale,
            y: (y(0) - p.y + offsetY) / scale,
          };
          const next = handle
            ? progress
            : nearestProgress(g, target.x, target.y, progress);
          session.current = {
            ...target,
            progress: next,
            pointerId: e.pointerId,
            offsetX,
            offsetY,
          };
          onChange(next);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const s = session.current,
            p = local(e);
          if (!s || !p || s.pointerId !== e.pointerId) return;
          const target = {
            x: (p.x - s.offsetX - x(0)) / scale,
            y: (y(0) - p.y + s.offsetY) / scale,
          };
          const next = dragProgress(g, s.progress, 0, s, target, 2 / scale);
          session.current = { ...s, ...target, progress: next };
          onChange(next);
        }}
        onPointerUp={(e) => {
          session.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          session.current = null;
        }}
        onLostPointerCapture={() => {
          session.current = null;
        }}
      >
        <rect width="640" height="370" fill="#f7f9fc" />
        {ticks(projection.x0, projection.x1).map((v, i) => (
          <g key={`x${i}`}>
            <line x1={x(v)} x2={x(v)} y1="32" y2="318" stroke="#e0e7f1" />
            <text
              x={x(v)}
              y="343"
              textAnchor="middle"
              fill="#697b91"
              fontSize="13"
            >
              {Math.abs(v) < 0.001 ? 0 : Number(v.toFixed(2))}
            </text>
          </g>
        ))}
        {ticks(projection.y0, projection.y1).map((v, i) => (
          <g key={`y${i}`}>
            <line x1="45" x2="605" y1={y(v)} y2={y(v)} stroke="#e0e7f1" />
            <text
              x="40"
              y={y(v) + 4}
              textAnchor="end"
              fill="#697b91"
              fontSize="13"
            >
              {Math.abs(v) < 0.001 ? 0 : Number(v.toFixed(2))}
            </text>
          </g>
        ))}
        <text x="600" y="365" textAnchor="end" fill="#697b91" fontSize="13">
          x{unit && ` (${unit})`}
        </text>
        <text x="16" y="20" fill="#697b91" fontSize="13">
          y{unit && ` (${unit})`}
        </text>
        {decoration?.(projection)}
        {paths.map((path, i) => (
          <path
            key={i}
            d={path.points
              .map(
                (p, j) =>
                  `${j ? 'L' : 'M'}${x(p.x).toFixed(2)},${y(p.y).toFixed(2)}`,
              )
              .join(' ')}
            fill="none"
            stroke={path.color}
            strokeWidth={path.dashed ? 2 : 3}
            strokeDasharray={path.dashed ? '6 5' : undefined}
          />
        ))}
        {markers.map((m, i) => (
          <circle
            key={i}
            cx={x(m.point.x)}
            cy={y(m.point.y)}
            r="5"
            fill={m.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
        <circle
          cx={x(point.x)}
          cy={y(point.y)}
          r="7"
          fill="#e87051"
          stroke="white"
          strokeWidth="2"
        />
        {/* The SVG trace handle exposes slider keyboard behavior. */}
        <circle
          data-handle="true"
          className="trace-handle"
          cx={x(point.x)}
          cy={y(point.y)}
          r="18"
          fill="transparent"
          tabIndex={0}
          // An SVG handle cannot be an HTML input.
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
          role="slider"
          aria-label="Trace the active curve"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-valuetext={`x ${point.x.toFixed(3)}, y ${point.y.toFixed(3)}`}
          onKeyDown={(e) => {
            const delta =
              e.key === 'ArrowRight' || e.key === 'ArrowUp'
                ? 0.01
                : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
                  ? -0.01
                  : 0;
            if (delta || e.key === 'Home' || e.key === 'End') {
              e.preventDefault();
              onChange(
                e.key === 'Home'
                  ? 0
                  : e.key === 'End'
                    ? 1
                    : Math.max(0, Math.min(1, progress + delta)),
              );
            }
          }}
        />
      </svg>
      <p className="physics-plot-help">
        Drag the orange point or use the slider · equal x / y scale
      </p>
    </div>
  );
}
