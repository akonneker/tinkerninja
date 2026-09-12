import { MathText } from '@/components/math-text';
('use client');
import { useMemo, useState } from 'react';
import { PageLink as Link } from '@/components/page-link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { LandmarkedSlider } from '@/components/landmarked-slider';
import { familyLandmarks } from '@/lib/parameter-landmarks';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RollingParameterMap } from '@/components/rolling-parameter-map';
import { CurveReferences } from '@/components/curve-references';
import { Explorer } from '@/components/curve-explorer';
import {
  curveFamilies,
  familyDefaults,
  familyPresets,
  buildFamilyCurve,
  initialFamilySettings,
  namedCurve,
} from '@/lib/curve-families';
import type { FamilyId, FamilySettings } from '@/lib/curve-families';
export function FamilyLab({
  familyId,
  initialCurve,
}: {
  familyId: FamilyId;
  initialCurve?: string;
}) {
  const family = curveFamilies.find((f) => f.id === familyId)!;
  const [settings, setSettings] = useState<FamilySettings>(() =>
    initialFamilySettings(familyId, initialCurve),
  );
  const result = useMemo(
    () => buildFamilyCurve(familyId, settings),
    [familyId, settings],
  );
  function update(value: Partial<FamilySettings>) {
    setSettings((s) => ({ ...s, ...value }));
  }
  function range(
    key: keyof FamilySettings,
    label: string,
    min: number,
    max: number,
    step: number,
    suffix = '',
  ) {
    const value = settings[key] as number;
    return (
      <div className="family-range" key={key}>
        <div>
          <label htmlFor={`family-${key}`}>{label}</label>
          <div>
            <input
              id={`family-${key}`}
              type="number"
              min={min}
              max={max}
              step={step}
              value={Number(value.toFixed(6))}
              onChange={(e) => {
                const n = e.target.valueAsNumber;
                if (Number.isFinite(n))
                  update({
                    [key]: Math.max(
                      min,
                      Math.min(max, step === 1 ? Math.round(n) : n),
                    ),
                  });
              }}
            />
            {suffix && <span>{suffix}</span>}
          </div>
        </div>
        <LandmarkedSlider
          label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          landmarks={familyLandmarks(key, settings)}
          onChange={(v) => update({ [key]: v })}
        />
      </div>
    );
  }
  return (
    <>
      <header className="masthead">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            ∿
          </span>
          THE CURVE ATLAS
        </Link>
        <Link href="/">
          <ArrowLeft size={16} /> Named collection
        </Link>
      </header>
      <main className="family-page">
        <nav className="family-navigation" aria-label="Curve family explorers">
          {curveFamilies.map((f) => (
            <Link
              key={f.id}
              href={`/families/${f.id}`}
              aria-current={f.id === familyId ? 'page' : undefined}
            >
              {f.title}
            </Link>
          ))}
        </nav>
        <div className="family-page-heading">
          <span className="eyebrow">THE FAMILY EXPLORER</span>
          <h1>{family.title}</h1>
          <p>
            <MathText>{family.summary}</MathText>
          </p>
        </div>
        <div className="family-lab-layout">
          <div className="family-explanation">
            <section
              className="family-lab-controls"
              aria-labelledby="family-controls-title"
            >
              <div className="family-control-heading">
                <h2 id="family-controls-title">Shape the family</h2>
                <button
                  className="text-button"
                  onClick={() => setSettings({ ...familyDefaults })}
                >
                  Reset
                </button>
              </div>
              {familyId === 'rolling' && (
                <>
                  <Tabs
                    value={settings.mode}
                    onValueChange={(v) =>
                      update({
                        mode: v as FamilySettings['mode'],
                        radius: Math.min(
                          settings.radius,
                          v === 'inside' ? 0.95 : 1,
                        ),
                      })
                    }
                  >
                    <TabsList
                      className="family-mode-tabs"
                      aria-label="Rolling surface"
                    >
                      <TabsTrigger value="inside">Inside a circle</TabsTrigger>
                      <TabsTrigger value="outside">
                        Outside a circle
                      </TabsTrigger>
                      <TabsTrigger value="line">Along a line</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="family-control-note">
                    <MathText>
                      {settings.mode === 'line'
                        ? 'The rolling radius sets the scale of each arch.'
                        : 'Fixed circle radius R = 1. Change r to vary the radius ratio R/r.'}
                    </MathText>
                  </p>
                  <RollingParameterMap
                    key={settings.mode}
                    settings={settings}
                    onChange={update}
                  />
                </>
              )}
              {familyId === 'conics' &&
                range('eccentricity', 'Eccentricity e', 0, 2, 0.01)}
              {familyId === 'lissajous' && (
                <>
                  {range('fx', 'X frequency', 1, 9, 1)}
                  {range('fy', 'Y frequency', 1, 9, 1)}
                  {range('phase', 'Phase difference', 0, 180, 1, '°')}
                  {range('amplitude', 'Y / X amplitude', 0.25, 2, 0.05)}
                </>
              )}
              {familyId === 'roses' &&
                range('petals', 'Polar frequency k', 1, 12, 1)}
              {familyId === 'limacons' &&
                range('limacon', 'Cosine / constant ratio k', 0, 2.5, 0.05)}
              {familyId === 'spirals' && (
                <>
                  <Tabs
                    value={settings.growth}
                    onValueChange={(v) =>
                      update({ growth: v as FamilySettings['growth'] })
                    }
                  >
                    <TabsList
                      className="family-mode-tabs"
                      aria-label="Spiral growth law"
                    >
                      <TabsTrigger value="power">Power law</TabsTrigger>
                      <TabsTrigger value="log">Logarithmic</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {settings.growth === 'power'
                    ? range('exponent', 'Power p', -2, 2, 0.25)
                    : range('rate', 'Growth rate b', 0.05, 0.3, 0.01)}
                </>
              )}
              {familyId !== 'rolling' && (
                <>
                  <h3>
                    {familyId === 'fractals'
                      ? 'Choose a construction'
                      : 'Try a special case'}
                  </h3>
                  <div className="family-preset-grid">
                    {familyPresets[familyId].map((p) => (
                      <button
                        key={p.name}
                        aria-pressed={Object.entries(p.values).every(
                          ([key, value]) =>
                            typeof value === 'number'
                              ? Math.abs(
                                  Number(
                                    settings[key as keyof FamilySettings],
                                  ) - value,
                                ) < 1e-8
                              : settings[key as keyof FamilySettings] === value,
                        )}
                        onClick={() => update(p.values)}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="family-current" aria-live="polite">
                <span className="eyebrow">THIS SETTING</span>
                <p>
                  <MathText>{result.status}</MathText>
                </p>
                {result.matches.map((id) => (
                  <Link key={id} href={`/?curve=${id}#collection`}>
                    {namedCurve(id).name} <ArrowUpRight size={15} />
                  </Link>
                ))}
                <small>
                  {result.matches.length
                    ? 'Named entries show representative examples; scale, orientation, or parameters may differ.'
                    : 'This setting has no separate named entry in the atlas.'}
                </small>
              </div>
            </section>
            <section className="family-context">
              <h2>One idea, many curves</h2>
              <p>
                <MathText>{family.mechanism}</MathText>
              </p>
              <h3>Where it comes from</h3>
              <p>
                <MathText>{family.history}</MathText>
              </p>
              <h3>Why it matters</h3>
              <p>
                <MathText>{family.uses}</MathText>
              </p>
              <a href={family.source} target="_blank" rel="noreferrer">
                {familyId === 'fractals'
                  ? 'Sagan · Space-Filling Curves'
                  : 'MacTutor · University of St Andrews'}{' '}
                <ArrowUpRight size={14} />
              </a>
              {familyId === 'rolling' && (
                <a
                  href="https://mathshistory.st-andrews.ac.uk/Curves/Epicycloid/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Outside rolling · epicycloids <ArrowUpRight size={14} />
                </a>
              )}
            </section>
            <CurveReferences id={`family-${familyId}`} />
            <section className="family-members">
              <h2>Named curves in this family</h2>
              <div>
                {family.members.map((id) => (
                  <Link key={id} href={`/?curve=${id}#collection`}>
                    {namedCurve(id).name}
                    <ArrowUpRight size={14} />
                  </Link>
                ))}
              </div>
            </section>
          </div>
          <aside
            className="explorer family-drawing"
            aria-label={`${family.title} interactive drawing`}
          >
            <Explorer
              key={familyId === 'fractals' ? settings.construction : familyId}
              curve={result.curve}
              familyMode
            />
          </aside>
        </div>
      </main>
    </>
  );
}
