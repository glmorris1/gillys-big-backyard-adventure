export class SynthAudio {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.context = null;
    this.master = null;
    this.loopTimer = null;
    this.step = 0;
    this.bpm = 112;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stopMusic();
  }

  ensure() {
    if (!this.enabled) return null;
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.08;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') this.context.resume();
    return this.context;
  }

  blip(frequency = 440, duration = 0.08, type = 'square', gain = 0.16) {
    const ctx = this.ensure();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const volume = ctx.createGain();
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;
    volume.gain.setValueAtTime(gain, ctx.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(volume);
    volume.connect(this.master);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  noise(duration = 0.16, gain = 0.12) {
    const ctx = this.ensure();
    if (!ctx) return;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const source = ctx.createBufferSource();
    const volume = ctx.createGain();
    volume.gain.value = gain;
    source.buffer = buffer;
    source.connect(volume);
    volume.connect(this.master);
    source.start();
  }

  jump() {
    this.blip(520, 0.09, 'triangle', 0.18);
  }

  bounce() {
    this.blip(280, 0.06, 'square', 0.16);
    setTimeout(() => this.blip(720, 0.09, 'triangle', 0.14), 45);
  }

  bonk() {
    this.noise(0.22, 0.15);
    this.blip(120, 0.18, 'sawtooth', 0.14);
  }

  celebrate() {
    [440, 554, 659, 880].forEach((note, index) => {
      setTimeout(() => this.blip(note, 0.12, 'triangle', 0.15), index * 85);
    });
  }

  startMusic(level) {
    const ctx = this.ensure();
    if (!ctx) return;
    this.stopMusic();
    this.bpm = 100 + level.id * 12;
    this.step = 0;
    const scale = [0, 3, 5, 7, 10, 12, 15, 17];
    const root = 165 + level.id * 14;
    const interval = (60 / this.bpm / 2) * 1000;
    this.loopTimer = setInterval(() => {
      if (!this.enabled) return;
      const beat = this.step % 8;
      const note = root * 2 ** (scale[(beat + level.id) % scale.length] / 12);
      this.blip(note, 0.055, beat % 2 ? 'triangle' : 'square', beat === 0 ? 0.13 : 0.07);
      if (beat === 0 || beat === 4) this.blip(root / 2, 0.06, 'sine', 0.12);
      this.step += 1;
    }, interval);
  }

  stopMusic() {
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }
}
