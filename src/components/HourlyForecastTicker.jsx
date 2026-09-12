import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Umbrella, TrendingUp, BarChart2, Calendar } from 'lucide-react';
import { getWeatherDetails, convertTemp } from '../utils/weatherInterpretation';
import { WeatherIcon } from './CurrentWeatherCard';

// Bulletproof timestamp parser & formatter to fix "Invalid Date"
function parseHourlyTimestamp(rawTime, index = 0) {
  const now = new Date();

  if (!rawTime) {
    const d = new Date(now.getTime() + index * 3600 * 1000);
    return formatParsedDate(d);
  }

  // Handle HH:MM format strings (e.g. "14:00" or "09:00")
  if (typeof rawTime === 'string') {
    const trimmed = rawTime.trim();
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      const [h, m] = trimmed.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      if (index > 6 && h < now.getHours()) {
        d.setDate(d.getDate() + 1);
      }
      return formatParsedDate(d);
    }
  }

  // Handle ISO strings, epoch timestamps, or standard date strings
  let d;
  if (typeof rawTime === 'number') {
    d = new Date(rawTime > 1e11 ? rawTime : rawTime * 1000);
  } else {
    let clean = String(rawTime).trim().replace(' ', 'T');
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(clean)) {
      clean += ':00';
    }
    d = new Date(clean);
  }

  // Fallback if Date parsing fails
  if (isNaN(d.getTime())) {
    d = new Date(now.getTime() + index * 3600 * 1000);
  }

  return formatParsedDate(d);
}

function formatParsedDate(d) {
  const hourLabel = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dayLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const fullTimestamp = `${dayLabel}, ${hourLabel}`;
  return {
    hourLabel,
    dayLabel,
    fullTimestamp,
    rawDate: d,
  };
}

export default function HourlyForecastTicker({ hourlyData = [], unit = 'C' }) {
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'cards'

  if (!hourlyData || hourlyData.length === 0) return null;

  // Prepare chart dataset with validated timestamps
  const chartData = hourlyData.slice(0, 24).map((item, idx) => {
    const ts = parseHourlyTimestamp(item.time, idx);
    const tempVal = convertTemp(item.temp, unit);

    return {
      time: ts.hourLabel,
      fullTimestamp: ts.fullTimestamp,
      dayLabel: ts.dayLabel,
      temp: tempVal,
      pop: item.pop || 0,
      precip: item.precipitation || 0,
      code: item.weatherCode,
      isDay: item.isDay,
    };
  });

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">24-Hour Detailed Breakdown</h2>
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono rounded-md">
                Live Timestamps
              </span>
            </div>
            <p className="text-xs text-slate-400">Hourly weather trend & precipitation probability</p>
          </div>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center p-1 bg-slate-950/60 border border-white/10 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'chart'
                ? 'bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Chart</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'cards'
                ? 'bg-gradient-to-r from-slate-100 via-cyan-300 to-sky-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Ticker Cards</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Recharts Temperature Spline */}
      {viewMode === 'chart' ? (
        <div className="w-full h-60 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit={`°${unit}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const details = getWeatherDetails(data.code, data.isDay);
                    return (
                      <div className="bg-slate-900/95 border border-white/20 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-extrabold text-xs pb-1 border-b border-white/10">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{data.fullTimestamp}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-0.5">
                          <span className="text-slate-300 font-medium">Temperature:</span>
                          <span className="text-white font-extrabold text-sm">{data.temp}°{unit}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-300 font-medium">Condition:</span>
                          <span className="text-cyan-300 font-semibold capitalize">{details.description}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-300 font-medium">Rain Chance:</span>
                          <span className="text-blue-400 font-bold">{data.pop}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="temp" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#tempGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Mode 2: Horizontal Scrolling Ticker Cards */
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
          {chartData.map((item, idx) => {
            const details = getWeatherDetails(item.code, item.isDay);
            return (
              <div
                key={idx}
                className="flex-shrink-0 w-28 p-3.5 bg-slate-800/40 hover:bg-slate-800/80 border border-white/10 rounded-2xl backdrop-blur-md flex flex-col items-center gap-1.5 transition-all hover:scale-105"
              >
                {/* Timestamp & Date Badge */}
                <div className="text-center">
                  <span className="text-xs font-bold text-cyan-300 block">{item.time}</span>
                  <span className="text-[10px] font-medium text-slate-400 block">{item.dayLabel}</span>
                </div>

                <WeatherIcon iconName={details.icon} className="w-7 h-7 my-1" />
                <span className="text-sm font-extrabold text-white">{item.temp}°{unit}</span>

                {item.pop > 0 ? (
                  <div className="flex items-center gap-1 text-[10px] text-blue-400 font-semibold mt-0.5">
                    <Umbrella className="w-3 h-3" />
                    <span>{item.pop}%</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 mt-0.5">0% rain</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
