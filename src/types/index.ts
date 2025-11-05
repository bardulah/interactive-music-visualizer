export type VisualizationType = 'waveform' | 'particles' | 'geometric' | 'organic' | 'bars' | 'spiral';

export interface AudioData {
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  avgFrequency: number;
  bassLevel: number;
  midLevel: number;
  trebleLevel: number;
}

export interface VisualizationSettings {
  type: VisualizationType;
  colorPalette: ColorPalette;
  speed: number;
  complexity: number;
  sensitivity: number;
  smoothing: number;
}

export interface ColorPalette {
  name: string;
  colors: string[];
  backgroundColor: string;
}

export interface Preset {
  id: string;
  name: string;
  settings: VisualizationSettings;
  thumbnail?: string;
  createdAt: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}
