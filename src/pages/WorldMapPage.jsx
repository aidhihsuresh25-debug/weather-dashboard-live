import React from 'react';
import WorldMap2DSection from '../components/WorldMap2DSection';
import CurrentWeatherCard from '../components/CurrentWeatherCard';

export default function WorldMapPage({ city, weather, unit, onSelectCity, isFavorite, onToggleFavorite, onRefresh, isRefreshing }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 2D World Map Section */}
      <WorldMap2DSection onSelectCity={onSelectCity} currentCity={city} />

      {/* Selected City Weather Telemetry */}
      {weather && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-wide">
            Selected Location Telemetry: {city.name}
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
