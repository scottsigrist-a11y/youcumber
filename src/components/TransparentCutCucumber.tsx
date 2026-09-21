import { useEffect, useRef, useState } from 'react';
import cutCucumberImg from '../assets/images/cut_cucumber_vertical_1789944164414.jpg';

interface TransparentCutCucumberProps {
  widthPx: number;
  heightPx: number;
  displayMode: string;
}

/**
 * Renders the cut cucumber with 100% eliminated background (zero white/box artifacts).
 * The flat cut side is positioned at the very bottom, with realistic seeds & cut flesh cross-section.
 */
export function TransparentCutCucumber({
  widthPx,
  heightPx,
  displayMode,
}: TransparentCutCucumberProps) {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Process image to eliminate any white or dark background, ensuring pure transparent cutout
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = cutCucumberImg;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = img.naturalWidth || 600;
      const h = img.naturalHeight || 1000;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample corners to detect background color
      const cornerSamples = [
        [0, 0],
        [w - 1, 0],
        [0, h - 1],
        [w - 1, h - 1],
        [2, 2],
        [w - 3, 2],
      ];

      let bgR = 0;
      let bgG = 0;
      let bgB = 0;
      cornerSamples.forEach(([x, y]) => {
        const idx = (y * w + x) * 4;
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      });
      bgR /= cornerSamples.length;
      bgG /= cornerSamples.length;
      bgB /= cornerSamples.length;

      const isBgDark = (bgR + bgG + bgB) / 3 < 50;
      const isBgLight = (bgR + bgG + bgB) / 3 > 200;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // If background is light/white, remove all near-white pixels
        if (isBgLight) {
          if (r > 215 && g > 215 && b > 215) {
            data[i + 3] = 0;
          } else if (r > 195 && g > 195 && b > 195) {
            // Feather edge
            const alpha = Math.max(0, 255 - ((r + g + b) / 3 - 195) * 8);
            data[i + 3] = Math.min(data[i + 3], alpha);
          }
        }
        // If background is dark/black, remove all near-black pixels around cucumber
        else if (isBgDark) {
          if (r < 25 && g < 30 && b < 25) {
            data[i + 3] = 0;
          } else if (r < 45 && g < 50 && b < 45) {
            // Feather edge
            const brightness = Math.max(r, Math.max(g, b));
            const alpha = Math.max(0, (brightness - 25) * 12);
            data[i + 3] = Math.min(data[i + 3], alpha);
          }
        } else {
          // General distance to corner background
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          if (dist < 35) {
            data[i + 3] = 0;
          } else if (dist < 55) {
            data[i + 3] = Math.min(data[i + 3], ((dist - 35) / 20) * 255);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setProcessedSrc(canvas.toDataURL('image/png'));
    };
  }, []);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-end overflow-visible select-none"
      style={{ transformOrigin: 'bottom center' }}
    >
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Cut Cucumber Body (Lengthwise rising up from bottom) */}
      <div
        className="relative w-full flex-1 flex items-end justify-center overflow-visible"
        style={{
          height: `${heightPx}px`,
          width: `${widthPx}px`,
        }}
      >
        <img
          src={processedSrc || cutCucumberImg}
          alt="Cut cucumber oriented vertically"
          referrerPolicy="no-referrer"
          className="w-full h-full object-fill pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
          style={{
            transformOrigin: 'bottom center',
            filter:
              displayMode === 'waveguide-green'
                ? 'brightness(1.1) contrast(1.3) drop-shadow(0 0 16px rgba(34, 197, 94, 0.4))'
                : displayMode === 'waveguide-cyan'
                ? 'brightness(1.1) contrast(1.3) hue-rotate(90deg) drop-shadow(0 0 16px rgba(6, 182, 212, 0.4))'
                : displayMode === 'microled-amber'
                ? 'brightness(1.1) contrast(1.2) sepia(1) saturate(3) hue-rotate(-20deg) drop-shadow(0 0 16px rgba(245, 158, 11, 0.4))'
                : 'brightness(1.05) contrast(1.05)',
          }}
        />

        {/* Detailed Cut Cross-Section Slice Disc at the Bottom */}
        <div
          id="cucumber-cut-bottom-face"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: `${Math.max(widthPx * 0.96, 24)}px`,
            height: `${Math.min(widthPx * 0.35, 75)}px`,
          }}
        >
          {/* 3D Cut Cucumber Base Showing Juicy Flesh and Seeds */}
          <svg
            viewBox="0 0 100 45"
            className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
            preserveAspectRatio="none"
          >
            {/* Dark green outer skin rim */}
            <ellipse cx="50" cy="22.5" rx="49" ry="21.5" fill="#14532d" stroke="#166534" strokeWidth="2" />
            {/* Crisp pale green flesh */}
            <ellipse cx="50" cy="22.5" rx="44" ry="18" fill="#dcfce7" />
            {/* Translucent watery center core */}
            <ellipse cx="50" cy="22.5" rx="34" ry="13" fill="#bbf7d0" opacity="0.9" />
            {/* Cucumber seed segments radiating in 3 lobes */}
            <g fill="#86efac" stroke="#4ade80" strokeWidth="0.8">
              {/* Top seed lobe */}
              <ellipse cx="50" cy="16" rx="10" ry="4" />
              <circle cx="46" cy="16" r="1.2" fill="#15803d" />
              <circle cx="54" cy="16" r="1.2" fill="#15803d" />

              {/* Bottom-left seed lobe */}
              <ellipse cx="40" cy="26" rx="9" ry="3.5" transform="rotate(-20 40 26)" />
              <circle cx="37" cy="26" r="1.2" fill="#15803d" />
              <circle cx="43" cy="26" r="1.2" fill="#15803d" />

              {/* Bottom-right seed lobe */}
              <ellipse cx="60" cy="26" rx="9" ry="3.5" transform="rotate(20 60 26)" />
              <circle cx="57" cy="26" r="1.2" fill="#15803d" />
              <circle cx="63" cy="26" r="1.2" fill="#15803d" />
            </g>
            {/* Center triangular seed division */}
            <path
              d="M50 20 L44 26 L56 26 Z"
              fill="#22c55e"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
