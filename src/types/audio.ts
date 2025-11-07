/**
 * Enhanced type definitions for Web Audio API
 * Provides strict typing for audio nodes and parameters
 */

/**
 * Custom distortion curve type that matches WaveShaperNode requirements
 */
export type DistortionCurve = Float32Array;

/**
 * WebKit Audio Context type for cross-browser support
 */
export interface WebKitWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

/**
 * Type guard to check if window has WebKit Audio Context
 */
export function hasWebKitAudioContext(win: Window): win is WebKitWindow {
  return 'webkitAudioContext' in win;
}

/**
 * Safely get AudioContext constructor (supports WebKit)
 */
export function getAudioContextConstructor(): typeof AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext is only available in browser environment');
  }

  if ('AudioContext' in window) {
    return window.AudioContext;
  }

  const webkitWindow = window as WebKitWindow;
  if (webkitWindow.webkitAudioContext) {
    return webkitWindow.webkitAudioContext;
  }

  throw new Error('AudioContext is not supported in this browser');
}

/**
 * Spotify API response types
 */
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  preview_url: string | null;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email?: string;
  images: Array<{ url: string }>;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: {
    total: number;
  };
  images: Array<{ url: string }>;
  external_urls: {
    spotify: string;
  };
}
