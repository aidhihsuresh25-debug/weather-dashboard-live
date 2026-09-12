import React from 'react';
import { Sun, Droplets, Wind, Gauge, Eye, Activity, Compass, ShieldAlert } from 'lucide-react';
import { getWindDirection, convertTemp } from '../utils/weatherInterpretation';

export default function MetricCards({ current = {}, airQuality = {}, unit = 'C' }) {
  const uvIndex = current.uvIndex || 0;
  const humidity = current.humidity || 50;
  const windSpeed = current.windSpeed || 0;
  const windDirection = current.windDirection || 0;
  const windGusts = current.windGusts || windSpeed;
  const pressure = current.pressure || 1013;
  const visibility = current.visibility || 10;
  const usAqi = airQuality.usAqi || 35;

  // UV Rating Helper
  const getUvInfo = (val) => {
    if (val >= 11) return { text: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' };
    if (val >= 8) return { text: 'Very High', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/30' };
    if (val >= 6) return { text: 'High', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' };
    if (val >= 3) return { text: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' };
    return { text: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' };
  };

  // AQI Rating Helper
  const getAqiInfo = (aqi) => {
    if (aqi > 200) return { text: 'Hazardous', badge: 'bg-purple-500/30 text-purple-300 border-purple-500/40' };
    if (aqi > 150) return { text: 'Unhealthy', badge: 'bg-rose-500/30 text-rose-300 border-rose-500/40' };
    if (aqi > 100) return { text: 'Unhealthy for Sensitive Groups', badge: 'bg-orange-500/30 text-orange-300 border-orange-500/40' };
    if (aqi > 50) return { text: 'Moderate', badge: 'bg-amber-500/30 text-amber-300 border-amber-500/40' };
    return { text: 'Good', badge: 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40' };
  };

  const uvInfo = getUvInfo(uvIndex);
  const aqiInfo = getAqiInfo(usAqi);
  const windDirText = getWindDirection(windDirection);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {/* 1. UV Index Card */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Sun className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-300">UV Index</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${uvInfo.bg} ${uvInfo.color}`}>
            {uvInfo.text}
          </span>
        </div>

        <div className="my-4">
          <div className="text-3xl font-black text-white">{uvIndex} <span className="text-xs text-slate-400 font-semibold">/ 12</span></div>
          {/* UV Scale Meter */}
          <div className="w-full h-2 bg-slate-950/80 rounded-full mt-3 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-purple-600 rounded-full"
              style={{ width: `${Math.min(100, (uvIndex / 12) * 100)}%` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          {uvIndex >= 6 ? 'Sun protection required between 10am - 4pm.' : 'Minimal sun hazard. Normal outdoor activity safe.'}
        </p>
      </div>

      {/* 2. Humidity & Moisture Card */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-300">Humidity</span>
          </div>
          <span className="text-xs font-bold text-blue-400">
            {humidity > 70 ? 'High Moisture' : humidity < 30 ? 'Dry Air' : 'Comfortable'}
          </span>
        </div>

        <div className="my-4">
          <div className="text-3xl font-black text-white">{humidity}<span className="text-xl text-blue-400 font-extrabold">%</span></div>
          {/* Humidity Meter */}
          <div className="w-full h-2 bg-slate-950/80 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full" style={{ width: `${humidity}%` }} />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          The dew point is approx {Math.round(current.temp - (100 - humidity) / 5)}°C.
        </p>
      </div>

      {/* 3. Wind Direction & Compass Card */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <Wind className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-300">Wind Velocity</span>
          </div>
          <span className="text-xs font-bold text-cyan-300">{windDirText} ({windDirection}°)</span>
        </div>

        <div className="flex items-center justify-between my-2">
          <div>
            <div className="text-3xl font-black text-white">{windSpeed} <span className="text-sm font-bold text-slate-400">km/h</span></div>
            <div className="text-xs text-slate-400 font-medium mt-1">Gusts up to {windGusts} km/h</div>
          </div>

          {/* Animated Compass Graphic */}
          <div className="relative w-14 h-14 bg-slate-950/80 border border-white/10 rounded-full flex items-center justify-center shadow-inner">
            <Compass className="w-10 h-10 text-slate-600" />
            <div
              className="absolute text-cyan-400 transition-transform duration-700"
              style={{ transform: `rotate(${windDirection}deg)` }}
            >
              <div className="w-1 h-6 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          {windSpeed > 30 ? 'Breezy conditions. Secure loose outdoor objects.' : 'Gentle ambient breeze.'}
        </p>
      </div>

      {/* 4. Air Pressure Card */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
              <Gauge className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-300">Air Pressure</span>
          </div>
          <span className="text-xs font-bold text-purple-300">Steady</span>
        </div>

        <div className="my-4">
          <div className="text-3xl font-black text-white">{Math.round(pressure)} <span className="text-sm font-bold text-slate-400">hPa</span></div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Standard atmospheric baseline ~1013.25 hPa
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          {pressure > 1015 ? 'High pressure system promoting stable clear weather.' : 'Normal barometric pressure.'}
        </p>
      </div>

      {/* 5. Visibility Card */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-300">Visibility</span>
          </div>
          <span className="text-xs font-bold text-teal-300">
            {visibility >= 10 ? 'Clear Optics' : visibility >= 5 ? 'Moderate' : 'Poor Optics'}
          </span>
        </div>

        <div className="my-4">
          <div className="text-3xl font-black text-white">{visibility} <span className="text-sm font-bold text-slate-400">km</span></div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            {visibility >= 10 ? 'Crystal clear horizon view' : 'Haze or mist in atmosphere'}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          No fog obstruction reported across transit pathways.
        </p>
      </div>

      {/* 6. Air Quality Index (AQI) Card */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-300">Air Quality Index</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${aqiInfo.badge}`}>
            {aqiInfo.text}
          </span>
        </div>

        <div className="my-4">
          <div className="text-3xl font-black text-white">{usAqi} <span className="text-xs text-slate-400 font-semibold">US AQI</span></div>
          {/* Pollutant meters */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
              <span className="text-slate-400">PM2.5:</span> <span className="text-white font-bold">{airQuality.pm2_5 || 8.5} µg/m³</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
              <span className="text-slate-400">PM10:</span> <span className="text-white font-bold">{airQuality.pm10 || 14.2} µg/m³</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          Air quality is ideal for outdoor sports and open window ventilation.
        </p>
      </div>
    </div>
  );
}
