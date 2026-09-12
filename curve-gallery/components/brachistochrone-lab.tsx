import { MathText } from '@/components/math-text';
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
import { descentTracks, atTime, onPath, gravity } from '@/lib/physics';
import { measure, progressAtParameter } from '@/lib/geometry';
export function BrachistochroneLab() {
  const [width, setWidth] = useState(4),
    [drop, setDrop] = useState(2),
    [time, setTime] = useState(0),
    [playing, setPlaying] = useState(false);
  const clock = useRef(0);
  const tracks = useMemo(() => descentTracks(width, drop), [width, drop]);
  const g = useMemo(() => measure(tracks.cycloid), [tracks]);
  const end = (p: typeof tracks.cycloid) => p[p.length - 1].t;
  const duration = Math.max(
    end(tracks.line),
    end(tracks.parabola),
    end(tracks.cycloid),
  );
  function seek(t: number) {
    clock.current = t;
    setTime(t);
  }
  function change(kind: 'width' | 'drop', value: number) {
    setPlaying(false);
    seek(0);
    if (kind === 'width') setWidth(value);
    else setDrop(value);
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
  const paths = useMemo(
    () => [
      { points: tracks.line, color: '#8394ad', dashed: true },
      { points: tracks.parabola, color: '#9978ba', dashed: true },
      { points: tracks.cycloid, color: '#2449b7' },
    ],
    [tracks],
  );
  const progress = progressAtParameter(g, Math.min(time, end(tracks.cycloid))),
    point = atTime(tracks.cycloid, time);
  return (
    <PhysicsFrame active="brachistochrone">
      <div className="family-page-heading">
        <span className="eyebrow">THE FASTEST DESCENT</span>
        <h1>Brachistochrone</h1>
        <p>The shortest path is not always the quickest journey.</p>
      </div>
      <div className="physics-lab-layout">
        <section className="family-lab-controls">
          <h2>Give every bead the same start</h2>
          <PhysicsControl
            label="Horizontal distance"
            value={width}
            onChange={(v) => change('width', v)}
            min={1}
            max={8}
            step={0.25}
            unit="m"
          />
          <PhysicsControl
            label="Vertical drop"
            value={drop}
            onChange={(v) => change('drop', v)}
            min={0.5}
            max={5}
            step={0.25}
            unit="m"
          />
          <p className="family-control-note">
            All three point beads start from rest at A, slide without friction,
            and finish at B. Gravity is <MathText>{'9.81 m/s²'}</MathText>. No
            rolling inertia or air resistance is included.
          </p>
          <div className="physics-launch-controls">
            <button
              className="physics-fire"
              onClick={() => {
                if (playing) setPlaying(false);
                else {
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
                  : 'Race the beads'}
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setPlaying(false);
                seek(0);
              }}
            >
              <RotateCcw size={15} />
              Reset race
            </button>
          </div>
          <div className="family-current">
            <span className="eyebrow">THE WINNING SHAPE</span>
            <h3>A cycloid arc</h3>
            <p>
              The steep initial drop builds speed early.{' '}
              {tracks.theta > Math.PI
                ? 'For these endpoints the fastest path dips below B, then climbs back up to it.'
                : 'For these endpoints the fastest path descends all the way to B.'}
            </p>
            <Link href="/?curve=cycloid#collection">
              Explore the named cycloid ↗
            </Link>
            <Link href="/families/rolling?curve=cycloid">
              See its rolling-circle construction ↗
            </Link>
          </div>
        </section>
        <section className="physics-drawing">
          <div className="physics-legend">
            <span>
              <i style={{ background: '#2449b7' }} />
              Cycloid · fastest
            </span>
            <span>
              <i style={{ background: '#8394ad' }} />
              Straight ramp
            </span>
            <span>
              <i style={{ background: '#9978ba' }} />
              Parabolic ramp
            </span>
          </div>
          <PhysicsPlot
            points={tracks.cycloid}
            paths={paths}
            progress={progress}
            onChange={(p) => {
              setPlaying(false);
              seek(onPath(g, p).t);
            }}
            unit="m"
            label="Brachistochrone race: three tracks sharing the same start and finish"
            markers={[
              { point: atTime(tracks.line, time), color: '#8394ad' },
              { point: atTime(tracks.parabola, time), color: '#9978ba' },
            ]}
            decoration={({ x, y }) => (
              <g>
                <text x={x(0) + 10} y={y(0) - 10} fill="#334c70" fontSize="15">
                  A · release
                </text>
                <text
                  x={x(width) - 10}
                  y={y(-drop) - 12}
                  textAnchor="end"
                  fill="#334c70"
                  fontSize="15"
                >
                  B · finish
                </text>
              </g>
            )}
          />
          <div className="physics-readouts">
            <span>
              Time <strong>{time.toFixed(3)} s</strong>
            </span>
            <span>
              x <strong>{point.x.toFixed(3)} m</strong>
            </span>
            <span>
              y <strong>{point.y.toFixed(3)} m</strong>
            </span>
          </div>
          <Slider
            aria-label="Race time"
            min={0}
            max={duration}
            step={0.001}
            value={[time]}
            onValueChange={(v) => {
              setPlaying(false);
              seek(Array.isArray(v) ? v[0] : v);
            }}
          />
          <p className="family-control-note">
            All beads share one clock. Finished beads stay at B. The orange bead
            follows the cycloid; drag it to scrub the race.
          </p>
          <div className="physics-comparison">
            <table>
              <caption>From rest at A to B</caption>
              <thead>
                <tr>
                  <th scope="col">Track</th>
                  <th scope="col">Length</th>
                  <th scope="col">Arrival</th>
                  <th scope="col">Behind cycloid</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Cycloid', points: tracks.cycloid },
                  { name: 'Straight ramp', points: tracks.line },
                  { name: 'Parabolic ramp', points: tracks.parabola },
                ].map((p) => (
                  <tr key={p.name}>
                    <th scope="row">{p.name}</th>
                    <td>{measure(p.points).length.toFixed(3)} m</td>
                    <td>{end(p.points).toFixed(3)} s</td>
                    <td>
                      {(end(p.points) - end(tracks.cycloid)).toFixed(3)} s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="family-control-note">
            All reach B at the same speed,{' '}
            <MathEquation
              inline
              tex={String.raw`\sqrt{2g\Delta y}=${Math.sqrt(2 * gravity * drop).toFixed(2)}\,\mathrm{m}/\mathrm{s}`}
              fallback={`√(2gΔy) = ${Math.sqrt(2 * gravity * drop).toFixed(2)} m/s`}
            />
            . Their speeds along the way differ.
          </p>
        </section>
      </div>
      <div className="physics-notes-grid">
        <section className="family-context">
          <h2>Why this curve wins</h2>
          <p>
            A straight ramp covers the least distance, but gains speed
            gradually. A cycloid begins vertically, trading extra distance for
            an earlier gain in speed. It balances the entire journey to minimize
            time between the given endpoints.
          </p>
          <p>
            The brachistochrone is this fastest-descent problem and its
            solution. The curve itself is an inverted cycloid arc—the same
            geometric family generated by a point on a rolling circle. The blue
            path is fitted to your chosen A and B; it is not an arbitrary
            cycloid.
          </p>
          <MathEquation
            className="physics-equation"
            tex={physicsEquations.brachistochrone}
            fallback="x = r(θ − sin θ); y = −r(1 − cos θ); T = θ₁√(r/g)"
          />
          <p>
            The endpoint determines{' '}
            <MathEquation
              inline
              tex={physicsEquations.brachistochroneRadius}
              fallback="r"
            />{' '}
            and{' '}
            <MathEquation
              inline
              tex={physicsEquations.brachistochroneEndAngle}
              fallback="θ₁"
            />
            . Energy conservation gives speed{' '}
            <MathEquation
              inline
              tex={physicsEquations.brachistochroneSpeed}
              fallback="v = √(−2gy)"
            />
            , and arrival time is{' '}
            <MathEquation
              inline
              tex={physicsEquations.brachistochroneTime}
              fallback="T = ∫ from A to B of ds/v"
            />
            . The straight ramp has a closed-form time; the chosen parabola{' '}
            <MathEquation
              inline
              tex={physicsEquations.brachistochroneParabolaY}
              fallback="y = −Δy(2u − u²)"
            />
            ,{' '}
            <MathEquation
              inline
              tex={physicsEquations.brachistochroneParabolaX}
              fallback="x = Δx·u"
            />
            , is integrated numerically.
          </p>
          <a
            href="https://mathworld.wolfram.com/BrachistochroneProblem.html"
            target="_blank"
            rel="noreferrer"
          >
            Wolfram MathWorld · the brachistochrone problem ↗
          </a>
        </section>
        <section className="family-context">
          <h2>A challenge that helped shape calculus</h2>
          <p>
            Johann Bernoulli posed the problem in June 1696 and published his
            solution in 1697. Newton, Leibniz, Jakob Bernoulli, and de l’Hôpital
            also found solutions. The challenge became a landmark in the
            development of the calculus of variations: choosing an entire curve
            to minimize a quantity.
          </p>
          <p>
            The cycloid has another famous property, the <em>tautochrone</em>:
            beads released from different positions on an ideal inverted cycloid
            reach its lowest point in equal times. That is a different
            experiment from this race, which compares different tracks with the
            same endpoints.
          </p>
          <p>
            The beads here represent frictionless sliding particles constrained
            to their tracks. A real rolling ball also stores rotational energy;
            contact forces, friction, and track construction require a different
            physical model.
          </p>
          <a
            href="https://mathshistory.st-andrews.ac.uk/HistTopics/Brachistochrone/"
            target="_blank"
            rel="noreferrer"
          >
            MacTutor · Bernoulli’s challenge ↗
          </a>
          <a
            href="https://mathshistory.st-andrews.ac.uk/Curves/Cycloid/"
            target="_blank"
            rel="noreferrer"
          >
            MacTutor · cycloids and the tautochrone ↗
          </a>
        </section>
      </div>
    </PhysicsFrame>
  );
}
