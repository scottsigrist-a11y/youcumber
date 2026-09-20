import { Sparkles } from 'lucide-react';

interface YouCumberLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function YouCumberLogo({ className = '', size = 'md' }: YouCumberLogoProps) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div
      id="you-cumber-logo"
      className={`flex items-center gap-2.5 select-none ${className}`}
    >
      {/* Fun Cucumber Mascot wearing smart glasses */}
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-lime-500 via-emerald-400 to-green-300 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
            {/* Cucumber Body in SVG */}
            <svg
              viewBox="0 0 40 40"
              className="w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cute little cucumber */}
              <rect x="14" y="6" width="12" height="26" rx="6" fill="#22c55e" />
              <rect x="16" y="8" width="8" height="22" rx="4" fill="#4ade80" />
              {/* Tiny bumps */}
              <circle cx="15" cy="14" r="1" fill="#15803d" />
              <circle cx="25" cy="18" r="1" fill="#15803d" />
              <circle cx="15" cy="24" r="1" fill="#15803d" />
              <circle cx="24" cy="27" r="1" fill="#15803d" />
              {/* Cool Meta Sunglasses */}
              <rect x="11" y="13" width="8" height="6" rx="2" fill="#0f172a" stroke="#f8fafc" strokeWidth="0.8" />
              <rect x="21" y="13" width="8" height="6" rx="2" fill="#0f172a" stroke="#f8fafc" strokeWidth="0.8" />
              <path d="M19 15H21" stroke="#f8fafc" strokeWidth="1" />
              {/* Lens shine */}
              <line x1="12.5" y1="14.5" x2="16.5" y2="17.5" stroke="#38bdf8" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="22.5" y1="14.5" x2="26.5" y2="17.5" stroke="#38bdf8" strokeWidth="0.8" strokeLinecap="round" />
              {/* Happy Smile */}
              <path d="M17 23C18.5 25 21.5 25 23 23" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
      </div>

      {/* Fun, Colorful Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1 leading-none tracking-tight">
          {/* "You-" in vivid electric sky/cyan/coral */}
          <span
            className={`font-black tracking-tight ${
              isSm ? 'text-xl' : isLg ? 'text-3xl' : 'text-2xl sm:text-3xl'
            } bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent drop-shadow-sm font-sans`}
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(56, 189, 248, 0.4))',
            }}
          >
            You
          </span>

          <span
            className={`font-black ${
              isSm ? 'text-xl' : isLg ? 'text-3xl' : 'text-2xl sm:text-3xl'
            } text-amber-400`}
          >
            -
          </span>

          {/* "Cumber" in vibrant lime green with yellow pop */}
          <span
            className={`font-black tracking-tight ${
              isSm ? 'text-xl' : isLg ? 'text-3xl' : 'text-2xl sm:text-3xl'
            } bg-gradient-to-r from-lime-400 via-emerald-300 to-green-400 bg-clip-text text-transparent font-sans`}
            style={{
              filter: 'drop-shadow(0 2px 10px rgba(74, 222, 128, 0.45))',
            }}
          >
            Cumber
          </span>
        </div>
        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300 font-bold mt-0.5">
          Smart Measure &bull; Ray-Ban Display
        </span>
      </div>
    </div>
  );
}
