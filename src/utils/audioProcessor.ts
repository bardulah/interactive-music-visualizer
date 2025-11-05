import { AudioData } from '../types';

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private audio: HTMLAudioElement | null = null;
  private frequencyData: Uint8Array | null = null;
  private timeData: Uint8Array | null = null;

  constructor() {
    // AudioContext will be initialized when audio is loaded
  }

  async loadAudio(file: File): Promise<HTMLAudioElement> {
    // Create audio element
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.src = url;
    this.audio = audio;

    // Initialize audio context on user interaction
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Create analyser
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    // Create source and connect
    this.source = this.audioContext.createMediaElementSource(audio);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    // Initialize data arrays
    const bufferLength = this.analyser.frequencyBinCount;
    this.frequencyData = new Uint8Array(bufferLength);
    this.timeData = new Uint8Array(bufferLength);

    return audio;
  }

  getAudioData(): AudioData | null {
    if (!this.analyser || !this.frequencyData || !this.timeData) {
      return null;
    }

    // Get frequency and time domain data
    // @ts-expect-error - TS strict check issue with Uint8Array types
    this.analyser.getByteFrequencyData(this.frequencyData);
    // @ts-expect-error - TS strict check issue with Uint8Array types
    this.analyser.getByteTimeDomainData(this.timeData);

    // Calculate average frequency
    const avgFrequency = this.frequencyData.reduce((sum, val) => sum + val, 0) / this.frequencyData.length;

    // Calculate frequency bands
    const bassEnd = Math.floor(this.frequencyData.length * 0.1);
    const midEnd = Math.floor(this.frequencyData.length * 0.5);

    const bassLevel = this.calculateAverage(this.frequencyData, 0, bassEnd);
    const midLevel = this.calculateAverage(this.frequencyData, bassEnd, midEnd);
    const trebleLevel = this.calculateAverage(this.frequencyData, midEnd, this.frequencyData.length);

    return {
      frequencyData: this.frequencyData,
      timeData: this.timeData,
      avgFrequency,
      bassLevel,
      midLevel,
      trebleLevel,
    };
  }

  private calculateAverage(data: Uint8Array, start: number, end: number): number {
    const slice = data.slice(start, end);
    return slice.reduce((sum, val) => sum + val, 0) / slice.length;
  }

  setSmoothingTimeConstant(value: number): void {
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = value;
    }
  }

  setFFTSize(size: number): void {
    if (this.analyser) {
      this.analyser.fftSize = size;
      const bufferLength = this.analyser.frequencyBinCount;
      this.frequencyData = new Uint8Array(bufferLength);
      this.timeData = new Uint8Array(bufferLength);
    }
  }

  play(): void {
    if (this.audio) {
      this.audio.play();
    }
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  setCurrentTime(time: number): void {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }

  getAudio(): HTMLAudioElement | null {
    return this.audio;
  }

  destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
    if (this.source) {
      this.source.disconnect();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
