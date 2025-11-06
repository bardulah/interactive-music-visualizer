import type {
  SpotifyTrack as SpotifyAPITrack,
  SpotifySearchResponse,
  SpotifyPlaylist,
} from '../types/audio';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  duration: number;
  previewUrl: string | null;
  imageUrl: string;
}

interface SpotifyAudioFeatures {
  tempo: number;
  energy: number;
  danceability: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
}

interface SpotifyCurrentlyPlaying {
  item: SpotifyAPITrack | null;
  is_playing: boolean;
  progress_ms: number;
}

export class SpotifyIntegration {
  private static readonly CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // Users will need to add their own
  private static readonly REDIRECT_URI = window.location.origin + '/spotify-callback';
  private static readonly SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state'
  ];

  private accessToken: string | null = null;

  // Check if Spotify is configured
  static isConfigured(): boolean {
    return this.CLIENT_ID !== 'YOUR_SPOTIFY_CLIENT_ID';
  }

  // Generate authorization URL
  static getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      response_type: 'token',
      redirect_uri: this.REDIRECT_URI,
      scope: this.SCOPES.join(' '),
      show_dialog: 'true',
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Parse token from URL after redirect
  static parseTokenFromUrl(): string | null {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
  }

  // Set access token
  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('spotify_access_token', token);
  }

  // Get stored access token
  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('spotify_access_token');
    }
    return this.accessToken;
  }

  // Clear access token
  clearAccessToken(): void {
    this.accessToken = null;
    localStorage.removeItem('spotify_access_token');
  }

  // Search for tracks
  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAccessToken();
        throw new Error('Authentication expired');
      }
      throw new Error('Failed to search tracks');
    }

    const data = await response.json() as SpotifySearchResponse;
    return data.tracks.items.map((track: SpotifyAPITrack) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(artist => artist.name),
      album: track.album.name,
      duration: track.duration_ms / 1000,
      previewUrl: track.preview_url,
      imageUrl: track.album.images[0]?.url || '',
    }));
  }

  // Get track audio features (tempo, energy, etc.)
  async getTrackAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(
      `https://api.spotify.com/v1/audio-features/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get audio features');
    }

    return response.json();
  }

  // Get user's playlists
  async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(
      'https://api.spotify.com/v1/me/playlists',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get playlists');
    }

    const data = await response.json() as { items: SpotifyPlaylist[] };
    return data.items;
  }

  // Get currently playing track
  async getCurrentlyPlaying(): Promise<SpotifyCurrentlyPlaying | null> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.status === 204) {
      return null; // Nothing playing
    }

    if (!response.ok) {
      throw new Error('Failed to get currently playing track');
    }

    return response.json() as Promise<SpotifyCurrentlyPlaying>;
  }
}

interface SoundCloudTrack {
  id: number;
  title: string;
  user: { username: string };
  duration: number;
  stream_url: string;
  artwork_url: string | null;
}

export class SoundCloudIntegration {
  private static readonly CLIENT_ID = 'YOUR_SOUNDCLOUD_CLIENT_ID'; // Users will need to add their own

  // Check if SoundCloud is configured
  static isConfigured(): boolean {
    return this.CLIENT_ID !== 'YOUR_SOUNDCLOUD_CLIENT_ID';
  }

  // Search tracks (using public API)
  static async searchTracks(query: string, limit: number = 20): Promise<SoundCloudTrack[]> {
    // Note: SoundCloud API v2 requires authentication
    // This is a simplified example - users would need to implement proper auth
    const response = await fetch(
      `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&limit=${limit}&client_id=${this.CLIENT_ID}`
    );

    if (!response.ok) {
      throw new Error('Failed to search SoundCloud tracks');
    }

    const data = await response.json();
    return data.collection || [];
  }

  // Get stream URL for track
  static async getStreamUrl(trackId: string): Promise<string> {
    const response = await fetch(
      `https://api-v2.soundcloud.com/tracks/${trackId}/streams?client_id=${this.CLIENT_ID}`
    );

    if (!response.ok) {
      throw new Error('Failed to get stream URL');
    }

    const data = await response.json();
    return data.http_mp3_128_url || data.preview_url;
  }
}
