import React from 'react';
import SearchBar from '../components/SearchBar';
import CurrentWeatherCard from '../components/CurrentWeatherCard';
import HourlyForecastTicker from '../components/HourlyForecastTicker';
import DailyForecastGrid from '../components/DailyForecastGrid';
import MetricCards from '../components/MetricCards';
import LifestyleAdvisory from '../components/LifestyleAdvisory';
import SunMoonTracker from '../components/SunMoonTracker';
import { DEFAULT_CITIES } from '../api/weatherService';
import { MapPin, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';

export default function Dashboard({
  city,
  weather,
  unit,
  onSelectCity,
  onLocateMe,
  isLocating,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  isRefreshing,
  error,
}) {
  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Search Section */}
      <section className="space-y-4 text-center py-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-gradient-to-r from-slate-200/20 via-cyan-400/20 to-sky-400/20 text-cyan-300 border border-cyan-400/40 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg shadow-cyan-500/10 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
          <span>NEXUS.ATMOS Platinum Telemetry Network</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight font-heading">
          Next-Gen Meteorological Intelligence
        </h1>

        {/* Intelligent Search Input */}
        <div className="pt-2">
          <SearchBar
            onSelectCity={onSelectCity}
            onLocateMe={onLocateMe}
            isLocating={isLocating}
          />
        </div>

        {/* Popular Preset Cities Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Popular:</span>
          {DEFAULT_CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => onSelectCity(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 backdrop-blur-md ${
                city.name === c.name
                  ? 'bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 border-cyan-300 font-bold shadow-lg shadow-cyan-500/25 scale-105'
                  : 'bg-slate-900/60 text-slate-300 border-white/10 hover:border-cyan-400/40 hover:text-white'
              }`}
            >
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-200 text-sm font-semibold max-w-xl mx-auto">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Hero Weather Card or Loading Skeleton */}
      {weather ? (
        <CurrentWeatherCard
          city={city}
          weather={weather}
          unit={unit}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      ) : (
        <div className="p-12 bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-medium text-slate-300">Fetching live atmospheric telemetry for {city.name}...</p>
        </div>
      )}

      {/* Additional Telemetry Layout (If Loaded) */}
      {weather && (
        <div className="space-y-10">
          {/* Smart Lifestyle Advisory Engine */}
          <LifestyleAdvisory weatherData={weather} />

          {/* 24-Hour Detailed Hourly Forecast & Temperature Spline */}
          <HourlyForecastTicker hourlyData={weather.hourly} unit={unit} />

          {/* 5-7 Day Daily Forecast & Astronomy Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <DailyForecastGrid dailyData={weather.daily} unit={unit} />
            </div>
            <div className="lg:col-span-5">
              <SunMoonTracker dailyData={weather.daily} />
            </div>
          </div>

          {/* Meteorological Metrics Breakdown */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <span>Atmospheric Highlights & AQI</span>
            </h2>
            <MetricCards
              current={weather.current}
              airQuality={weather.airQuality}
              unit={unit}
            />
          </section>
        </div>
      )}
    </div>
  );
}
