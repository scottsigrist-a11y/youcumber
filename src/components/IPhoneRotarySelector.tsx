import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, Smartphone, RotateCw } from 'lucide-react';
import { IPhoneModel, IPHONE_MODELS } from '../data/iphoneModels';
import { soundEngine } from '../utils/audioFeedback';

interface IPhoneRotarySelectorProps {
  selectedPhone: IPhoneModel;
  onSelectPhone: (phone: IPhoneModel) => void;
  onConfirm: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function IPhoneRotarySelector({
  selectedPhone,
  onSelectPhone,
  onConfirm,
  isOpen,
  onToggle,
}: IPhoneRotarySelectorProps) {
  const currentIndex = IPHONE_MODELS.findIndex((p) => p.id === selectedPhone.id);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  // Rotation angle in degrees for the rotary dial wheel
  const [dialAngle, setDialAngle] = useState(activeIndex * 15);
  const isDraggingRef = useRef(false);
  const dragStartAngleRef = useRef(0);
  const dialCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dialElemRef = useRef<HTMLDivElement>(null);

  // Keep dial angle synced when activeIndex changes externally
  useEffect(() => {
    setDialAngle(activeIndex * 15);
  }, [activeIndex]);

  const selectByIndex = useCallback(
    (index: number) => {
      const clampedIndex = (index + IPHONE_MODELS.length) % IPHONE_MODELS.length;
      soundEngine.playTickSound();
      onSelectPhone(IPHONE_MODELS[clampedIndex]);
    },
    [onSelectPhone]
  );

  const handlePrev = () => {
    selectByIndex(activeIndex - 1);
  };

  const handleNext = () => {
    selectByIndex(activeIndex + 1);
  };

  // Wheel / Dial Mouse/Touch Rotation logic
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dialElemRef.current) return;
    const rect = dialElemRef.current.getBoundingClientRect();
    dialCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    isDraggingRef.current = true;
    const dx = e.clientX - dialCenterRef.current.x;
    const dy = e.clientY - dialCenterRef.current.y;
    dragStartAngleRef.current = Math.atan2(dy, dx) * (180 / Math.PI) - dialAngle;
    dialElemRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dialCenterRef.current.x;
    const dy = e.clientY - dialCenterRef.current.y;
    const currentMouseAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const newAngle = currentMouseAngle - dragStartAngleRef.current;

    setDialAngle(newAngle);

    // Map dial angle (every 15 degrees is one step)
    const step = Math.round(newAngle / 15);
    const targetIndex = ((step % IPHONE_MODELS.length) + IPHONE_MODELS.length) % IPHONE_MODELS.length;
    if (targetIndex !== activeIndex) {
      soundEngine.playTickSound();
      onSelectPhone(IPHONE_MODELS[targetIndex]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      if (dialElemRef.current && dialElemRef.current.hasPointerCapture(e.pointerId)) {
        dialElemRef.current.releasePointerCapture(e.pointerId);
      }
    }
  };

  // Keyboard navigation when open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        soundEngine.playSuccessChime();
        onConfirm();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, activeIndex, handleNext, handlePrev, onConfirm]);

  if (!isOpen) {
    // Collapsed launcher pill in the top-left of the 600x600 screen
    return (
      <button
        id="reopen-iphone-calibrator-btn"
        type="button"
        onClick={onToggle}
        title="Tap to change iPhone model or recalibrate size"
        className="pointer-events-auto flex items-center gap-2 backdrop-blur-md bg-black/85 hover:bg-slate-900 border border-lime-400/40 rounded-xl px-2.5 py-1.5 shadow-lg transition-all cursor-pointer hover:border-lime-300 group"
      >
        <div className="w-5 h-5 rounded-lg bg-lime-500/20 text-lime-300 flex items-center justify-center">
          <Smartphone className="w-3 h-3 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-lime-300">
              {selectedPhone.shortName}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          </div>
          <span className="text-[9px] font-mono text-slate-400">
            {selectedPhone.lengthInches.toFixed(1)}&quot; &times; {selectedPhone.widthInches.toFixed(1)}&quot; &bull; Calibrated
          </span>
        </div>
        <RotateCw className="w-3 h-3 text-slate-400 group-hover:text-lime-300 group-hover:rotate-90 transition-all ml-0.5" />
      </button>
    );
  }

  // Active Calibration Overlay inside the 600x600 window
  return (
    <div
      id="iphone-calibration-overlay"
      className="absolute inset-0 z-40 flex flex-col justify-between p-4 bg-black/80 backdrop-blur-md pointer-events-auto animate-fadeIn select-none"
    >
      {/* Top Banner: Whimsical Instructions */}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 via-yellow-500/20 to-lime-500/20 border border-lime-400/40 text-lime-300 text-xs font-mono font-bold shadow-sm">
          <Smartphone className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
          <span>HOLD PHONE AT WAIST TO MATCH</span>
        </div>

        <p className="mt-2 text-xs sm:text-[13px] text-slate-200 leading-snug max-w-[500px] font-medium px-2">
          Hold your iPhone vertically at your waist. Spin the rotational dial below to select your model — the cucumber will instantly match your phone&apos;s physical dimensions.
        </p>
      </div>

      {/* Center: The Whimsical Rotational Selector Dial & Phone Display */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        {/* Selected iPhone Card / Highlight Display */}
        <div className="relative mb-3 flex flex-col items-center">
          <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-black border-2 border-lime-400 shadow-xl shadow-lime-500/20 flex flex-col items-center min-w-[280px]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400">
              {selectedPhone.series} &bull; {selectedPhone.screenDiagonal}
            </span>
            <div className="text-xl font-black text-white font-sans tracking-tight mt-0.5">
              {selectedPhone.name}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs font-mono font-bold text-lime-300">
              <span className="bg-lime-500/20 px-2 py-0.5 rounded border border-lime-500/30">
                Height: {selectedPhone.lengthInches.toFixed(1)}&quot;
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="bg-lime-500/20 px-2 py-0.5 rounded border border-lime-500/30">
                Width: {selectedPhone.widthInches.toFixed(1)}&quot;
              </span>
            </div>
          </div>
        </div>

        {/* The Interactive Rotational Dial Wheel */}
        <div className="relative flex items-center justify-center gap-3">
          {/* Previous Button (<) */}
          <button
            id="dial-prev-btn"
            type="button"
            onClick={handlePrev}
            title="Previous iPhone"
            className="w-10 h-10 rounded-full bg-slate-900 border border-white/20 text-lime-300 hover:text-white hover:border-lime-400 hover:bg-slate-800 flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Interactive Circular Rotary Wheel */}
          <div
            ref={dialElemRef}
            id="iphone-rotary-dial"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-b from-slate-800 via-slate-950 to-slate-900 border-4 border-slate-700 shadow-2xl shadow-black flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
            style={{
              boxShadow: '0 0 25px rgba(163, 230, 53, 0.2), inset 0 2px 10px rgba(255,255,255,0.15)',
            }}
          >
            {/* Top Indicator Needle */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-lime-400 z-20 drop-shadow-[0_2px_4px_rgba(163,230,53,0.8)]" />

            {/* Dial Rotating Disk with radial notches */}
            <div
              className="absolute inset-2 rounded-full border border-white/10 flex items-center justify-center transition-transform duration-75"
              style={{
                transform: `rotate(${dialAngle}deg)`,
              }}
            >
              {/* Perimeter Tick Marks (every 15 degrees) */}
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-3 top-1 left-1/2 -translate-x-1/2 origin-[center_66px] sm:origin-[center_72px]"
                  style={{
                    transform: `rotate(${i * 15}deg)`,
                    backgroundColor: i % 4 === 0 ? '#a3e635' : 'rgba(255, 255, 255, 0.25)',
                    height: i % 4 === 0 ? '12px' : '7px',
                  }}
                />
              ))}

              {/* Rotary Inner Bezel & Knurled Texture */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-lime-400/30 flex flex-col items-center justify-center shadow-inner">
                <Smartphone className="w-6 h-6 text-lime-300" />
                <span className="text-[9px] font-mono font-bold text-lime-400 mt-1 uppercase tracking-wider">
                  SPIN DIAL
                </span>
              </div>
            </div>
          </div>

          {/* Next Button (>) */}
          <button
            id="dial-next-btn"
            type="button"
            onClick={handleNext}
            title="Next iPhone"
            className="w-10 h-10 rounded-full bg-slate-900 border border-white/20 text-lime-300 hover:text-white hover:border-lime-400 hover:bg-slate-800 flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Carousel Ticker Preview */}
        <div className="flex items-center justify-center gap-1.5 mt-3 overflow-hidden max-w-[380px] px-2">
          {[-2, -1, 0, 1, 2].map((offset) => {
            const idx = (activeIndex + offset + IPHONE_MODELS.length) % IPHONE_MODELS.length;
            const model = IPHONE_MODELS[idx];
            const isSelected = offset === 0;
            return (
              <button
                key={model.id + offset}
                type="button"
                onClick={() => selectByIndex(idx)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-lime-400 text-slate-950 font-bold shadow-md scale-105 ring-2 ring-lime-300'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                {model.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action: Match Cucumber & Begin Measuring */}
      <div className="flex flex-col items-center pb-2">
        <button
          id="confirm-iphone-scale-btn"
          type="button"
          onClick={() => {
            soundEngine.playSuccessChime();
            onConfirm();
          }}
          className="w-full max-w-[340px] py-3 px-6 rounded-2xl bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400 text-slate-950 font-black font-sans text-sm tracking-wide shadow-xl shadow-lime-500/30 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <Check className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
          <span>MATCH CUCUMBER &amp; BEGIN</span>
        </button>

        <span className="text-[10px] font-mono text-slate-400 mt-2">
          (You can tap the phone badge in the top-left to recalibrate anytime)
        </span>
      </div>
    </div>
  );
}
