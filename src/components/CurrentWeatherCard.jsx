import React from 'react';
import { Heart, RefreshCw, ArrowUp, ArrowDown, Wind, Droplets, Gauge, Eye, Sun, CloudRain, Snowflake, CloudLightning, CloudDrizzle, CloudFog } from 'lucide-react';
import { getWeatherDetails, convertTemp } from '../utils/weatherInterpretation';

// Dynamic icon chooser helper
export const WeatherIcon = ({ iconName, className = 'w-6 h-6' }) => {
  switch (iconName) {
    case 'Sun':
    case 'SunDim':
      return <Sun className={`${className} text-amber-400`} />;
    case 'CloudRain':
    case 'CloudRainHeavy':
      return <CloudRain className={`${className} text-cyan-400`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-blue-300`} />;
    case 'Snowflake':
      return <Snowflake className={`${className} text-sky-200`} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-yellow-400`} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-slate-300`} />;
    default:
      return <Sun className={`${className} text-amber-400`} />;
  }
};

export default function CurrentWeatherCard({
  city,
  weather,
  unit = 'C',
  isFavorite = false,
  onToggleFavorite,
  onRefresh,
  isRefreshing = false,
}) {
  if (!weather || !weather.current) return null;

  const current = weather.current;
  const todayDaily = weather.daily?.[0] || {};
  const details = getWeatherDetails(current.weatherCode, current.isDay);
  const theme = details?.theme || {
    accentText: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    glowBg: 'bg-cyan-500/10',
    iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  const formattedTemp = convertTemp(current.temp, unit);
  const formattedFeels = convertTemp(current.feelsLike, unit);
  const formattedHigh = convertTemp(todayDaily.tempMax, unit);
  const formattedLow = convertTemp(todayDaily.tempMin, unit);

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative w-full bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 lg:p-8 shadow-2xl overflow-hidden group">
      {/* Dynamic Ambient Glow Mesh */}
      <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${theme.glowBg}`} />

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight">
              {city.name}
            </h1>
            <span className="text-sm font-semibold text-slate-400">
              {city.countryCode || city.country}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {currentDateStr} • Local Time {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Favorite & Refresh Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-800/60 hover:bg-slate-700/80 border border-white/10 rounded-2xl text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            title="Refresh Live Weather"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? `animate-spin ${theme.accentText}` : ''}`} />
          </button>

          <button
            onClick={onToggleFavorite}
            className={`p-2.5 border rounded-2xl transition-all active:scale-95 ${
              isFavorite
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/20'
                : 'bg-slate-800/60 border-white/10 text-slate-400 hover:text-rose-400 hover:bg-slate-700/80'
            }`}
            title={isFavorite ? 'Remove from Bookmarked Favorites' : 'Bookmark to Favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Temperature & Visual Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative z-10">
        {/* Left Column: Big Temp Display */}
        <div className="flex items-center gap-6">
          <div className={`relative p-4 rounded-3xl border backdrop-blur-md shadow-inner transition-colors duration-500 ${theme.iconBg}`}>
            <WeatherIcon iconName={details.icon} className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />
          </div>

          <div>
            <div className="flex items-baseline font-black tracking-tighter text-slate-100">
              <span className="text-6xl lg:text-7xl drop-shadow-md">{formattedTemp}</span>
              <span className={`text-3xl font-extrabold ml-1 transition-colors duration-500 ${theme.accentText}`}>°{unit}</span>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-slate-300">
              <span>Feels like {formattedFeels}°{unit}</span>
              <span className="text-slate-600">•</span>
              <span className={`capitalize font-bold transition-colors duration-500 ${theme.accentText}`}>{details.description}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Key Metric Snapshot Badges */}
        <div className="grid grid-cols-2 gap-3">
          {/* High / Low Range */}
          <div className="p-3.5 bg-slate-800/40 border border-white/10 rounded-2xl flex items-center gap-3 backdrop-blur-md">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <ArrowUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Day High / Low</div>
              <div className="text-xs font-bold text-slate-200">
                {formattedHigh}° / <span className="text-slate-400">{formattedLow}°{unit}</span>
              </div>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="p-3.5 bg-slate-800/40 border border-white/10 rounded-2xl flex items-center gap-3 backdrop-blur-md">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Wind Speed</div>
              <div className="text-xs font-bold text-slate-200">{current.windSpeed} km/h</div>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-3.5 bg-slate-800/40 border border-white/10 rounded-2xl flex items-center gap-3 backdrop-blur-md">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Humidity</div>
              <div className="text-xs font-bold text-slate-200">{current.humidity}%</div>
            </div>
          </div>

          {/* Pressure */}
          <div className="p-3.5 bg-slate-800/40 border border-white/10 rounded-2xl flex items-center gap-3 backdrop-blur-md">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Air Pressure</div>
              <div className="text-xs font-bold text-slate-200">{Math.round(current.pressure)} hPa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
