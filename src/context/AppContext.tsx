import { createContext, useReducer, ReactNode, Dispatch } from 'react';
import { VisualizationSettings, Preset, PlaybackState, AudioData } from '../types';
import { AudioEffects } from '../utils/audioEffects.refactored';
import { colorPalettes } from '../utils/colorPalettes';

// State interface
export interface AppState {
  // Audio
  audioData: AudioData | null;
  playbackState: PlaybackState;
  fileName: string | null;

  // Visualization
  settings: VisualizationSettings;
  presets: Preset[];
  selectedPresetId: string | undefined;

  // Audio Effects
  audioEffects: AudioEffects;

  // UI State
  showControls: boolean;
  isFullscreen: boolean;
  isRecording: boolean;
  activePanel: 'controls' | 'effects' | 'sharing' | 'streaming' | 'shader' | 'midi';

  // Beat Detection
  beatInfo: {
    isBeat: boolean;
    bpm: number;
    confidence: number;
  };
}

// Action types
type AppAction =
  | { type: 'SET_AUDIO_DATA'; payload: AudioData | null }
  | { type: 'SET_PLAYBACK_STATE'; payload: Partial<PlaybackState> }
  | { type: 'SET_FILE_NAME'; payload: string | null }
  | { type: 'SET_SETTINGS'; payload: VisualizationSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<VisualizationSettings> }
  | { type: 'SET_PRESETS'; payload: Preset[] }
  | { type: 'ADD_PRESET'; payload: Preset }
  | { type: 'DELETE_PRESET'; payload: string }
  | { type: 'SELECT_PRESET'; payload: string | undefined }
  | { type: 'SET_AUDIO_EFFECTS'; payload: AudioEffects }
  | { type: 'UPDATE_AUDIO_EFFECTS'; payload: Partial<AudioEffects> }
  | { type: 'SET_SHOW_CONTROLS'; payload: boolean }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_ACTIVE_PANEL'; payload: AppState['activePanel'] }
  | { type: 'SET_BEAT_INFO'; payload: AppState['beatInfo'] };

// Initial state
const initialState: AppState = {
  audioData: null,
  playbackState: {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
  },
  fileName: null,
  settings: {
    type: 'particles',
    colorPalette: colorPalettes[0],
    speed: 1.0,
    complexity: 0.7,
    sensitivity: 1.0,
    smoothing: 0.8,
  },
  presets: [],
  selectedPresetId: undefined,
  audioEffects: {
    reverbEnabled: false,
    reverbAmount: 0.3,
    echoEnabled: false,
    echoDelay: 0.5,
    echoFeedback: 0.4,
    filterEnabled: false,
    filterType: 'lowpass',
    filterFrequency: 1000,
    filterQ: 1.0,
    distortionEnabled: false,
    distortionAmount: 0.3,
  },
  showControls: true,
  isFullscreen: false,
  isRecording: false,
  activePanel: 'controls',
  beatInfo: {
    isBeat: false,
    bpm: 0,
    confidence: 0,
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_AUDIO_DATA':
      return { ...state, audioData: action.payload };

    case 'SET_PLAYBACK_STATE':
      return {
        ...state,
        playbackState: { ...state.playbackState, ...action.payload },
      };

    case 'SET_FILE_NAME':
      return { ...state, fileName: action.payload };

    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'SET_PRESETS':
      return { ...state, presets: action.payload };

    case 'ADD_PRESET':
      return { ...state, presets: [...state.presets, action.payload] };

    case 'DELETE_PRESET':
      return {
        ...state,
        presets: state.presets.filter(p => p.id !== action.payload),
      };

    case 'SELECT_PRESET':
      return { ...state, selectedPresetId: action.payload };

    case 'SET_AUDIO_EFFECTS':
      return { ...state, audioEffects: action.payload };

    case 'UPDATE_AUDIO_EFFECTS':
      return {
        ...state,
        audioEffects: { ...state.audioEffects, ...action.payload },
      };

    case 'SET_SHOW_CONTROLS':
      return { ...state, showControls: action.payload };

    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullscreen: !state.isFullscreen };

    case 'SET_RECORDING':
      return { ...state, isRecording: action.payload };

    case 'SET_ACTIVE_PANEL':
      return { ...state, activePanel: action.payload };

    case 'SET_BEAT_INFO':
      return { ...state, beatInfo: action.payload };

    default:
      return state;
  }
}

// Context - exported for hooks to access
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
} | undefined>(undefined);

// Provider component - only export component from this file for Fast Refresh
// Hooks are exported from ./hooks.ts
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
