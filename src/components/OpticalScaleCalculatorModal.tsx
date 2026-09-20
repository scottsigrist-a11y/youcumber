import { useMemo, useState } from 'react';
import { X, Check, Eye, HelpCircle, ArrowRight } from 'lucide-react';
import {
  calculateAngularSubtenseDeg,
  calculateDisplayCoverageRatio,
  formatInches,
} from '../utils/opticalScale';

interface OpticalScaleCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLengthInches: number;
  currentWidthInches: number;
  workingDistanceInches: number;
  onWorkingDistanceChange: (dist: number) => void;
  displayFovDegrees: number;
  onDisplayFovChange: (fov: number) => void;
}

export function OpticalScaleCalculatorModal({
  isOpen,
  onClose,
  currentLengthInches,
  currentWidthInches,
  workingDistanceInches,
  onWorkingDistanceChange,
  displayFovDegrees,
  onDisplayFovChange,
}: OpticalScaleCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'theory' | 'calibration'>('calculator');
  const [screenPpi, setScreenPpi] = useState<number>(96); // standard default PPI

  const angularLengthDeg = useMemo(() => {
    return calculateAngularSubtenseDeg(currentLengthInches, workingDistanceInches);
  }, [currentLengthInches, workingDistanceInches]);

  const angularWidthDeg = useMemo(() => {
    return calculateAngularSubtenseDeg(currentWidthInches, workingDistanceInches);
  }, [currentWidthInches, workingDistanceInches]);

  const coverageRatio = useMemo(() => {
    return calculateDisplayCoverageRatio(currentLengthInches, workingDistanceInches, displayFovDegrees);
  }, [currentLengthInches, workingDistanceInches, displayFovDegrees]);

  const coveragePercentage = (coverageRatio * 100).toFixed(1);

  if (!isOpen) return null;

  return (
    <div
      id="optical-scale-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/40 text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Meta Ray-Ban Optical Scale Calculation
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Perspective Geometry &amp; Accurate Measurement Calibration
              </p>
            </div>
          </div>
          <button
            id="close-optical-modal-button"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 px-5 pt-2 bg-slate-950/40 gap-4 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Live Optical Calculator</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('theory')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'theory'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Optics Math &amp; Derivation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calibration')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calibration'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Screen Ruler Test</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'calculator' && (
            <div className="space-y-4">
              {/* Core Finding / Summary Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase text-lime-400 font-semibold tracking-wider">
                        Calibrated Scale for {formatInches(currentLengthInches)}&quot; Cucumber
                      </span>
                      {Math.abs(workingDistanceInches - 32.4) < 0.5 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-lime-500/20 text-lime-300 border border-lime-500/30">
                          2.7 FT CALIBRATED
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-2xl font-black font-mono text-white flex items-baseline gap-2">
                      <span>{coveragePercentage}% of Display Height</span>
                      <span className="text-xs font-mono font-normal text-slate-400">
                        (subtends {angularLengthDeg.toFixed(1)}° at {(workingDistanceInches / 12).toFixed(1)} ft / {workingDistanceInches.toFixed(1)}&quot;)
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  In an AR display, real-world size depends directly on <strong>Viewing Distance</strong>. A{' '}
                  {formatInches(currentLengthInches)}&quot; cucumber positioned {(workingDistanceInches / 12).toFixed(1)} ft ({workingDistanceInches.toFixed(1)}&quot;) away subtends exactly{' '}
                  <strong className="text-emerald-300">{angularLengthDeg.toFixed(1)}°</strong> in your vision to match 1:1.
                </p>
              </div>

              {/* Working Distance Slider */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="working-distance-slider" className="text-xs font-mono font-bold text-slate-200 uppercase">
                    Working Distance (Glasses to Cucumber)
                  </label>
                  <span className="text-sm font-mono font-bold text-lime-400">
                    {(workingDistanceInches / 12).toFixed(1)} ft ({workingDistanceInches.toFixed(1)}&quot; / {(workingDistanceInches * 2.54).toFixed(0)} cm)
                  </span>
                </div>

                <input
                  id="working-distance-slider"
                  type="range"
                  min={10}
                  max={48}
                  step={0.5}
                  value={workingDistanceInches}
                  onChange={(e) => onWorkingDistanceChange(Number(e.target.value))}
                  className="w-full accent-lime-500 cursor-pointer"
                />

                {/* Quick Preset Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { label: '2.7 ft (Tabletop)', inches: 32.4, badge: 'Target' },
                    { label: '2.0 ft (Arm Reach)', inches: 24, badge: null },
                    { label: '1.5 ft (Countertop)', inches: 18, badge: null },
                    { label: '1.0 ft (Handheld)', inches: 12, badge: null },
                  ].map((preset) => (
                    <button
                      key={preset.inches}
                      type="button"
                      onClick={() => onWorkingDistanceChange(preset.inches)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono transition-colors border cursor-pointer flex flex-col items-center ${
                        Math.abs(workingDistanceInches - preset.inches) < 0.3
                          ? 'bg-lime-500/20 text-lime-300 border-lime-500/40 font-bold shadow-sm'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span>{preset.label}</span>
                      <span className="text-[10px] text-slate-400">{preset.inches}&quot;</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Display FOV Selection */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="display-fov-slider" className="text-xs font-mono font-bold text-slate-200 uppercase">
                    Smart Glasses Display Field of View (FOV)
                  </label>
                  <span className="text-sm font-mono font-bold text-sky-400">
                    {displayFovDegrees}° Vertical
                  </span>
                </div>

                <input
                  id="display-fov-slider"
                  type="range"
                  min={12}
                  max={70}
                  step={1}
                  value={displayFovDegrees}
                  onChange={(e) => onDisplayFovChange(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onDisplayFovChange(20)}
                    className={`p-2 rounded-lg text-xs font-mono text-left border cursor-pointer ${
                      displayFovDegrees === 20
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold">Ray-Ban Display</div>
                    <div className="text-[10px] text-slate-400">20° MicroLED HUD</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDisplayFovChange(25)}
                    className={`p-2 rounded-lg text-xs font-mono text-left border cursor-pointer ${
                      displayFovDegrees === 25
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold">Waveguide Max</div>
                    <div className="text-[10px] text-slate-400">25° Monocular</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDisplayFovChange(70)}
                    className={`p-2 rounded-lg text-xs font-mono text-left border cursor-pointer ${
                      displayFovDegrees === 70
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold">Meta Orion</div>
                    <div className="text-[10px] text-slate-400">70° Wide AR</div>
                  </button>
                </div>
              </div>

              {/* Optical Math Breakdown Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Cucumber Length</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {formatInches(currentLengthInches)}&quot;
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Angular Subtense</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    {angularLengthDeg.toFixed(1)}°
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Width Angle</div>
                  <div className="text-base font-bold font-mono text-sky-400 mt-0.5">
                    {angularWidthDeg.toFixed(1)}°
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Waveguide Scale</div>
                  <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                    {coveragePercentage}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theory' && (
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  How Scale is Calculated in Meta Ray-Ban Display
                </h3>
                <p className="text-xs">
                  Unlike a physical ruler pressed against a cucumber, an AR waveguide projects a virtual image at optical infinity or 1.5–2.0 meters. Because optical see-through glasses overlay graphics directly onto human vision, the required scale depends on the <strong>angular subtense</strong> ($\theta$) of the real vegetable:
                </p>

                <div className="p-3 rounded-lg bg-black/60 border border-emerald-500/20 font-mono text-xs text-emerald-300 space-y-1">
                  <div>&theta; = 2 &times; arctan( Length / (2 &times; Distance) )</div>
                  <div className="text-[11px] text-slate-400">
                    Example: For L = {formatInches(currentLengthInches)}&quot; at D = {workingDistanceInches.toFixed(0)}&quot;
                  </div>
                  <div className="text-white font-bold">
                    &theta; = 2 &times; arctan({currentLengthInches} / {2 * workingDistanceInches}) = {angularLengthDeg.toFixed(2)}&deg;
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/60 border border-sky-500/20 font-mono text-xs text-sky-300 space-y-1">
                  <div>Display Scale % = (&theta; / Display_FOV) &times; 100</div>
                  <div className="text-white font-bold">
                    Display Scale = ({angularLengthDeg.toFixed(2)}&deg; / {displayFovDegrees}&deg;) &times; 100 = {coveragePercentage}%
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-2 text-xs">
                <h4 className="font-bold text-white">Why 2.7 Feet (32.4 Inches) Calibration Matters:</h4>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li>
                    <strong className="text-lime-300">At 2.7 feet (32.4&quot;):</strong> A 7.5&quot; cucumber subtends <strong className="text-white">13.2&deg;</strong>, covering <strong>66.0%</strong> of the Meta Ray-Ban 20&deg; vertical display.
                  </li>
                  <li>
                    <strong className="text-amber-300">At 1.5 feet (18.0&quot;):</strong> That same 7.5&quot; cucumber subtends <strong className="text-white">23.5&deg;</strong> (117.7% of the display). If the glasses displayed an 18&quot; close-up scale while looking at a cucumber 2.7 feet away, the overlay would be nearly <strong className="text-rose-300">1.8&times; too large</strong>!
                  </li>
                  <li>
                    With this active 2.7 ft calibration, the overlay scales with mathematical perspective precision so that when looking at a real cucumber resting on a table 2.7 ft away, the virtual silhouette matches it 1:1.
                  </li>
                  <li>
                    Each swipe gesture adjusts the cucumber by exactly <strong>0.25 inches</strong> for length and width.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'calibration' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-3 text-xs">
                <h3 className="text-sm font-bold text-white">Physical Screen Calibration Test</h3>
                <p className="text-slate-300">
                  If testing this web simulator on a monitor, tablet, or phone, adjust the screen PPI until this 1-inch bar matches a physical ruler:
                </p>

                {/* 1 Inch Physical Test Bar */}
                <div className="py-4 flex flex-col items-center justify-center bg-black/50 rounded-xl border border-dashed border-white/20">
                  <div
                    className="h-6 bg-emerald-500 rounded flex items-center justify-center text-[10px] font-mono font-bold text-black shadow-lg"
                    style={{ width: `${screenPpi}px` }}
                  >
                    EXACT 1.0 INCH
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">
                    Current rendering: {screenPpi} CSS pixels per inch
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label htmlFor="ppi-slider" className="text-xs font-mono text-slate-300">
                    Adjust Screen PPI:
                  </label>
                  <input
                    id="ppi-slider"
                    type="range"
                    min={72}
                    max={160}
                    value={screenPpi}
                    onChange={(e) => setScreenPpi(Number(e.target.value))}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="text-xs font-mono font-bold text-white">{screenPpi} PPI</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-slate-950/70 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Meta Ray-Ban Waveguide Optical Model v2.4
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Calibration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
