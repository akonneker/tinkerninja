import { MathText } from '@/components/math-text';
('use client');
import { useId, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { familyPresets } from '@/lib/curve-families';
import type { FamilySettings } from '@/lib/curve-families';
import {
  integerRatioPoints,
  parametersAt,
  positionFor,
  radiusLimit,
} from '@/lib/rolling-map';
import type { RollingParameters } from '@/lib/rolling-map';

export function RollingParameterMap({
  settings,
  onChange,
}: {
  settings: FamilySettings;
  onChange: (value: RollingParameters) => void;
}) {
  const id = useId();
  const pointer = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const presets = familyPresets.rolling.filter(
    (p) => p.values.mode === settings.mode,
  );
  const selected = positionFor(settings, settings.mode);
  const markers = presets.map((preset) => ({
    ...preset,
    parameters: {
      radius: preset.values.radius!,
      offset: preset.values.offset!,
    },
    position: positionFor(
      { radius: preset.values.radius!, offset: preset.values.offset! },
      settings.mode,
    ),
  }));
  const guides = integerRatioPoints(settings.mode)
    .filter(
      (guide) =>
        !markers.some(
          (marker) =>
            Math.abs(marker.parameters.radius - guide.parameters.radius) <
              1e-8 && marker.parameters.offset === guide.parameters.offset,
        ),
    )
    .map((guide) => ({
      ...guide,
      position: positionFor(guide.parameters, settings.mode),
      label: `Radius ratio R:r = ${guide.ratio}:1; tracing distance d/r = ${guide.parameters.offset}`,
    }));
  const active = markers.find(
    (p) =>
      Math.abs(p.parameters.radius - settings.radius) < 1e-8 &&
      Math.abs(p.parameters.offset - settings.offset) < 1e-8,
  );
  function updateFromPointer(e: PointerEvent<SVGSVGElement>, snap: boolean) {
    const matrix = e.currentTarget.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      matrix.inverse(),
    );
    // Measure marker hits in screen pixels, independent of the panel size.
    const near = snap
      ? [
          ...markers.map((m) => ({ ...m, hitRadius: 10 })),
          ...guides.map((g) => ({ ...g, hitRadius: 5 })),
        ]
          .map((m) => {
            const screen = new DOMPoint(
              m.position.x,
              m.position.y,
            ).matrixTransform(matrix);
            return {
              marker: m,
              distance: Math.hypot(screen.x - e.clientX, screen.y - e.clientY),
            };
          })
          .filter((hit) => hit.distance <= hit.marker.hitRadius)
          .sort((a, b) => a.distance - b.distance)[0]
      : undefined;
    onChange(
      near
        ? near.marker.parameters
        : parametersAt(point.x, point.y, settings.mode),
    );
  }
  function finish(e: PointerEvent<SVGSVGElement>, cancelled = false) {
    if (pointer.current !== e.pointerId) return;
    if (!cancelled) updateFromPointer(e, true);
    pointer.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  return (
    <section className="rolling-map" aria-label="Rolling curve parameter map">
      <p id={`${id}-help`} className="family-control-note">
        Drag the orange point to change both parameters. Numbered points select
        exact examples; their names are listed below. Logarithmic radius spacing
        gives smaller wheels more room.
      </p>
      <svg
        className={
          dragging ? 'rolling-map-plot is-dragging' : 'rolling-map-plot'
        }
        viewBox="0 0 400 316"
        // SVG is the graphic itself; an HTML img cannot contain its interactive geometry.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="img"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-help`}
        onPointerDown={(e) => {
          if (e.button !== 0 || pointer.current !== null) return;
          pointer.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          updateFromPointer(e, true);
        }}
        onPointerMove={(e) => {
          if (pointer.current === e.pointerId) updateFromPointer(e, false);
        }}
        onPointerUp={(e) => finish(e)}
        onPointerCancel={(e) => finish(e, true)}
        onLostPointerCapture={() => {
          pointer.current = null;
          setDragging(false);
        }}
      >
        <title
          id={`${id}-title`}
        >{`Rolling radius on a logarithmic horizontal axis; tracing point distance vertically. Current radius ${settings.radius.toFixed(3)}, distance ${settings.offset.toFixed(3)}.`}</title>
        <text className="rolling-map-axis-title" x="48" y="22">
          Tracing distance d / r
        </text>
        <rect x="48" y="38" width="320" height="109" fill="#f4f7fd" />
        <rect x="48" y="147" width="320" height="109" fill="#eef6f4" />
        {[0, 0.5, 1, 1.5, 2].map((v) => {
          const y = positionFor({ radius: 0.1, offset: v }, settings.mode).y;
          return (
            <g key={v}>
              <line
                x1="48"
                x2="368"
                y1={y}
                y2={y}
                stroke={v === 1 ? '#8b9fbb' : '#dce4ee'}
                strokeDasharray={v === 1 ? '5 4' : undefined}
              />
              <text x="38" y={y + 5} textAnchor="end">
                {v}
              </text>
            </g>
          );
        })}
        {[0.1, 0.2, 0.3, 0.5, radiusLimit(settings.mode)].map((v) => {
          const x = positionFor({ radius: v, offset: 0 }, settings.mode).x;
          return (
            <g key={v}>
              <line x1={x} x2={x} y1="38" y2="256" stroke="#dce4ee" />
              <text x={x} y="279" textAnchor="middle">
                {v}
              </text>
            </g>
          );
        })}
        <text x="356" y="132" textAnchor="end" className="rolling-map-region">
          on the rim · ratio 1
        </text>
        <text x="356" y="65" textAnchor="end" className="rolling-map-region">
          beyond the rim
        </text>
        <text x="356" y="240" textAnchor="end" className="rolling-map-region">
          inside the wheel
        </text>
        <text
          x="208"
          y="307"
          textAnchor="middle"
          className="rolling-map-axis-title"
        >
          Rolling radius r · log scale
        </text>
        <line
          x1={selected.x}
          x2={selected.x}
          y1="38"
          y2="256"
          stroke="#c77f39"
          strokeDasharray="3 4"
          opacity=".65"
        />
        <line
          x1="48"
          x2="368"
          y1={selected.y}
          y2={selected.y}
          stroke="#c77f39"
          strokeDasharray="3 4"
          opacity=".65"
        />
        {guides.map((guide) => (
          <circle
            key={`${guide.ratio}-${guide.parameters.offset}`}
            className="rolling-map-integer-point"
            cx={guide.position.x}
            cy={guide.position.y}
            r="3"
            tabIndex={0}
            // SVG points use button semantics for keyboard selection.
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="button"
            aria-label={guide.label}
            onClick={() => onChange(guide.parameters)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(guide.parameters);
              }
            }}
          >
            <title>{guide.label}</title>
          </circle>
        ))}
        {markers.map((p, i) => (
          <g key={p.name}>
            <title>{`${p.name}: r = ${p.parameters.radius}, d/r = ${p.parameters.offset}`}</title>
            <circle
              cx={p.position.x}
              cy={p.position.y}
              r="9"
              fill="#2449b7"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={p.position.x}
              y={p.position.y + 4}
              textAnchor="middle"
              className="rolling-map-marker-number"
            >
              {i + 1}
            </text>
          </g>
        ))}
        <circle
          cx={selected.x}
          cy={selected.y}
          r="13"
          fill="none"
          stroke="#c77f39"
          strokeWidth="2.5"
        />
        {!active && (
          <circle
            cx={selected.x}
            cy={selected.y}
            r="7"
            fill="#c77f39"
            stroke="white"
            strokeWidth="2"
          />
        )}
      </svg>
      <div className="rolling-map-values">
        {(['radius', 'offset'] as const).map((key) => (
          <label key={key} htmlFor={`${id}-${key}`}>
            {key === 'radius' ? 'Radius r' : 'Distance d / r'}
            <input
              id={`${id}-${key}`}
              type="number"
              min={key === 'radius' ? 0.1 : 0}
              max={key === 'radius' ? radiusLimit(settings.mode) : 2}
              step="any"
              value={Number(settings[key].toFixed(6))}
              onChange={(e) => {
                const value = e.target.valueAsNumber;
                if (!Number.isFinite(value)) return;
                onChange({
                  radius: settings.radius,
                  offset: settings.offset,
                  [key]: Math.max(
                    key === 'radius' ? 0.1 : 0,
                    Math.min(
                      key === 'radius' ? radiusLimit(settings.mode) : 2,
                      value,
                    ),
                  ),
                });
              }}
              onKeyDown={(e) => {
                if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;
                e.preventDefault();
                const value =
                  settings[key] +
                  (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 0.001 : 0.01);
                onChange({
                  radius: settings.radius,
                  offset: settings.offset,
                  [key]: Math.max(
                    key === 'radius' ? 0.1 : 0,
                    Math.min(
                      key === 'radius' ? radiusLimit(settings.mode) : 2,
                      value,
                    ),
                  ),
                });
              }}
            />
          </label>
        ))}
      </div>
      {settings.mode !== 'line' && (
        <p className="rolling-map-integer-note">
          <span aria-hidden="true">·</span>{' '}
          <MathText>
            {
              'Faint points mark integer radius ratios R:r = n:1, at d/r = 1 or 2. Hover for values; select a point to use its exact ratio.'
            }
          </MathText>
        </p>
      )}
      <h3>Named points & examples</h3>
      <div className="rolling-map-legend">
        {markers.map((p, i) => (
          <button
            key={p.name}
            type="button"
            aria-pressed={active?.name === p.name}
            onClick={() => onChange(p.parameters)}
          >
            <span className="rolling-map-number" aria-hidden="true">
              {i + 1}
            </span>
            <span>
              <strong>{p.name}</strong>
              <small>
                <MathText>{`r = ${p.parameters.radius === 1 / 3 ? '⅓' : p.parameters.radius} · d/r = ${p.parameters.offset}`}</MathText>
              </small>
            </span>
          </button>
        ))}
      </div>
      <p className="family-control-note">
        Markers are representative settings; whole regions share curve-family
        names.
        <MathText>
          {settings.mode === 'line'
            ? ' Every point on d/r = 1 is a cycloid; radius changes its size.'
            : ' The dashed line places the tracing point on the wheel’s rim.'}
        </MathText>
      </p>
    </section>
  );
}
