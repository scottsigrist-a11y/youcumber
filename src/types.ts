export interface CucumberDimensions {
  lengthInches: number; // e.g. 7.5
  widthInches: number;  // e.g. 1.8
}

export interface OpticalCalibration {
  workingDistanceInches: number; // distance from eye/glasses to cucumber, e.g. 16 inches (table / cutting board)
  displayFovVerticalDegrees: number; // typical Meta waveguide vertical FOV: ~20 degrees
  displayFovHorizontalDegrees: number; // ~25 degrees
  displayResolutionPx: {
    width: number;
    height: number;
  };
  virtualFocalDistanceMeters: number; // waveguide focal distance, usually 1.5m - 2m
}

export type DisplayColorMode = 'waveguide-green' | 'waveguide-cyan' | 'microled-amber' | 'full-color-ar' | 'pure-white';

export interface CucumberClassification {
  type: string;
  typicalLengthRange: [number, number];
  typicalWidthRange: [number, number];
  description: string;
}
