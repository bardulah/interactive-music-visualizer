/**
 * Beat Detection Algorithm
 * Detects beats in real-time audio using energy-based analysis
 * Based on Sound Energy Algorithm
 */

export interface BeatInfo {
  isBeat: boolean;
  confidence: number;
  bpm: number;
  energy: number;
  timestamp: number;
}

export class BeatDetector {
  private energyHistory: number[] = [];
  private beatHistory: number[] = [];
  private readonly HISTORY_SIZE = 43; // ~1 second at 43 updates/sec
  private readonly BEAT_THRESHOLD = 1.5; // Energy multiplier for beat detection
  private lastBeatTime = 0;
  private readonly MIN_BEAT_INTERVAL = 300; // ms (200 BPM max)
  private bpmHistory: number[] = [];
  private readonly BPM_HISTORY_SIZE = 8;

  /**
   * Detect beat from frequency data
   */
  detectBeat(frequencyData: Uint8Array): BeatInfo {
    const now = performance.now();

    // Calculate instant energy (focus on bass/low-mid frequencies)
    const energy = this.calculateEnergy(frequencyData, 0, 10);

    // Add to history
    this.energyHistory.push(energy);
    if (this.energyHistory.length > this.HISTORY_SIZE) {
      this.energyHistory.shift();
    }

    // Calculate average energy
    const avgEnergy = this.getAverageEnergy();

    // Calculate variance for adaptive thresholding
    const variance = this.getVariance(avgEnergy);
    const threshold = (-0.0025714 * variance) + this.BEAT_THRESHOLD;

    // Detect beat
    const isBeat =
      energy > threshold * avgEnergy &&
      now - this.lastBeatTime > this.MIN_BEAT_INTERVAL;

    // Calculate confidence
    const confidence = isBeat ? Math.min((energy / (threshold * avgEnergy)) - 1, 1) : 0;

    if (isBeat) {
      this.lastBeatTime = now;
      this.beatHistory.push(now);

      // Keep last 8 beats for BPM calculation
      if (this.beatHistory.length > this.BPM_HISTORY_SIZE) {
        this.beatHistory.shift();
      }
    }

    // Calculate BPM from recent beats
    const bpm = this.calculateBPM();

    return {
      isBeat,
      confidence,
      bpm,
      energy,
      timestamp: now,
    };
  }

  /**
   * Calculate energy from frequency data
   */
  private calculateEnergy(data: Uint8Array, start: number, end: number): number {
    let sum = 0;
    const actualEnd = Math.min(end, data.length);

    for (let i = start; i < actualEnd; i++) {
      sum += data[i] * data[i];
    }

    return sum / (actualEnd - start);
  }

  /**
   * Get average energy from history
   */
  private getAverageEnergy(): number {
    if (this.energyHistory.length === 0) return 0;
    const sum = this.energyHistory.reduce((a, b) => a + b, 0);
    return sum / this.energyHistory.length;
  }

  /**
   * Calculate variance for adaptive thresholding
   */
  private getVariance(average: number): number {
    if (this.energyHistory.length === 0) return 0;

    const squaredDiffs = this.energyHistory.map(energy => {
      const diff = energy - average;
      return diff * diff;
    });

    const sum = squaredDiffs.reduce((a, b) => a + b, 0);
    return sum / this.energyHistory.length;
  }

  /**
   * Calculate BPM from recent beat intervals
   */
  private calculateBPM(): number {
    if (this.beatHistory.length < 2) return 0;

    // Calculate intervals between beats
    const intervals: number[] = [];
    for (let i = 1; i < this.beatHistory.length; i++) {
      intervals.push(this.beatHistory[i] - this.beatHistory[i - 1]);
    }

    // Average interval in milliseconds
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Convert to BPM (beats per minute)
    const bpm = Math.round(60000 / avgInterval);

    // Smooth BPM with history
    this.bpmHistory.push(bpm);
    if (this.bpmHistory.length > 5) {
      this.bpmHistory.shift();
    }

    // Return smoothed BPM
    const smoothedBPM = Math.round(
      this.bpmHistory.reduce((a, b) => a + b, 0) / this.bpmHistory.length
    );

    // Sanity check (typical music range)
    return smoothedBPM >= 60 && smoothedBPM <= 200 ? smoothedBPM : 0;
  }

  /**
   * Reset detector state
   */
  reset(): void {
    this.energyHistory = [];
    this.beatHistory = [];
    this.bpmHistory = [];
    this.lastBeatTime = 0;
  }

  /**
   * Get current BPM estimate
   */
  getCurrentBPM(): number {
    return this.calculateBPM();
  }
}
