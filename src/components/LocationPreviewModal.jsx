import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, X, ArrowRight, Wind, Droplets, Heart, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { fetchWeatherData } from '../api/weatherService';
import { getWeatherDetails, convertTemp } from '../utils/weatherInterpretation';
import { WeatherIcon } from './CurrentWeatherCard';

export default function LocationPreviewModal({
  location,
  isOpen,
  onClose,
  onSelectCity,
  unit = 'C',
  isFavorite = false,
  onToggleFavorite,
}) {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !location) return;

    let isMounted = true;
    setLoading(true);
    setWeather(null);

    fetchWeatherData(location.lat, location.lon)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Preview weather load error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, location]);

  if (!isOpen || !location) return null;

  const current = weather?.current;
  const details = current ? getWeatherDetails(current.weatherCode, current.isDay) : null;
  const theme = details?.theme || {
    accentText: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    btnBg: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25',
    glowBg: 'bg-cyan-500/20',
    iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  const formattedTemp = current ? convertTemp(current.temp, unit) : null;
  const formattedFeels = current ? convertTemp(current.feelsLike, unit) : null;

  const handleGoToDetails = () => {
    onSelectCity(location);
    onClose();
    navigate(`/city/${encodeURIComponent(location.name)}`);
  };

  const handleSetActive = () => {
    onSelectCity(location);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-slate-900/90 border border-white/20 rounded-3xl p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic weather ambient glow backdrop */}
        <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${theme.glowBg}`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-white/10 rounded-xl transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Location Header */}
        <div className="flex items-start gap-3 mb-4 pr-8">
          <div className={`p-3 rounded-2xl border transition-colors ${theme.iconBg}`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {location.name}
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {location.admin1 ? `${location.admin1}, ` : ''}{location.country || 'Global Location'}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[11px] rounded-md border border-white/10">
              {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
            </span>
          </div>
        </div>

        {/* Weather Telemetry Body */}
        {loading ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
            <p className="text-xs font-medium text-slate-400">Loading location telemetry...</p>
          </div>
        ) : current ? (
          <div className="space-y-4 my-4">
            <div className="p-4 bg-slate-800/50 border border-white/10 rounded-2xl flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <WeatherIcon iconName={details.icon} className="w-10 h-10" />
                </div>
                <div>
                  <div className="flex items-baseline text-white font-black text-3xl">
                    <span>{formattedTemp}</span>
                    <span className={`text-lg font-bold ml-1 ${theme.accentText}`}>°{unit}</span>
                  </div>
                  <div className="text-xs text-slate-300 capitalize font-medium">
                    {details.description}
                  </div>
                </div>
              </div>

              <div className="text-right text-xs space-y-1">
                <div className="text-slate-400">Feels like {formattedFeels}°{unit}</div>
                <div className="flex items-center justify-end gap-1.5 text-slate-300">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>{current.humidity}%</span>
                </div>
                <div className="flex items-center justify-end gap-1.5 text-slate-300">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{current.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleSetActive}
            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/15 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Set Active</span>
          </button>

          <button
            onClick={handleGoToDetails}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg flex items-center justify-center gap-1.5 ${theme.btnBg}`}
          >
            <span>Full Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
