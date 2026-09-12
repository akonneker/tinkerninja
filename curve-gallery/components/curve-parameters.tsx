import { MathText } from '@/components/math-text';
('use client');
import { Slider } from '@/components/ui/slider';
import { defaultFigures, lissajousPresets } from '@/lib/curve-controls';
import type { FigureSettings } from '@/lib/curve-controls';
export function CurveParameters({
  id,
  controlId,
  value,
  onChange,
}: {
  id: string;
  controlId: string;
  value: FigureSettings;
  onChange: (v: FigureSettings) => void;
}) {
  if (!['lissajous', 'rose', 'limacon'].includes(id)) return null;
  function change(key: keyof FigureSettings, n: number) {
    onChange({ ...value, [key]: n });
  }
  const range = (
    key: keyof FigureSettings,
    label: string,
    min: number,
    max: number,
    step: number,
    suffix = '',
  ) => (
    <div className="figure-range">
      <div>
        <span id={`${controlId}-${key}`}>{label}</span>
        <output>
          {value[key]}
          {suffix}
        </output>
      </div>
      <Slider
        aria-labelledby={`${controlId}-${key}`}
        min={min}
        max={max}
        step={step}
        value={[value[key]]}
        onValueChange={(v) => change(key, Array.isArray(v) ? v[0] : v)}
      />
    </div>
  );
  return (
    <section className="figure-controls" aria-label="Curve special cases">
      <div className="figure-heading">
        <h3>
          {id === 'lissajous'
            ? 'Lissajous figures'
            : id === 'rose'
              ? 'Rose family'
              : 'Limaçon family'}
        </h3>
        <button
          className="text-button"
          onClick={() => onChange({ ...defaultFigures })}
        >
          Reset
        </button>
      </div>
      {id === 'lissajous' ? (
        <>
          <div className="figure-presets">
            {lissajousPresets.map((p) => (
              <button
                key={p.name}
                aria-pressed={
                  p.fx === value.fx &&
                  p.fy === value.fy &&
                  p.phase === value.phase &&
                  p.amplitude === value.amplitude
                }
                onClick={() =>
                  onChange({
                    ...value,
                    fx: p.fx,
                    fy: p.fy,
                    phase: p.phase,
                    amplitude: p.amplitude,
                  })
                }
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="frequency-controls">
            {(['fx', 'fy'] as const).map((key, i) => (
              <label key={key}>
                {i ? 'Y' : 'X'} frequency
                <input
                  type="number"
                  min={1}
                  max={9}
                  step={1}
                  value={value[key]}
                  onChange={(e) => {
                    if (e.target.value !== '')
                      change(
                        key,
                        Math.max(
                          1,
                          Math.min(9, Math.round(e.target.valueAsNumber) || 1),
                        ),
                      );
                  }}
                />
              </label>
            ))}
          </div>
          {range('phase', 'Phase difference', 0, 180, 1, '°')}
          {range('amplitude', 'Y / X amplitude', 0.25, 2, 0.05)}
          <p>
            Integer frequencies close the figure. Phase changes how the
            oscillations line up.
          </p>
        </>
      ) : id === 'rose' ? (
        <>
          <div className="figure-presets">
            {[3, 4, 5, 8].map((k) => (
              <button
                key={k}
                aria-pressed={value.petals === k}
                onClick={() => change('petals', k)}
              >
                {k % 2 ? k : 2 * k} petals
              </button>
            ))}
          </div>
          {range('petals', 'Polar frequency k', 1, 12, 1)}
          <p>
            <MathText>{'Odd k gives k petals; even k gives 2k.'}</MathText>
          </p>
        </>
      ) : (
        <>
          <div className="figure-presets">
            {[
              { name: 'Circle', k: 0 },
              { name: 'Dimpled', k: 0.75 },
              { name: 'Cardioid', k: 1 },
              { name: 'Inner loop', k: 2 },
            ].map((p) => (
              <button
                key={p.name}
                aria-pressed={value.limacon === p.k}
                onClick={() => change('limacon', p.k)}
              >
                {p.name}
              </button>
            ))}
          </div>
          {range('limacon', 'Cosine / constant ratio', 0, 2.5, 0.05)}
        </>
      )}
    </section>
  );
}
