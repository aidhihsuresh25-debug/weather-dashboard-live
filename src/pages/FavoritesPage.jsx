import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ExternalLink, MapPin, Loader2, Plus, Sparkles } from 'lucide-react';
import { fetchWeatherData, DEFAULT_CITIES } from '../api/weatherService';
import { convertTemp, getWeatherDetails } from '../utils/weatherInterpretation';
import { WeatherIcon } from '../components/CurrentWeatherCard';

export default function FavoritesPage({
  favorites = [],
  onRemoveFavorite,
  onSelectCity,
  unit,
  apiKey,
}) {
  const [favoriteWeathers, setFavoriteWeathers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAllFavorites = async () => {
      if (favorites.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const results = {};
        await Promise.all(
          favorites.map(async (fav) => {
            const data = await fetchWeatherData(fav.lat, fav.lon, apiKey);
            results[fav.name] = data;
          })
        );
        if (isMounted) setFavoriteWeathers(results);
      } catch (err) {
        console.error('Error fetching favorites weather:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllFavorites();
    return () => { isMounted = false; };
  }, [favorites, apiKey]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-full text-xs font-semibold">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-500/30" />
          <span>Bookmarked Cities Gallery</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Your Saved Weather Snapshots
        </h1>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Instant weather telemetry and quick focus selection for your pinned favorite cities across the globe.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-rose-400 animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Synchronizing Live Favorite Telemetry...</p>
        </div>
      ) : favorites.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-2xl">
          <div className="p-4 bg-rose-500/10 text-rose-400 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Bookmarked Favorites Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click the heart icon on any city card or select popular cities below to add them to your persistent favorite dashboard.
          </p>

          <div className="pt-2 space-y-2">
            <div className="text-xs font-bold text-slate-300">Quick Add Popular Cities:</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {DEFAULT_CITIES.slice(0, 4).map((c) => (
                <button
                  key={c.name}
                  onClick={() => onSelectCity(c)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Favorites Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const wData = favoriteWeathers[fav.name];
            const current = wData?.current || {};
            const details = getWeatherDetails(current.weatherCode, current.isDay);

            return (
              <div
                key={fav.name}
                className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden group hover:border-rose-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xl font-black text-white">{fav.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{fav.country}</p>
                  </div>

                  <button
                    onClick={() => onRemoveFavorite(fav.name)}
                    className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950/60 rounded-xl border border-white/10 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Weather Display */}
                {wData ? (
                  <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <WeatherIcon iconName={details.icon} className="w-10 h-10" />
                      <div>
                        <div className="text-2xl font-black text-white">
                          {convertTemp(current.temp, unit)}°{unit}
                        </div>
                        <div className="text-[11px] font-bold text-cyan-300 capitalize">
                          {details.description}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 font-medium">
                      <div>Wind: {current.windSpeed} km/h</div>
                      <div>Humidity: {current.humidity}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">Loading snapshot...</div>
                )}

                {/* Action Row */}
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    to={`/city/${encodeURIComponent(fav.name)}`}
                    className="flex-1 py-2 px-3 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-200 hover:text-white rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View Detail</span>
                  </Link>

                  <button
                    onClick={() => onSelectCity(fav)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all"
                  >
                    Focus City
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
