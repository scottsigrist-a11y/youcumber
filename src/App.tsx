import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  CucumberDimensions,
  DisplayColorMode,
} from './types';
import { CucumberDisplay } from './components/CucumberDisplay';
import { MetaRayBanHUD } from './components/MetaRayBanHUD';
import { TempleTouchpad } from './components/TempleTouchpad';
import { OpticalScaleCalculatorModal } from './components/OpticalScaleCalculatorModal';
import { CameraPassthrough } from './components/CameraPassthrough';
import { YouCumberLogo } from './components/YouCumberLogo';
import { soundEngine } from './utils/audioFeedback';
import {
  calculateDisplayCoverageRatio,
  identifyCucumberType,
} from './utils/opticalScale';
import {
  Sparkles,
  Layers,
} from 'lucide-react';

export default function App() {
  // Dimensions in inches (default: 7.5" length, 1.8" width - typical American slicer)
  const [dimensions, setDimensions] = useState<CucumberDimensions>({
    lengthInches: 7.5,
    widthInches: 1.8,
  });

  // Optical display parameters calibrated for cucumber at 2.7 feet (32.4 inches)
  const [workingDistanceInches, setWorkingDistanceInches] = useState<number>(32.4); // 2.7 ft calibrated default
  const [displayFovDegrees, setDisplayFovDegrees] = useState<number>(20); // standard Meta waveguide FOV
  const [displayMode, setDisplayMode] = useState<DisplayColorMode>('waveguide-green');
  const [showCalipers, setShowCalipers] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState<boolean>(false);
  const [bgPreset, setBgPreset] = useState<'countertop' | 'dark-waveguide' | 'cutting-board'>('countertop');

  // Feedback banner state for swipe events
  const [recentAction, setRecentAction] = useState<{
    text: string;
    id: number;
    type: 'length' | 'width';
  } | null>(null);

  const actionTimeoutRef = useRef<number | null>(null);

  const triggerActionFeedback = (text: string, type: 'length' | 'width') => {
    if (actionTimeoutRef.current) {
      window.clearTimeout(actionTimeoutRef.current);
    }
    const newId = Date.now();
    setRecentAction({ text, id: newId, type });
    actionTimeoutRef.current = window.setTimeout(() => {
      setRecentAction(null);
    }, 1200);
  };

  // Swiping gestures defined in prompt:
  // "If the user swipes down, the cucumber gets smaller by .25 inches. swiping up makes it get longer by .25 inches."
  // "If the user swipes left the cucumber gets wider, if they swipe right it gets narrower."
  const handleSwipeUp = useCallback(() => {
    setDimensions((prev) => {
      const nextLength = Math.min(18.0, Number((prev.lengthInches + 0.25).toFixed(2)));
      soundEngine.playSwipeSound('up');
      triggerActionFeedback(`LENGTH +0.25" (${nextLength.toFixed(1)}")`, 'length');
      return { ...prev, lengthInches: nextLength };
    });
  }, []);

  const handleSwipeDown = useCallback(() => {
    setDimensions((prev) => {
      const nextLength = Math.max(1.5, Number((prev.lengthInches - 0.25).toFixed(2)));
      soundEngine.playSwipeSound('down');
      triggerActionFeedback(`LENGTH -0.25" (${nextLength.toFixed(1)}")`, 'length');
      return { ...prev, lengthInches: nextLength };
    });
  }, []);

  const handleSwipeLeft = useCallback(() => {
    setDimensions((prev) => {
      const nextWidth = Math.min(4.5, Number((prev.widthInches + 0.25).toFixed(2)));
      soundEngine.playSwipeSound('left');
      triggerActionFeedback(`WIDTH +0.25" (${nextWidth.toFixed(1)}")`, 'width');
      return { ...prev, widthInches: nextWidth };
    });
  }, []);

  const handleSwipeRight = useCallback(() => {
    setDimensions((prev) => {
      const nextWidth = Math.max(0.5, Number((prev.widthInches - 0.25).toFixed(2)));
      soundEngine.playSwipeSound('right');
      triggerActionFeedback(`WIDTH -0.25" (${nextWidth.toFixed(1)}")`, 'width');
      return { ...prev, widthInches: nextWidth };
    });
  }, []);

  const handleReset = useCallback(() => {
    setDimensions({ lengthInches: 7.5, widthInches: 1.8 });
    triggerActionFeedback('RESET TO 7.5" x 1.8"', 'length');
  }, []);

  // Keyboard controls for desktop convenience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp') handleSwipeUp();
      if (e.key === 'ArrowDown') handleSwipeDown();
      if (e.key === 'ArrowLeft') handleSwipeLeft();
      if (e.key === 'ArrowRight') handleSwipeRight();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipeUp, handleSwipeDown, handleSwipeLeft, handleSwipeRight]);

  // Touch gesture handler on the main AR viewport
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const onViewportTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartPos.current = { x, y };
  };

  const onViewportTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartPos.current) return;
    const endX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const endY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;

    const dx = endX - touchStartPos.current.x;
    const dy = endY - touchStartPos.current.y;
    touchStartPos.current = null;

    const minSwipePx = 25;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) >= minSwipePx) {
        if (dx > 0) {
          handleSwipeRight(); // narrower
        } else {
          handleSwipeLeft(); // wider
        }
      }
    } else {
      if (Math.abs(dy) >= minSwipePx) {
        if (dy > 0) {
          handleSwipeDown(); // shorter by .25"
        } else {
          handleSwipeUp(); // longer by .25"
        }
      }
    }
  };

  // Calculate optical scale factor based on distance and FOV
  // At reference distance of 18", reference scale is 1.0
  const opticalScaleFactor = useMemo(() => {
    const coverageAtCurrentDist = calculateDisplayCoverageRatio(
      dimensions.lengthInches,
      workingDistanceInches,
      displayFovDegrees
    );
    const coverageAtRefDist = calculateDisplayCoverageRatio(
      dimensions.lengthInches,
      18, // baseline reference distance
      20  // baseline reference FOV
    );
    if (coverageAtRefDist <= 0) return 1;
    return Math.max(0.6, Math.min(coverageAtCurrentDist / coverageAtRefDist, 1.8));
  }, [dimensions.lengthInches, workingDistanceInches, displayFovDegrees]);

  const cucumberClassification = identifyCucumberType(dimensions.lengthInches, dimensions.widthInches);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center select-none font-sans overflow-x-hidden">
      {/* Fun & Colorful You-Cumber Header */}
      <div className="w-full max-w-7xl px-4 pt-4 pb-2 flex items-center justify-between">
        <YouCumberLogo size="lg" />

        <div className="flex items-center gap-2">
          <button
            id="header-optical-calc-btn"
            type="button"
            onClick={() => setIsScaleModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-lime-500/20 hover:from-emerald-500/30 hover:to-lime-500/30 text-lime-300 border border-lime-500/40 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-lime-950/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Optical Scale Math</span>
            <span className="sm:hidden">Math</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl flex-1 p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left / Center: The Meta Ray-Ban Glass Viewport (8 Cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Glasses Frame Viewport Outer Container */}
          <div className="relative rounded-3xl p-1.5 sm:p-2 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-white/20 shadow-2xl shadow-black/80">
            {/* Simulated Glass Lens Screen Viewport (Locked to Bottom) */}
            <div
              id="meta-rayban-viewport"
              onTouchStart={onViewportTouchStart}
              onTouchEnd={onViewportTouchEnd}
              onMouseDown={onViewportTouchStart}
              onMouseUp={onViewportTouchEnd}
              className="relative w-full h-[520px] sm:h-[620px] rounded-2xl overflow-hidden bg-black border border-white/10 flex flex-col justify-end items-center cursor-grab active:cursor-grabbing group shadow-inner"
              title="Swipe anywhere on screen: UP/DOWN for length, LEFT/RIGHT for width"
            >
              {/* Camera or Simulated Background */}
              <CameraPassthrough active={cameraActive} backgroundPreset={bgPreset} />

              {/* Waveguide Edge Glow / Grid lines */}
              <div className="absolute inset-0 pointer-events-none opacity-20 border-2 border-emerald-500/30 rounded-2xl" />

              {/* The Cucumber Display (Lengthwise Top to Bottom, Scaled for 2.7 ft) */}
              <CucumberDisplay
                lengthInches={dimensions.lengthInches}
                widthInches={dimensions.widthInches}
                displayMode={displayMode}
                showCalipers={showCalipers}
                workingDistanceInches={workingDistanceInches}
                displayFovDegrees={displayFovDegrees}
                recentAction={recentAction}
              />

              {/* Ray-Ban Optical HUD overlay (Includes top-right measurements) */}
              <MetaRayBanHUD
                lengthInches={dimensions.lengthInches}
                widthInches={dimensions.widthInches}
                workingDistanceInches={workingDistanceInches}
                displayMode={displayMode}
                onDisplayModeChange={setDisplayMode}
                showCalipers={showCalipers}
                onToggleCalipers={() => setShowCalipers(!showCalipers)}
                onReset={handleReset}
                onOpenScaleModal={() => setIsScaleModalOpen(true)}
                cameraActive={cameraActive}
                onToggleCamera={() => setCameraActive(!cameraActive)}
                soundEnabled={soundEnabled}
                onToggleSound={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  soundEngine.setSoundEnabled(next);
                }}
              />
            </div>

            {/* Bottom Glasses Bridge & Temple Indicator */}
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Swipe Controls:</span>
                <span className="text-emerald-400">▲ +0.25&quot;</span>
                <span className="text-rose-400">▼ -0.25&quot;</span>
                <span className="text-sky-400">◄ Wider</span>
                <span className="text-amber-400">► Thinner</span>
              </div>
              <div className="flex items-center gap-1.5 text-lime-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                <span>Calibrated: {(workingDistanceInches / 12).toFixed(1)} ft ({workingDistanceInches.toFixed(1)}&quot;)</span>
              </div>
            </div>
          </div>

          {/* Cucumber Variety Classification Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                CUC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">
                    {cucumberClassification.type}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-300">
                    USDA Spec
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {cucumberClassification.description}
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-slate-300 shrink-0">
              <div>Typical: {cucumberClassification.typicalLengthRange[0]}&quot;–{cucumberClassification.typicalLengthRange[1]}&quot; L</div>
              <div className="text-slate-400 text-[11px]">Dia: {cucumberClassification.typicalWidthRange[0]}&quot;–{cucumberClassification.typicalWidthRange[1]}&quot;</div>
            </div>
          </div>
        </div>

        {/* Right Column: Ray-Ban Temple Controller & Optical Parameters (4 Cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Ray-Ban Right Temple Touchpad Simulator */}
          <TempleTouchpad
            onSwipeUp={handleSwipeUp}
            onSwipeDown={handleSwipeDown}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />

          {/* Quick Preset Cucumbers */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Cucumber Variety Presets
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Quick Set</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {[
                { name: 'Standard Slicer', l: 7.5, w: 1.8, note: 'Grocery default' },
                { name: 'English Hothouse', l: 12.0, w: 1.6, note: 'Long, slender' },
                { name: 'Persian Mini', l: 5.0, w: 1.2, note: 'Snack cucumber' },
                { name: 'Kirby Pickling', l: 4.0, w: 1.5, note: 'Pickle size' },
                { name: 'Gherkin / Cornichon', l: 2.5, w: 0.8, note: 'Mini pickle' },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setDimensions({ lengthInches: preset.l, widthInches: preset.w });
                    triggerActionFeedback(`SET TO ${preset.name.toUpperCase()}`, 'length');
                  }}
                  className={`px-3 py-2 rounded-xl text-left border text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                    Math.abs(dimensions.lengthInches - preset.l) < 0.1 && Math.abs(dimensions.widthInches - preset.w) < 0.1
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">{preset.name}</span>
                    <span className="text-[10px] text-slate-400">{preset.note}</span>
                  </div>
                  <span className="text-right text-slate-200 font-bold">
                    {preset.l.toFixed(1)}&quot; &times; {preset.w.toFixed(1)}&quot;
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Optical Scale Calculation Summary Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Meta Ray-Ban Scale Factor</span>
              </div>
              <button
                type="button"
                onClick={() => setIsScaleModalOpen(true)}
                className="text-[10px] font-mono text-emerald-400 hover:underline cursor-pointer"
              >
                Full Math &rarr;
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5">
              <p className="leading-relaxed">
                Calibrated for Meta Ray-Ban display optics (20&deg; vertical FOV) at <strong className="text-lime-300">2.7 feet (32.4&quot;)</strong>:
              </p>
              <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-emerald-300 border border-emerald-500/20 flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Target Distance:</span>
                  <span className="font-bold text-lime-400">
                    {(workingDistanceInches / 12).toFixed(1)} ft ({workingDistanceInches.toFixed(1)}&quot; / {(workingDistanceInches * 2.54).toFixed(0)} cm)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Angular Subtense:</span>
                  <span className="font-bold text-emerald-400">
                    {(2 * Math.atan(dimensions.lengthInches / (2 * workingDistanceInches)) * (180 / Math.PI)).toFixed(1)}&deg;
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waveguide Coverage:</span>
                  <span className="font-bold text-sky-300">
                    {(calculateDisplayCoverageRatio(dimensions.lengthInches, workingDistanceInches, displayFovDegrees) * 100).toFixed(1)}% FOV
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Distance Presets */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Distance Presets:</span>
                <span className="text-white font-bold">{(workingDistanceInches / 12).toFixed(1)} ft</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setWorkingDistanceInches(32.4)}
                  className={`px-2 py-1 rounded-lg border transition-all cursor-pointer text-center ${
                    Math.abs(workingDistanceInches - 32.4) < 0.2
                      ? 'bg-lime-500/20 border-lime-400 text-lime-300 font-bold shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  2.7 ft (32.4&quot;)
                  <div className="text-[9px] text-lime-400/80">Tabletop Target</div>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkingDistanceInches(24)}
                  className={`px-2 py-1 rounded-lg border transition-all cursor-pointer text-center ${
                    Math.abs(workingDistanceInches - 24) < 0.2
                      ? 'bg-lime-500/20 border-lime-400 text-lime-300 font-bold shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  2.0 ft (24&quot;)
                  <div className="text-[9px] text-slate-400">Arm Reach</div>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkingDistanceInches(18)}
                  className={`px-2 py-1 rounded-lg border transition-all cursor-pointer text-center ${
                    Math.abs(workingDistanceInches - 18) < 0.2
                      ? 'bg-lime-500/20 border-lime-400 text-lime-300 font-bold shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  1.5 ft (18&quot;)
                  <div className="text-[9px] text-slate-400">Countertop</div>
                </button>
              </div>

              {/* Slider with expanded range */}
              <div className="pt-1">
                <input
                  type="range"
                  min={10}
                  max={48}
                  step={0.5}
                  value={workingDistanceInches}
                  onChange={(e) => setWorkingDistanceInches(Number(e.target.value))}
                  className="w-full accent-lime-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>0.8 ft (10&quot;)</span>
                  <span className="text-lime-400 font-semibold">2.7 ft (32.4&quot;)</span>
                  <span>4.0 ft (48&quot;)</span>
                </div>
              </div>
            </div>

            {/* Background Environment Selector */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Backdrop:
              </span>
              <div className="flex gap-1">
                {(
                  [
                    { id: 'countertop', label: 'Counter' },
                    { id: 'cutting-board', label: 'Wood' },
                    { id: 'dark-waveguide', label: 'Dark AR' },
                  ] as const
                ).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBgPreset(b.id)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                      bgPreset === b.id ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Optical Scale Calculation & FOV Theory Modal */}
      <OpticalScaleCalculatorModal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        currentLengthInches={dimensions.lengthInches}
        currentWidthInches={dimensions.widthInches}
        workingDistanceInches={workingDistanceInches}
        onWorkingDistanceChange={setWorkingDistanceInches}
        displayFovDegrees={displayFovDegrees}
        onDisplayFovChange={setDisplayFovDegrees}
      />
    </div>
  );
}
