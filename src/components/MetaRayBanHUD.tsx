import { useState } from 'react';
import { Info } from 'lucide-react';
import { DisplayColorMode } from '../types';
import { identifyCucumberType } from '../utils/opticalScale';

interface MetaRayBanHUDProps {
  lengthInches: number;
  widthInches: number;
  workingDistanceInches: number;
  displayMode?: DisplayColorMode;
  onDisplayModeChange?: (mode: DisplayColorMode) => void;
  showCalipers?: boolean;
  onToggleCalipers?: () => void;
  onReset?: () => void;
  onOpenScaleModal?: () => void;
  cameraActive?: boolean;
  onToggleCamera?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export function MetaRayBanHUD({
  lengthInches,
  widthInches,
  workingDistanceInches,
  displayMode = 'waveguide-green',
}: MetaRayBanHUDProps) {
  const [showUnitCm, setShowUnitCm] = useState(false);
  const cucumberType = identifyCucumberType(lengthInches, widthInches);

  const themeColors = {
    'waveguide-green': { text: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-950/40', glow: '#22c55e' },
    'waveguide-cyan': { text: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-950/40', glow: '#06b6d4' },
    'microled-amber': { text: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-950/40', glow: '#f59e0b' },
    'pure-white': { text: 'text-slate-100', border: 'border-slate-400/40', bg: 'bg-slate-900/40', glow: '#ffffff' },
    'full-color-ar': { text: 'text-emerald-300', border: 'border-white/20', bg: 'bg-slate-900/60', glow: '#10b981' },
  }[displayMode];

  const displayLength = showUnitCm ? (lengthInches * 2.54).toFixed(1) : lengthInches.toFixed(1);
  const displayWidth = showUnitCm ? (widthInches * 2.54).toFixed(1) : widthInches.toFixed(1);
  const unitLabel = showUnitCm ? 'cm' : 'in';

  return (
    <div id="meta-rayban-hud-overlay" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: You-comber HUD Status */}
        <div className="pointer-events-auto flex items-center gap-2 backdrop-blur-md rounded-xl px-3 py-2 bg-black/60 border border-white/10 shadow-lg">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-tight bg-gradient-to-r from-sky-400 via-pink-400 to-lime-300 bg-clip-text text-transparent font-sans">
              You-comber
            </span>
            <span className="text-[10px] text-slate-300 font-mono">
              Dist: {(workingDistanceInches / 12).toFixed(1)} ft ({workingDistanceInches.toFixed(1)}&quot;) &bull; {cucumberType.type.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* TOP-RIGHT HAND SIDE: Required length and width to 1 decimal in inches */}
        <div
          id="hud-top-right-measurements"
          className="pointer-events-auto flex flex-col items-end backdrop-blur-md rounded-xl p-3 bg-black/75 border shadow-2xl transition-all"
          style={{
            borderColor: `${themeColors.glow}55`,
            boxShadow: `0 0 20px ${themeColors.glow}22`,
          }}
        >
          <div className="text-[9px] font-mono tracking-widest uppercase text-slate-400 mb-0.5">
            CUCUMBER METRICS (1-DECIMAL)
          </div>

          <div className="flex items-baseline gap-3">
            {/* Length */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Length</span>
              <div className="flex items-baseline gap-0.5">
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${themeColors.text}`}>
                  {displayLength}
                </span>
                <span className="text-xs font-mono font-medium text-slate-400">{unitLabel}</span>
              </div>
            </div>

            <div className="h-7 w-[1px] bg-white/20 my-auto" />

            {/* Width */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Width</span>
              <div className="flex items-baseline gap-0.5">
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${themeColors.text}`}>
                  {displayWidth}
                </span>
                <span className="text-xs font-mono font-medium text-slate-400">{unitLabel}</span>
              </div>
            </div>
          </div>

          {/* Unit Toggle & Accuracy Note */}
          <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between w-full gap-2">
            <span className="text-[10px] text-slate-400 font-mono">
              Step: ±0.25&quot;
            </span>
            <button
              id="unit-toggle-button"
              type="button"
              onClick={() => setShowUnitCm(!showUnitCm)}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors uppercase cursor-pointer"
            >
              Unit: {unitLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Center Target Waveguide Reticle Indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 flex items-center justify-center">
        <div className="w-16 h-16 border border-dashed border-white/50 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
