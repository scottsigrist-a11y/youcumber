import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DisplayColorMode } from '../types';
import { TransparentCutCucumber } from './TransparentCutCucumber';

interface CucumberDisplayProps {
  lengthInches: number;
  widthInches: number;
  displayMode: DisplayColorMode;
  showCalipers: boolean;
  workingDistanceInches?: number;
  displayFovDegrees?: number;
  recentAction?: { text: string; id: number; type: 'length' | 'width' } | null;
}

export function CucumberDisplay({
  lengthInches,
  widthInches,
  displayMode,
  showCalipers,
  workingDistanceInches = 32.4, // Default 2.7 feet (32.4 inches)
  displayFovDegrees = 20,
  recentAction,
}: CucumberDisplayProps) {
  // Compute exact optical perspective scale based on eye-to-cucumber distance
  // At 2.7 ft (32.4 in), theta = 2 * atan(L / (2 * 32.4))
  const computedHeight = useMemo(() => {
    const angularRad = 2 * Math.atan(lengthInches / (2 * workingDistanceInches));
    const angularDeg = (angularRad * 180) / Math.PI;
    const fov = displayFovDegrees || 20;
    const fraction = angularDeg / fov;
    const virtualScreenHeight = 600;
    const rawPx = fraction * virtualScreenHeight;
    return Math.max(80, Math.min(rawPx, 570));
  }, [lengthInches, workingDistanceInches, displayFovDegrees]);

  const computedWidth = useMemo(() => {
    const angularRad = 2 * Math.atan(widthInches / (2 * workingDistanceInches));
    const angularDeg = (angularRad * 180) / Math.PI;
    const fov = displayFovDegrees || 20;
    const fraction = angularDeg / fov;
    const virtualScreenHeight = 600;
    const rawPx = fraction * virtualScreenHeight;
    return Math.max(22, Math.min(rawPx, 240));
  }, [widthInches, workingDistanceInches, displayFovDegrees]);

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
      className="relative w-full h-full flex flex-col justify-end items-center select-none overflow-visible pb-3 pointer-events-none"
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
              top: '10%',
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
        className="relative flex flex-col items-center justify-end transition-all duration-150 ease-out origin-bottom"
        style={{
          height: `${computedHeight}px`,
          width: `${computedWidth}px`,
        }}
      >
        {/* Top Caliper Bar on the Crown of the Cucumber */}
        {showCalipers && (
          <div
            id="top-caliper"
            className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ width: `${Math.max(computedWidth + 40, 110)}px` }}
          >
            <span
              className="text-[10px] font-mono tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-black/70 border border-white/10 mb-1"
              style={{ color: caliperAccentColor }}
            >
              TIP: {lengthInches.toFixed(1)}&quot;
            </span>
            <div
              className="h-0.5 w-full transition-colors"
              style={{ backgroundColor: caliperAccentColor, boxShadow: `0 0 6px ${caliperAccentColor}` }}
            />
            <div
              className="w-0.5 h-2 transition-colors"
              style={{ backgroundColor: caliperAccentColor }}
            />
          </div>
        )}

        {/* Vertical Dimension Leader Line (Left Side) */}
        {showCalipers && (
          <div
            id="vertical-caliper-leader"
            className="absolute -left-8 top-0 bottom-0 flex items-center pointer-events-none"
          >
            <div
              className="w-0.5 h-full relative transition-colors"
              style={{ backgroundColor: caliperAccentColor, opacity: 0.8 }}
            >
              {/* Top arrow tick */}
              <div
                className="absolute top-0 -left-1.5 w-3.5 h-0.5"
                style={{ backgroundColor: caliperAccentColor }}
              />
              {/* Bottom arrow tick */}
              <div
                className="absolute bottom-0 -left-1.5 w-3.5 h-0.5"
                style={{ backgroundColor: caliperAccentColor }}
              />
              {/* Measurement badge */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -left-14 -rotate-90 origin-center text-[11px] font-mono font-bold whitespace-nowrap px-1.5 py-0.5 rounded backdrop-blur-md shadow-md"
                style={{
                  color: caliperAccentColor,
                  backgroundColor: 'rgba(0,0,0,0.75)',
                  border: `1px solid ${caliperAccentColor}55`,
                }}
              >
                {lengthInches.toFixed(1)}&quot; L
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Width Caliper (Middle of cucumber) */}
        {showCalipers && (
          <div
            id="horizontal-width-caliper"
            className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-center pointer-events-none"
          >
            <div
              className="h-0.5 w-full relative transition-colors flex items-center justify-center"
              style={{ backgroundColor: caliperAccentColor, opacity: 0.85 }}
            >
              {/* Left bracket tick */}
              <div
                className="absolute -left-1 -top-1.5 w-0.5 h-3.5"
                style={{ backgroundColor: caliperAccentColor }}
              />
              {/* Right bracket tick */}
              <div
                className="absolute -right-1 -top-1.5 w-0.5 h-3.5"
                style={{ backgroundColor: caliperAccentColor }}
              />
              {/* Width badge */}
              <div
                className="text-[10px] font-mono font-bold whitespace-nowrap px-1.5 py-0.5 rounded backdrop-blur-md shadow-md -translate-y-4"
                style={{
                  color: caliperAccentColor,
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: `1px solid ${caliperAccentColor}55`,
                }}
              >
                DIA: {widthInches.toFixed(1)}&quot;
              </div>
            </div>
          </div>
        )}

        {/* The Cut Cucumber Image with Zero White Background, Locked to Bottom */}
        <TransparentCutCucumber
          widthPx={computedWidth}
          heightPx={computedHeight}
          displayMode={displayMode}
        />

        {/* Bottom Cut Baseline Caliper */}
        {showCalipers && (
          <div
            id="bottom-caliper"
            className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ width: `${Math.max(computedWidth + 40, 110)}px` }}
          >
            <div
              className="w-0.5 h-2 transition-colors"
              style={{ backgroundColor: caliperAccentColor }}
            />
            <div
              className="h-0.5 w-full transition-colors"
              style={{ backgroundColor: caliperAccentColor, boxShadow: `0 0 6px ${caliperAccentColor}` }}
            />
            <span
              className="text-[10px] font-mono tracking-wider uppercase font-bold mt-1 px-1.5 py-0.2 rounded bg-black/70 border border-white/10"
              style={{ color: caliperAccentColor }}
            >
              CUT BASE (0.0&quot;)
            </span>
          </div>
        )}
      </div>

      {/* Screen Bottom Reference Line */}
      <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mt-1" />
    </div>
  );
}
