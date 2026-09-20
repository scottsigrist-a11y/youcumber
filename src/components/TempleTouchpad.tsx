import { useRef, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Hand } from 'lucide-react';

interface TempleTouchpadProps {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function TempleTouchpad({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
}: TempleTouchpadProps) {
  const [activeGesture, setActiveGesture] = useState<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const triggerGesture = (type: 'up' | 'down' | 'left' | 'right') => {
    setActiveGesture(type);
    setTimeout(() => setActiveGesture(null), 300);

    if (type === 'up') onSwipeUp();
    if (type === 'down') onSwipeDown();
    if (type === 'left') onSwipeLeft();
    if (type === 'right') onSwipeRight();
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartRef.current = { x: clientX, y: clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartRef.current) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;

    const dx = clientX - touchStartRef.current.x;
    const dy = clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipeDist = 18;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) >= minSwipeDist) {
        if (dx > 0) {
          // Swipe right -> narrower
          triggerGesture('right');
        } else {
          // Swipe left -> wider
          triggerGesture('left');
        }
      }
    } else {
      if (Math.abs(dy) >= minSwipeDist) {
        if (dy > 0) {
          // Swipe down -> smaller by .25"
          triggerGesture('down');
        } else {
          // Swipe up -> longer by .25"
          triggerGesture('up');
        }
      }
    }
  };

  return (
    <div
      id="temple-touchpad-controller"
      className="backdrop-blur-md bg-slate-950/80 border border-white/15 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 select-none"
    >
      <div className="flex items-center justify-between pb-1 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 font-bold">
          <Hand className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ray-Ban Temple Touchpad</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Gesture Controller</span>
      </div>

      {/* Swipe surface mimicking the glasses frame temple */}
      <div
        id="temple-swipe-surface"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        className="relative h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-white/20 flex flex-col items-center justify-center p-2 cursor-grab active:cursor-grabbing hover:border-emerald-500/50 transition-colors shadow-inner"
        title="Swipe directly here or use buttons below"
      >
        <div className="absolute inset-x-4 top-2 flex justify-center">
          <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUp className="w-3 h-3" /> Swipe UP: +0.25&quot; Longer
          </span>
        </div>

        <div className="w-full flex justify-between items-center px-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-sky-400 font-semibold flex items-center gap-0.5">
            <ArrowLeft className="w-3 h-3" /> LEFT: Wider
          </span>
          <div className="flex flex-col items-center opacity-60">
            <div className="w-6 h-1 rounded-full bg-white/40 mb-1" />
            <span className="text-[9px] font-mono text-slate-400">TOUCHPAD</span>
            <div className="w-6 h-1 rounded-full bg-white/40 mt-1" />
          </div>
          <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold flex items-center gap-0.5">
            RIGHT: Narrower <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-2 flex justify-center">
          <span className="text-[10px] font-mono tracking-wider uppercase text-rose-400 font-semibold flex items-center gap-1">
            <ArrowDown className="w-3 h-3" /> Swipe DOWN: -0.25&quot; Shorter
          </span>
        </div>
      </div>

      {/* Direct Clickable Arrow Pads */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <div />
        <button
          id="btn-swipe-up"
          type="button"
          onClick={() => triggerGesture('up')}
          className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1 border transition-all cursor-pointer ${
            activeGesture === 'up'
              ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30 scale-95'
              : 'bg-white/10 hover:bg-emerald-500/20 text-slate-200 border-white/15'
          }`}
          title="Swipe Up: Longer (+0.25 in)"
        >
          <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>+0.25&quot;</span>
        </button>
        <div />

        <button
          id="btn-swipe-left"
          type="button"
          onClick={() => triggerGesture('left')}
          className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1 border transition-all cursor-pointer ${
            activeGesture === 'left'
              ? 'bg-sky-500 text-black border-sky-400 shadow-md shadow-sky-500/30 scale-95'
              : 'bg-white/10 hover:bg-sky-500/20 text-slate-200 border-white/15'
          }`}
          title="Swipe Left: Wider (+0.25 in)"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
          <span>Wider</span>
        </button>

        <button
          id="btn-swipe-down"
          type="button"
          onClick={() => triggerGesture('down')}
          className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1 border transition-all cursor-pointer ${
            activeGesture === 'down'
              ? 'bg-rose-500 text-black border-rose-400 shadow-md shadow-rose-500/30 scale-95'
              : 'bg-white/10 hover:bg-rose-500/20 text-slate-200 border-white/15'
          }`}
          title="Swipe Down: Shorter (-0.25 in)"
        >
          <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
          <span>-0.25&quot;</span>
        </button>

        <button
          id="btn-swipe-right"
          type="button"
          onClick={() => triggerGesture('right')}
          className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1 border transition-all cursor-pointer ${
            activeGesture === 'right'
              ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30 scale-95'
              : 'bg-white/10 hover:bg-amber-500/20 text-slate-200 border-white/15'
          }`}
          title="Swipe Right: Narrower (-0.25 in)"
        >
          <span>Thinner</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>

      <div className="text-[10px] text-slate-400 font-mono text-center">
        Keyboard: <kbd className="px-1 py-0.5 bg-white/10 rounded">▲</kbd> Longer &bull;{' '}
        <kbd className="px-1 py-0.5 bg-white/10 rounded">▼</kbd> Shorter &bull;{' '}
        <kbd className="px-1 py-0.5 bg-white/10 rounded">◄</kbd> Wider &bull;{' '}
        <kbd className="px-1 py-0.5 bg-white/10 rounded">►</kbd> Narrower
      </div>
    </div>
  );
}
