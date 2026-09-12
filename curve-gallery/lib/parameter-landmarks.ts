import type { FamilySettings } from './curve-families';
export type ParameterLandmark = {
  value: number;
  label: string;
  display?: string;
};
export function familyLandmarks(
  key: keyof FamilySettings,
  settings: FamilySettings,
): ParameterLandmark[] {
  switch (key) {
    case 'limacon':
      return [
        { value: 0, label: 'Circle' },
        { value: 0.5, label: 'Dimple threshold', display: '½' },
        { value: 1, label: 'Cardioid / loop threshold' },
      ];
    case 'eccentricity':
      return [
        { value: 0, label: 'Circle' },
        { value: 1, label: 'Parabola' },
        { value: Math.SQRT2, label: 'Rectangular hyperbola', display: '√2' },
      ];
    case 'exponent':
      return [
        { value: -1, label: 'Hyperbolic spiral' },
        { value: -0.5, label: 'Lituus', display: '−½' },
        { value: 0, label: 'Circle' },
        { value: 0.5, label: 'Fermat spiral', display: '½' },
        { value: 1, label: 'Archimedean spiral' },
      ];
    case 'petals':
      return [
        { value: 1, label: 'Circle' },
        { value: 2, label: 'Quadrifolium' },
      ];
    case 'phase':
      return [
        { value: 0, label: 'In phase', display: '0°' },
        { value: 90, label: 'Quarter cycle', display: '90°' },
        { value: 180, label: 'Opposite phase', display: '180°' },
      ];
    case 'amplitude':
      return [{ value: 1, label: 'Equal amplitudes' }];
    case 'fx':
      return [{ value: settings.fy, label: 'Equal frequencies' }];
    case 'fy':
      return [{ value: settings.fx, label: 'Equal frequencies' }];
    default:
      return [];
  }
}
