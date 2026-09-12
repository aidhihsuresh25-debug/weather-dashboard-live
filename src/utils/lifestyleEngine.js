// Smart Lifestyle Advisory Engine
// Analyzes weather data to provide automated, real-time advice for lifestyle, commute, fitness, & attire

export const getLifestyleInsights = (weatherData) => {
  if (!weatherData || !weatherData.current) return null;

  const current = weatherData.current;
  const hourly = weatherData.hourly || [];
  const temp = current.temp;
  const feelsLike = current.feelsLike;
  const code = current.weatherCode;
  const popMax = Math.max(...hourly.slice(0, 12).map(h => h.pop || 0), 0);
  const rainSum = current.precipitation || 0;
  const windSpeed = current.windSpeed;
  const windGusts = current.windGusts || windSpeed;
  const uvIndex = current.uvIndex;
  const visibility = current.visibility;

  // 1. Umbrella Necessity
  let umbrellaStatus = 'Not Needed';
  let umbrellaDetail = 'Clear conditions expected. Leave the umbrella at home.';
  let umbrellaBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code) || rainSum > 0.5) {
    umbrellaStatus = 'Essential';
    umbrellaDetail = 'Active rainfall detected. Heavy umbrella & waterproof gear strictly required.';
    umbrellaBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  } else if ([51, 53, 55].includes(code) || popMax > 50) {
    umbrellaStatus = 'Recommended';
    umbrellaDetail = `High chance of precipitation (${popMax}%). Keep a compact umbrella in your bag.`;
    umbrellaBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  }

  // 2. Attire Recommendation
  let attireTitle = 'Light Comfortable Clothing';
  let attireDetail = 'T-shirt, shorts/light trousers, sunglasses.';
  let attireItems = ['T-Shirt', 'Sunglasses', 'Light Pants'];

  if (feelsLike <= 0) {
    attireTitle = 'Heavy Winter Insulation';
    attireDetail = 'Sub-zero thermal feel! Thermal base layer, heavy down parka, gloves & beanie required.';
    attireItems = ['Down Jacket', 'Thermal Underwear', 'Beanie & Gloves', 'Insulated Boots'];
  } else if (feelsLike <= 10) {
    attireTitle = 'Warm Layered Attire';
    attireDetail = 'Chilly weather. Coat or thick fleece sweater over long sleeves recommended.';
    attireItems = ['Heavy Coat', 'Sweater', 'Long Pants', 'Warm Socks'];
  } else if (feelsLike <= 18) {
    attireTitle = 'Light Outerwear Layer';
    attireDetail = 'Mildly cool. A light windbreaker, jacket or cardigan is ideal.';
    attireItems = ['Light Jacket', 'Long Sleeve Shirt', 'Jeans'];
  } else if (feelsLike >= 30) {
    attireTitle = 'Ultra-Breathable Summer Attire';
    attireDetail = 'Hot & humid! Wear loose cotton/linen clothing, wide-brim hat, and apply sunscreen.';
    attireItems = ['Linen Shirt', 'Shorts', 'Sun Hat', 'Sunscreen SPF50'];
  }

  // 3. Outdoor Fitness Best Window
  let bestFitnessHour = 'Morning (07:00 - 09:00)';
  let fitnessScore = 85;
  let fitnessAdvice = 'Great weather for outdoor running, cycling, or tennis.';

  if (hourly.length >= 12) {
    // Find hourly index with lowest precipitation chance and moderate temp (15-22 C)
    let bestIdx = 0;
    let minPenalty = 999;

    hourly.slice(0, 16).forEach((h, idx) => {
      const tempDiff = Math.abs(h.temp - 18);
      const popPenalty = (h.pop || 0) * 1.5;
      const windPenalty = (h.windSpeed || 0) * 0.8;
      const uvPenalty = (h.uvIndex > 6) ? 20 : 0;
      const penalty = tempDiff + popPenalty + windPenalty + uvPenalty;

      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestIdx = idx;
      }
    });

    const bestTimeObj = new Date(hourly[bestIdx].time);
    const hourFormatted = bestTimeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    bestFitnessHour = `${hourFormatted} (${hourly[bestIdx].temp}°C, ${hourly[bestIdx].pop}% rain)`;
    
    if (hourly[bestIdx].pop > 50) {
      fitnessScore = 40;
      fitnessAdvice = 'High rain probability. Indoor gym workout recommended today.';
    } else if (hourly[bestIdx].windSpeed > 35) {
      fitnessScore = 55;
      fitnessAdvice = 'Breezy gust conditions. Shielded park trails recommended.';
    } else {
      fitnessScore = Math.max(70, Math.min(98, Math.round(100 - minPenalty)));
      fitnessAdvice = `Optimal conditions around ${hourFormatted}. Low rain risk & comfortable temperature.`;
    }
  }

  // 4. Commute Safety Engine
  let commuteScore = 95;
  let commuteStatus = 'Optimal Driving & Transit';
  let commuteDetails = [];

  if (visibility < 3) {
    commuteScore -= 25;
    commuteDetails.push(`Reduced visibility (${visibility} km due to fog/haze). Maintain extra distance.`);
  }
  if (rainSum > 2 || [63, 65, 82, 95, 96, 99].includes(code)) {
    commuteScore -= 30;
    commuteDetails.push('Wet asphalt & risk of hydroplaning. Reduce speeds by 15-20%.');
  }
  if (windGusts > 45) {
    commuteScore -= 20;
    commuteDetails.push(`High wind gusts (${windGusts} km/h). Keep steady grip on steering wheel.`);
  }
  if ([71, 73, 75].includes(code) || temp <= 0) {
    commuteScore -= 35;
    commuteDetails.push('Ice or snow accumulation possible. Ensure winter tires & clearance.');
  }

  commuteScore = Math.max(20, Math.min(100, commuteScore));
  if (commuteScore < 50) {
    commuteStatus = 'Hazardous Commute Warning';
  } else if (commuteScore < 80) {
    commuteStatus = 'Moderate Commute Caution';
  }
  if (commuteDetails.length === 0) {
    commuteDetails.push('Clear roadways & high visibility across major transport routes.');
  }

  // 5. UV & Solar Exposure Advisory
  let uvAdvice = 'Low UV danger. No special sun protection required.';
  if (uvIndex >= 8) {
    uvAdvice = 'Very High UV Index (8+)! Shirt, SPF 50+ sunscreen, and sunglasses mandatory. Limit midday sun exposure.';
  } else if (uvIndex >= 6) {
    uvAdvice = 'High UV Index (6-7). Apply sunscreen SPF 30+ every 2 hours and seek shade during noon hours.';
  } else if (uvIndex >= 3) {
    uvAdvice = 'Moderate UV Index (3-5). Wear sunglasses and apply sunscreen if spending over 45 minutes outdoors.';
  }

  return {
    umbrella: { status: umbrellaStatus, detail: umbrellaDetail, badge: umbrellaBadge },
    attire: { title: attireTitle, detail: attireDetail, items: attireItems },
    fitness: { bestTime: bestFitnessHour, score: fitnessScore, advice: fitnessAdvice },
    commute: { score: commuteScore, status: commuteStatus, details: commuteDetails },
    uv: { index: uvIndex, advice: uvAdvice }
  };
};
