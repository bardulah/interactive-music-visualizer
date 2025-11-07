/**
 * Environment Configuration
 * Centralized access to environment variables with type safety
 */

export interface AppConfig {
  // API Keys
  spotifyClientId: string | undefined;
  soundcloudClientId: string | undefined;

  // App Info
  appName: string;
  appVersion: string;

  // Optional Services
  analyticsId?: string;
  sentryDsn?: string;

  // Feature Flags
  features: {
    enable3D: boolean;
    enableShaders: boolean;
    enableMIDI: boolean;
    enableStreaming: boolean;
    enableEffects: boolean;
  };

  // Runtime Info
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Parse boolean from string (handles "true", "false", "1", "0")
 */
const parseBoolean = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Get configuration from environment variables
 */
export const config: AppConfig = {
  // API Keys
  spotifyClientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  soundcloudClientId: import.meta.env.VITE_SOUNDCLOUD_CLIENT_ID,

  // App Info
  appName: import.meta.env.VITE_APP_NAME || 'Music Visualizer Pro',
  appVersion: import.meta.env.VITE_APP_VERSION || '2.0.0',

  // Optional Services
  analyticsId: import.meta.env.VITE_ANALYTICS_ID,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,

  // Feature Flags
  features: {
    enable3D: parseBoolean(import.meta.env.VITE_ENABLE_3D, true),
    enableShaders: parseBoolean(import.meta.env.VITE_ENABLE_SHADERS, true),
    enableMIDI: parseBoolean(import.meta.env.VITE_ENABLE_MIDI, true),
    enableStreaming: parseBoolean(import.meta.env.VITE_ENABLE_STREAMING, true),
    enableEffects: parseBoolean(import.meta.env.VITE_ENABLE_EFFECTS, true),
  },

  // Runtime Info
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

/**
 * Check if Spotify is configured
 */
export const isSpotifyConfigured = (): boolean => {
  return !!config.spotifyClientId && config.spotifyClientId !== 'your_spotify_client_id_here';
};

/**
 * Check if SoundCloud is configured
 */
export const isSoundCloudConfigured = (): boolean => {
  return !!config.soundcloudClientId && config.soundcloudClientId !== 'your_soundcloud_client_id_here';
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature];
};

/**
 * Log configuration on startup (development only)
 */
if (config.isDevelopment) {
  console.log('🔧 App Configuration:', {
    name: config.appName,
    version: config.appVersion,
    spotify: isSpotifyConfigured() ? '✅ Configured' : '❌ Not configured',
    soundcloud: isSoundCloudConfigured() ? '✅ Configured' : '❌ Not configured',
    features: config.features,
  });
}

export default config;
