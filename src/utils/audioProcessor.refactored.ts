import { AudioData } from '../types';
import { AudioContextManager } from './audioContextManager';

/**
 * Refactored AudioProcessor that uses centralized AudioContextManager
 * This ensures proper audio routing through effects chain
 */
export class AudioProcessor {
  private source: MediaElementAudioSourceNode | null = null;
  private audio: HTMLAudioElement | null = null;
  private frequencyData: Uint8Array | null = null;
  private timeData: Uint8Array | null = null;

  constructor() {
    // AudioContext managed centrally
  }

  async loadAudio(file: File): Promise<HTMLAudioElement> {
    // Create audio element
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.src = url;
    this.audio = audio;

    // Resume audio context (for autoplay policies)
    await AudioContextManager.resume();

    // Get analyser from manager
    const analyser = AudioContextManager.getAnalyser(2048, 0.8);

    // Create source and connect through manager
    this.source = AudioContextManager.createMediaElementSource(audio);
    AudioContextManager.connectSource(this.source);

    // Initialize data arrays
    const bufferLength = analyser.frequencyBinCount;
    this.frequencyData = new Uint8Array(bufferLength);
    this.timeData = new Uint8Array(bufferLength);

    return audio;
  }

  getAudioData(): AudioData | null {
    const analyser = AudioContextManager.getAnalyser();

    if (!analyser || !this.frequencyData || !this.timeData) {
      return null;
    }

    // Get frequency and time domain data
    // @ts-expect-error - TS strict check issue with Uint8Array types
    analyser.getByteFrequencyData(this.frequencyData);
    // @ts-expect-error - TS strict check issue with Uint8Array types
    analyser.getByteTimeDomainData(this.timeData);

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
    AudioContextManager.updateAnalyser(undefined, value);
  }

  setFFTSize(size: number): void {
    AudioContextManager.updateAnalyser(size, undefined);
    const analyser = AudioContextManager.getAnalyser();
    const bufferLength = analyser.frequencyBinCount;
    this.frequencyData = new Uint8Array(bufferLength);
    this.timeData = new Uint8Array(bufferLength);
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
    // Context managed centrally - don't close it
  }
}
