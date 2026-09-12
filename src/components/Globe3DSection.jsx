import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Globe as GlobeIcon, Play, Pause, MapPin, RotateCcw, Navigation, Loader2, Sparkles } from 'lucide-react';
import { reverseGeocode, WORLD_CITIES } from '../api/weatherService';
import LocationPreviewModal from './LocationPreviewModal';

const GLOBE_CITIES = WORLD_CITIES;

const EARTH_TEXTURE_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg';
const EARTH_SPECULAR_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg';

export default function Globe3DSection({ onSelectCity, currentCity, unit = 'C' }) {
  const mountRef = useRef(null);
  const [isRotatingState, setIsRotatingState] = useState(true);
  const [lastClickedGeo, setLastClickedGeo] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [previewLocation, setPreviewLocation] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const globeGroupRef = useRef(null);
  const isRotatingRef = useRef(true);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const toggleSpin = () => {
    const next = !isRotatingState;
    setIsRotatingState(next);
    isRotatingRef.current = next;
  };

  const focusCity = useCallback((city) => {
    if (!globeGroupRef.current) return;
    const targetY = (city.lon * Math.PI) / 180 + Math.PI / 2;
    const targetX = (-city.lat * Math.PI) / 180;
    globeGroupRef.current.rotation.y = targetY;
    globeGroupRef.current.rotation.x = targetX * 0.5;
  }, []);

  const resetGlobe = () => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y = (80 * Math.PI) / 180;
      globeGroupRef.current.rotation.x = (15 * Math.PI) / 180;
    }
    setLastClickedGeo(null);
  };

  // WebGL Three.js Photorealistic 3D Earth Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = (80 * Math.PI) / 180;
    globeGroup.rotation.x = (15 * Math.PI) / 180;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const radius = 1.4;
    const earthGeo = new THREE.SphereGeometry(radius, 64, 64);

    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load(EARTH_TEXTURE_URL);
    const specularMap = textureLoader.load(EARTH_SPECULAR_URL);
    earthMap.colorSpace = THREE.SRGBColorSpace;

    const earthMat = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: specularMap,
      specular: new THREE.Color(0x336699),
      shininess: 18,
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    const atmosGeo = new THREE.SphereGeometry(radius * 1.12, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.22, 0.74, 0.97, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

function getCityWeatherSymbol(city) {
  const name = (city.name || '').toLowerCase();
  if (['london', 'paris', 'amsterdam', 'dublin', 'vancouver', 'bogotá', 'hanoi'].includes(name)) {
    return { symbol: '🌧️', label: 'Rain' };
  }
  if (['moscow', 'oslo', 'stockholm', 'warsaw', 'toronto'].includes(name)) {
    return { symbol: '❄️', label: 'Snow' };
  }
  if (['dubai', 'riyadh', 'cairo', 'doha', 'los angeles', 'miami', 'honolulu', 'chennai', 'mumbai', 'delhi'].includes(name)) {
    return { symbol: '☀️', label: 'Sunny' };
  }
  if (['istanbul', 'rome', 'madrid', 'athens'].includes(name)) {
    return { symbol: '🌩️', label: 'Storm' };
  }
  return { symbol: '⛅', label: 'Partly Cloudy' };
}

function createWeatherSprite(symbolStr, isSelected) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background glowing circle
  ctx.beginPath();
  ctx.arc(64, 64, 52, 0, Math.PI * 2);
  ctx.fillStyle = isSelected ? 'rgba(244, 63, 94, 0.95)' : 'rgba(15, 23, 42, 0.90)';
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = isSelected ? '#ffffff' : '#06b6d4';
  ctx.stroke();

  // Weather symbol
  ctx.font = '54px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbolStr, 64, 66);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.13, 0.13, 1);
  return sprite;
}

    const cityPinsGroup = new THREE.Group();
    globeGroup.add(cityPinsGroup);

    const latLonToVector3 = (lat, lon, r) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    GLOBE_CITIES.forEach((city) => {
      const pos = latLonToVector3(city.lat, city.lon, radius * 1.025);
      const isSelected = currentCity?.name?.toLowerCase() === city.name.toLowerCase();
      const wx = getCityWeatherSymbol(city);

      const sprite = createWeatherSprite(wx.symbol, isSelected);
      sprite.position.copy(pos);
      sprite.userData = city;
      cityPinsGroup.add(sprite);
    });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animId;
    const animate = () => {
      if (isRotatingRef.current && !isDraggingRef.current) {
        globeGroup.rotation.y += 0.0025;
      }
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = async (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check pin hits
      const pinHits = raycaster.intersectObjects(cityPinsGroup.children);
      if (pinHits.length > 0) {
        const city = pinHits[0].object.userData;
        focusCity(city);
        setPreviewLocation(city);
        setIsPreviewOpen(true);
        return;
      }

      // Check Earth surface hit
      const hits = raycaster.intersectObject(earthMesh);
      if (hits.length > 0) {
        const hitPoint = hits[0].point;
        const localPoint = globeGroup.worldToLocal(hitPoint.clone());
        localPoint.normalize();

        const lat = 90 - Math.acos(localPoint.y) * (180 / Math.PI);
        const lon = (Math.atan2(localPoint.z, -localPoint.x) * (180 / Math.PI)) - 180;

        setLastClickedGeo({ lat, lon });
        setIsGeocoding(true);

        try {
          const resolvedCity = await reverseGeocode(lat, lon);
          setPreviewLocation(resolvedCity);
          setIsPreviewOpen(true);
        } catch (err) {
          console.error('WebGL 3D Earth raycast error:', err);
        } finally {
          setIsGeocoding(false);
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('click', handleCanvasClick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('click', handleCanvasClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentCity, focusCity]);

  // Mouse & Touch Drag Handlers
  const handleStart = (clientX, clientY) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX, clientY) => {
    if (!isDraggingRef.current || !globeGroupRef.current) return;
    const dx = clientX - lastMouseRef.current.x;
    const dy = clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: clientX, y: clientY };

    globeGroupRef.current.rotation.y += dx * 0.006;
    globeGroupRef.current.rotation.x = Math.max(-1.2, Math.min(1.2, globeGroupRef.current.rotation.x + dy * 0.006));
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative w-full bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-full text-xs font-semibold backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ultra-Smooth WebGL 3D Earth</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Photorealistic 3D WebGL Earth Sphere</span>
          </h2>
          <p className="text-xs text-slate-400">
            Drag to rotate 3D Earth • Click ANY point to open interactive location preview card
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {lastClickedGeo && (
            <div className="px-3 py-1 bg-slate-800/80 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-300 backdrop-blur-md flex items-center gap-1.5">
              {isGeocoding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>
                {lastClickedGeo.lat.toFixed(2)}°, {lastClickedGeo.lon.toFixed(2)}°
              </span>
            </div>
          )}

          <button
            onClick={toggleSpin}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition-all flex items-center gap-1.5 ${
              isRotatingState
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/60 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            {isRotatingState ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRotatingState ? 'Auto Spin ON' : 'Spin Paused'}</span>
          </button>

          <button
            onClick={resetGlobe}
            className="p-2 bg-slate-800/60 hover:bg-slate-700/80 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all"
            title="Reset Globe Rotation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WebGL 3D Globe Mount Container */}
      <div
        ref={mountRef}
        className="relative w-full h-[420px] sm:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => e.touches[0] && handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => e.touches[0] && handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
      >
        {/* Quick Focus City Chips */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center flex-wrap gap-1.5 z-20 pointer-events-auto">
          <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Major Hubs:</span>
          {GLOBE_CITIES.slice(0, 10).map((c) => (
            <button
              key={c.name}
              onClick={() => {
                focusCity(c);
                setPreviewLocation(c);
                setIsPreviewOpen(true);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1 backdrop-blur-md ${
                currentCity?.name?.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20 scale-105'
                  : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-cyan-400/50 hover:text-white'
              }`}
            >
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location Interactive Preview Modal Popup */}
      <LocationPreviewModal
        location={previewLocation}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSelectCity={onSelectCity}
        unit={unit}
      />
    </div>
  );
}
