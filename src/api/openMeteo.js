// Keyless Open-Meteo Geocoding, Forecast & Air Quality API Service

export const searchCitiesOpenMeteo = async (query) => {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch geocoding data');
    const data = await res.json();
    if (!data.results) return [];
    
    return data.results.map((item) => ({
      name: item.name,
      country: item.country || '',
      countryCode: item.country_code || '',
      admin1: item.admin1 || '',
      lat: item.latitude,
      lon: item.longitude,
      timezone: item.timezone || 'UTC',
      displayName: `${item.name}${item.admin1 ? `, ${item.admin1}` : ''}${item.country ? `, ${item.country}` : ''}`,
    }));
  } catch (err) {
    console.error('Open-Meteo Geocoding search error:', err);
    return [];
  }
};

export const fetchWeatherOpenMeteo = async (lat, lon) => {
  try {
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
    
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi`;

    const [forecastRes, aqRes] = await Promise.all([
      fetch(forecastUrl),
      fetch(airQualityUrl).catch(() => null)
    ]);

    if (!forecastRes.ok) throw new Error('Failed to fetch forecast from Open-Meteo');
    const forecastData = await forecastRes.json();
    let aqData = null;
    if (aqRes && aqRes.ok) {
      aqData = await aqRes.json();
    }

    return formatOpenMeteoResponse(forecastData, aqData, lat, lon);
  } catch (err) {
    console.error('Open-Meteo forecast error:', err);
    throw err;
  }
};

function formatOpenMeteoResponse(data, aqData, lat, lon) {
  const current = data.current || {};
  const hourly = data.hourly || {};
  const daily = data.daily || {};

  // Map 24h hourly forecast starting from current hour
  const hourlyList = [];
  const nowISO = new Date().toISOString();
  const currentIndex = hourly.time ? hourly.time.findIndex(t => t >= nowISO.substring(0, 13)) : 0;
  const startIdx = currentIndex >= 0 ? currentIndex : 0;

  for (let i = startIdx; i < Math.min(startIdx + 24, (hourly.time || []).length); i++) {
    hourlyList.push({
      time: hourly.time[i],
      temp: hourly.temperature_2m[i],
      apparentTemp: hourly.apparent_temperature ? hourly.apparent_temperature[i] : hourly.temperature_2m[i],
      pop: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
      precipitation: hourly.precipitation ? hourly.precipitation[i] : 0,
      weatherCode: hourly.weather_code[i],
      humidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[i] : 50,
      windSpeed: hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : 0,
      uvIndex: hourly.uv_index ? hourly.uv_index[i] : 0,
      isDay: hourly.is_day ? hourly.is_day[i] : 1,
      visibility: hourly.visibility ? Math.round(hourly.visibility[i] / 1000) : 10,
    });
  }

  // Map 7-day daily forecast
  const dailyList = [];
  for (let i = 0; i < (daily.time || []).length; i++) {
    dailyList.push({
      date: daily.time[i],
      weatherCode: daily.weather_code[i],
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      apparentMax: daily.apparent_temperature_max ? daily.apparent_temperature_max[i] : daily.temperature_2m_max[i],
      apparentMin: daily.apparent_temperature_min ? daily.apparent_temperature_min[i] : daily.temperature_2m_min[i],
      sunrise: daily.sunrise ? daily.sunrise[i] : null,
      sunset: daily.sunset ? daily.sunset[i] : null,
      uvIndexMax: daily.uv_index_max ? daily.uv_index_max[i] : 0,
      popMax: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0,
      precipSum: daily.precipitation_sum ? daily.precipitation_sum[i] : 0,
    });
  }

  const currentAq = aqData?.current || {};

  return {
    lat,
    lon,
    timezone: data.timezone || 'UTC',
    timezoneAbbreviation: data.timezone_abbreviation || '',
    current: {
      temp: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      isDay: current.is_day,
      precipitation: current.precipitation,
      rain: current.rain,
      snowfall: current.snowfall,
      weatherCode: current.weather_code,
      cloudCover: current.cloud_cover,
      pressure: current.pressure_msl || current.surface_pressure,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      windGusts: current.wind_gusts_10m,
      uvIndex: hourlyList[0]?.uvIndex || 0,
      visibility: hourlyList[0]?.visibility || 10,
    },
    hourly: hourlyList,
    daily: dailyList,
    airQuality: {
      usAqi: currentAq.us_aqi || Math.round((currentAq.pm2_5 || 10) * 4),
      euAqi: currentAq.european_aqi || 20,
      pm2_5: currentAq.pm2_5 || 8.5,
      pm10: currentAq.pm10 || 14.2,
      co: currentAq.carbon_monoxide || 210,
      no2: currentAq.nitrogen_dioxide || 12,
      so2: currentAq.sulphur_dioxide || 3,
      o3: currentAq.ozone || 45,
    }
  };
}
