// Astronomy utilities for Sun & Moon cycles and phase determination

export const getSunProgress = (sunriseIso, sunsetIso) => {
  if (!sunriseIso || !sunsetIso) {
    return { progress: 50, isDaytime: true, label: 'Sun in Sky' };
  }

  const sunrise = new Date(sunriseIso).getTime();
  const sunset = new Date(sunsetIso).getTime();
  const now = Date.now();

  if (now < sunrise) {
    return {
      progress: 0,
      isDaytime: false,
      label: `Sunrise in ${Math.round((sunrise - now) / 3600000)}h ${Math.round(((sunrise - now) % 3600000) / 60000)}m`,
    };
  } else if (now > sunset) {
    return {
      progress: 100,
      isDaytime: false,
      label: `Sunset occurred ${Math.round((now - sunset) / 3600000)}h ago`,
    };
  } else {
    const totalDaylight = sunset - sunrise;
    const elapsed = now - sunrise;
    const progress = Math.round((elapsed / totalDaylight) * 100);
    const remainingMs = sunset - now;
    const hoursRem = Math.floor(remainingMs / 3600000);
    const minsRem = Math.floor((remainingMs % 3600000) / 60000);

    return {
      progress,
      isDaytime: true,
      label: `${hoursRem}h ${minsRem}m daylight remaining`,
    };
  }
};

export const getMoonPhase = (date = new Date()) => {
  // Approximate moon phase calculation using Julian date reference
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let c = 0;
  let e = 0;
  let jd = 0;
  let b = 0;

  if (month < 3) {
    year - 1;
    month + 12;
  }

  c = 365.25 * year;
  e = 30.6 * month;
  jd = c + e + day - 694039.09; // julian date relative to Jan 1 1900
  jd /= 29.5305882; // divide by synodic month
  b = parseInt(jd); // int(jd)
  jd -= b; // fractional part of jd
  const phaseValue = Math.round(jd * 8);

  let phaseName = 'New Moon';
  let illumination = 0;
  let moonSymbol = '🌑';

  switch (phaseValue % 8) {
    case 0:
      phaseName = 'New Moon';
      illumination = 0;
      moonSymbol = '🌑';
      break;
    case 1:
      phaseName = 'Waxing Crescent';
      illumination = 25;
      moonSymbol = '🌒';
      break;
    case 2:
      phaseName = 'First Quarter';
      illumination = 50;
      moonSymbol = '🌓';
      break;
    case 3:
      phaseName = 'Waxing Gibbous';
      illumination = 75;
      moonSymbol = '🌔';
      break;
    case 4:
      phaseName = 'Full Moon';
      illumination = 100;
      moonSymbol = '🌕';
      break;
    case 5:
      phaseName = 'Waning Gibbous';
      illumination = 75;
      moonSymbol = '🌖';
      break;
    case 6:
      phaseName = 'Last Quarter';
      illumination = 50;
      moonSymbol = '🌗';
      break;
    case 7:
      phaseName = 'Waning Crescent';
      illumination = 25;
      moonSymbol = '🌘';
      break;
    default:
      phaseName = 'New Moon';
  }

  return {
    name: phaseName,
    illumination,
    symbol: moonSymbol,
  };
};
