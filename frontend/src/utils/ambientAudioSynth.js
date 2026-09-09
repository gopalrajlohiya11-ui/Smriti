/**
 * Smriti Ambient Nature Sound Synthesizer (100% Offline Web Audio API)
 * Generates calming regional ambient soundscapes (River, Rain, Wind, Mountain Flute, Forest Birds)
 * without requiring any streaming bandwidth or audio assets.
 */

class AmbientNatureSynth {
  constructor() {
    this.ctx = null;
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentPreset = null;
    this.volume = 0.4;
    this.gainNode = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  stop() {
    try {
      this.activeNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          node.disconnect();
        } catch (e) {}
      });
      this.activeNodes = [];
      this.isPlaying = false;
      this.currentPreset = null;
    } catch (e) {}
  }

  playPreset(type) {
    this.stop();
    this.init();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentPreset = type;

    switch (type) {
      case 'rain':
        this._playRain();
        break;
      case 'river':
        this._playRiver();
        break;
      case 'wind':
        this._playWind();
        break;
      case 'flute':
        this._playFluteChords();
        break;
      case 'birds':
        this._playForestBirds();
        break;
      default:
        this._playRiver();
    }
  }

  // Pink Noise Generator for Rain / Water / Wind
  _createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  _playRain() {
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer();
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const highFilter = this.ctx.createBiquadFilter();
    highFilter.type = 'highpass';
    highFilter.frequency.setValueAtTime(300, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(highFilter);
    highFilter.connect(this.gainNode);

    noise.start();
    this.activeNodes.push(noise, filter, highFilter);
  }

  _playRiver() {
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer();
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    // Subtle LFO modulation for gentle wave ripples
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(this.gainNode);

    noise.start();
    lfo.start();
    this.activeNodes.push(noise, filter, lfo, lfoGain);
  }

  _playWind() {
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer();
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(this.gainNode);

    noise.start();
    lfo.start();
    this.activeNodes.push(noise, filter, lfo, lfoGain);
  }

  _playFluteChords() {
    // Gentle bamboo pentatonic scale tones
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C D E G A C
    let step = 0;

    const playNextTone = () => {
      if (!this.isPlaying || this.currentPreset !== 'flute' || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const toneGain = this.ctx.createGain();
        osc.type = 'sine';
        const freq = scale[step % scale.length];
        step++;

        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        toneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        toneGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 0.8);
        toneGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.8);

        osc.connect(toneGain);
        toneGain.connect(this.gainNode);

        osc.start();
        osc.stop(this.ctx.currentTime + 4.0);
        this.activeNodes.push(osc, toneGain);

        setTimeout(playNextTone, 3200);
      } catch (e) {}
    };

    playNextTone();
  }

  _playForestBirds() {
    const chirp = () => {
      if (!this.isPlaying || this.currentPreset !== 'birds' || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const chirpGain = this.ctx.createGain();
        osc.type = 'sine';

        const base = 2200 + Math.random() * 600;
        osc.frequency.setValueAtTime(base, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(base + 800, this.ctx.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(base + 200, this.ctx.currentTime + 0.15);

        chirpGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        chirpGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.05);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.connect(chirpGain);
        chirpGain.connect(this.gainNode);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
        this.activeNodes.push(osc, chirpGain);

        const nextDelay = 1500 + Math.random() * 2500;
        setTimeout(chirp, nextDelay);
      } catch (e) {}
    };

    chirp();
  }
}

export const ambientSynth = new AmbientNatureSynth();
