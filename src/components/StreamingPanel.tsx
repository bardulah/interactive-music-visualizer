import { useState, useEffect } from 'react';
import { SpotifyIntegration, SpotifyTrack } from '../utils/spotifyIntegration';

interface Props {
  onTrackSelect: (previewUrl: string, trackName: string) => void;
  className?: string;
}

export const StreamingPanel: React.FC<Props> = ({ onTrackSelect, className = '' }) => {
  const [spotify] = useState(() => new SpotifyIntegration());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if we have a token
    const token = spotify.getAccessToken();
    setIsAuthenticated(!!token);

    // Check if we just got redirected from Spotify
    const urlToken = SpotifyIntegration.parseTokenFromUrl();
    if (urlToken) {
      spotify.setAccessToken(urlToken);
      setIsAuthenticated(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [spotify]);

  const handleLogin = () => {
    if (!SpotifyIntegration.isConfigured()) {
      setError('Spotify integration is not configured. Please add your Spotify Client ID.');
      return;
    }
    window.location.href = SpotifyIntegration.getAuthorizationUrl();
  };

  const handleLogout = () => {
    spotify.clearAccessToken();
    setIsAuthenticated(false);
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const results = await spotify.searchTracks(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError((err as Error).message);
      if ((err as Error).message.includes('Authentication')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrackSelect = (track: SpotifyTrack) => {
    if (track.previewUrl) {
      onTrackSelect(track.previewUrl, track.name);
    } else {
      setError('No preview available for this track');
    }
  };

  return (
    <div className={`glass-effect rounded-xl p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-6 glow-text">🎵 Streaming Services</h2>

      {!SpotifyIntegration.isConfigured() && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg text-sm">
          <p className="font-medium mb-1">⚠️ Configuration Required</p>
          <p className="text-gray-300">
            To use Spotify integration, you need to add your Spotify Client ID in the code.
            Visit the{' '}
            <a
              href="https://developer.spotify.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Spotify Developer Dashboard
            </a>{' '}
            to get your credentials.
          </p>
        </div>
      )}

      {!isAuthenticated ? (
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Connect your Spotify account to search and play music
          </p>
          <button
            onClick={handleLogin}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-all"
          >
            Connect Spotify
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for songs..."
                className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg focus:border-purple-500 outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all disabled:opacity-50"
              >
                {isSearching ? '...' : '🔍'}
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-all"
            >
              Logout
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="max-h-80 overflow-y-auto space-y-2">
            {searchResults.map((track) => (
              <div
                key={track.id}
                className="p-3 bg-dark-surface hover:bg-dark-border rounded-lg cursor-pointer transition-all flex items-center gap-3"
                onClick={() => handleTrackSelect(track)}
              >
                {track.imageUrl && (
                  <img
                    src={track.imageUrl}
                    alt={track.name}
                    className="w-12 h-12 rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{track.name}</div>
                  <div className="text-sm text-gray-400 truncate">
                    {track.artists.join(', ')}
                  </div>
                </div>
                {!track.previewUrl && (
                  <span className="text-xs text-gray-500">No preview</span>
                )}
              </div>
            ))}
            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="text-center text-gray-400 py-8">
                No results found
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-6 pt-6 border-t border-dark-border">
        <p className="text-xs text-gray-500 text-center">
          Note: Spotify provides 30-second previews for most tracks
        </p>
      </div>
    </div>
  );
};
