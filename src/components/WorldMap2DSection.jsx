import React, { useState } from 'react';
import { Map, MapPin, Navigation, Loader2, Compass } from 'lucide-react';
import { reverseGeocode, WORLD_CITIES } from '../api/weatherService';
import LocationPreviewModal from './LocationPreviewModal';

const MAP_CITIES = WORLD_CITIES;

const NASA_SATELLITE_MAP_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg';

function getCityWeatherSymbol(city) {
  const name = (city.name || '').toLowerCase();
  if (['london', 'paris', 'amsterdam', 'dublin', 'vancouver', 'bogotá', 'hanoi'].includes(name)) {
    return { symbol: '🌧️', label: 'Rain' };
  }
  if (['moscow', 'oslo', 'stockholm', 'warsaw', 'toronto'].includes(name)) {
    return { symbol: '❄️', label: 'Snow' };
  }
  if (['dubai', 'riyadh', 'cairo', 'doha', 'los angeles', 'miami', 'honolulu', 'chennai', 'mumbai', 'delhi'].includes(name)) {
    return { symbol: '☀️', label: 'Sunny' };
  }
  if (['istanbul', 'rome', 'madrid', 'athens'].includes(name)) {
    return { symbol: '🌩️', label: 'Storm' };
  }
  return { symbol: '⛅', label: 'Partly Cloudy' };
}

export default function WorldMap2DSection({ onSelectCity, currentCity, unit = 'C' }) {
  const [clickedCoord, setClickedCoord] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [previewLocation, setPreviewLocation] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getMapPos = (lat, lon) => {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  const handleMapClick = async (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = clickX / rect.width;
    const percentY = clickY / rect.height;

    const lon = percentX * 360 - 180;
    const lat = 90 - percentY * 180;

    setClickedCoord({ x: percentX * 100, y: percentY * 100, lat, lon });
    setIsGeocoding(true);

    try {
      const resolvedCity = await reverseGeocode(lat, lon);
      setPreviewLocation(resolvedCity);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Map click reverse geocode error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="relative w-full bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden group">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-full text-xs font-semibold backdrop-blur-md mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>2D Equirectangular Weather Map</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Photorealistic NASA 2D World Satellite Map</span>
          </h2>
          <p className="text-xs text-slate-400">
            Mini weather symbols inside pointers • Click ANY city pin or location to open weather preview card
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {clickedCoord && (
            <div className="px-3 py-1 bg-slate-800/80 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-300 backdrop-blur-md flex items-center gap-1.5">
              {isGeocoding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>
                {clickedCoord.lat.toFixed(2)}°, {clickedCoord.lon.toFixed(2)}°
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive 2D Satellite Map Container */}
      <div
        onClick={handleMapClick}
        className="relative w-full h-[420px] sm:h-[500px] rounded-2xl border border-white/20 shadow-2xl overflow-hidden cursor-crosshair group/map select-none"
        style={{
          backgroundImage: `url(${NASA_SATELLITE_MAP_URL})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Equirectangular Grid Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(6,182,212,0.8)" strokeWidth="1.2" strokeDasharray="5 5" />
          <line x1="0" y1="36.9%" x2="100%" y2="36.9%" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="0" y1="63.1%" x2="100%" y2="63.1%" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(6,182,212,0.8)" strokeWidth="1.2" strokeDasharray="5 5" />
        </svg>

        {MAP_CITIES.map((city) => {
          const { x, y } = getMapPos(city.lat, city.lon);
          const isSelected = currentCity?.name?.toLowerCase() === city.name.toLowerCase();
          const wx = getCityWeatherSymbol(city);

          return (
            <div
              key={city.name}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setPreviewLocation(city);
                setIsPreviewOpen(true);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer z-30"
              title={`${city.name}, ${city.country} (${wx.label})`}
            >
              <div
                className={`absolute inset-0 rounded-full animate-ping ${
                  isSelected ? 'bg-rose-500/60' : 'bg-cyan-400/40'
                }`}
              />

              <div
                className={`relative px-1.5 py-0.5 rounded-full border flex items-center gap-1 transition-all group-hover/pin:scale-125 shadow-lg ${
                  isSelected
                    ? 'bg-rose-500 border-white text-white shadow-rose-500/50'
                    : 'bg-slate-900/90 border-cyan-400 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950'
                }`}
              >
                <span className="text-[11px] leading-none">{wx.symbol}</span>
                <span className="text-[9px] font-extrabold hidden group-hover/pin:inline">{city.name}</span>
              </div>

              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-slate-900/90 border border-white/15 rounded-md text-[10px] font-semibold text-slate-200 whitespace-nowrap opacity-80 group-hover/pin:opacity-100 group-hover/pin:scale-105 transition-all pointer-events-none flex items-center gap-1">
                <span>{wx.symbol}</span>
                <span>{city.name}</span>
              </div>
            </div>
          );
        })}

        {clickedCoord && (
          <div
            style={{ left: `${clickedCoord.x}%`, top: `${clickedCoord.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
          >
            <div className="w-8 h-8 bg-cyan-500/30 border-2 border-cyan-400 rounded-full animate-ping" />
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-cyan-400" />
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="mt-4 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>NASA Blue Marble Satellite Imagery • Equirectangular Projection</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Equator: 0° N/S • Prime Meridian: 0° E/W • Click anywhere to open location preview card
        </div>
      </div>

      {/* Location Interactive Preview Modal Popup */}
      <LocationPreviewModal
        location={previewLocation}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSelectCity={onSelectCity}
        unit={unit}
      />
    </div>
  );
}
