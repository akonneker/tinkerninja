'use client';
import { useId } from 'react';
import { LandmarkedSlider } from '@/components/landmarked-slider';
import type { ParameterLandmark } from '@/lib/parameter-landmarks';
export function PhysicsControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = '',
  landmarks,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  landmarks?: ParameterLandmark[];
}) {
  const id = useId();
  return (
    <div className="family-range">
      <div>
        <label htmlFor={id}>{label}</label>
        <div>
          <input
            id={id}
            type="number"
            min={min}
            max={max}
            step={step}
            value={Number(value.toFixed(4))}
            onChange={(e) => {
              const n = e.target.valueAsNumber;
              if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, n)));
            }}
          />
          {unit && <span> {unit}</span>}
        </div>
      </div>
      <LandmarkedSlider
        label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        landmarks={landmarks}
        onChange={onChange}
      />
    </div>
  );
}
