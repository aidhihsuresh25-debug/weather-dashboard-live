import React, { useState, useEffect } from 'react';
import { Scale, MapPin, Trophy, ArrowRight, Loader2, RefreshCw, Sun, Wind, Droplets, Activity } from 'lucide-react';
import { DEFAULT_CITIES, searchCities, fetchWeatherData } from '../api/weatherService';
import { getWeatherDetails, convertTemp } from '../utils/weatherInterpretation';
import { WeatherIcon } from '../components/CurrentWeatherCard';

export default function CompareCities({ unit, apiKey }) {
  const [cityA, setCityA] = useState(DEFAULT_CITIES[0]); // Tokyo
  const [cityB, setCityB] = useState(DEFAULT_CITIES[1]); // Paris

  const [weatherA, setWeatherA] = useState(null);
  const [weatherB, setWeatherB] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadBoth = async () => {
      setLoading(true);
      try {
        const [wA, wB] = await Promise.all([
          fetchWeatherData(cityA.lat, cityA.lon, apiKey),
          fetchWeatherData(cityB.lat, cityB.lon, apiKey),
        ]);
        if (isMounted) {
          setWeatherA(wA);
          setWeatherB(wB);
        }
      } catch (err) {
        console.error('Failed to load comparison weather:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBoth();
    return () => { isMounted = false; };
  }, [cityA, cityB, apiKey]);

  if (loading || !weatherA || !weatherB) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <h3 className="text-xl font-bold text-white">Comparing Global Atmospheres...</h3>
        <p className="text-xs text-slate-400">Benchmarking {cityA.name} vs {cityB.name}</p>
      </div>
    );
  }

  const tempA = convertTemp(weatherA.current.temp, unit);
  const tempB = convertTemp(weatherB.current.temp, unit);
  const tempDiff = Math.abs(tempA - tempB);
  const warmerCity = tempA >= tempB ? cityA.name : cityB.name;

  const aqiA = weatherA.airQuality.usAqi;
  const aqiB = weatherB.airQuality.usAqi;
  const cleanerCity = aqiA <= aqiB ? cityA.name : cityB.name;

  const detailsA = getWeatherDetails(weatherA.current.weatherCode, weatherA.current.isDay);
  const detailsB = getWeatherDetails(weatherB.current.weatherCode, weatherB.current.isDay);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-full text-xs font-semibold">
          <Scale className="w-4 h-4" />
          <span>Side-by-Side Meteorological Comparator</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Compare Cities Weather & Air Quality
        </h1>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Analyze real-time temperature variance, wind speed, humidity, and air purity across global metropolitan areas.
        </p>
      </div>

      {/* City Selectors Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* City A Selector */}
        <div className="p-4 bg-slate-900/60 backdrop-blur-xl border border-white/15 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
            City A (Primary)
          </label>
          <select
            value={cityA.name}
            onChange={(e) => {
              const selected = DEFAULT_CITIES.find(c => c.name === e.target.value);
              if (selected) setCityA(selected);
            }}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/15 rounded-xl text-white font-bold text-sm focus:ring-2 focus:ring-cyan-500/50"
          >
            {DEFAULT_CITIES.map(c => (
              <option key={c.name} value={c.name} disabled={c.name === cityB.name}>
                {c.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* City B Selector */}
        <div className="p-4 bg-slate-900/60 backdrop-blur-xl border border-white/15 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
            City B (Secondary)
          </label>
          <select
            value={cityB.name}
            onChange={(e) => {
              const selected = DEFAULT_CITIES.find(c => c.name === e.target.value);
              if (selected) setCityB(selected);
            }}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/15 rounded-xl text-white font-bold text-sm focus:ring-2 focus:ring-purple-500/50"
          >
            {DEFAULT_CITIES.map(c => (
              <option key={c.name} value={c.name} disabled={c.name === cityA.name}>
                {c.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Temperature Variance Insight Banner */}
      <div className="p-4 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-white/15 rounded-2xl text-center backdrop-blur-xl max-w-4xl mx-auto">
        <p className="text-sm font-bold text-white">
          🔥 <span className="text-cyan-300">{warmerCity}</span> is currently{' '}
          <span className="text-amber-400">{tempDiff}°{unit}</span> warmer than{' '}
          <span className="text-purple-300">{warmerCity === cityA.name ? cityB.name : cityA.name}</span>.
        </p>
      </div>

      {/* Side-by-Side Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* City A Card */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-black text-white">{cityA.name}</h2>
            </div>
            {warmerCity === cityA.name && (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Warmer
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 p-4 bg-slate-950/60 border border-white/10 rounded-2xl">
            <WeatherIcon iconName={detailsA.icon} className="w-14 h-14" />
            <div>
              <div className="text-5xl font-black text-white">{tempA}°{unit}</div>
              <div className="text-xs font-bold text-cyan-300">{detailsA.description}</div>
            </div>
          </div>

          {/* Key Metric Comparison Stack */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Droplets className="w-4 h-4 text-blue-400" /> Humidity</span>
              <span className="font-bold text-white">{weatherA.current.humidity}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Wind className="w-4 h-4 text-cyan-400" /> Wind Speed</span>
              <span className="font-bold text-white">{weatherA.current.windSpeed} km/h</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Sun className="w-4 h-4 text-amber-400" /> UV Index</span>
              <span className="font-bold text-white">{weatherA.current.uvIndex} / 12</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-400" /> Air Quality (AQI)</span>
              <span className="font-bold text-emerald-400">{aqiA} US AQI</span>
            </div>
          </div>
        </div>

        {/* City B Card */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              <h2 className="text-2xl font-black text-white">{cityB.name}</h2>
            </div>
            {warmerCity === cityB.name && (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Warmer
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 p-4 bg-slate-950/60 border border-white/10 rounded-2xl">
            <WeatherIcon iconName={detailsB.icon} className="w-14 h-14" />
            <div>
              <div className="text-5xl font-black text-white">{tempB}°{unit}</div>
              <div className="text-xs font-bold text-purple-300">{detailsB.description}</div>
            </div>
          </div>

          {/* Key Metric Comparison Stack */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Droplets className="w-4 h-4 text-blue-400" /> Humidity</span>
              <span className="font-bold text-white">{weatherB.current.humidity}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Wind className="w-4 h-4 text-cyan-400" /> Wind Speed</span>
              <span className="font-bold text-white">{weatherB.current.windSpeed} km/h</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Sun className="w-4 h-4 text-amber-400" /> UV Index</span>
              <span className="font-bold text-white">{weatherB.current.uvIndex} / 12</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-400" /> Air Quality (AQI)</span>
              <span className="font-bold text-emerald-400">{aqiB} US AQI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
