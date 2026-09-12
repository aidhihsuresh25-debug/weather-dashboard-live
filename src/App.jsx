import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AtmosphericBackground from './components/AtmosphericBackground';
import AudioControlModal from './components/AudioControlModal';
import ApiKeyModal from './components/ApiKeyModal';
import Dashboard from './pages/Dashboard';
import CityDetail from './pages/CityDetail';
import CompareCities from './pages/CompareCities';
import FavoritesPage from './pages/FavoritesPage';
import GlobePage from './pages/GlobePage';
import WorldMapPage from './pages/WorldMapPage';
import { DEFAULT_CITIES, fetchWeatherData, reverseGeocode, getIPLocation } from './api/weatherService';
import { weatherAudio } from './utils/audioSynth';
import { getWeatherDetails } from './utils/weatherInterpretation';

export default function App() {
  const navigate = useNavigate();

  // Unit State ('C' or 'F')
  const [unit, setUnit] = useState(() => localStorage.getItem('aether_unit') || 'C');

  // OpenWeather API Key State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('aether_owm_key') || '');

  // Active City State (Default Chennai)
  const [currentCity, setCurrentCity] = useState(() => {
    const saved = localStorage.getItem('aether_current_city');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && !parsed.name.toLowerCase().includes('tirup')) {
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_CITIES[0];
  });

  // Weather Data State
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  // Favorites State
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('aether_favorites');
    return saved ? JSON.parse(saved) : [DEFAULT_CITIES[0], DEFAULT_CITIES[1]]; // Tokyo & Paris by default
  });

  // Web Audio Ambient State
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [activeAudioTheme, setActiveAudioTheme] = useState('sunny');
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Load weather for active city
  const loadWeather = useCallback(async (city, forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(city.lat, city.lon, apiKey);
      setWeatherData(data);

      // Auto update audio theme according to weather condition if audio is unmuted
      if (data && data.current) {
        const details = getWeatherDetails(data.current.weatherCode, data.current.isDay);
        setActiveAudioTheme(details.soundTheme);
      }
    } catch (err) {
      console.error('Weather load error:', err);
      setError('Unable to load weather telemetry. Please check connectivity or try another location.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [apiKey]);

  useEffect(() => {
    loadWeather(currentCity);
  }, [currentCity, loadWeather]);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('aether_unit', unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem('aether_current_city', JSON.stringify(currentCity));
  }, [currentCity]);

  useEffect(() => {
    localStorage.setItem('aether_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('aether_owm_key', apiKey);
  }, [apiKey]);

  // Audio engine trigger effect
  useEffect(() => {
    if (!isAudioMuted && activeAudioTheme) {
      weatherAudio.playTheme(activeAudioTheme);
    } else {
      weatherAudio.stopAll();
    }
  }, [isAudioMuted, activeAudioTheme]);

  // Select City Handler
  const handleSelectCity = (city) => {
    setCurrentCity(city);
    navigate('/');
  };

  // GPS Locate Me Handler with high accuracy, reverse geocoding & IP fallback
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setIsLocating(true);
      getIPLocation().then((ipCity) => {
        setIsLocating(false);
        if (ipCity) {
          setCurrentCity(ipCity);
          setError('Geolocation is not supported by your browser. Using estimated IP location.');
          navigate('/');
        } else {
          setError('Geolocation is not supported by your browser.');
        }
      });
      return;
    }

    setIsLocating(true);
    setError(null);

    const onPosSuccess = async (pos) => {
      try {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const resolvedCity = await reverseGeocode(lat, lon, apiKey);
        setCurrentCity(resolvedCity);
        navigate('/');
      } catch (err) {
        console.error('GPS Geolocation resolution error:', err);
        setCurrentCity({
          name: 'Current Location',
          country: 'GPS Location',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          displayName: `GPS (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`,
        });
        navigate('/');
      } finally {
        setIsLocating(false);
      }
    };

    const onPosError = (err) => {
      console.warn('High-accuracy GPS failed or timed out, trying low-accuracy / IP fallback:', err);
      navigator.geolocation.getCurrentPosition(
        onPosSuccess,
        async (fallbackErr) => {
          console.warn('Low-accuracy GPS failed, falling back to IP Geolocation:', fallbackErr);
          const ipCity = await getIPLocation();
          setIsLocating(false);
          if (ipCity) {
            setCurrentCity(ipCity);
            setError('Using network IP location because GPS access was unavailable or denied.');
            navigate('/');
          } else {
            setError('Location access denied or unavailable. Please enable GPS permissions or search manually.');
          }
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    };

    navigator.geolocation.getCurrentPosition(
      onPosSuccess,
      onPosError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Toggle Favorite Handler
  const isFav = favorites.some((f) => f.name.toLowerCase() === currentCity.name.toLowerCase());
  const handleToggleFavorite = (targetCity = currentCity) => {
    const exists = favorites.some((f) => f.name.toLowerCase() === targetCity.name.toLowerCase());
    if (exists) {
      setFavorites(favorites.filter((f) => f.name.toLowerCase() !== targetCity.name.toLowerCase()));
    } else {
      setFavorites([...favorites, targetCity]);
    }
  };

  const handleRemoveFavoriteByName = (name) => {
    setFavorites(favorites.filter((f) => f.name.toLowerCase() !== name.toLowerCase()));
  };

  // Audio Toggle
  const handleToggleAudio = () => {
    const newMuted = weatherAudio.toggleMute();
    setIsAudioMuted(newMuted);
    if (!newMuted) {
      setIsAudioModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500 selection:text-slate-950">
      {/* Dynamic Animated Canvas & Landscape Background */}
      <AtmosphericBackground
        weatherCode={weatherData?.current?.weatherCode || 0}
        isDay={weatherData?.current?.isDay ?? 1}
      />

      {/* Navigation Header */}
      <Navbar
        unit={unit}
        onToggleUnit={() => setUnit(unit === 'C' ? 'F' : 'C')}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        favoritesCount={favorites.length}
        currentCityName={currentCity.name}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 relative z-10">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                city={currentCity}
                weather={weatherData}
                unit={unit}
                onSelectCity={handleSelectCity}
                onLocateMe={handleLocateMe}
                isLocating={isLocating}
                isFavorite={isFav}
                onToggleFavorite={() => handleToggleFavorite(currentCity)}
                onRefresh={() => loadWeather(currentCity, true)}
                isRefreshing={isRefreshing}
                error={error}
              />
            }
          />

          <Route
            path="/globe"
            element={
              <GlobePage
                city={currentCity}
                weather={weatherData}
                unit={unit}
                onSelectCity={handleSelectCity}
                isFavorite={isFav}
                onToggleFavorite={() => handleToggleFavorite(currentCity)}
                onRefresh={() => loadWeather(currentCity, true)}
                isRefreshing={isRefreshing}
              />
            }
          />

          <Route
            path="/world-map"
            element={
              <WorldMapPage
                city={currentCity}
                weather={weatherData}
                unit={unit}
                onSelectCity={handleSelectCity}
                isFavorite={isFav}
                onToggleFavorite={() => handleToggleFavorite(currentCity)}
                onRefresh={() => loadWeather(currentCity, true)}
                isRefreshing={isRefreshing}
              />
            }
          />

          <Route
            path="/city/:cityName"
            element={
              <CityDetail
                unit={unit}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                apiKey={apiKey}
              />
            }
          />

          <Route
            path="/compare"
            element={
              <CompareCities
                unit={unit}
                apiKey={apiKey}
              />
            }
          />

          <Route
            path="/favorites"
            element={
              <FavoritesPage
                favorites={favorites}
                onRemoveFavorite={handleRemoveFavoriteByName}
                onSelectCity={handleSelectCity}
                unit={unit}
                apiKey={apiKey}
              />
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-white/10 text-center text-xs text-slate-400 backdrop-blur-xl bg-slate-950/60 relative z-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            NEXUS.ATMOS Ultra • Live Telemetry powered by <span className="text-emerald-300 font-semibold">Open-Meteo & Met.no Telemetry</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>WMO Standards</span>
            <span>•</span>
            <span>US AQI Chemical Telemetry</span>
          </div>
        </div>
      </footer>

      {/* Audio Tuning Modal */}
      <AudioControlModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        isMuted={isAudioMuted}
        onToggleMute={() => {
          const muted = weatherAudio.toggleMute();
          setIsAudioMuted(muted);
        }}
        activeTheme={activeAudioTheme}
        onSelectTheme={(theme) => {
          setActiveAudioTheme(theme);
          if (isAudioMuted) {
            setIsAudioMuted(false);
            weatherAudio.toggleMute(false);
          }
          weatherAudio.playTheme(theme);
        }}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={(key) => {
          setApiKey(key);
          if (currentCity) loadWeather(currentCity, true);
        }}
      />
    </div>
  );
}
