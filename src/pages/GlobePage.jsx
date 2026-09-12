import React from 'react';
import Globe3DSection from '../components/Globe3DSection';
import CurrentWeatherCard from '../components/CurrentWeatherCard';

export default function GlobePage({ city, weather, unit, onSelectCity, isFavorite, onToggleFavorite, onRefresh, isRefreshing }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 3D Globe Section */}
      <Globe3DSection onSelectCity={onSelectCity} currentCity={city} />

      {/* Selected City Weather Telemetry */}
      {weather && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-wide">
            Live Telemetry for {city.name}
          </h2>
          <CurrentWeatherCard
            city={city}
            weather={weather}
            unit={unit}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
      )}
    </div>
  );
}
