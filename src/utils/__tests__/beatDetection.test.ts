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

    const result = detector.detectBeat(highEnergy);

    expect(result).toHaveProperty('isBeat');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('bpm');
    expect(result).toHaveProperty('energy');
  });

  it('should not detect beat immediately after previous beat', () => {
    const highEnergy = new Uint8Array(128).fill(200);

    // First beat
    const first = detector.detectBeat(highEnergy);

    // Immediate second call (should be rejected)
    const second = detector.detectBeat(highEnergy);

    expect(first.isBeat).toBeTruthy();
    expect(second.isBeat).toBeFalsy(); // Too soon
  });

  it('should reset state correctly', () => {
    const highEnergy = new Uint8Array(128).fill(200);
    detector.detectBeat(highEnergy);

    detector.reset();

    expect(detector.getCurrentBPM()).toBe(0);
  });

  it('should calculate BPM from multiple beats', () => {
    const highEnergy = new Uint8Array(128).fill(200);
    const lowEnergy = new Uint8Array(128).fill(50);

    // Simulate beats at ~120 BPM (500ms intervals)
    for (let i = 0; i < 5; i++) {
      detector.detectBeat(highEnergy);

      // Wait equivalent (simulate time passing)
      for (let j = 0; j < 50; j++) {
        detector.detectBeat(lowEnergy);
      }
    }

    const bpm = detector.getCurrentBPM();
    expect(bpm).toBeGreaterThan(0);
    expect(bpm).toBeLessThanOrEqual(200);
  });
});
