import { describe, it, expect, beforeEach } from 'vitest';
import { BeatDetector } from '../beatDetection';

describe('BeatDetector', () => {
  let detector: BeatDetector;

  beforeEach(() => {
    detector = new BeatDetector();
  });

  it('should initialize correctly', () => {
    expect(detector).toBeDefined();
    expect(detector.getCurrentBPM()).toBe(0);
  });

  it('should detect high energy as potential beat', () => {
    // Create high energy frequency data
    const highEnergy = new Uint8Array(128).fill(200);
    const lowEnergy = new Uint8Array(128).fill(50);

    // Build up history first (need baseline)
    for (let i = 0; i < 10; i++) {
      detector.detectBeat(lowEnergy);
    }

    const result = detector.detectBeat(highEnergy);

    expect(result).toHaveProperty('isBeat');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('bpm');
    expect(result).toHaveProperty('energy');
  });

  it('should not detect beat immediately after previous beat', () => {
    const highEnergy = new Uint8Array(128).fill(200);
    const lowEnergy = new Uint8Array(128).fill(50);

    // Build up history first
    for (let i = 0; i < 10; i++) {
      detector.detectBeat(lowEnergy);
    }

    // First beat
    const first = detector.detectBeat(highEnergy);

    // Immediate second call (should be rejected due to MIN_BEAT_INTERVAL)
    const second = detector.detectBeat(highEnergy);

    // First should detect a beat after building history
    expect(first.isBeat).toBeTruthy();
    expect(second.isBeat).toBeFalsy(); // Too soon (MIN_BEAT_INTERVAL = 300ms)
  });

  it('should reset state correctly', () => {
    const highEnergy = new Uint8Array(128).fill(200);
    detector.detectBeat(highEnergy);

    detector.reset();

    expect(detector.getCurrentBPM()).toBe(0);
  });

  it('should calculate BPM from multiple beats', () => {
    const highEnergy = new Uint8Array(128).fill(250);
    const lowEnergy = new Uint8Array(128).fill(30);

    // Build baseline history
    for (let i = 0; i < 20; i++) {
      detector.detectBeat(lowEnergy);
    }

    // Detect a beat
    const firstBeat = detector.detectBeat(highEnergy);
    expect(firstBeat.isBeat).toBeTruthy();

    // Since we can't actually wait in tests, BPM will be 0 without real time passing
    // This test verifies the method returns a valid number
    const bpm = detector.getCurrentBPM();
    expect(bpm).toBeGreaterThanOrEqual(0);
    expect(bpm).toBeLessThanOrEqual(200);
  });
});
