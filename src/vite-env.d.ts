/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID?: string;
  readonly VITE_SOUNDCLOUD_CLIENT_ID?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_ANALYTICS_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_ENABLE_3D?: string;
  readonly VITE_ENABLE_SHADERS?: string;
  readonly VITE_ENABLE_MIDI?: string;
  readonly VITE_ENABLE_STREAMING?: string;
  readonly VITE_ENABLE_EFFECTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
