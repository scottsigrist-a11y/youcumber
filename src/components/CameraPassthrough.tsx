import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

interface CameraPassthroughProps {
  active: boolean;
  backgroundPreset: 'countertop' | 'dark-waveguide' | 'cutting-board';
}

export function CameraPassthrough({ active, backgroundPreset }: CameraPassthroughProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const startCamera = async () => {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        if (isMounted) {
          setCameraError(
            err instanceof Error ? err.message : 'Camera access was denied or is not available in this environment.'
          );
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [active]);

  if (active && !cameraError) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
    );
  }

  // Simulated Backgrounds
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {backgroundPreset === 'cutting-board' && (
        <div className="w-full h-full bg-[#1e1b18] relative flex items-center justify-center">
          {/* Subtle wood grain texture styling */}
          <div
            className="w-full h-full opacity-60"
            style={{
              backgroundImage: `radial-gradient(#2d2720 1px, transparent 1px), radial-gradient(#2d2720 1px, #1a1714 1px)`,
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0, 20px 20px',
            }}
          />
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80" />
        </div>
      )}

      {backgroundPreset === 'countertop' && (
        <div className="w-full h-full bg-slate-900 relative">
          <div
            className="w-full h-full opacity-30"
            style={{
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/60 to-slate-950" />
        </div>
      )}

      {backgroundPreset === 'dark-waveguide' && (
        <div className="w-full h-full bg-black relative">
          <div className="absolute inset-0 bg-radial from-slate-950 via-black to-black opacity-90" />
        </div>
      )}

      {cameraError && active && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 max-w-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Camera notice: Using simulated display mode.</span>
        </div>
      )}
    </div>
  );
}
