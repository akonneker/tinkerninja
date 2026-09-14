import { MathText } from '@/components/math-text';
('use client');
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { PageLink as Link } from '@/components/page-link';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  ArrowUpRight,
  Download,
  Play,
  Pause,
  RotateCcw,
  Check,
  MousePointer2,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { MathEquation } from '@/components/math-equation';
import { CurveParameters } from '@/components/curve-parameters';
import {
  configureCurve,
  defaultFigures,
  rollingSpec,
  rollingState,
  rollingBounds,
} from '@/lib/curve-controls';
import { CurveReferences } from '@/components/curve-references';
import { maximumOrder } from '@/lib/fractals';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { sampleCurve, bounds } from '@/lib/curves';
import type { Curve } from '@/lib/curves';
import {
  measure,
  pointAt,
  nearestProgress,
  dragProgress,
  progressAtParameter,
  curveCSV,
} from '@/lib/geometry';
import { familiesForCurve } from '@/lib/curve-families';
const format = (v: number, digits = 4) =>
  Math.abs(v) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : v.toFixed(digits);
function download(name: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: 'text/csv;charset=utf-8;' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function sourceLabel(c: Curve) {
  return c.source.includes('archive.org')
    ? `Yates · pp. ${c.page}`
    : c.source.includes('doi.org')
      ? `Sagan · ${c.page.startsWith('Chapter') ? c.page : 'pp. ' + c.page}`
      : c.source.includes('st-andrews')
        ? 'MacTutor · University of St Andrews'
        : c.source.includes('cam.ac.uk')
          ? 'University of Cambridge · ' + c.page
          : '3DXM Virtual Math Museum';
}
export function Explorer({
  curve: baseCurve,
  familyMode = false,
  pageMode = false,
}: {
  curve: Curve;
  familyMode?: boolean;
  pageMode?: boolean;
}) {
  const Heading = pageMode ? 'h1' : 'h2';
  const [trace, setTrace] = useState(baseCurve.fractal ? 1 : 0.16),
    [traceBranch, setTraceBranch] = useState<number>(),
    [a, setA] = useState(1),
    [depth, setDepth] = useState(3),
    [playing, setPlaying] = useState(false),
    [notice, setNotice] = useState(''),
    [tab, setTab] = useState('about'),
    [figures, setFigures] = useState(defaultFigures),
    [showRolling, setShowRolling] = useState(Boolean(baseCurve.rolling)),
    [orderPlaying, setOrderPlaying] = useState(false),
    [dragging, setDragging] = useState(false);
  const curve = useMemo(
    () => (familyMode ? baseCurve : configureCurve(baseCurve, figures)),
    [baseCurve, figures, familyMode],
  );
  const controlId = useId();
  const geometry = useMemo(
    () => measure(sampleCurve(curve, a, curve.sampleCount ?? 1600, depth)),
    [curve, a, depth],
  );
  const point = pointAt(geometry, trace, curve, a, traceBranch),
    b = useMemo(
      () =>
        bounds(
          showRolling
            ? [...geometry.points, ...rollingBounds(curve, a)]
            : geometry.points,
        ),
      [geometry, showRolling, curve, a],
    );
  const rolling = showRolling ? rollingState(curve, point.t, a) : undefined;
  const canRoll = Boolean(rollingSpec(curve));
  const scale = 320 / b.span,
    px = (x: number) => 200 + (x - b.cx) * scale,
    py = (y: number) => 160 - (y - b.cy) * scale;
  const maxDepth = maximumOrder(curve.id);
  const minOrder = curve.id === 'moore' ? 1 : 0;
  const path = useMemo(
    () =>
      geometry.points
        .map(
          (p, i) =>
            `${!i || p.segment !== geometry.points[i - 1].segment ? 'M' : 'L'}${(200 + ((p.x - b.cx) * 320) / b.span).toFixed(3)},${(160 - ((p.y - b.cy) * 320) / b.span).toFixed(3)}`,
        )
        .join(' '),
    [geometry, b],
  );
  const step = useMemo(() => {
    const rough = b.span / 5,
      pow = 10 ** Math.floor(Math.log10(rough));
    return (
      (rough / pow <= 1
        ? 1
        : rough / pow <= 2
          ? 2
          : rough / pow <= 5
            ? 5
            : 10) * pow
    );
  }, [b]);
  const xticks = Array.from(
    { length: 13 },
    (_, i) => (Math.floor(b.cx / step) - 6 + i) * step,
  ).filter((x) => px(x) > 24 && px(x) < 384);
  const yticks = Array.from(
    { length: 13 },
    (_, i) => (Math.floor(b.cy / step) - 6 + i) * step,
  ).filter((y) => py(y) > 16 && py(y) < 296);
  const tick = (v: number) =>
    Math.abs(v) < 1e-10
      ? '0'
      : Math.abs(v) >= 1000 || Math.abs(v) < 0.001
        ? v.toExponential(1)
        : String(Number(v.toFixed(5)));
  const svgRef = useRef<SVGSVGElement>(null);
  const traceRef = useRef(trace);
  const pointerOffset = useRef({ x: 0, y: 0 });
  const dragSession = useRef<{
    pointerId: number;
    x: number;
    y: number;
    progress: number;
    segment: number;
  } | null>(null);
  function moveTrace(next: number, segment?: number) {
    traceRef.current = next;
    setTrace(next);
    setTraceBranch(segment);
  }
  useEffect(() => {
    traceRef.current = trace;
  }, [trace]);
  useEffect(() => {
    if (!playing) return;
    let frame: number,
      last = 0;
    const animate = (now: number) => {
      if (last) {
        const delta = Math.min(now - last, 80) / 16000;
        const currentT = pointAt(geometry, traceRef.current, curve, a).t;
        const next = showRolling
          ? progressAtParameter(
              geometry,
              Math.min(
                curve.ranges[0][1],
                currentT + delta * (curve.ranges[0][1] - curve.ranges[0][0]),
              ),
            )
          : Math.min(1, traceRef.current + delta);
        traceRef.current = next;
        moveTrace(next);
        if (next >= 1) setPlaying(false);
      }
      last = now;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [playing, showRolling, geometry, curve, a]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!orderPlaying) return;
    let order = minOrder;
    const timer = setInterval(() => {
      order += 1;
      setDepth(order);
      if (order >= maxDepth) setOrderPlaying(false);
    }, 1100);
    return () => clearInterval(timer);
  }, [orderPlaying, minOrder, maxDepth]);
  function setOrder(order: number) {
    setPlaying(false);
    setOrderPlaying(false);
    setDepth(Math.max(minOrder, Math.min(maxDepth, Math.round(order))));
    moveTrace(1);
  }
  function localPointer(e: ReactPointerEvent<SVGSVGElement>) {
    const matrix = svgRef.current?.getScreenCTM();
    return matrix
      ? new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse())
      : null;
  }
  function tracePointer(e: ReactPointerEvent<SVGSVGElement>) {
    const local = localPointer(e),
      session = dragSession.current;
    if (!local || !session || session.pointerId !== e.pointerId) return;
    const target = {
      x: b.cx + (local.x - pointerOffset.current.x - 200) / scale,
      y: b.cy - (local.y - pointerOffset.current.y - 160) / scale,
    };
    const next = dragProgress(
      geometry,
      session.progress,
      session.segment,
      session,
      target,
      2 / scale,
    );
    dragSession.current = { ...session, ...target, progress: next };
    moveTrace(next, session.segment);
  }
  function endDrag() {
    dragSession.current = null;
    setDragging(false);
  }
  return (
    <>
      <div className="explorer-heading">
        <span className="eyebrow">ON THE DRAWING BOARD</span>
        <span className="live-dot">Interactive</span>
      </div>
      <Heading>{curve.name}</Heading>
      {!familyMode && (
        <div className="related-family-links">
          {curve.id === 'cycloid' && (
            <Link href="/physics/brachistochrone">
              Race the brachistochrone <ArrowUpRight size={14} />
            </Link>
          )}

          {familiesForCurve(curve.id).map((f) => (
            <Link key={f.id} href={`/families/${f.id}?curve=${curve.id}`}>
              Explore {f.title.toLowerCase()} <ArrowUpRight size={14} />
            </Link>
          ))}
          {['catenary', 'parabola'].includes(curve.id) && (
            <Link href="/physics/catenary-parabola">
              Explore cable loading <ArrowUpRight size={14} />
            </Link>
          )}
          {curve.id === 'parabola' && (
            <Link href="/physics/ballistics">
              Explore projectile motion <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      )}
      <p className="curve-description">
        <MathText>{curve.description}</MathText>
      </p>
      {curve.fractal && (
        <section className="order-controls" aria-label="Fractal order">
          <div className="order-heading">
            <label htmlFor={`${controlId}-order`}>
              Fractal order <i>n</i>
            </label>
            <div className="order-stepper">
              <button
                aria-label="Decrease fractal order"
                disabled={depth <= minOrder}
                onClick={() => setOrder(depth - 1)}
              >
                −
              </button>
              <input
                id={`${controlId}-order`}
                type="number"
                min={minOrder}
                max={maxDepth}
                step={1}
                value={depth}
                onChange={(e) => {
                  if (Number.isFinite(e.target.valueAsNumber))
                    setOrder(e.target.valueAsNumber);
                }}
              />
              <button
                aria-label="Increase fractal order"
                disabled={depth >= maxDepth}
                onClick={() => setOrder(depth + 1)}
              >
                +
              </button>
            </div>
          </div>
          <Slider
            aria-label="Fractal order"
            min={minOrder}
            max={maxDepth}
            step={1}
            value={[depth]}
            onValueChange={(v) => setOrder(Array.isArray(v) ? v[0] : v)}
          />
          <div className="order-summary">
            <span>
              {(geometry.points.length - 1).toLocaleString('en-US')} segments ·
              order {depth}
            </span>
            <button
              className="text-button"
              onClick={() => {
                setPlaying(false);
                if (orderPlaying) {
                  setOrderPlaying(false);
                } else {
                  setDepth(minOrder);
                  moveTrace(1);
                  setOrderPlaying(true);
                }
              }}
            >
              {orderPlaying ? <Pause size={14} /> : <Play size={14} />}{' '}
              {orderPlaying ? 'Stop orders' : 'Animate orders'}
            </button>
          </div>
        </section>
      )}
      {canRoll && (
        <div className="rolling-toggle">
          <div>
            <label htmlFor={`${controlId}-rolling`}>Rolling motion</label>
            <p>Show the generating circle and its tracing arm.</p>
          </div>
          <Switch
            id={`${controlId}-rolling`}
            checked={showRolling}
            onCheckedChange={(checked) => {
              setShowRolling(checked);
              if (checked && trace >= 1) moveTrace(0);
              setPlaying(checked);
            }}
          />
        </div>
      )}
      <div className={`plot ${dragging ? 'is-dragging' : ''}`}>
        <svg
          ref={svgRef}
          viewBox="0 0 400 320"
          aria-label={`${curve.name}, with equally scaled x and y axes. Drag to trace, or use the slider below.`}
          onPointerDown={(e) => {
            if (e.button !== 0 || dragSession.current) return;
            const local = localPointer(e);
            if (!local) return;
            const isHandle = (e.target as Element).hasAttribute(
              'data-trace-handle',
            );
            pointerOffset.current = isHandle
              ? { x: local.x - px(point.x), y: local.y - py(point.y) }
              : { x: 0, y: 0 };
            const target = {
              x: b.cx + (local.x - pointerOffset.current.x - 200) / scale,
              y: b.cy - (local.y - pointerOffset.current.y - 160) / scale,
            };
            // A new click can select any arc; a held drag follows only that arc.
            const progress = isHandle
              ? traceRef.current
              : nearestProgress(geometry, target.x, target.y, traceRef.current);
            const segment = isHandle
              ? point.segment
              : pointAt(geometry, progress, curve, a).segment;
            dragSession.current = {
              pointerId: e.pointerId,
              ...target,
              progress,
              segment,
            };
            setPlaying(false);
            setOrderPlaying(false);
            moveTrace(progress, segment);
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) tracePointer(e);
          }}
          onPointerUp={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
            endDrag();
          }}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        >
          <rect width="400" height="320" fill="#f7f9fc" />
          {xticks.map((x) => (
            <line
              key={'x' + x}
              x1={px(x)}
              x2={px(x)}
              y1={0}
              y2={320}
              stroke={Math.abs(x) < 1e-10 ? '#aabbd0' : '#e2e8ef'}
            />
          ))}
          {yticks.map((y) => (
            <line
              key={'y' + y}
              x1={0}
              x2={400}
              y1={py(y)}
              y2={py(y)}
              stroke={Math.abs(y) < 1e-10 ? '#aabbd0' : '#e2e8ef'}
            />
          ))}
          {xticks.map((x) => (
            <text
              key={'xl' + x}
              x={px(x)}
              y={Math.max(18, Math.min(304, py(0) + 16))}
              textAnchor="middle"
              className="axis-label"
            >
              {tick(x)}
            </text>
          ))}
          {yticks
            .filter((y) => Math.abs(y) > 1e-10)
            .map((y) => (
              <text
                key={'yl' + y}
                x={
                  curve.fractal
                    ? Math.max(32, Math.min(393, px(0) - 7))
                    : Math.max(7, Math.min(370, px(0) + 7))
                }
                textAnchor={curve.fractal ? 'end' : 'start'}
                y={py(y) - 6}
                className="axis-label"
              >
                {tick(y)}
              </text>
            ))}
          <text
            x="385"
            y={Math.max(16, Math.min(305, py(0) - 9))}
            className="axis-name"
          >
            x
          </text>
          <text
            x={Math.max(8, Math.min(380, px(0) + 9))}
            y="14"
            className="axis-name"
          >
            y
          </text>
          {rolling && (
            <g className="rolling-construction" aria-hidden="true">
              {rolling.kind === 'line' ? (
                <line
                  x1="0"
                  x2="400"
                  y1={py(0)}
                  y2={py(0)}
                  stroke="#518276"
                  strokeWidth="2"
                />
              ) : (
                <circle
                  cx={px(rolling.origin.x)}
                  cy={py(rolling.origin.y)}
                  r={rolling.fixedRadius * scale}
                  fill="none"
                  stroke="#518276"
                  strokeWidth="1.5"
                />
              )}
              <circle
                cx={px(rolling.center.x)}
                cy={py(rolling.center.y)}
                r={rolling.radius * scale}
                fill="#63a896"
                fillOpacity=".1"
                stroke="#518276"
                strokeWidth="2"
              />
              <line
                x1={px(rolling.center.x)}
                y1={py(rolling.center.y)}
                x2={px(rolling.tip.x)}
                y2={py(rolling.tip.y)}
                stroke="#c08235"
                strokeWidth="2"
              />
              <circle
                cx={px(rolling.center.x)}
                cy={py(rolling.center.y)}
                r="3"
                fill="#518276"
              />
              <circle
                cx={px(rolling.rim.x)}
                cy={py(rolling.rim.y)}
                r="3"
                fill="#c08235"
              />
              <circle
                cx={px(rolling.contact.x)}
                cy={py(rolling.contact.y)}
                r="3"
                fill="#518276"
              />
            </g>
          )}
          {curve.fractal && (
            <path
              d={path}
              fill="none"
              stroke="#2449b7"
              strokeOpacity=".15"
              strokeWidth="1"
            />
          )}
          <path
            d={path}
            pathLength={curve.fractal ? 1 : undefined}
            strokeDasharray={curve.fractal ? `${trace} 1` : undefined}
            fill="none"
            stroke="#2449b7"
            strokeWidth={curve.fractal ? 1.5 : 2.4}
            strokeLinejoin="round"
          />
          <path
            d={`M${px(point.x)} ${py(point.y)}V${Math.max(0, Math.min(320, py(0)))}M${px(point.x)} ${py(point.y)}H${Math.max(0, Math.min(400, px(0)))}`}
            stroke="#d16c50"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <g
            aria-hidden="true"
            pointerEvents="none"
            fill="#e87051"
            stroke="white"
            strokeWidth="1.5"
          >
            {py(0) >= 0 && py(0) <= 320 && (
              <circle cx={px(point.x)} cy={py(0)} r="3" />
            )}
            {px(0) >= 0 && px(0) <= 400 && (
              <circle cx={px(0)} cy={py(point.y)} r="3" />
            )}
          </g>
          <circle
            cx={px(point.x)}
            cy={py(point.y)}
            r="10"
            fill="#ef775c"
            fillOpacity=".16"
          />
          <circle
            cx={px(point.x)}
            cy={py(point.y)}
            r="5.5"
            fill="#e87051"
            stroke="white"
            strokeWidth="2.5"
          />
          <circle
            data-trace-handle="true"
            className="trace-handle"
            cx={px(point.x)}
            cy={py(point.y)}
            r="17"
            fill="transparent"
            tabIndex={0}
            // An SVG handle cannot be an HTML input; expose its keyboard-controlled value.
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="slider"
            aria-label="Draggable trace point"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Number((trace * 100).toFixed(1))}
            aria-valuetext={`${format(trace * 100, 1)} percent; x ${format(point.x)}, y ${format(point.y)}`}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 0.02 : 0.002;
              const next =
                e.key === 'Home'
                  ? 0
                  : e.key === 'End'
                    ? 1
                    : ['ArrowRight', 'ArrowUp'].includes(e.key)
                      ? Math.min(1, trace + step)
                      : ['ArrowLeft', 'ArrowDown'].includes(e.key)
                        ? Math.max(0, trace - step)
                        : null;
              if (next !== null) {
                e.preventDefault();
                setPlaying(false);
                setOrderPlaying(false);
                moveTrace(next);
              }
            }}
          />
        </svg>
      </div>
      <div className="plot-caption">
        <MousePointer2 size={13} />
        <span>Drag the orange point · or click the curve</span>
        <span>1:1 axes</span>
      </div>
      <div className="coordinates">
        <div>
          <span>x coordinate</span>
          <strong>{format(point.x)}</strong>
        </div>
        <div>
          <span>y coordinate</span>
          <strong>{format(point.y)}</strong>
        </div>
      </div>
      <div className="trace-controls">
        <div>
          <span id={`${controlId}-trace-label`}>
            {curve.fractal ? 'Draw this order' : 'Trace by distance'}
          </span>
          <span>{format(trace * 100, 1)}%</span>
        </div>
        <div className="play-slider">
          <button
            className="icon-button"
            aria-label={playing ? 'Pause tracing' : 'Play tracing'}
            title={playing ? 'Pause' : 'Trace automatically'}
            onClick={() => {
              setOrderPlaying(false);
              if (trace >= 1) moveTrace(0);
              setPlaying(!playing);
            }}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <Slider
            aria-labelledby={`${controlId}-trace-label`}
            min={0}
            max={1}
            step={0.001}
            value={[trace]}
            onValueChange={(v) => {
              setPlaying(false);
              setOrderPlaying(false);
              moveTrace(Array.isArray(v) ? v[0] : v);
            }}
          />
          <button
            className="icon-button"
            aria-label="Reset trace to start"
            title="Reset trace"
            onClick={() => {
              setPlaying(false);
              setOrderPlaying(false);
              moveTrace(0);
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
        <div className="trace-meta">
          <span>
            {curve.fractal ? 'Construction t' : 'Parameter t'} ={' '}
            {format(point.t)}
          </span>
          <span>Branch {point.segment + 1}</span>
        </div>
      </div>
      {!familyMode && (
        <CurveParameters
          id={curve.id}
          controlId={controlId}
          value={figures}
          onChange={(value) => {
            setFigures(value);
            setPlaying(false);
            moveTrace(0);
          }}
        />
      )}
      <div className="export-actions">
        <button
          className="secondary-button"
          onClick={() => {
            download(
              `${curve.id}-a${a}${curve.fractal ? '-order' + depth : ''}.csv`,
              curveCSV(curve, a, depth, geometry),
            );
            setNotice('Curve CSV downloaded');
          }}
        >
          <Download size={15} />
          Curve CSV
        </button>
      </div>
      <output className="action-notice" aria-live="polite">
        {notice && (
          <>
            <Check size={13} />
            {notice}
          </>
        )}
      </output>
      <div className="shape-controls">
        <div>
          <span id={`${controlId}-scale-label`}>
            Scale <i>a</i>
          </span>
          <span>{a.toFixed(2)}</span>
        </div>
        <Slider
          aria-labelledby={`${controlId}-scale-label`}
          min={0.5}
          max={3}
          step={0.05}
          value={[a]}
          onValueChange={(v) => {
            setPlaying(false);
            setOrderPlaying(false);
            setA(Array.isArray(v) ? v[0] : v);
          }}
        />
      </div>
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(String(v))}
        className="detail-tabs"
      >
        <TabsList aria-label="Curve details" className="details-tab-list">
          <TabsTrigger value="about">The story</TabsTrigger>
          <TabsTrigger value="math">The math</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
          <div className="story">
            <h3>A little history</h3>
            <p>
              <MathText>{curve.history}</MathText>
            </p>
            <h3>Uses & connections</h3>
            <p>
              <MathText>{curve.uses}</MathText>
            </p>
            <a href={curve.source} target="_blank" rel="noreferrer">
              {sourceLabel(curve)} <ArrowUpRight size={14} />
            </a>
            {!familyMode && <CurveReferences id={baseCurve.id} />}
          </div>
        </TabsContent>
        <TabsContent value="math">
          <div className="story">
            <h3>{curve.fractal ? 'Construction' : 'Defining equation'}</h3>
            {curve.equationTex ? (
              <MathEquation tex={curve.equationTex} fallback={curve.equation} />
            ) : (
              <div className="equation">{curve.equation}</div>
            )}
            {!curve.fractal && (
              <p className="domain">
                {curve.ranges.map(([lo, hi], i) => (
                  <span key={i}>
                    Branch {i + 1}: t from {format(lo, 3)} to {format(hi, 3)}
                    <br />
                  </span>
                ))}
                Angles are in radians. Scale{' '}
                <MathText>{`a = ${a.toFixed(2)}`}</MathText>.
              </p>
            )}
            <h3>Reading this drawing</h3>
            <p>
              <MathText>
                {curve.note ??
                  'A complete representative of this curve is shown. Scale a changes the size without changing the shape.'}
              </MathText>
            </p>
            <div className="length-readout">
              <span>Displayed length ≈</span>
              <strong>{format(geometry.length)}</strong>
            </div>
            <p>
              The trace follows approximate arc length measured along the
              displayed polygon. Coordinates are numerical values
              {curve.fractal
                ? ' on the finite construction'
                : '; smooth curves are evaluated at the interpolated parameter'}
              . CSV includes every sampled vertex and its branch.
            </p>
            <a href={curve.source} target="_blank" rel="noreferrer">
              {sourceLabel(curve)} <ArrowUpRight size={14} />
            </a>
          </div>
        </TabsContent>
      </Tabs>
      <div className="approximation-note">
        {curve.fractal
          ? 'Finite construction · increase order to refine'
          : curve.note
            ? 'Representative curve · see “The math” for its range'
            : 'Representative curve · explore its equation in “The math”'}
      </div>
    </>
  );
}
