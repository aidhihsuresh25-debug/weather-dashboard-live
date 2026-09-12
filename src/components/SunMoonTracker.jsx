import React from 'react';
import { Sunrise, Sunset, Moon, Sun } from 'lucide-react';
import { getSunProgress, getMoonPhase } from '../utils/astronomyUtils';

export default function SunMoonTracker({ dailyData = [] }) {
  const today = dailyData[0] || {};
  const sunInfo = getSunProgress(today.sunrise, today.sunset);
  const moonInfo = getMoonPhase();

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
          <Sun className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Solar & Lunar Astronomy</h2>
          <p className="text-xs text-slate-400">Daylight progress, twilight times, and moon phase illumination</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Solar Daylight Arc */}
        <div className="p-5 bg-slate-800/40 border border-white/10 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-300">Sun daylight Arc</span>
            <span className="text-xs font-semibold text-cyan-300">{sunInfo.label}</span>
          </div>

          {/* Arch Visual Progress Bar */}
          <div className="relative py-4 my-2">
            <div className="w-full h-3 bg-slate-950/80 rounded-full relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-rose-500 rounded-full transition-all duration-700"
                style={{ width: `${sunInfo.progress}%` }}
              />
            </div>

            {/* Sun Icon Position Indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 pointer-events-none"
              style={{ left: `calc(${sunInfo.progress}% - 12px)` }}
            >
              <div className="p-1.5 bg-amber-400 text-slate-950 rounded-full shadow-lg shadow-amber-400/50 animate-pulse">
                <Sun className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">Sunrise</div>
                <div className="text-xs font-bold text-white">{formatTime(today.sunrise)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sunset className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-[10px] text-slate-400">Sunset</div>
                <div className="text-xs font-bold text-white">{formatTime(today.sunset)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Lunar Phase Tracker */}
        <div className="p-5 bg-slate-800/40 border border-white/10 rounded-2xl backdrop-blur-md flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300">Moon Phase</span>
            <h3 className="text-xl font-extrabold text-white">{moonInfo.name}</h3>
            <div className="text-xs font-semibold text-cyan-300">{moonInfo.illumination}% Illumination</div>
            <p className="text-[11px] text-slate-400 font-medium">
              Next full moon phase estimated within 12 days.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 border border-white/10 rounded-2xl shadow-inner min-w-[100px]">
            <span className="text-4xl my-1">{moonInfo.symbol}</span>
            <span className="text-[10px] font-mono text-slate-400 mt-1">Lunar Cycle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
