import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2, Calendar, Wind, Droplets, Sun, Activity, ShieldCheck, Heart } from 'lucide-react';
import { searchCities, fetchWeatherData } from '../api/weatherService';
import { getWeatherDetails, convertTemp, getWindDirection } from '../utils/weatherInterpretation';
import { WeatherIcon } from '../components/CurrentWeatherCard';
import HourlyForecastTicker from '../components/HourlyForecastTicker';
import LifestyleAdvisory from '../components/LifestyleAdvisory';
import SunMoonTracker from '../components/SunMoonTracker';

export default function CityDetail({ unit, favorites, onToggleFavorite, apiKey }) {
  const { cityName } = useParams();
  const navigate = useNavigate();

  const [cityData, setCityData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadCity = async () => {
      setLoading(true);
      setError(null);
      try {
        const decodedName = decodeURIComponent(cityName || 'Tokyo');
        const searchResults = await searchCities(decodedName);
        if (searchResults && searchResults.length > 0) {
          const matchedCity = searchResults[0];
          if (isMounted) setCityData(matchedCity);
          const data = await fetchWeatherData(matchedCity.lat, matchedCity.lon, apiKey);
          if (isMounted) setWeather(data);
        } else {
          // Fallback to default Tokyo if not found
          const fallback = { name: decodedName, country: 'Global Location', lat: 35.6762, lon: 139.6503, displayName: decodedName };
          if (isMounted) setCityData(fallback);
          const data = await fetchWeatherData(35.6762, 139.6503, apiKey);
          if (isMounted) setWeather(data);
        }
      } catch (err) {
        console.error('Failed to load city details:', err);
        if (isMounted) setError('Unable to load meteorological data for this location.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCity();
    return () => { isMounted = false; };
  }, [cityName, apiKey]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <h3 className="text-xl font-bold text-white">Analyzing City Meteorology...</h3>
        <p className="text-xs text-slate-400">Fetching high-precision atmospheric telemetry for {cityName}</p>
      </div>
    );
  }

  if (error || !cityData || !weather) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-rose-400">Location Data Unavailable</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">{error || 'Could not locate telemetry for city.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-xl font-bold text-xs">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const current = weather.current;
  const details = getWeatherDetails(current.weatherCode, current.isDay);
  const isFav = favorites.some((f) => f.name.toLowerCase() === cityData.name.toLowerCase());

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 rounded-2xl text-slate-300 hover:text-white transition-all text-xs font-semibold backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={() => onToggleFavorite(cityData)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-2xl transition-all text-xs font-bold ${
            isFav
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-slate-900/60 border-white/10 text-slate-300 hover:text-rose-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{isFav ? 'Bookmarked' : 'Add to Favorites'}</span>
        </button>
      </div>

      {/* Parametric Hero Header */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-cyan-400" />
              <h1 className="text-3xl lg:text-5xl font-black text-white">{cityData.displayName || cityData.name}</h1>
            </div>
            <p className="text-xs font-mono text-cyan-300 mt-2">
              Coordinates: {cityData.lat.toFixed(4)}°N, {cityData.lon.toFixed(4)}°E • Timezone: {weather.timezone}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-950/60 border border-white/10 p-4 rounded-2xl">
            <WeatherIcon iconName={details.icon} className="w-16 h-16" />
            <div>
              <div className="text-4xl font-black text-white">
                {convertTemp(current.temp, unit)}°{unit}
              </div>
              <div className="text-xs font-bold text-cyan-300 capitalize">{details.description}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lifestyle Advisor for City */}
      <LifestyleAdvisory weatherData={weather} />

      {/* 24-Hour Spline Breakdown */}
      <HourlyForecastTicker hourlyData={weather.hourly} unit={unit} />

      {/* Air Quality Deep Dive Breakdown */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Air Quality & Chemical Pollutants</h3>
            <p className="text-xs text-slate-400">Microgram particle density per cubic meter (µg/m³)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3 bg-slate-800/40 border border-white/10 rounded-2xl text-center">
            <div className="text-[10px] text-slate-400 font-bold">PM 2.5</div>
            <div className="text-lg font-black text-white my-1">{weather.airQuality.pm2_5}</div>
            <div className="text-[9px] text-emerald-400 font-bold">Fine Particles</div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-white/10 rounded-2xl text-center">
            <div className="text-[10px] text-slate-400 font-bold">PM 10</div>
            <div className="text-lg font-black text-white my-1">{weather.airQuality.pm10}</div>
            <div className="text-[9px] text-emerald-400 font-bold">Coarse Dust</div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-white/10 rounded-2xl text-center">
            <div className="text-[10px] text-slate-400 font-bold">Ozone (O₃)</div>
            <div className="text-lg font-black text-white my-1">{weather.airQuality.o3}</div>
            <div className="text-[9px] text-cyan-400 font-bold">Atmospheric</div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-white/10 rounded-2xl text-center">
            <div className="text-[10px] text-slate-400 font-bold">NO₂</div>
            <div className="text-lg font-black text-white my-1">{weather.airQuality.no2}</div>
            <div className="text-[9px] text-blue-400 font-bold">Nitrogen Oxide</div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-white/10 rounded-2xl text-center">
            <div className="text-[10px] text-slate-400 font-bold">SO₂</div>
            <div className="text-lg font-black text-white my-1">{weather.airQuality.so2}</div>
            <div className="text-[9px] text-purple-400 font-bold">Sulfur Dioxide</div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-white/10 rounded-2xl text-center">
            <div className="text-[10px] text-slate-400 font-bold">CO</div>
            <div className="text-lg font-black text-white my-1">{weather.airQuality.co}</div>
            <div className="text-[9px] text-amber-400 font-bold">Carbon Monoxide</div>
          </div>
        </div>
      </div>

      {/* Astronomy Sun/Moon */}
      <SunMoonTracker dailyData={weather.daily} />
    </div>
  );
}
