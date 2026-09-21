import React from 'react';
import { Sparkles, Star } from 'lucide-react';

interface YoucomberLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function YoucomberLogo({ className = '', size = 'lg' }: YoucomberLogoProps) {
  const isSm = size === 'sm';
  const isMd = size === 'md';
  const isXl = size === 'xl';

  return (
    <div
      id="you-comber-logo"
      className={`inline-flex flex-col items-center justify-center select-none group cursor-pointer ${className}`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Whimsical Cucumber Mascot with funky comb & smart shades */}
        <div className="relative flex items-center justify-center">
          <div
            className={`${
              isSm ? 'w-9 h-9 rounded-xl' : 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl'
            } bg-gradient-to-tr from-pink-500 via-yellow-400 to-emerald-400 p-0.5 shadow-xl shadow-lime-500/30 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}
          >
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <svg
                viewBox="0 0 48 48"
                className={`${isSm ? 'w-7 h-7' : 'w-10 h-10'} drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Whimsical Cucumber hair / comb swoop */}
                <path
                  d="M19 8C20 4 28 4 29 8C33 8 36 12 32 15C30 14 26 13 22 14C19 14 17 11 19 8Z"
                  fill="#facc15"
                />
                <path
                  d="M21 9C23 6 27 6 28 9"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Friendly cucumber body */}
                <rect x="16" y="11" width="16" height="30" rx="8" fill="#22c55e" />
                {/* Inner belly highlight */}
                <rect x="18" y="13" width="12" height="26" rx="6" fill="#4ade80" />

                {/* Playful bumps / texture */}
                <circle cx="18" cy="20" r="1.5" fill="#16a34a" />
                <circle cx="30" cy="23" r="1.5" fill="#16a34a" />
                <circle cx="18" cy="30" r="1.5" fill="#16a34a" />
                <circle cx="29" cy="33" r="1.5" fill="#16a34a" />

                {/* Rosy blush cheeks */}
                <ellipse cx="19" cy="27" rx="2" ry="1.2" fill="#f43f5e" opacity="0.8" />
                <ellipse cx="29" cy="27" rx="2" ry="1.2" fill="#f43f5e" opacity="0.8" />

                {/* Whimsical AR smart glasses */}
                <rect x="14" y="18" width="9" height="7" rx="2.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                <rect x="25" y="18" width="9" height="7" rx="2.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                <line x1="23" y1="20.5" x2="25" y2="20.5" stroke="#ffffff" strokeWidth="1.2" />

                {/* Glint reflections on glasses */}
                <line x1="16" y1="20" x2="20" y2="23" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
                <line x1="27" y1="20" x2="31" y2="23" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />

                {/* Wide happy smile */}
                <path d="M21 28C22.5 31 25.5 31 27 28" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Floating whimsical sparkle stars */}
          <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1.5 -right-1.5 animate-bounce drop-shadow" />
          <Star className="w-3 h-3 text-pink-400 fill-pink-400 absolute -bottom-1 -left-1 animate-pulse" />
        </div>

        {/* Whimsical, Bright & Fun Brand Typography: "You-comber" */}
        <div className="flex items-baseline tracking-tight font-black select-none">
          {/* "You" - Electric Sky & Candy Pink Glow */}
          <span
            className={`${
              isSm ? 'text-2xl' : isMd ? 'text-3xl' : isXl ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl'
            } bg-gradient-to-r from-sky-400 via-cyan-300 to-pink-400 bg-clip-text text-transparent font-extrabold tracking-tight transform group-hover:-translate-y-0.5 transition-transform`}
            style={{
              filter: 'drop-shadow(0 2px 10px rgba(56, 189, 248, 0.45))',
            }}
          >
            You
          </span>

          {/* "-" with colorful whimsical star effect */}
          <span
            className={`${
              isSm ? 'text-2xl' : isMd ? 'text-3xl' : isXl ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl'
            } text-yellow-400 px-0.5 transform group-hover:rotate-12 transition-transform`}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.7))',
            }}
          >
            -
          </span>

          {/* "comber" - Bright Neon Lime, Emerald & Sunshine */}
          <span
            className={`${
              isSm ? 'text-2xl' : isMd ? 'text-3xl' : isXl ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl'
            } bg-gradient-to-r from-lime-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent font-black tracking-tight transform group-hover:translate-y-0.5 transition-transform`}
            style={{
              filter: 'drop-shadow(0 2px 12px rgba(132, 204, 22, 0.55))',
            }}
          >
            comber
          </span>
        </div>
      </div>

      {/* Playful Whimsical Subtitle / Ribbon Accent */}
      <div className="flex items-center gap-2 mt-1">
        <span className="w-5 h-[1.5px] bg-gradient-to-r from-transparent to-pink-400/80 rounded-full" />
        <span className="text-[11px] sm:text-xs font-bold font-mono tracking-wide bg-gradient-to-r from-pink-300 via-yellow-200 to-lime-300 bg-clip-text text-transparent">
          What is the size of your cumcumber?
        </span>
        <span className="w-5 h-[1.5px] bg-gradient-to-l from-transparent to-lime-400/80 rounded-full" />
      </div>
    </div>
  );
}
