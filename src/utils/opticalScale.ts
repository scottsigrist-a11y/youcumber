import { CucumberClassification } from '../types';

/**
 * Calculates the angular subtense of an object in radians
 * @param objectSizeInches Real physical size of the object
 * @param distanceInches Distance from glasses pupil to the object
 */
export function calculateAngularSubtenseRad(objectSizeInches: number, distanceInches: number): number {
  if (distanceInches <= 0) return 0;
  return 2 * Math.atan(objectSizeInches / (2 * distanceInches));
}

/**
 * Calculates the angular subtense of an object in degrees
 */
export function calculateAngularSubtenseDeg(objectSizeInches: number, distanceInches: number): number {
  return (calculateAngularSubtenseRad(objectSizeInches, distanceInches) * 180) / Math.PI;
}

/**
 * Calculates the percentage of the Meta Ray-Ban display FOV that the object covers
 * @param objectSizeInches Object physical size in inches
 * @param distanceInches Viewing distance in inches
 * @param displayFovDegrees The display field of view in degrees (e.g. 20° vertical)
 */
export function calculateDisplayCoverageRatio(
  objectSizeInches: number,
  distanceInches: number,
  displayFovDegrees: number
): number {
  if (displayFovDegrees <= 0) return 1;
  const angularDeg = calculateAngularSubtenseDeg(objectSizeInches, distanceInches);
  return angularDeg / displayFovDegrees;
}

/**
 * Calculates the exact rendered pixel dimension in a Meta Ray-Ban display waveguide
 * @param objectSizeInches Object physical size
 * @param distanceInches Distance from eye to object
 * @param fovDeg Field of view of that axis
 * @param resolutionPx Total resolution pixels along that axis
 */
export function calculateWaveguidePixelSize(
  objectSizeInches: number,
  distanceInches: number,
  fovDeg: number,
  resolutionPx: number
): number {
  const ratio = calculateDisplayCoverageRatio(objectSizeInches, distanceInches, fovDeg);
  return ratio * resolutionPx;
}

/**
 * Format inch value to 1 decimal place as specified in requirements
 */
export function formatInches(inches: number): string {
  return inches.toFixed(1);
}

/**
 * Format centimeter value to 1 decimal place
 */
export function formatCm(inches: number): string {
  return (inches * 2.54).toFixed(1);
}

export const CUCUMBER_CLASSIFICATIONS: CucumberClassification[] = [
  {
    type: 'English Hothouse Cucumber',
    typicalLengthRange: [10.0, 14.0],
    typicalWidthRange: [1.4, 2.0],
    description: 'Long, slender, seedless, shrink-wrapped variety with tender skin.',
  },
  {
    type: 'Standard American Slicer',
    typicalLengthRange: [6.0, 8.5],
    typicalWidthRange: [1.8, 2.5],
    description: 'Common garden variety with thicker, dark green waxy skin.',
  },
  {
    type: 'Persian Mini Cucumber',
    typicalLengthRange: [4.5, 6.0],
    typicalWidthRange: [1.0, 1.4],
    description: 'Thin-skinned, sweet, crisp, and practically seedless.',
  },
  {
    type: 'Kirby Pickling Cucumber',
    typicalLengthRange: [3.0, 5.5],
    typicalWidthRange: [1.2, 1.8],
    description: 'Short, bumpy, firm cucumber ideal for pickling or snacking.',
  },
  {
    type: 'Gherkin / Cornichon',
    typicalLengthRange: [1.5, 3.0],
    typicalWidthRange: [0.6, 1.1],
    description: 'Miniature crisp pickling variety.',
  },
];

export function identifyCucumberType(length: number, width: number): CucumberClassification {
  const match = CUCUMBER_CLASSIFICATIONS.find(
    (c) =>
      length >= c.typicalLengthRange[0] - 0.5 &&
      length <= c.typicalLengthRange[1] + 0.5 &&
      width >= c.typicalWidthRange[0] - 0.3 &&
      width <= c.typicalWidthRange[1] + 0.3
  );

  if (match) return match;

  if (length > 8.5) return CUCUMBER_CLASSIFICATIONS[0];
  if (length < 3.5) return CUCUMBER_CLASSIFICATIONS[4];
  if (length < 5.5 && width < 1.4) return CUCUMBER_CLASSIFICATIONS[2];
  if (length < 5.5) return CUCUMBER_CLASSIFICATIONS[3];
  return CUCUMBER_CLASSIFICATIONS[1];
}
