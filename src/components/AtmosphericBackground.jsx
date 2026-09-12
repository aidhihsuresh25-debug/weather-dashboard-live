import React, { useEffect, useRef, useState } from 'react';
import { getWeatherDetails } from '../utils/weatherInterpretation';

export default function AtmosphericBackground({ weatherCode = 0, isDay = 1 }) {
  const canvasRef = useRef(null);
  const [lightningFlash, setLightningFlash] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const details = getWeatherDetails(weatherCode, isDay);

  // Reset image load status when bgImage changes
  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);

    if (!details.bgImage) return;

    const img = new Image();
    img.src = details.bgImage;
    img.onload = () => setImgLoaded(true);
    img.onerror = () => setImgError(true);
  }, [details.bgImage]);

  // Canvas particle animation system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mode = details.particleType;

    // Create particles based on weather type
    const particles = [];
    const particleCount = mode.includes('heavy') ? 200 : mode.includes('rain') ? 130 : mode.includes('snow') ? 80 : mode === 'stars' ? 100 : 35;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: mode.includes('rain') ? Math.random() * 12 + 8 : mode.includes('snow') ? Math.random() * 1.5 + 0.5 : Math.random() * 0.4 + 0.1,
        length: Math.random() * 20 + 10,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    let shootingStar = null;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (mode.includes('rain') || mode === 'thunderstorm') {
        ctx.strokeStyle = 'rgba(180, 220, 255, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        particles.forEach((p) => {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.speedX * 2, p.y + p.length);
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        });
        ctx.stroke();
      } else if (mode.includes('snow')) {
        particles.forEach((p) => {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.speedY;
          p.x += Math.sin(p.y / 20) * 0.8;
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        });
      } else if (mode === 'stars') {
        particles.forEach((p) => {
          p.opacity += p.twinkleSpeed;
          if (p.opacity > 1 || p.opacity < 0.2) p.twinkleSpeed = -p.twinkleSpeed;
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.9, 0, Math.PI * 2);
          ctx.fill();
        });

        if (!shootingStar && Math.random() < 0.008) {
          shootingStar = {
            x: Math.random() * width,
            y: Math.random() * (height * 0.4),
            length: Math.random() * 80 + 40,
            speed: Math.random() * 10 + 12,
            opacity: 1,
          };
        }

        if (shootingStar) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${shootingStar.opacity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(shootingStar.x, shootingStar.y);
          ctx.lineTo(shootingStar.x - shootingStar.length, shootingStar.y + shootingStar.length * 0.5);
          ctx.stroke();

          shootingStar.x += shootingStar.speed;
          shootingStar.y += shootingStar.speed * 0.5;
          shootingStar.opacity -= 0.03;

          if (shootingStar.opacity <= 0) shootingStar = null;
        }
      } else if (mode === 'sunbeams') {
        particles.forEach((p) => {
          ctx.fillStyle = `rgba(255, 220, 150, ${p.opacity * 0.4})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
          p.y -= p.speedY * 0.5;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [details.particleType]);

  // Thunderstorm periodic lightning flash
  useEffect(() => {
    if (details.particleType !== 'thunderstorm') {
      setLightningFlash(false);
      return;
    }
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setLightningFlash(true);
        setTimeout(() => setLightningFlash(false), 120);
        setTimeout(() => {
          if (Math.random() > 0.5) {
            setLightningFlash(true);
            setTimeout(() => setLightningFlash(false), 80);
          }
        }, 180);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [details.particleType]);

  // Get dynamic CSS sky gradient based on weather category & time
  const getSkyGradient = () => {
    if (!isDay) {
      return 'linear-gradient(135deg, #030712 0%, #0f172a 45%, #1e1b4b 100%)';
    }
    switch (details.category) {
      case 'clear':
        return 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #0f172a 100%)';
      case 'cloudy':
        return 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)';
      case 'rain':
      case 'drizzle':
        return 'linear-gradient(135deg, #0b192c 0%, #1e293b 50%, #020617 100%)';
      case 'thunderstorm':
        return 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #020617 100%)';
      case 'snow':
        return 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 40%, #0f172a 100%)';
      case 'fog':
        return 'linear-gradient(135deg, #115e59 0%, #1e293b 50%, #0f172a 100%)';
      default:
        return 'linear-gradient(135deg, #0f172a 0%, #020617 100%)';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Layer 1: Guaranteed Pure CSS Sky Gradient Base (Never Blanks / Flashes) */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: getSkyGradient() }}
      />

      {/* Layer 2: Solar Flare / Celestial Glow Radial Aura */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
        style={{
          background: isDay
            ? 'radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.15) 30%, transparent 65%)'
            : 'radial-gradient(circle at 75% 25%, rgba(56, 189, 248, 0.25) 0%, rgba(147, 51, 234, 0.15) 35%, transparent 65%)',
        }}
      />

      {/* Layer 3: Smooth Fading Landscape Photo Banner (Loads Gracefully Over Gradient) */}
      {details.bgImage && !imgError && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 transform scale-105 ${
            imgLoaded ? 'opacity-40' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${details.bgImage}')` }}
        />
      )}

      {/* Layer 4: Soft Glass Vignette & Depth Mask */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/70" />

      {/* Layer 5: Electric Lightning Flash Overlay */}
      {lightningFlash && (
        <div className="absolute inset-0 bg-sky-100/35 backdrop-brightness-200 transition-opacity duration-75" />
      )}

      {/* Layer 6: Interactive Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-90" />
    </div>
  );
}
