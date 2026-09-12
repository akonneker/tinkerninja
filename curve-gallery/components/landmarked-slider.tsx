import { Slider } from '@/components/ui/slider';
import type { ParameterLandmark } from '@/lib/parameter-landmarks';
export function LandmarkedSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  landmarks = [],
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  landmarks?: ParameterLandmark[];
}) {
  const marks = landmarks.filter((m) => m.value >= min && m.value <= max);
  return (
    <div className="landmarked-slider">
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
      {marks.length > 0 && (
        <>
          <div
            className="parameter-landmark-ticks"
            aria-label={`${label} landmarks`}
          >
            {marks.map((mark) => (
              <button
                key={mark.value}
                type="button"
                style={{ left: `${((mark.value - min) / (max - min)) * 100}%` }}
                title={`${mark.display ?? mark.value} · ${mark.label}`}
                aria-label={`Set ${label} to ${mark.display ?? mark.value}: ${mark.label}`}
                aria-pressed={Math.abs(value - mark.value) < 1e-8}
                onClick={() => onChange(mark.value)}
              >
                {mark.display ?? mark.value}
              </button>
            ))}
          </div>
          <p className="parameter-landmark-key">
            {marks.map((mark) => (
              <span key={mark.value}>
                <strong>{mark.display ?? mark.value}</strong> {mark.label}
              </span>
            ))}
          </p>
        </>
      )}
    </div>
  );
}
