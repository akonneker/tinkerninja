import { MathEquation } from '@/components/math-equation';
import { physicsEquations } from '@/lib/equations';
('use client');
import { useEffect, useMemo, useRef, useState } from 'react';
import { PageLink as Link } from '@/components/page-link';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { PhysicsFrame } from '@/components/physics-frame';
import { PhysicsPlot } from '@/components/physics-plot';
import { PhysicsControl } from '@/components/physics-control';
import { trajectory, atTime, onPath } from '@/lib/physics';
import { measure, progressAtParameter } from '@/lib/geometry';
import type { LaunchSettings } from '@/lib/physics';
export function BallisticsLab() {
  const [settings, setSettings] = useState<LaunchSettings>({
      speed: 22,
      angle: 45,
      drag: 0.012,
    }),
    [time, setTime] = useState(0),
    [playing, setPlaying] = useState(false);
  const clock = useRef(0);
  const ideal = useMemo(() => trajectory({ ...settings, drag: 0 }), [settings]),
    air = useMemo(() => trajectory(settings), [settings]);
  const g = useMemo(() => measure(air), [air]);
  const idealEnd = ideal[ideal.length - 1],
    airEnd = air[air.length - 1],
    duration = Math.max(idealEnd.t, airEnd.t);
  function seek(t: number) {
    clock.current = t;
    setTime(t);
  }
  function change(value: Partial<LaunchSettings>) {
    setPlaying(false);
    seek(0);
    setSettings((s) => ({ ...s, ...value }));
  }
  useEffect(() => {
    if (!playing) return;
    let frame: number,
      last = 0;
    function animate(now: number) {
      if (last) {
        clock.current = Math.min(
          duration,
          clock.current + Math.min(now - last, 80) / 1000,
        );
        setTime(clock.current);
        if (clock.current >= duration) {
          setPlaying(false);
          return;
        }
      }
      last = now;
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);
  const point = atTime(air, time),
    idealPoint = atTime(ideal, time);
  const progress = progressAtParameter(g, Math.min(time, airEnd.t));
  const paths = useMemo(
    () => [
      { points: ideal, color: '#8394ad', dashed: true },
      { points: air, color: '#2449b7' },
    ],
    [ideal, air],
  );
  const maxHeight = (p: typeof air) => Math.max(...p.map((v) => v.y));
  return (
    <PhysicsFrame active="ballistics">
      <div className="family-page-heading">
        <span className="eyebrow">GRAVITY + MOTION</span>
        <h1>A cannon, gravity & air</h1>
        <p>One launch. Two assumptions. Two different curves.</p>
      </div>
      <div className="physics-lab-layout">
        <section className="family-lab-controls">
          <h2>Set up a launch</h2>
          <PhysicsControl
            label="Launch speed"
            value={settings.speed}
            onChange={(speed) => change({ speed })}
            min={8}
            max={35}
            step={1}
            unit="m/s"
          />
          <PhysicsControl
            label="Launch angle"
            value={settings.angle}
            onChange={(angle) => change({ angle })}
            min={10}
            max={80}
            step={1}
            unit="°"
          />
          <PhysicsControl
            label="Air resistance k"
            landmarks={[
              { value: 0, label: 'No air resistance · ideal parabola' },
            ]}
            value={settings.drag}
            onChange={(drag) => change({ drag })}
            min={0}
            max={0.04}
            step={0.001}
            unit="m⁻¹"
          />
          <div className="family-preset-grid">
            {[
              { label: 'No air', drag: 0 },
              { label: 'Light drag', drag: 0.006 },
              { label: 'More drag', drag: 0.025 },
            ].map((p) => (
              <button
                key={p.label}
                aria-pressed={settings.drag === p.drag}
                onClick={() => change({ drag: p.drag })}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="family-control-note">
            Gravity is 9.81 m/s². The launch point is 1 m above level ground.
            Drag opposes motion and grows with the square of speed.
          </p>
          <div className="physics-launch-controls">
            <button
              className="physics-fire"
              onClick={() => {
                if (playing) {
                  setPlaying(false);
                } else {
                  if (time >= duration) seek(0);
                  setPlaying(true);
                }
              }}
            >
              {playing ? <Pause size={17} /> : <Play size={17} />}{' '}
              {playing
                ? 'Pause'
                : time > 0 && time < duration
                  ? 'Resume'
                  : 'Fire cannon'}
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setPlaying(false);
                seek(0);
              }}
            >
              <RotateCcw size={15} />
              Reset flight
            </button>
          </div>
          <div className="family-current">
            <span className="eyebrow">FROM PHYSICS TO GEOMETRY</span>
            <p>
              Without air resistance, the path is a parabola. With drag, the
              descent is steeper and the range is shorter for these launches.
            </p>
            <Link href="/?curve=parabola#collection">
              Explore the parabola ↗
            </Link>
          </div>
        </section>
        <section className="physics-drawing">
          <div className="physics-legend">
            <span>
              <i style={{ background: '#8394ad' }} />
              Ideal · no air
            </span>
            <span>
              <i style={{ background: '#2449b7' }} />
              Quadratic air drag
            </span>
          </div>
          <PhysicsPlot
            points={air}
            paths={paths}
            progress={progress}
            onChange={(p) => {
              setPlaying(false);
              seek(onPath(g, p).t);
            }}
            label="Cannon trajectories with and without air resistance"
            unit="m"
            minimumY={-1}
            markers={[{ point: idealPoint, color: '#8394ad' }]}
            decoration={({ x, y }) => {
              const mx = x(0),
                my = y(1),
                angle = -settings.angle;
              return (
                <g>
                  <line
                    x1={mx}
                    x2="609"
                    y1={y(0)}
                    y2={y(0)}
                    stroke="#9baa9a"
                    strokeWidth="2"
                  />
                  <g transform={`translate(${mx} ${my})`}>
                    <g transform={`rotate(${angle})`}>
                      <rect
                        x="-34"
                        y="-5"
                        width="35"
                        height="10"
                        rx="3"
                        fill="#3e516a"
                      />
                      <rect
                        x="-4"
                        y="-7"
                        width="6"
                        height="14"
                        rx="2"
                        fill="#273e5c"
                      />
                    </g>
                    <circle
                      cx="-23"
                      cy="13"
                      r="10"
                      fill="#c2cad5"
                      stroke="#3e516a"
                      strokeWidth="3"
                    />
                    <circle cx="-23" cy="13" r="3" fill="#3e516a" />
                  </g>
                </g>
              );
            }}
          />
          <div className="physics-readouts">
            <span>
              Time <strong>{time.toFixed(2)} s</strong>
            </span>
            <span>
              x <strong>{point.x.toFixed(2)} m</strong>
            </span>
            <span>
              y <strong>{point.y.toFixed(2)} m</strong>
            </span>
          </div>
          <Slider
            aria-label="Flight time"
            min={0}
            max={duration}
            step={0.01}
            value={[time]}
            onValueChange={(v) => {
              setPlaying(false);
              seek(Array.isArray(v) ? v[0] : v);
            }}
          />
          <p className="family-control-note">
            Both points share the same clock.{' '}
            {time >= airEnd.t
              ? 'The air-drag projectile has landed.'
              : 'Drag the orange point to inspect the air-drag trajectory.'}
          </p>
          <div className="physics-comparison">
            <table>
              <caption>Complete-flight comparison</caption>
              <thead>
                <tr>
                  <th scope="col">Model</th>
                  <th scope="col">Range</th>
                  <th scope="col">Peak height</th>
                  <th scope="col">Flight time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Ideal</th>
                  <td>{idealEnd.x.toFixed(2)} m</td>
                  <td>{maxHeight(ideal).toFixed(2)} m</td>
                  <td>{idealEnd.t.toFixed(2)} s</td>
                </tr>
                <tr>
                  <th scope="row">Air drag</th>
                  <td>{airEnd.x.toFixed(2)} m</td>
                  <td>{maxHeight(air).toFixed(2)} m</td>
                  <td>{airEnd.t.toFixed(2)} s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <div className="physics-notes-grid">
        <section className="family-context">
          <h2>Why the parabola changes</h2>
          <MathEquation
            className="physics-equation"
            tex={physicsEquations.ballistics}
            fallback="x = v₀ cos(θ)t; y = 1 + v₀ sin(θ)t − ½gt²"
          />
          <p>
            In the ideal model, horizontal velocity stays constant and gravity
            changes vertical velocity at a constant rate. Eliminating time gives
            a parabola.
          </p>
          <MathEquation
            className="physics-equation"
            tex={physicsEquations.drag}
            fallback="aₓ = −k|v|vₓ; aᵧ = −g − k|v|vᵧ"
          />
          <p>
            The second model adds quadratic drag, with k = ρCᴅA/(2m). The same
            resistance acts opposite the velocity vector, slowing horizontal
            motion as well as changing ascent and descent. Set k to zero and the
            two paths coincide.
          </p>
          <p>
            These trajectories are integrated numerically in time and stop at
            ground contact. The model holds gravity, air density, and drag
            coefficient constant, and omits wind, spin, lift, and changes in
            terrain.
          </p>
          <a
            href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/flight-equations-with-drag/"
            target="_blank"
            rel="noreferrer"
          >
            NASA Glenn · flight equations with drag ↗
          </a>
        </section>
        <section className="family-context">
          <span className="eyebrow">CURVES THAT HELPED BUILD COMPUTERS</span>
          <h2>From ballistic tables to ENIAC</h2>
          <p>
            A ballistic table collected the results of many trajectory
            calculations for different conditions. Producing those tables
            required repeated numerical work: before electronic computers,
            people known as “computers” used desk calculators and machines such
            as differential analyzers.
          </p>
          <p>
            The U.S. Army’s demand for faster ballistic calculations was a major
            motivation for ENIAC, developed at the University of Pennsylvania by
            J. Presper Eckert and John Mauchly. It was dedicated in February
            1946, after World War II had ended. Ballistics helped drive the
            project, but the machine could tackle a much broader range of
            numerical problems.
          </p>
          <p>
            Six pioneering women—including Jean Jennings Bartik and Frances
            Bilas Spence—developed ENIAC programs by working out the
            computational steps and configuring the machine. Their work helped
            turn mathematical procedures into electronic computation.
          </p>
          <p>
            This little simulation uses the same broad idea: replace a
            continuous equation of motion with a sequence of numerical steps,
            then compare the resulting curves.
          </p>
          <a
            href="https://ftp.arl.army.mil/~mike/comphist/eniac-story.html"
            target="_blank"
            rel="noreferrer"
          >
            U.S. Army Research Laboratory · The ENIAC Story ↗
          </a>
          <a
            href="https://penntoday.upenn.edu/news/worlds-first-general-purpose-computer-turns-75"
            target="_blank"
            rel="noreferrer"
          >
            Penn · ENIAC and its pioneering programmers ↗
          </a>
        </section>
      </div>
    </PhysicsFrame>
  );
}
