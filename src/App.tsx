import { useState, useEffect, useRef, useCallback } from 'react';
import { CucumberDimensions } from './types';
import { CucumberDisplay } from './components/CucumberDisplay';
import { YoucomberLogo } from './components/YoucomberLogo';
import { TwoInchRulerCalibrator } from './components/TwoInchRulerCalibrator';
import { soundEngine } from './utils/audioFeedback';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Check, X } from 'lucide-react';

export default function App() {
  // Calibrated scale in pixels per inch (matches user's real-world perspective to 1 inch)
  const [pixelsPerInch, setPixelsPerInch] = useState<number>(55);
  const [rulerWidthPx, setRulerWidthPx] = useState<number>(44);

  // Calibration state: Screen 1 (Full screen calibration at start)
  const [isCalibrating, setIsCalibrating] = useState<boolean>(true);

  // Recalibration confirmation modal state (triggered when user hits Enter on Screen 2)
  const [showRecalibratePrompt, setShowRecalibratePrompt] = useState<boolean>(false);

  // Cucumber dimensions in inches: Starts at 1 inch by 1 inch
  const [dimensions, setDimensions] = useState<CucumberDimensions>({
    lengthInches: 1.0,
    widthInches: 1.0,
  });

  // Feedback action pill state
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
    }, 1000);
  };

  // Swiping gestures and key adjustments:
  // "If the user swipes down, the cucumber gets smaller by .25 inches. swiping up makes it get longer by .25 inches."
  // "If the user swipes left the cucumber gets wider, if they swipe right it gets narrower."
  // "the cucumber width can go up to 10 inches and should be calcucated to circumference."
  const handleIncreaseLength = useCallback(() => {
    setDimensions((prev) => {
      const nextLength = Math.min(24.0, Number((prev.lengthInches + 0.25).toFixed(2)));
      soundEngine.playSwipeSound('up');
      triggerActionFeedback(`+0.25" LENGTH (${nextLength.toFixed(1)}")`, 'length');
      return { ...prev, lengthInches: nextLength };
    });
  }, []);

  const handleDecreaseLength = useCallback(() => {
    setDimensions((prev) => {
      const nextLength = Math.max(0.25, Number((prev.lengthInches - 0.25).toFixed(2)));
      soundEngine.playSwipeSound('down');
      triggerActionFeedback(`-0.25" LENGTH (${nextLength.toFixed(1)}")`, 'length');
      return { ...prev, lengthInches: nextLength };
    });
  }, []);

  const handleIncreaseWidth = useCallback(() => {
    setDimensions((prev) => {
      // Cucumber width can go up to 10 inches
      const nextWidth = Math.min(10.0, Number((prev.widthInches + 0.25).toFixed(2)));
      const nextCirc = (nextWidth * Math.PI).toFixed(1);
      soundEngine.playSwipeSound('left');
      triggerActionFeedback(`+0.25" WIDTH (${nextWidth.toFixed(1)}" | ${nextCirc}" circ)`, 'width');
      return { ...prev, widthInches: nextWidth };
    });
  }, []);

  const handleDecreaseWidth = useCallback(() => {
    setDimensions((prev) => {
      const nextWidth = Math.max(0.25, Number((prev.widthInches - 0.25).toFixed(2)));
      const nextCirc = (nextWidth * Math.PI).toFixed(1);
      soundEngine.playSwipeSound('right');
      triggerActionFeedback(`-0.25" WIDTH (${nextWidth.toFixed(1)}" | ${nextCirc}" circ)`, 'width');
      return { ...prev, widthInches: nextWidth };
    });
  }, []);

  // Keyboard navigation shortcuts for the main measurement screen
  useEffect(() => {
    if (isCalibrating) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If recalibrate popup is open:
      if (showRecalibratePrompt) {
        if (e.key === 'Enter' || e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          soundEngine.playSuccessChime();
          setShowRecalibratePrompt(false);
          setIsCalibrating(true);
        } else if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          soundEngine.playTickSound();
          setShowRecalibratePrompt(false);
        }
        return;
      }

      // If on main cucumber screen and user hits Enter:
      // "If they hit Enter/Select, a window pops up asking if the user wants to recalibrate. If yes, take them back to the calibration screen to sale 1 inch."
      if (e.key === 'Enter') {
        e.preventDefault();
        soundEngine.playTickSound();
        setShowRecalibratePrompt(true);
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp') handleIncreaseLength();
      if (e.key === 'ArrowDown') handleDecreaseLength();
      if (e.key === 'ArrowLeft') handleIncreaseWidth(); // wider
      if (e.key === 'ArrowRight') handleDecreaseWidth(); // narrower
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCalibrating,
    showRecalibratePrompt,
    handleIncreaseLength,
    handleDecreaseLength,
    handleIncreaseWidth,
    handleDecreaseWidth,
  ]);

  // Touch and mouse drag swipe detection on the 600x600 display
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isCalibrating || showRecalibratePrompt) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartPos.current = { x, y };
  };

  const onTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (isCalibrating || showRecalibratePrompt || !touchStartPos.current) return;
    const endX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const endY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;

    const dx = endX - touchStartPos.current.x;
    const dy = endY - touchStartPos.current.y;
    touchStartPos.current = null;

    const minSwipePx = 25;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) >= minSwipePx) {
        if (dx > 0) {
          handleDecreaseWidth(); // narrower by .25"
        } else {
          handleIncreaseWidth(); // wider by .25"
        }
      }
    } else {
      if (Math.abs(dy) >= minSwipePx) {
        if (dy > 0) {
          handleDecreaseLength(); // shorter by .25"
        } else {
          handleIncreaseLength(); // longer by .25"
        }
      }
    }
  };

  // Circumference calculation: C = π * d (where diameter is cucumber width)
  const circumferenceInches = (dimensions.widthInches * Math.PI).toFixed(1);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center select-none overflow-hidden p-0">
      {/* 
        Strict 600x600 Meta Ray-Ban Display Window:
        - Everything displays strictly within this 600x600 constraint
        - Screen 1: Full-screen 1-inch ruler calibration at start, centered. Hits Enter/Select to set.
        - Screen 2: Fresh screen with the cucumber starting at 1" x 1" and measurements.
        - Hit Enter/Select on Screen 2: Pops up window asking to recalibrate. If yes, returns to calibration.
        - Cucumber width can go up to 10 inches and is calculated to circumference.
        - Tagline: "What is the size of your cumcumber?"
        - Zero elements below the cucumber (sits flush on the bottom edge).
      */}
      <div
        id="meta-rayban-600-window"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onTouchStart}
        onMouseUp={onTouchEnd}
        className="relative w-[600px] h-[600px] bg-black overflow-hidden flex flex-col justify-end items-center cursor-grab active:cursor-grabbing border border-white/10 shadow-2xl"
        style={{
          boxShadow: '0 0 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(0,0,0,0.8)',
        }}
        title="Swipe: UP/DOWN for length (±0.25&quot;), LEFT/RIGHT for width (±0.25&quot;)"
      >
        {/* Subtle Waveguide Display Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* 
          SCREEN 1: FULL SCREEN CALIBRATION AT START (2-STEP: 1 INCH THEN 2 INCHES)
          "on calibration, tell them to set the scale for 1 inch and hit enter, then set scale for 2 inches and hit enter. Use those to determine scale"
        */}
        {isCalibrating ? (
          <TwoInchRulerCalibrator
            initialPpi={pixelsPerInch}
            rulerWidthPx={rulerWidthPx}
            onRulerWidthChange={setRulerWidthPx}
            onConfirmScale={(determinedPpi, p1, p2) => {
              setPixelsPerInch(determinedPpi);
              setIsCalibrating(false);
              // Cucumber starts at 1 inch by 1 inch on the fresh screen
              setDimensions({ lengthInches: 1.0, widthInches: 1.0 });
              triggerActionFeedback(
                `CALIBRATED: ${determinedPpi} px/in (1"=${p1}px, 2"=${p2}px)`,
                'length'
              );
            }}
          />
        ) : (
          /* 
            SCREEN 2: FRESH SCREEN WITH CUCUMBER & MEASUREMENTS
          */
          <>
            {/* Top-Left: Recalibrate Button (also triggers popup/recalibration) */}
            <div className="absolute top-4 left-4 z-30">
              <button
                id="recalibrate-trigger-btn"
                type="button"
                onClick={() => {
                  soundEngine.playTickSound();
                  setShowRecalibratePrompt(true);
                }}
                title="Recalibrate scale (Enter)"
                className="flex items-center gap-1.5 backdrop-blur-md bg-black/80 hover:bg-slate-900 border border-white/20 hover:border-lime-400/60 rounded-xl px-2.5 py-1.5 shadow-lg text-slate-300 hover:text-lime-300 transition-all cursor-pointer group"
              >
                <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform" />
                <span className="text-[10px] font-mono font-bold tracking-wide">
                  Recalibrate (Enter)
                </span>
              </button>
            </div>

            {/* Top-Center: Whimsical "You-comber" Logo with Tagline: "What is the size of your cumcumber?" */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <YoucomberLogo size="sm" />
            </div>

            {/* Top-Right: Length, Width (up to 10"), and Circumference Calculated to 1 Decimal Place */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none flex flex-col items-end">
              <div
                id="cucumber-dimension-readout"
                className="backdrop-blur-md bg-black/85 border border-lime-400/40 rounded-xl px-3 py-1.5 shadow-lg text-right min-w-[130px]"
              >
                <div className="text-[9px] font-mono uppercase tracking-widest text-lime-400 font-bold">
                  Dimensions
                </div>
                {/* Length */}
                <div className="text-lg font-black font-mono text-white tracking-tight leading-tight mt-0.5">
                  {dimensions.lengthInches.toFixed(1)}&quot;{' '}
                  <span className="text-[10px] font-normal text-slate-400">length</span>
                </div>
                {/* Width */}
                <div className="text-sm font-black font-mono text-lime-300 tracking-tight leading-tight mt-0.5">
                  {dimensions.widthInches.toFixed(1)}&quot;{' '}
                  <span className="text-[9px] font-normal text-slate-400">width</span>
                </div>
                {/* Calculated Circumference (C = π * width) */}
                <div className="text-xs font-bold font-mono text-yellow-300 tracking-tight leading-tight mt-1 pt-1 border-t border-white/15 flex items-center justify-end gap-1">
                  <span>{circumferenceInches}&quot;</span>
                  <span className="text-[8px] font-normal text-slate-400">circ (&pi;&times;w)</span>
                </div>
              </div>
            </div>

            {/* 
              Quick HUD Arrow Controls (Discreetly positioned near bottom corners, above the bottom edge)
              Allows quick tap adjustments on touch / mouse screens in addition to swiping and keyboard
            */}
            <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl p-1 shadow-lg">
              <button
                id="hud-wider-btn"
                type="button"
                onClick={handleIncreaseWidth}
                title="Wider (Left arrow or swipe left)"
                className="w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-lime-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                id="hud-narrower-btn"
                type="button"
                onClick={handleDecreaseWidth}
                title="Narrower (Right arrow or swipe right)"
                className="w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-lime-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[9px] font-mono text-slate-400 px-1">width</span>
            </div>

            <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl p-1 shadow-lg">
              <span className="text-[9px] font-mono text-slate-400 px-1">length</span>
              <button
                id="hud-longer-btn"
                type="button"
                onClick={handleIncreaseLength}
                title="Longer (Up arrow or swipe up)"
                className="w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-lime-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                id="hud-shorter-btn"
                type="button"
                onClick={handleDecreaseLength}
                title="Shorter (Down arrow or swipe down)"
                className="w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-lime-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 
              The Cucumber Display:
              - Visible at the calibrated 1-inch scale
              - Starts at 1 inch by 1 inch
              - Lengthwise top-to-bottom
              - Flat cut side locked flush against the absolute bottom (bottom-0)
              - Grows upward as length increases
              - Zero elements below the cucumber
            */}
            <div className="w-full h-full flex flex-col justify-end items-center mb-0 pb-0 overflow-hidden">
              <CucumberDisplay
                lengthInches={dimensions.lengthInches}
                widthInches={dimensions.widthInches}
                displayMode="waveguide-green"
                showCalipers={false}
                pixelsPerInch={pixelsPerInch}
                recentAction={recentAction}
              />
            </div>

            {/* 
              RECALIBRATE CONFIRMATION POPUP MODAL
              "If they hit Enter/Select, a window pops up asking if the user wants to recalibrate. If yes, take them back to the calibration screen to scale 1 inch."
            */}
            {showRecalibratePrompt && (
              <div
                id="recalibrate-popup-modal"
                className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
              >
                <div className="w-full max-w-[380px] rounded-2xl bg-slate-900 border-2 border-lime-400/60 p-6 shadow-2xl flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-lime-400/20 border border-lime-400/40 text-lime-300 flex items-center justify-center mb-3">
                    <RotateCcw className="w-6 h-6 animate-pulse" />
                  </div>

                  <h2 className="text-base sm:text-lg font-black font-mono text-white tracking-wide uppercase">
                    Recalibrate Scale?
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 mt-2 mb-5 leading-relaxed">
                    Do you want to return to the calibration screen to set the scale for 1 inch and 2 inches?
                  </p>

                  <div className="w-full flex items-center gap-3">
                    <button
                      id="confirm-recalibrate-yes-btn"
                      type="button"
                      onClick={() => {
                        soundEngine.playSuccessChime();
                        setShowRecalibratePrompt(false);
                        setIsCalibrating(true);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Yes, Recalibrate</span>
                    </button>

                    <button
                      id="cancel-recalibrate-no-btn"
                      type="button"
                      onClick={() => {
                        soundEngine.playTickSound();
                        setShowRecalibratePrompt(false);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/20 text-slate-200 font-bold font-mono text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 mt-3">
                    Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-lime-300">Enter</kbd> for Yes, <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">Esc</kbd> for Cancel
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
