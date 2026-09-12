// WMO Weather Interpretation Codes (WW)
// Maps Open-Meteo & OpenWeather codes to visual, particle, audio, and landscape themes

export const WEATHER_CODES = {
  0: {
    description: 'Clear Sky',
    category: 'clear',
    icon: 'Sun',
    nightIcon: 'Moon',
    particleMode: 'sunbeams', // or 'stars' at night
    soundTheme: 'sunny',
    bgDay: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=80', // Radiant clear sky
    bgNight: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80', // Starry night sky
  },
  1: {
    description: 'Mainly Clear',
    category: 'clear',
    icon: 'SunDim',
    nightIcon: 'Moon',
    particleMode: 'sunbeams',
    soundTheme: 'sunny',
    bgDay: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1532978379173-523e16f371f2?auto=format&fit=crop&w=1920&q=80',
  },
  2: {
    description: 'Partly Cloudy',
    category: 'cloudy',
    icon: 'CloudSun',
    nightIcon: 'CloudMoon',
    particleMode: 'clouds',
    soundTheme: 'wind',
    bgDay: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=1920&q=80',
  },
  3: {
    description: 'Overcast',
    category: 'cloudy',
    icon: 'Cloud',
    nightIcon: 'Cloud',
    particleMode: 'clouds',
    soundTheme: 'wind',
    bgDay: 'https://images.unsplash.com/photo-1499346866879-91cad50e5046?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1920&q=80',
  },
  45: {
    description: 'Foggy',
    category: 'fog',
    icon: 'CloudFog',
    nightIcon: 'CloudFog',
    particleMode: 'fog',
    soundTheme: 'wind',
    bgDay: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?auto=format&fit=crop&w=1920&q=80',
  },
  48: {
    description: 'Depositing Rime Fog',
    category: 'fog',
    icon: 'CloudFog',
    nightIcon: 'CloudFog',
    particleMode: 'fog',
    soundTheme: 'wind',
    bgDay: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?auto=format&fit=crop&w=1920&q=80',
  },
  51: {
    description: 'Light Drizzle',
    category: 'drizzle',
    icon: 'CloudDrizzle',
    nightIcon: 'CloudDrizzle',
    particleMode: 'rain_light',
    soundTheme: 'rain',
    bgDay: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=80',
  },
  53: {
    description: 'Moderate Drizzle',
    category: 'drizzle',
    icon: 'CloudDrizzle',
    nightIcon: 'CloudDrizzle',
    particleMode: 'rain_light',
    soundTheme: 'rain',
    bgDay: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=80',
  },
  55: {
    description: 'Dense Drizzle',
    category: 'drizzle',
    icon: 'CloudRain',
    nightIcon: 'CloudRain',
    particleMode: 'rain',
    soundTheme: 'rain',
    bgDay: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=80',
  },
  61: {
    description: 'Slight Rain',
    category: 'rain',
    icon: 'CloudRain',
    nightIcon: 'CloudRain',
    particleMode: 'rain',
    soundTheme: 'rain',
    bgDay: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1920&q=80',
  },
  63: {
    description: 'Moderate Rain',
    category: 'rain',
    icon: 'CloudRain',
    nightIcon: 'CloudRain',
    particleMode: 'rain',
    soundTheme: 'rain',
    bgDay: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1920&q=80',
  },
  65: {
    description: 'Heavy Rain',
    category: 'rain',
    icon: 'CloudRainHeavy',
    nightIcon: 'CloudRainHeavy',
    particleMode: 'rain_heavy',
    soundTheme: 'rain',
    bgDay: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1920&q=80',
  },
  71: {
    description: 'Slight Snow',
    category: 'snow',
    icon: 'Snowflake',
    nightIcon: 'Snowflake',
    particleMode: 'snow',
    soundTheme: 'wind',
    bgDay: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1517299321529-639f8c26d4a1?auto=format&fit=crop&w=1920&q=80',
  },
  73: {
    description: 'Moderate Snow',
    category: 'snow',
    icon: 'Snowflake',
    nightIcon: 'Snowflake',
    particleMode: 'snow',
    soundTheme: 'wind',
    bgDay: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1517299321529-639f8c26d4a1?auto=format&fit=crop&w=1920&q=80',
  },
  75: {
    description: 'Heavy Snow',
    category: 'snow',
    icon: 'Snowflake',
    nightIcon: 'Snowflake',
    particleMode: 'snow_heavy',
    soundTheme: 'wind',
    bgDay: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1517299321529-639f8c26d4a1?auto=format&fit=crop&w=1920&q=80',
  },
  80: {
    description: 'Slight Rain Showers',
    category: 'rain',
    icon: 'CloudSunRain',
    nightIcon: 'CloudMoonRain',
    particleMode: 'rain',
    soundTheme: 'rain',
    bgDay: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1920&q=80',
  },
  81: {
    description: 'Moderate Rain Showers',
    category: 'rain',
    icon: 'CloudSunRain',
    nightIcon: 'CloudMoonRain',
    particleMode: 'rain',
    soundTheme: 'rain',
    bgDay: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1920&q=80',
  },
  82: {
    description: 'Violent Rain Showers',
    category: 'rain',
    icon: 'CloudRainHeavy',
    nightIcon: 'CloudRainHeavy',
    particleMode: 'rain_heavy',
    soundTheme: 'rain',
    bgDay: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1920&q=80',
  },
  95: {
    description: 'Thunderstorm',
    category: 'thunderstorm',
    icon: 'CloudLightning',
    nightIcon: 'CloudLightning',
    particleMode: 'thunderstorm',
    soundTheme: 'thunder',
    bgDay: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1920&q=80',
  },
  96: {
    description: 'Thunderstorm with Hail',
    category: 'thunderstorm',
    icon: 'CloudLightning',
    nightIcon: 'CloudLightning',
    particleMode: 'thunderstorm',
    soundTheme: 'thunder',
    bgDay: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1920&q=80',
  },
  99: {
    description: 'Heavy Thunderstorm with Hail',
    category: 'thunderstorm',
    icon: 'CloudLightning',
    nightIcon: 'CloudLightning',
    particleMode: 'thunderstorm',
    soundTheme: 'thunder',
    bgDay: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1920&q=80',
    bgNight: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1920&q=80',
  },
};

export const getWeatherTheme = (category = 'clear', isDay = 1) => {
  switch (category) {
    case 'clear':
      return {
        accentText: isDay ? 'text-amber-400' : 'text-amber-300',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        btnBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25',
        glowBg: 'bg-amber-500/20',
        borderColor: 'border-amber-500/30',
        activeChip: 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/25',
        iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      };
    case 'cloudy':
      return {
        accentText: 'text-indigo-300',
        badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        btnBg: 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white shadow-indigo-500/25',
        glowBg: 'bg-indigo-500/20',
        borderColor: 'border-indigo-500/30',
        activeChip: 'bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/25',
        iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      };
    case 'thunderstorm':
      return {
        accentText: 'text-purple-300',
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        btnBg: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-500/30',
        glowBg: 'bg-purple-500/20',
        borderColor: 'border-purple-500/30',
        activeChip: 'bg-purple-600 text-white border-purple-400 shadow-purple-500/30',
        iconBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      };
    case 'snow':
      return {
        accentText: 'text-sky-300',
        badgeBg: 'bg-sky-400/20 text-sky-200 border-sky-400/40',
        btnBg: 'bg-gradient-to-r from-sky-400 to-teal-400 hover:from-sky-300 hover:to-teal-300 text-slate-950 shadow-sky-400/25',
        glowBg: 'bg-sky-400/20',
        borderColor: 'border-sky-400/30',
        activeChip: 'bg-sky-400 text-slate-950 border-sky-300 shadow-sky-400/25',
        iconBg: 'bg-sky-400/20 text-sky-200 border-sky-400/30',
      };
    case 'fog':
      return {
        accentText: 'text-emerald-300',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        btnBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/25',
        glowBg: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/30',
        activeChip: 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/25',
        iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      };
    case 'rain':
    case 'drizzle':
    default:
      return {
        accentText: 'text-cyan-400',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        btnBg: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25',
        glowBg: 'bg-cyan-500/20',
        borderColor: 'border-cyan-500/30',
        activeChip: 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/25',
        iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      };
  }
};

export const getWeatherDetails = (code, isDay = 1) => {
  const defaultInfo = WEATHER_CODES[0];
  const info = WEATHER_CODES[code] || defaultInfo;
  const theme = getWeatherTheme(info.category, isDay);
  
  const fallbackGradients = {
    clear: isDay
      ? 'linear-gradient(to bottom, #0284c7, #38bdf8, #0f172a)'
      : 'linear-gradient(to bottom, #030712, #0f172a, #1e1b4b)',
    cloudy: isDay
      ? 'linear-gradient(to bottom, #1e293b, #334155, #0f172a)'
      : 'linear-gradient(to bottom, #020617, #0f172a, #1e293b)',
    rain: isDay
      ? 'linear-gradient(to bottom, #0f172a, #1e293b, #030712)'
      : 'linear-gradient(to bottom, #020617, #0b1329, #020617)',
    drizzle: isDay
      ? 'linear-gradient(to bottom, #0f172a, #1e293b, #030712)'
      : 'linear-gradient(to bottom, #020617, #0b1329, #020617)',
    thunderstorm: 'linear-gradient(to bottom, #1e1b4b, #311042, #020617)',
    snow: 'linear-gradient(to bottom, #0c4a6e, #0369a1, #0f172a)',
    fog: 'linear-gradient(to bottom, #1e293b, #334155, #0f172a)',
  };

  return {
    ...info,
    theme,
    bgImage: isDay ? info.bgDay : info.bgNight,
    fallbackGradient: fallbackGradients[info.category] || fallbackGradients.clear,
    particleType: !isDay && info.category === 'clear' ? 'stars' : info.particleMode
  };
};

export const convertTemp = (celsius, unit = 'C') => {
  if (celsius === undefined || celsius === null) return '--';
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
};

export const getWindDirection = (deg) => {
  if (deg === undefined || deg === null) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5);
  return directions[index % 16];
};
