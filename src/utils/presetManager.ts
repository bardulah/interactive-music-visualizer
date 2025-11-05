import { Preset, VisualizationSettings } from '../types';

const STORAGE_KEY = 'music-visualizer-presets';

export class PresetManager {
  static savePreset(name: string, settings: VisualizationSettings): Preset {
    const presets = this.getAllPresets();
    const preset: Preset = {
      id: Date.now().toString(),
      name,
      settings,
      createdAt: Date.now(),
    };
    presets.push(preset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    return preset;
  }

  static getAllPresets(): Preset[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static deletePreset(id: string): void {
    const presets = this.getAllPresets().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  }

  static updatePreset(id: string, updates: Partial<Preset>): void {
    const presets = this.getAllPresets();
    const index = presets.findIndex(p => p.id === id);
    if (index !== -1) {
      presets[index] = { ...presets[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    }
  }

  static getDefaultPresets(): Preset[] {
    return [
      {
        id: 'default-1',
        name: 'Electric Dreams',
        settings: {
          type: 'particles',
          colorPalette: {
            name: 'Neon Dreams',
            colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'],
            backgroundColor: '#0a0a0f',
          },
          speed: 1.5,
          complexity: 0.8,
          sensitivity: 1.2,
          smoothing: 0.8,
        },
        createdAt: Date.now(),
      },
      {
        id: 'default-2',
        name: 'Ocean Waves',
        settings: {
          type: 'waveform',
          colorPalette: {
            name: 'Ocean Deep',
            colors: ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4'],
            backgroundColor: '#000814',
          },
          speed: 0.8,
          complexity: 0.6,
          sensitivity: 1.0,
          smoothing: 0.85,
        },
        createdAt: Date.now(),
      },
      {
        id: 'default-3',
        name: 'Geometric Pulse',
        settings: {
          type: 'geometric',
          colorPalette: {
            name: 'Cyber Pink',
            colors: ['#ff0a54', '#ff477e', '#ff5c8a', '#ff7096', '#ff85a1', '#ff99ac'],
            backgroundColor: '#0d0221',
          },
          speed: 1.2,
          complexity: 0.9,
          sensitivity: 1.3,
          smoothing: 0.75,
        },
        createdAt: Date.now(),
      },
    ];
  }
}
