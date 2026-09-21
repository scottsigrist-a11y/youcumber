import { useState, useEffect, useRef } from 'react';
import { Ruler, Check, Plus, Minus, MoveHorizontal, MoveVertical, ArrowLeft } from 'lucide-react';
import { soundEngine } from '../utils/audioFeedback';

interface TwoInchRulerCalibratorProps {
  initialPpi: number;
  rulerWidthPx: number;
  onRulerWidthChange: (newWidth: number) => void;
  onConfirmScale: (determinedPpi: number, p1: number, p2: number) => void;
}

export function TwoInchRulerCalibrator({
  initialPpi,
  rulerWidthPx,
  onRulerWidthChange,
  onConfirmScale,
}: TwoInchRulerCalibratorProps) {
  // Step 1: Set scale for 1 inch
  // Step 2: Set scale for 2 inches
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 measurement: height in pixels for 1 inch
  const [oneInchPx, setOneInchPx] = useState<number>(() => Math.max(25, Math.min(160, initialPpi)));

  // Step 2 measurement: height in pixels for 2 inches (initialized to 2 * oneInchPx)
  const [twoInchesPx, setTwoInchesPx] = useState<number>(() =>
    Math.max(50, Math.min(320, initialPpi * 2))
  );

  const isDraggingLengthRef = useRef(false);
  const isDraggingWidthRef = useRef(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const startLengthRef = useRef(0);
  const startWidthRef = useRef(rulerWidthPx);

  // Current active height being adjusted based on current step
  const currentRulerHeightPx = step === 1 ? oneInchPx : twoInchesPx;

  // Handler to advance or complete steps
  const handleConfirmCurrentStep = () => {
    soundEngine.playSuccessChime();
    if (step === 1) {
      // Set initial 2-inch ruler based on 2x of user's 1-inch calibration
      setTwoInchesPx(Math.max(50, Math.min(340, Math.round(oneInchPx * 2))));
      setStep(2);
    } else {
      // Both steps complete! Use both measurements to determine scale.
      // 1-inch gave oneInchPx
      // 2-inches gave twoInchesPx (which is twoInchesPx / 2 per inch)
      // Combining both measurements provides a balanced, robust calibration
      const determinedPpi = Math.max(
        20,
        Math.min(180, Math.round((oneInchPx + twoInchesPx / 2) / 2))
      );
      onConfirmScale(determinedPpi, oneInchPx, twoInchesPx);
    }
  };

  // Keyboard shortcut: Enter to confirm scale step, arrows to adjust length and width
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleConfirmCurrentStep();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        soundEngine.playTickSound();
        if (step === 1) {
          setOneInchPx((prev) => Math.min(160, prev + 2));
        } else {
          setTwoInchesPx((prev) => Math.min(340, prev + 3));
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        soundEngine.playTickSound();
        if (step === 1) {
          setOneInchPx((prev) => Math.max(25, prev - 2));
        } else {
          setTwoInchesPx((prev) => Math.max(50, prev - 3));
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        soundEngine.playTickSound();
        onRulerWidthChange(Math.min(140, Math.round(rulerWidthPx + 3)));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        soundEngine.playTickSound();
        onRulerWidthChange(Math.max(24, Math.round(rulerWidthPx - 3)));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, oneInchPx, twoInchesPx, rulerWidthPx, onRulerWidthChange]);

  const handleAdjustLength = (delta: number) => {
    soundEngine.playTickSound();
    if (step === 1) {
      setOneInchPx((prev) => Math.max(25, Math.min(160, Math.round(prev + delta))));
    } else {
      setTwoInchesPx((prev) => Math.max(50, Math.min(340, Math.round(prev + delta))));
    }
  };

  const handleAdjustWidth = (delta: number) => {
    soundEngine.playTickSound();
    onRulerWidthChange(Math.max(24, Math.min(140, Math.round(rulerWidthPx + delta))));
  };

  // Direct drag handles for touch and mouse
  const onLengthHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingLengthRef.current = true;
    startYRef.current = e.clientY;
    startLengthRef.current = currentRulerHeightPx;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onLengthHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingLengthRef.current) return;
    const dy = startYRef.current - e.clientY; // dragging up increases length
    if (step === 1) {
      const newLen = Math.max(25, Math.min(160, Math.round(startLengthRef.current + dy * 0.9)));
      if (newLen !== oneInchPx) {
        soundEngine.playTickSound();
        setOneInchPx(newLen);
      }
    } else {
      const newLen = Math.max(50, Math.min(340, Math.round(startLengthRef.current + dy * 0.9)));
      if (newLen !== twoInchesPx) {
        soundEngine.playTickSound();
        setTwoInchesPx(newLen);
      }
    }
  };

  const onLengthHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingLengthRef.current) {
      isDraggingLengthRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const onWidthHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingWidthRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = rulerWidthPx;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onWidthHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingWidthRef.current) return;
    const dx = Math.abs(e.clientX - startXRef.current);
    const newWidth = Math.max(24, Math.min(140, Math.round(startWidthRef.current + dx * 0.7)));
    if (newWidth !== rulerWidthPx) {
      soundEngine.playTickSound();
      onRulerWidthChange(newWidth);
    }
  };

  const onWidthHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingWidthRef.current) {
      isDraggingWidthRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Step 1 Ticks (0 to 1.0 inch)
  const step1Ticks = [
    { frac: 0.25, label: '1/4' },
    { frac: 0.5, label: '1/2', isHalf: true },
    { frac: 0.75, label: '3/4' },
    { frac: 1.0, label: '1.0" TARGET', isTarget: true },
  ];

  // Step 2 Ticks (0 to 2.0 inches)
  const step2Ticks = [
    { frac: 0.25, label: '1/2"' },
    { frac: 0.5, label: '1.0"', isOneInchRef: true },
    { frac: 0.75, label: '1 1/2"' },
    { frac: 1.0, label: '2.0" TARGET', isTarget: true },
  ];

  return (
    <div
      id="full-screen-ruler-calibrator"
      className="absolute inset-0 z-50 flex flex-col justify-between items-center p-5 bg-slate-950 text-white select-none animate-fadeIn overflow-hidden"
    >
      {/* Waveguide Display Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      {/* Top Header: Step Indicator & User Instructions */}
      <div className="relative z-10 flex flex-col items-center text-center mt-1 max-w-[540px]">
        {/* Step Progress Pill Badges */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              step === 1
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/30'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
            }`}
          >
            {step > 1 && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>Step 1: 1 Inch</span>
            {step > 1 && <span className="text-[10px] opacity-80">({oneInchPx}px)</span>}
          </div>

          <span className="text-slate-500 font-mono text-xs">&rarr;</span>

          <div
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
              step === 2
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/30'
                : 'bg-slate-900 text-slate-400 border border-white/10'
            }`}
          >
            <span>Step 2: 2 Inches</span>
          </div>
        </div>

        {/* Primary Step Directive */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-lime-500/20 via-emerald-500/20 to-teal-500/20 border border-lime-400/50 shadow-lg mb-1.5">
          <Ruler className="w-4 h-4 text-lime-300 animate-pulse" />
          <span className="text-sm sm:text-base font-black font-mono text-lime-300 tracking-wide uppercase">
            {step === 1
              ? 'Set scale for 1 inch and hit Enter'
              : 'Set scale for 2 inches and hit Enter'}
          </span>
        </div>

        <p className="text-xs sm:text-[13px] text-slate-300 font-medium leading-relaxed max-w-[480px]">
          {step === 1 ? (
            <>
              Adjust the ruler length below to match a{' '}
              <span className="text-yellow-300 font-bold underline decoration-yellow-400/50 underline-offset-2">
                1-inch reference
              </span>{' '}
              in your perspective, then hit <span className="text-lime-300 font-bold font-mono">Enter</span>.
            </>
          ) : (
            <>
              Now adjust the ruler to match a{' '}
              <span className="text-yellow-300 font-bold underline decoration-yellow-400/50 underline-offset-2">
                2-inch reference
              </span>
              . Both 1&quot; &amp; 2&quot; measurements will combine to determine scale!
            </>
          )}
        </p>
      </div>

      {/* Center Stage: Interactive Ruler with Target Highlight */}
      <div className="relative z-10 flex-1 flex items-center justify-center gap-7 my-auto py-2">
        {/* Length Adjust Controls */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
            Length
          </span>
          <button
            id="ruler-length-plus-btn"
            type="button"
            onClick={() => handleAdjustLength(step === 1 ? 4 : 6)}
            title="Make ruler longer"
            className="w-9 h-9 rounded-xl bg-slate-900 border border-lime-400/40 hover:bg-slate-800 text-lime-300 flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95 hover:border-lime-300"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center py-1">
            <span className="text-sm font-mono font-bold text-white leading-tight">
              {currentRulerHeightPx}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {step === 1 ? 'px for 1"' : 'px for 2"'}
            </span>
          </div>
          <button
            id="ruler-length-minus-btn"
            type="button"
            onClick={() => handleAdjustLength(step === 1 ? -4 : -6)}
            title="Make ruler shorter"
            className="w-9 h-9 rounded-xl bg-slate-900 border border-lime-400/40 hover:bg-slate-800 text-lime-300 flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95 hover:border-lime-300"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        {/* The Precision Ruler Graphic */}
        <div className="relative flex items-center justify-center">
          <div
            id="calibration-ruler-graphic"
            className="relative rounded-xl border-2 border-lime-400 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-2xl flex flex-col justify-end overflow-visible"
            style={{
              height: `${currentRulerHeightPx}px`,
              width: `${rulerWidthPx}px`,
              boxShadow: '0 0 35px rgba(163, 230, 53, 0.35), inset 0 0 20px rgba(0, 0, 0, 0.95)',
            }}
          >
            {/* Zero Base Line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400 z-10">
              <span className="absolute -left-16 -bottom-2 text-[10px] font-mono font-bold text-slate-400 whitespace-nowrap">
                0.0&quot; BASE
              </span>
            </div>

            {/* Step 1 Markings (0 to 1 inch) */}
            {step === 1 && (
              <>
                {step1Ticks.map((tick, i) => {
                  const tickBottomPx = Math.round(tick.frac * currentRulerHeightPx);
                  if (tick.isTarget) {
                    return (
                      <div
                        key={i}
                        className="absolute left-0 right-0 z-20"
                        style={{ bottom: `${tickBottomPx}px` }}
                      >
                        <div className="h-1 w-full bg-yellow-400 shadow-[0_0_12px_#facc15]" />
                        <div className="absolute -left-28 -top-3.5 flex items-center gap-1.5 bg-yellow-400/25 border border-yellow-400/80 rounded-md px-2 py-0.5 backdrop-blur-md shadow-md">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                          <span className="text-[11px] font-mono font-black text-yellow-300 whitespace-nowrap tracking-wide">
                            1.0&quot; TARGET
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={i}
                      className="absolute left-0 z-10"
                      style={{
                        bottom: `${tickBottomPx}px`,
                        width: tick.isHalf ? '60%' : '35%',
                        height: tick.isHalf ? '1.5px' : '1px',
                        backgroundColor: tick.isHalf ? '#a3e635' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      <span className="absolute left-full ml-1 -top-2 text-[8px] font-mono text-slate-400">
                        {tick.label}
                      </span>
                    </div>
                  );
                })}

                {/* Highlighted 1-Inch Target Area */}
                <div className="absolute inset-0 bg-yellow-400/10 border-t border-dashed border-yellow-400/70 pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] font-mono font-black text-yellow-300/80 -rotate-90 uppercase tracking-widest">
                    1 INCH
                  </span>
                </div>
              </>
            )}

            {/* Step 2 Markings (0 to 2 inches) */}
            {step === 2 && (
              <>
                {step2Ticks.map((tick, i) => {
                  const tickBottomPx = Math.round(tick.frac * currentRulerHeightPx);
                  if (tick.isTarget) {
                    return (
                      <div
                        key={i}
                        className="absolute left-0 right-0 z-20"
                        style={{ bottom: `${tickBottomPx}px` }}
                      >
                        <div className="h-1.5 w-full bg-yellow-400 shadow-[0_0_14px_#facc15]" />
                        <div className="absolute -left-28 -top-3.5 flex items-center gap-1.5 bg-yellow-400/25 border border-yellow-400/80 rounded-md px-2 py-0.5 backdrop-blur-md shadow-md">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                          <span className="text-[11px] font-mono font-black text-yellow-300 whitespace-nowrap tracking-wide">
                            2.0&quot; TARGET
                          </span>
                        </div>
                      </div>
                    );
                  }
                  if (tick.isOneInchRef) {
                    return (
                      <div
                        key={i}
                        className="absolute left-0 right-0 z-15"
                        style={{ bottom: `${tickBottomPx}px` }}
                      >
                        <div className="h-0.5 w-full bg-lime-400/80 border-b border-dashed border-lime-400" />
                        <span className="absolute -left-20 -top-2.5 text-[9px] font-mono font-bold text-lime-300 whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-lime-500/40">
                          1.0&quot; REF
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={i}
                      className="absolute left-0 z-10"
                      style={{
                        bottom: `${tickBottomPx}px`,
                        width: '40%',
                        height: '1px',
                        backgroundColor: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      <span className="absolute left-full ml-1 -top-2 text-[8px] font-mono text-slate-400">
                        {tick.label}
                      </span>
                    </div>
                  );
                })}

                {/* 2-Inch Full Area Highlight */}
                <div className="absolute inset-0 bg-yellow-400/10 border-t border-dashed border-yellow-400/70 pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] font-mono font-black text-yellow-300/80 -rotate-90 uppercase tracking-widest">
                    2 INCHES
                  </span>
                </div>
              </>
            )}

            {/* Drag Handle for Length at Top */}
            <div
              onPointerDown={onLengthHandlePointerDown}
              onPointerMove={onLengthHandlePointerMove}
              onPointerUp={onLengthHandlePointerUp}
              title="Drag up or down to adjust ruler length"
              className="absolute -top-4 left-1/2 -translate-x-1/2 w-9 h-5 rounded-md bg-lime-400 text-slate-950 flex items-center justify-center cursor-ns-resize shadow-lg hover:scale-110 active:scale-95 transition-transform z-30"
            >
              <MoveVertical className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            </div>

            {/* Drag Handle for Width at Right */}
            <div
              onPointerDown={onWidthHandlePointerDown}
              onPointerMove={onWidthHandlePointerMove}
              onPointerUp={onWidthHandlePointerUp}
              title="Drag left or right to adjust ruler width"
              className="absolute top-1/2 -translate-y-1/2 -right-4 w-5 h-9 rounded-md bg-lime-400 text-slate-950 flex items-center justify-center cursor-ew-resize shadow-lg hover:scale-110 active:scale-95 transition-transform z-30"
            >
              <MoveHorizontal className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Width Adjust Controls */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
            Width
          </span>
          <button
            id="ruler-width-plus-btn"
            type="button"
            onClick={() => handleAdjustWidth(4)}
            title="Make ruler wider"
            className="w-9 h-9 rounded-xl bg-slate-900 border border-lime-400/40 hover:bg-slate-800 text-lime-300 flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95 hover:border-lime-300"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center py-1">
            <span className="text-sm font-mono font-bold text-white leading-tight">
              {rulerWidthPx}
            </span>
            <span className="text-[9px] font-mono text-slate-400">px wide</span>
          </div>
          <button
            id="ruler-width-minus-btn"
            type="button"
            onClick={() => handleAdjustWidth(-4)}
            title="Make ruler narrower"
            className="w-9 h-9 rounded-xl bg-slate-900 border border-lime-400/40 hover:bg-slate-800 text-lime-300 flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95 hover:border-lime-300"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Controls: Primary Enter Action Button & Step Back */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[440px] mb-1">
        <div className="w-full flex items-center gap-2">
          {step === 2 && (
            <button
              id="back-to-step-1-btn"
              type="button"
              onClick={() => {
                soundEngine.playTickSound();
                setStep(1);
              }}
              title="Go back to Step 1 (1 inch scale)"
              className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <button
            id="confirm-current-step-btn"
            type="button"
            onClick={handleConfirmCurrentStep}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400 text-slate-950 font-black font-sans text-xs sm:text-sm tracking-wide shadow-xl shadow-lime-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Check className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform stroke-[2.5]" />
            <span>
              {step === 1
                ? 'SET 1 INCH SCALE & CONTINUE (ENTER)'
                : 'SET 2 INCHES & DETERMINE SCALE (ENTER)'}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2.5 text-[10px] font-mono text-slate-400 mt-2">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-lime-300 border border-white/20">Enter</kbd> to confirm</span>
          <span>&bull;</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-lime-300 border border-white/20">&uarr; / &darr;</kbd> length</span>
          <span>&bull;</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-lime-300 border border-white/20">&larr; / &rarr;</kbd> width</span>
        </div>
      </div>
    </div>
  );
}
