/**
 * Custom hooks for accessing app context
 * Separated for React Fast Refresh compatibility
 */

import { useContext } from 'react';
import { AppContext } from './AppContext';
import { VisualizationSettings } from '../types';

// Base hook to access context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Selector hook for audio data
export const useAudioData = () => {
  const { state } = useAppContext();
  return state.audioData;
};

// Selector hook for settings with update function
export const useSettings = () => {
  const { state, dispatch } = useAppContext();
  return {
    settings: state.settings,
    updateSettings: (settings: Partial<VisualizationSettings>) =>
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
  };
};

// Selector hook for playback state
export const usePlayback = () => {
  const { state } = useAppContext();
  return state.playbackState;
};
