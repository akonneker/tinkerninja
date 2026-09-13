import { MathText } from '@/components/math-text';
import { MathEquation } from '@/components/math-equation';
import { physicsEquations } from '@/lib/equations';
('use client');
import { useMemo, useState } from 'react';
import { PageLink as Link } from '@/components/page-link';
import { Slider } from '@/components/ui/slider';
import { PhysicsFrame } from '@/components/physics-frame';
import { PhysicsPlot } from '@/components/physics-plot';
import { PhysicsControl } from '@/components/physics-control';
import { cableShape, atTime, onPath } from '@/lib/physics';
import { measure } from '@/lib/geometry';
export function CableLab() {
  const [mix, setMix] = useState(0),
    [sag, setSag] = useState(0.85),
    [progress, setProgress] = useState(0.5);
  const current = useMemo(() => cableShape(mix, sag), [mix, sag]),
    catenary = useMemo(() => cableShape(0, sag), [sag]),
    parabola = useMemo(() => cableShape(1, sag), [sag]);
  const geometry = useMemo(() => measure(current.points), [current]);
  const point = onPath(geometry, progress);
  const gap = Math.max(
    ...current.points.map((p) =>
      Math.abs(p.y - atTime(parabola.points, p.x).y),
    ),
  );
  const name =
    mix === 0 ? 'Catenary' : mix === 1 ? 'Parabola' : 'Mixed-load cable';
  const paths = useMemo(
    () => [
      { points: catenary.points, color: '#8c9cb4', dashed: true },
      { points: parabola.points, color: '#9978ba', dashed: true },
      { points: current.points, color: '#2449b7' },
    ],
    [catenary, parabola, current],
  );
  return (
    <PhysicsFrame active="catenary-parabola">
      <div className="family-page-heading">
        <span className="eyebrow">GRAVITY + TENSION</span>
        <h1>From catenary to parabola</h1>
        <p>The curve changes when you change what the cable carries.</p>
      </div>
      <div className="physics-lab-layout">
        <section className="family-lab-controls">
          <h2>Change the load</h2>
          <PhysicsControl
            label="Load mix m"
            landmarks={[
              { value: 0, label: 'Catenary' },
              { value: 1, label: 'Parabola' },
            ]}
            value={mix}
            onChange={setMix}
            min={0}
            max={1}
            step={0.01}
          />
          <div className="physics-endpoints">
            <span>0 · Cable’s own weight</span>
            <span>1 · Horizontal deck load</span>
          </div>
          <div className="family-preset-grid">
            {[0, 0.5, 1].map((v) => (
              <button
                key={v}
                aria-pressed={mix === v}
                onClick={() => setMix(v)}
              >
                {v === 0 ? 'Catenary' : v === 1 ? 'Parabola' : 'Both loads'}
              </button>
            ))}
          </div>
          <PhysicsControl
            label="Sag / half-span"
            value={sag}
            onChange={setSag}
            min={0.2}
            max={1.4}
            step={0.05}
          />
          <p className="family-control-note">
            The supports and sag stay fixed for a fair comparison. Tension and
            the required cable length adjust as the load changes.
          </p>
          <div className="family-current">
            <span className="eyebrow">THIS EQUILIBRIUM</span>
            <h3>{name}</h3>
            <p>
              Maximum separation from the parabola: {(gap * 100).toFixed(2)}% of
              the half-span.
            </p>
            <Link href="/?curve=catenary#collection">
              Catenary named entry ↗
            </Link>
            <Link href="/?curve=parabola#collection">
              Parabola named entry ↗
            </Link>
          </div>
        </section>
        <section className="physics-drawing">
          <div className="physics-legend">
            <span>
              <i style={{ background: '#2449b7' }} />
              Current cable
            </span>
            <span>
              <i style={{ background: '#8c9cb4' }} />
              Catenary reference
            </span>
            <span>
              <i style={{ background: '#9978ba' }} />
              Parabola reference
            </span>
          </div>
          <PhysicsPlot
            points={current.points}
            paths={paths}
            progress={progress}
            onChange={setProgress}
            minimumY={-0.25}
            label="Cable equilibrium between two fixed supports"
            unit="half-span"
            decoration={({ x, y }) => (
              <g>
                {[-1, 1].map((v) => (
                  <g key={v}>
                    <line
                      x1={x(v)}
                      x2={x(v)}
                      y1={y(sag) + 5}
                      y2={y(-0.18)}
                      stroke="#a8b6c8"
                      strokeWidth="6"
                    />
                    <circle cx={x(v)} cy={y(sag)} r="6" fill="#344e70" />
                  </g>
                ))}
                {mix > 0 && (
                  <g opacity={mix}>
                    <line
                      x1={x(-1)}
                      x2={x(1)}
                      y1={y(-0.15)}
                      y2={y(-0.15)}
                      stroke="#60758e"
                      strokeWidth="5"
                    />
                    {Array.from({ length: 11 }, (_, i) => (i - 5) / 6).map(
                      (v) => (
                        <line
                          key={v}
                          x1={x(v)}
                          x2={x(v)}
                          y1={y(atTime(current.points, v).y)}
                          y2={y(-0.15)}
                          stroke="#9eafc4"
                          strokeWidth="1.5"
                        />
                      ),
                    )}
                  </g>
                )}
              </g>
            )}
          />
          <div className="physics-readouts">
            <span>
              x <strong>{point.x.toFixed(3)}</strong>
            </span>
            <span>
              y <strong>{point.y.toFixed(3)}</strong>
            </span>
            <span>
              Cable length <strong>{geometry.length.toFixed(3)} L</strong>
            </span>
          </div>
          <Slider
            aria-label="Trace cable"
            min={0}
            max={1}
            step={0.001}
            value={[progress]}
            onValueChange={(v) => setProgress(Array.isArray(v) ? v[0] : v)}
          />
          <p className="family-control-note">
            L is the half-span. The origin is the cable’s lowest point. Hangers
            illustrate a horizontally distributed deck load.
          </p>
        </section>
      </div>
      <div className="physics-notes-grid">
        <section className="family-context">
          <h2>Two ways to distribute weight</h2>
          <p>
            A uniform hanging chain carries equal weight per unit of its own
            length. Steeper portions contain more cable per horizontal interval,
            so the load per horizontal distance is larger near the supports. Its
            equilibrium shape is a catenary.
          </p>
          <MathEquation
            className="physics-equation"
            tex={physicsEquations.catenary}
            fallback="y = a cosh(x/a)"
          />
          <p>
            Here cosh is the hyperbolic cosine, and{' '}
            <MathEquation
              inline
              tex={physicsEquations.catenaryScale}
              fallback="a = H/w"
            />{' '}
            is the horizontal tension divided by the cable weight per unit
            length. The simulation shifts the lowest point to the origin:
          </p>
          <MathEquation
            className="physics-equation"
            tex={physicsEquations.catenaryShifted}
            fallback="y = a[cosh(x/a) − 1]"
          />
          <p>
            An idealized suspension-bridge deck instead supplies equal load per
            horizontal interval. If that load dominates and the cable’s own
            weight is neglected, the cable takes a parabolic shape.
          </p>
          <p>
            The slider changes the equilibrium equation, rather than blending
            two drawings. Intermediate values include both load types; m weights
            their load-density coefficients, not their total weights. Small sag
            makes the two limiting curves look very similar.
          </p>
          <a
            href="https://www.ce.jhu.edu/perspectives/studies/George%20Washington%20Files/GW_Internal%20Forces.htm"
            target="_blank"
            rel="noreferrer"
          >
            Johns Hopkins · suspension bridge cable forces ↗
          </a>
        </section>
        <section className="family-context">
          <h2>The equation behind the change</h2>
          <MathEquation
            className="physics-equation"
            tex={physicsEquations.cable}
            fallback="H y″ = w √(1 + y′²) + q"
          />
          <p>
            H is the constant horizontal tension, w is cable weight per unit
            cable length, and q is deck load per horizontal length.
          </p>
          <MathEquation
            className="physics-equation"
            tex={physicsEquations.cableNormalized}
            fallback="y″ = λ[(1 − m)√(1 + y′²) + m]"
          />
          <p>
            <MathText>
              {
                'In the normalized drawing, λ is adjusted to keep y(±1) equal to the chosen sag and y(0) = y′(0) = 0. At m = 0, y = [cosh(λx) − 1]/λ. At m = 1, y = λx²/2.'
              }
            </MathText>
          </p>
          <p>
            This is a sequence of static equilibria for a flexible cable. It
            does not model cable stretch, swinging, or the motion of one
            fixed-length chain.
          </p>
          <a
            href="https://web.mae.ufl.edu/uhk/StaticsPage/Statics.html"
            target="_blank"
            rel="noreferrer"
          >
            University of Florida · cable equilibrium derivation ↗
          </a>
        </section>
      </div>
    </PhysicsFrame>
  );
}
