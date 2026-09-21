import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DisplayColorMode } from '../types';
import { TransparentCutCucumber } from './TransparentCutCucumber';

interface CucumberDisplayProps {
  lengthInches: number;
  widthInches: number;
  displayMode: DisplayColorMode;
  showCalipers: boolean;
  pixelsPerInch?: number;
  workingDistanceInches?: number;
  displayFovDegrees?: number;
  recentAction?: { text: string; id: number; type: 'length' | 'width' } | null;
}

export function CucumberDisplay({
  lengthInches,
  widthInches,
  displayMode,
  showCalipers,
  pixelsPerInch,
  workingDistanceInches = 32.4, // Default 2.7 feet (32.4 inches)
  displayFovDegrees = 20,
  recentAction,
}: CucumberDisplayProps) {
  // Compute scale based on direct calibrated pixelsPerInch or optical perspective
  const computedHeight = useMemo(() => {
    if (pixelsPerInch && pixelsPerInch > 0) {
      const px = lengthInches * pixelsPerInch;
      return Math.max(24, Math.min(px, 570));
    }
    const angularRad = 2 * Math.atan(lengthInches / (2 * workingDistanceInches));
    const angularDeg = (angularRad * 180) / Math.PI;
    const fov = displayFovDegrees || 20;
    const fraction = angularDeg / fov;
    const virtualScreenHeight = 600;
    const rawPx = fraction * virtualScreenHeight;
    return Math.max(24, Math.min(rawPx, 570));
  }, [lengthInches, pixelsPerInch, workingDistanceInches, displayFovDegrees]);

  const computedWidth = useMemo(() => {
    if (pixelsPerInch && pixelsPerInch > 0) {
      const px = widthInches * pixelsPerInch;
      return Math.max(16, Math.min(px, 580));
    }
    const angularRad = 2 * Math.atan(widthInches / (2 * workingDistanceInches));
    const angularDeg = (angularRad * 180) / Math.PI;
    const fov = displayFovDegrees || 20;
    const fraction = angularDeg / fov;
    const virtualScreenHeight = 600;
    const rawPx = fraction * virtualScreenHeight;
    return Math.max(16, Math.min(rawPx, 580));
  }, [widthInches, pixelsPerInch, workingDistanceInches, displayFovDegrees]);

  const caliperAccentColor = useMemo(() => {
    switch (displayMode) {
      case 'waveguide-green':
        return '#22c55e';
      case 'waveguide-cyan':
        return '#06b6d4';
      case 'microled-amber':
        return '#f59e0b';
      case 'pure-white':
        return '#ffffff';
      case 'full-color-ar':
      default:
        return '#10b981';
    }
  }, [displayMode]);

  return (
    <div
      id="cucumber-display-container"
      className="relative w-full h-full flex flex-col justify-end items-center select-none overflow-hidden pb-0 mb-0 pointer-events-none"
    >
      {/* Floating Action Feedback Pill */}
      <AnimatePresence>
        {recentAction && (
          <motion.div
            key={recentAction.id}
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            transition={{ duration: 0.22 }}
            className="absolute z-30 px-3.5 py-1 text-xs font-mono font-bold tracking-wider rounded-full shadow-xl border backdrop-blur-md"
            style={{
              top: '18%',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              borderColor: caliperAccentColor,
              color: caliperAccentColor,
            }}
          >
            {recentAction.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Cucumber Wrapper locked to the bottom, growing UPWARD */}
      <div
        id="cucumber-measurement-frame"
        className="relative flex flex-col items-center justify-end transition-all duration-150 ease-out origin-bottom mb-0 pb-0 z-20"
        style={{
          height: `${computedHeight}px`,
          width: `${computedWidth}px`,
        }}
      >
        {/* The Cut Cucumber Image with Zero White Background, Locked to Bottom */}
        <TransparentCutCucumber
          widthPx={computedWidth}
          heightPx={computedHeight}
          displayMode={displayMode}
        />
      </div>
    </div>
  );
}
