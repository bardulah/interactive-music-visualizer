/**
 * Vitest Setup File
 * Runs before all tests
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Test mocks are allowed to use 'any' for simplicity and flexibility

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Web Audio API (not available in jsdom)
(globalThis as any).AudioContext = class AudioContext {
  createAnalyser() {
    return {
      fftSize: 2048,
      frequencyBinCount: 1024,
      smoothingTimeConstant: 0.8,
      getByteFrequencyData: () => {},
      getByteTimeDomainData: () => {},
      connect: () => {},
      disconnect: () => {},
    };
  }
  createGain() {
    return {
      gain: { value: 1 },
      connect: () => {},
      disconnect: () => {},
    };
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { value: 1000 },
      Q: { value: 1 },
      connect: () => {},
      disconnect: () => {},
    };
  }
  createDelay() {
    return {
      delayTime: { value: 0 },
      connect: () => {},
      disconnect: () => {},
    };
  }
  createConvolver() {
    return {
      buffer: null,
      connect: () => {},
      disconnect: () => {},
    };
  }
  createWaveShaper() {
    return {
      curve: null,
      oversample: '4x',
      connect: () => {},
      disconnect: () => {},
    };
  }
  createMediaElementSource() {
    return {
      connect: () => {},
      disconnect: () => {},
    };
  }
  get destination() {
    return {
      connect: () => {},
      disconnect: () => {},
    };
  }
  get sampleRate() {
    return 44100;
  }
  get state() {
    return 'running';
  }
  createBuffer() {
    return {
      getChannelData: () => new Float32Array(44100),
      numberOfChannels: 2,
    };
  }
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
} as any;

// Mock MIDI API
(globalThis as any).navigator.requestMIDIAccess = () => {
  return Promise.resolve({
    inputs: new Map(),
    outputs: new Map(),
  } as any);
};
