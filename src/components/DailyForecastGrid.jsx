import React from 'react';
import { Calendar, Droplets } from 'lucide-react';
import { getWeatherDetails, convertTemp } from '../utils/weatherInterpretation';
import { WeatherIcon } from './CurrentWeatherCard';

export default function DailyForecastGrid({ dailyData = [], unit = 'C' }) {
  if (!dailyData || dailyData.length === 0) return null;

  // Calculate weekly overall min and max for temperature bar positioning
  const allMaxs = dailyData.map(d => convertTemp(d.tempMax, unit));
  const allMins = dailyData.map(d => convertTemp(d.tempMin, unit));
  const weekMin = Math.min(...allMins);
  const weekMax = Math.max(...allMaxs);
  const totalRange = Math.max(1, weekMax - weekMin);

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">5-7 Day Extended Forecast</h2>
          <p className="text-xs text-slate-400">Daily high/low temperature bounds & condition forecasts</p>
        </div>
      </div>

      <div className="space-y-3">
        {dailyData.slice(0, 7).map((day, idx) => {
          const dateObj = new Date(day.date);
          const isToday = idx === 0;
          const dayName = isToday
            ? 'Today'
            : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

          const details = getWeatherDetails(day.weatherCode, 1);
          const maxTemp = convertTemp(day.tempMax, unit);
          const minTemp = convertTemp(day.tempMin, unit);

          // Calculate progress bar offsets
          const leftPercent = ((minTemp - weekMin) / totalRange) * 100;
          const widthPercent = Math.max(8, ((maxTemp - minTemp) / totalRange) * 100);

          return (
            <div
              key={day.date || idx}
              className="p-3.5 bg-slate-800/40 hover:bg-slate-800/70 border border-white/10 rounded-2xl backdrop-blur-md grid grid-cols-12 items-center gap-2 md:gap-4 transition-all group"
            >
              {/* Day Name */}
              <div className="col-span-3 md:col-span-2">
                <div className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {dayName}
                </div>
                <div className="text-[10px] font-medium text-slate-400">{dateFormatted}</div>
              </div>

              {/* Icon & Description */}
              <div className="col-span-4 md:col-span-3 flex items-center gap-2">
                <WeatherIcon iconName={details.icon} className="w-6 h-6 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-300 truncate hidden sm:inline">
                  {details.description}
                </span>
              </div>

              {/* Rain Chance */}
              <div className="col-span-2 md:col-span-2 text-right sm:text-center">
                {day.popMax > 0 ? (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-bold">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span>{day.popMax}%</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 font-medium">0%</span>
                )}
              </div>

              {/* High / Low Bar */}
              <div className="col-span-3 md:col-span-5 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 w-7 text-right">{minTemp}°</span>

                {/* Relative temp bar */}
                <div className="flex-1 h-2 bg-slate-950/80 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 rounded-full"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-bold text-slate-100 w-7">{maxTemp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
