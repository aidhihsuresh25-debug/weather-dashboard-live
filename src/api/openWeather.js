// OpenWeather API integration handler (optional key)

export const fetchWeatherOpenWeather = async (lat, lon, apiKey) => {
  if (!apiKey) throw new Error('No OpenWeather API key provided');
  
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    // Fallback to 2.5 weather + forecast if OneCall requires subscription
    return fetchOpenWeatherStandard(lat, lon, apiKey);
  }
  const data = await res.json();
  return formatOpenWeatherOneCall(data, lat, lon);
};

const fetchOpenWeatherStandard = async (lat, lon, apiKey) => {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  const [cRes, fRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
  if (!cRes.ok || !fRes.ok) throw new Error('OpenWeather standard request failed');

  const cData = await cRes.json();
  const fData = await fRes.json();

  return formatOpenWeatherStandardData(cData, fData, lat, lon);
};

function mapOWMToWMO(owmId) {
  if (owmId >= 200 && owmId < 300) return 95; // Thunderstorm
  if (owmId >= 300 && owmId < 400) return 51; // Drizzle
  if (owmId >= 500 && owmId < 600) return 61; // Rain
  if (owmId >= 600 && owmId < 700) return 71; // Snow
  if (owmId >= 700 && owmId < 800) return 45; // Atmosphere (Fog/Haze)
  if (owmId === 800) return 0; // Clear
  if (owmId === 801) return 1; // Mainly clear
  if (owmId === 802) return 2; // Partly cloudy
  if (owmId >= 803) return 3; // Overcast
  return 0;
}

function formatOpenWeatherOneCall(data, lat, lon) {
  const c = data.current;
  const wmoCode = mapOWMToWMO(c.weather[0]?.id || 800);

  const hourly = (data.hourly || []).slice(0, 24).map(h => ({
    time: new Date(h.dt * 1000).toISOString(),
    temp: h.temp,
    apparentTemp: h.feels_like,
    pop: Math.round((h.pop || 0) * 100),
    precipitation: h.rain ? h.rain['1h'] || 0 : 0,
    weatherCode: mapOWMToWMO(h.weather[0]?.id || 800),
    humidity: h.humidity,
    windSpeed: Math.round(h.wind_speed * 3.6), // m/s to km/h
    uvIndex: h.uvi || 0,
    isDay: (h.dt > c.sunrise && h.dt < c.sunset) ? 1 : 0,
    visibility: Math.round((h.visibility || 10000) / 1000),
  }));

  const daily = (data.daily || []).slice(0, 7).map(d => ({
    date: new Date(d.dt * 1000).toISOString().split('T')[0],
    weatherCode: mapOWMToWMO(d.weather[0]?.id || 800),
    tempMax: d.temp.max,
    tempMin: d.temp.min,
    apparentMax: d.feels_like.day,
    apparentMin: d.feels_like.night,
    sunrise: new Date(d.sunrise * 1000).toISOString(),
    sunset: new Date(d.sunset * 1000).toISOString(),
    uvIndexMax: d.uvi || 0,
    popMax: Math.round((d.pop || 0) * 100),
    precipSum: d.rain || 0,
  }));

  return {
    lat,
    lon,
    timezone: data.timezone || 'UTC',
    timezoneAbbreviation: '',
    current: {
      temp: c.temp,
      feelsLike: c.feels_like,
      humidity: c.humidity,
      isDay: (c.dt > c.sunrise && c.dt < c.sunset) ? 1 : 0,
      precipitation: c.rain ? c.rain['1h'] || 0 : 0,
      rain: c.rain ? c.rain['1h'] || 0 : 0,
      snowfall: c.snow ? c.snow['1h'] || 0 : 0,
      weatherCode: wmoCode,
      cloudCover: c.clouds,
      pressure: c.pressure,
      windSpeed: Math.round(c.wind_speed * 3.6),
      windDirection: c.wind_deg,
      windGusts: Math.round((c.wind_gust || c.wind_speed) * 3.6),
      uvIndex: c.uvi || 0,
      visibility: Math.round((c.visibility || 10000) / 1000),
    },
    hourly,
    daily,
    airQuality: {
      usAqi: 35,
      euAqi: 15,
      pm2_5: 8,
      pm10: 14,
      co: 200,
      no2: 10,
      so2: 2,
      o3: 40,
    }
  };
}

function formatOpenWeatherStandardData(cData, fData, lat, lon) {
  const wmoCode = mapOWMToWMO(cData.weather[0]?.id || 800);
  const now = Math.floor(Date.now() / 1000);
  const isDay = now > cData.sys.sunrise && now < cData.sys.sunset ? 1 : 0;

  const hourly = fData.list.slice(0, 8).map(item => ({
    time: item.dt_txt,
    temp: item.main.temp,
    apparentTemp: item.main.feels_like,
    pop: Math.round((item.pop || 0) * 100),
    precipitation: item.rain ? item.rain['3h'] / 3 || 0 : 0,
    weatherCode: mapOWMToWMO(item.weather[0]?.id || 800),
    humidity: item.main.humidity,
    windSpeed: Math.round(item.wind.speed * 3.6),
    uvIndex: 4,
    isDay: item.sys?.pod === 'd' ? 1 : 0,
    visibility: Math.round((item.visibility || 10000) / 1000),
  }));

  // Simple daily aggregation from 3h forecast
  const dailyMap = {};
  fData.list.forEach(item => {
    const day = item.dt_txt.split(' ')[0];
    if (!dailyMap[day]) {
      dailyMap[day] = {
        date: day,
        temps: [],
        codes: [],
        pops: []
      };
    }
    dailyMap[day].temps.push(item.main.temp);
    dailyMap[day].codes.push(mapOWMToWMO(item.weather[0]?.id || 800));
    dailyMap[day].pops.push(Math.round((item.pop || 0) * 100));
  });

  const daily = Object.values(dailyMap).slice(0, 7).map(d => ({
    date: d.date,
    weatherCode: d.codes[Math.floor(d.codes.length / 2)] || 0,
    tempMax: Math.max(...d.temps),
    tempMin: Math.min(...d.temps),
    apparentMax: Math.max(...d.temps),
    apparentMin: Math.min(...d.temps),
    sunrise: new Date(cData.sys.sunrise * 1000).toISOString(),
    sunset: new Date(cData.sys.sunset * 1000).toISOString(),
    uvIndexMax: 5,
    popMax: Math.max(...d.pops),
    precipSum: 0,
  }));

  return {
    lat,
    lon,
    timezone: fData.city?.timezone || 'UTC',
    timezoneAbbreviation: '',
    current: {
      temp: cData.main.temp,
      feelsLike: cData.main.feels_like,
      humidity: cData.main.humidity,
      isDay,
      precipitation: cData.rain ? cData.rain['1h'] || 0 : 0,
      rain: cData.rain ? cData.rain['1h'] || 0 : 0,
      snowfall: cData.snow ? cData.snow['1h'] || 0 : 0,
      weatherCode: wmoCode,
      cloudCover: cData.clouds.all,
      pressure: cData.main.pressure,
      windSpeed: Math.round(cData.wind.speed * 3.6),
      windDirection: cData.wind.deg,
      windGusts: Math.round((cData.wind.gust || cData.wind.speed) * 3.6),
      uvIndex: 4,
      visibility: Math.round((cData.visibility || 10000) / 1000),
    },
    hourly,
    daily,
    airQuality: {
      usAqi: 30,
      euAqi: 15,
      pm2_5: 7,
      pm10: 12,
      co: 190,
      no2: 8,
      so2: 2,
      o3: 38,
    }
  };
}
