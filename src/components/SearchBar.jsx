import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, Navigation } from 'lucide-react';
import { searchCities } from '../api/weatherService';

export default function SearchBar({ onSelectCity, onLocateMe, isLocating = false }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // Debounced search for live typeahead
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const results = await searchCities(query);
      setSuggestions(results);
      setIsLoading(false);
      setIsOpen(true);
      setSelectedIndex(-1);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    setQuery(city.displayName);
    setIsOpen(false);
    setSuggestions([]);
    onSelectCity(city);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query || query.trim().length < 2) return;

    if (isOpen && selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
      return;
    }

    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
      return;
    }

    // Direct search on submit if suggestions haven't loaded yet
    setIsLoading(true);
    const results = await searchCities(query);
    setIsLoading(false);
    if (results && results.length > 0) {
      handleSelect(results[0]);
    } else {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-cyan-400 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search city, region, or country (e.g. Chennai, Tokyo, Paris)..."
          className="w-full pl-12 pr-36 py-3.5 bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-2xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 shadow-2xl transition-all text-sm font-medium"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!query || query.trim().length < 2 || isLoading}
            className="px-3.5 py-1.5 bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-40 shadow-md shadow-cyan-500/20"
            title="Search city"
          >
            Search
          </button>

          <button
            type="button"
            onClick={onLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold backdrop-blur-md transition-all active:scale-95 disabled:opacity-50"
            title="Use current GPS location"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>
      </form>

      {/* Typeahead Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((city, idx) => (
            <button
              key={`${city.lat}-${city.lon}-${idx}`}
              type="button"
              onClick={() => handleSelect(city)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors group ${
                selectedIndex === idx ? 'bg-cyan-500/25 text-white font-semibold' : 'hover:bg-cyan-500/15 text-slate-200 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className={`w-4 h-4 ${selectedIndex === idx ? 'text-cyan-300 scale-110' : 'text-cyan-400 group-hover:scale-110'} transition-transform`} />
                <div>
                  <div className="font-semibold text-sm">{city.name}</div>
                  <div className="text-xs text-slate-400">
                    {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500 group-hover:text-cyan-300">
                {city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && !isLoading && suggestions.length === 0 && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-4 text-center text-xs text-slate-400 z-50">
          No matching cities found. Check spelling or press Search.
        </div>
      )}
    </div>
  );
}
