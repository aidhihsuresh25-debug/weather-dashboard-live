import React from 'react';
import { Volume2, VolumeX, CloudRain, Wind, CloudLightning, Sun, X, Sliders } from 'lucide-react';
import { weatherAudio } from '../utils/audioSynth';

export default function AudioControlModal({ isOpen, onClose, isMuted, onToggleMute, activeTheme, onSelectTheme }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 text-cyan-300 rounded-2xl border border-cyan-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Procedural Web Audio Ambiance</h3>
            <p className="text-xs text-slate-400">Synthesized atmospheric soundscapes</p>
          </div>
        </div>

        {/* Master Mute & Volume Slider */}
        <div className="p-4 bg-slate-800/40 border border-white/10 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Master Sound State</span>
            <button
              onClick={onToggleMute}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                !isMuted
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{!isMuted ? 'AUDIO ACTIVE' : 'MUTED'}</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
              <span>Volume</span>
              <span>{Math.round(weatherAudio.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weatherAudio.volume}
              onChange={(e) => weatherAudio.setVolume(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Sound Theme Selection */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300">Select Ambient Soundscape</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSelectTheme('rain')}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                activeTheme === 'rain' && !isMuted
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/40 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <div className="text-xs font-bold">Gentle Rain</div>
                <div className="text-[10px] text-slate-400">Raindrop noise</div>
              </div>
            </button>

            <button
              onClick={() => onSelectTheme('wind')}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                activeTheme === 'wind' && !isMuted
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/40 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Wind className="w-5 h-5 text-sky-400" />
              <div className="text-left">
                <div className="text-xs font-bold">Howling Wind</div>
                <div className="text-[10px] text-slate-400">Filter LFO sweep</div>
              </div>
            </button>

            <button
              onClick={() => onSelectTheme('thunder')}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                activeTheme === 'thunder' && !isMuted
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/40 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <CloudLightning className="w-5 h-5 text-yellow-400" />
              <div className="text-left">
                <div className="text-xs font-bold">Thunderstorm</div>
                <div className="text-[10px] text-slate-400">Low bass rumbles</div>
              </div>
            </button>

            <button
              onClick={() => onSelectTheme('sunny')}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                activeTheme === 'sunny' && !isMuted
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/40 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="text-xs font-bold">Sunny Chimes</div>
                <div className="text-[10px] text-slate-400">Harmonic bell pad</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
