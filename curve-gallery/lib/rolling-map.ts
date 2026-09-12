import type { FamilySettings } from './curve-families';
export type RollingParameters = Pick<FamilySettings, 'radius' | 'offset'>;
export type RollingMode = FamilySettings['mode'];
export const mapFrame = { left: 48, top: 38, width: 320, height: 218 };
export const radiusLimit = (mode: RollingMode) =>
  mode === 'inside' ? 0.95 : 1;
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
export function parametersAt(
  x: number,
  y: number,
  mode: RollingMode,
): RollingParameters {
  return {
    radius:
      Math.round(
        0.1 *
          Math.exp(
            clamp((x - mapFrame.left) / mapFrame.width, 0, 1) *
              Math.log(radiusLimit(mode) / 0.1),
          ) *
          1_000_000,
      ) / 1_000_000,
    offset:
      Math.round(clamp(1 - (y - mapFrame.top) / mapFrame.height, 0, 1) * 2000) /
      1000,
  };
}
export function positionFor(
  { radius, offset }: RollingParameters,
  mode: RollingMode,
) {
  return {
    x:
      mapFrame.left +
      (Math.log(radius / 0.1) / Math.log(radiusLimit(mode) / 0.1)) *
        mapFrame.width,
    y: mapFrame.top + (1 - offset / 2) * mapFrame.height,
  };
}

// With fixed radius R = 1, these retain exact r = 1/n settings on selection.
export function integerRatioPoints(mode: RollingMode) {
  if (mode === 'line') return [];
  return Array.from({ length: 10 }, (_, i) => i + 1)
    .filter((ratio) => 1 / ratio <= radiusLimit(mode))
    .flatMap((ratio) =>
      [1, 2].map((offset) => ({
        ratio,
        parameters: { radius: 1 / ratio, offset },
      })),
    );
}
