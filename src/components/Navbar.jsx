import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CloudSun, Heart, Scale, Volume2, VolumeX, Sparkles, Key, MapPin, Globe, Map } from 'lucide-react';

export default function Navbar({
  unit,
  onToggleUnit,
  isAudioMuted,
  onToggleAudio,
  favoritesCount = 0,
  currentCityName = 'Tokyo',
  onOpenKeyModal,
}) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 lg:px-8 py-3 bg-slate-950/60 backdrop-blur-2xl border-b border-white/10 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative p-2.5 bg-gradient-to-tr from-slate-200 via-cyan-400 to-sky-500 rounded-2xl shadow-xl shadow-cyan-500/25 border border-cyan-300/40 group-hover:scale-105 transition-transform duration-300">
            {/* Hexagonal Weather Vortex Icon */}
            <svg className="w-6 h-6 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" className="stroke-slate-950 fill-slate-950/20" />
              <path d="M2 17l10 5 10-5" className="stroke-slate-900" />
              <path d="M2 12l10 5 10-5" className="stroke-slate-950 opacity-90" />
              <circle cx="12" cy="12" r="2" fill="#0284c7" className="animate-ping" />
            </svg>
            <div className="absolute inset-0 bg-cyan-300/40 rounded-2xl blur-md -z-10 group-hover:blur-xl transition-all" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-xl text-white tracking-tight font-heading">
              NEXUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-300">.ATMOS</span>
              <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-md font-mono shadow-sm">
                PLATINUM
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:block">
              Ultra-Minimalist Weather Telemetry
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-xl p-1 border border-white/10 rounded-2xl">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isActive('/') && !location.pathname.startsWith('/city') && !location.pathname.startsWith('/compare') && !location.pathname.startsWith('/favorites') && !location.pathname.startsWith('/globe') && !location.pathname.startsWith('/world-map')
                ? 'bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/globe"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isActive('/globe')
                ? 'bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3D Globe</span>
          </Link>

          <Link
            to="/world-map"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isActive('/world-map')
                ? 'bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>2D Map</span>
          </Link>

          <Link
            to={`/city/${encodeURIComponent(currentCityName)}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isActive('/city')
                ? 'bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Detail</span>
          </Link>

          <Link
            to="/compare"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isActive('/compare')
                ? 'bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Compare</span>
          </Link>

          <Link
            to="/favorites"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isActive('/favorites')
                ? 'bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-full text-[10px] font-bold">
                {favoritesCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Action Controls: Sound & Unit Toggle */}
        <div className="flex items-center gap-2">
          {/* OpenWeather API Key button */}
          <button
            onClick={onOpenKeyModal}
            className="p-2 text-slate-300 hover:text-cyan-300 bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 rounded-xl text-xs backdrop-blur-md transition-all active:scale-95 hidden sm:flex items-center gap-1"
            title="Configure OpenWeather API Key"
          >
            <Key className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline font-medium">API Key</span>
          </button>

          {/* Web Audio Ambient Toggle */}
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-xl text-xs font-medium border backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 ${
              !isAudioMuted
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/30 animate-pulse'
                : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
            title={!isAudioMuted ? 'Ambient Audio Active (Click to Mute)' : 'Click to Enable Procedural Ambient Audio'}
          >
            {!isAudioMuted ? <Volume2 className="w-4 h-4 text-cyan-300" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px] font-semibold">{!isAudioMuted ? 'Audio ON' : 'Mute'}</span>
          </button>

          {/* Temperature Unit Switcher (°C / °F) */}
          <button
            onClick={onToggleUnit}
            className="flex items-center p-1 bg-slate-900/80 border border-white/15 rounded-xl shadow-inner font-mono text-xs font-bold transition-all"
            title="Toggle °C / °F Temperature Unit"
          >
            <span
              className={`px-2.5 py-1 rounded-lg transition-all ${
                unit === 'C' ? 'bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              °C
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg transition-all ${
                unit === 'F' ? 'bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              °F
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
