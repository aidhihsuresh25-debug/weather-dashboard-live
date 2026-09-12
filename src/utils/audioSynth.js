// Procedural Web Audio Ambient Soundscape Engine
// Real-time sound synthesis for Rain, Wind, Thunderstorm, and Sunny outdoor ambiance

class WeatherAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.activeNodes = [];
    this.currentMode = null;
    this.volume = 0.5;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return true;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute(forceState = null) {
    this.init();
    this.isMuted = forceState !== null ? forceState : !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  stopAll() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.activeNodes = [];
    this.currentMode = null;
  }

  playTheme(themeName) {
    if (!this.init()) return;
    if (this.currentMode === themeName && this.activeNodes.length > 0) return;

    this.stopAll();
    this.currentMode = themeName;

    if (themeName === 'rain') {
      this.startRainSynth();
    } else if (themeName === 'wind') {
      this.startWindSynth();
    } else if (themeName === 'thunder') {
      this.startThunderSynth();
    } else if (themeName === 'sunny') {
      this.startSunnySynth();
    }
  }

  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  }

  startRainSynth() {
    if (!this.ctx) return;
    const noiseBuf = this.createNoiseBuffer();
    if (!noiseBuf) return;

    // Rain continuous background noise
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuf;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.25, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, gainNode);
  }

  startWindSynth() {
    if (!this.ctx) return;
    const noiseBuf = this.createNoiseBuffer();
    if (!noiseBuf) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // LFO to swell wind frequencies
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime); // 5 sec sweep cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.activeNodes.push(noise, filter, lfo, lfoGain, gainNode);
  }

  startThunderSynth() {
    this.startRainSynth();

    // Periodic thunder rumble
    const triggerThunder = () => {
      if (!this.ctx || this.currentMode !== 'thunder') return;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 1.5);

      const thunderGain = this.ctx.createGain();
      thunderGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      thunderGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

      osc.connect(thunderGain);
      thunderGain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.5);
    };

    triggerThunder();
    const interval = setInterval(() => {
      if (this.currentMode !== 'thunder') {
        clearInterval(interval);
        return;
      }
      if (Math.random() > 0.4) triggerThunder();
    }, 7000);
  }

  startSunnySynth() {
    if (!this.ctx) return;

    // Ambient warm pad drone + gentle warm chimes
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime); // A3

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.05, this.ctx.currentTime);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    osc.start();

    this.activeNodes.push(osc, gainNode);

    // Subtle random pentatonic chimes
    const notes = [440, 523.25, 659.25, 783.99, 880];
    const chimeInterval = setInterval(() => {
      if (this.currentMode !== 'sunny' || !this.ctx || this.isMuted) return;
      const freq = notes[Math.floor(Math.random() * notes.length)];

      const chimeOsc = this.ctx.createOscillator();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const chimeGain = this.ctx.createGain();
      chimeGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.masterGain);

      chimeOsc.start();
      chimeOsc.stop(this.ctx.currentTime + 1.8);
    }, 4500);
  }
}

export const weatherAudio = new WeatherAudioEngine();
