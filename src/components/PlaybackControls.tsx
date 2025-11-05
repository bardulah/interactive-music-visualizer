import { PlaybackState } from '../types';

interface Props {
  playbackState: PlaybackState;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onFullscreen: () => void;
  onRecord: () => void;
  isRecording: boolean;
  fileName?: string;
  className?: string;
}

export const PlaybackControls: React.FC<Props> = ({
  playbackState,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onFullscreen,
  onRecord,
  isRecording,
  fileName,
  className = '',
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`glass-effect rounded-xl p-6 ${className}`}>
      {/* File Name */}
      {fileName && (
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold truncate">{fileName}</h3>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={playbackState.duration || 100}
          value={playbackState.currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span>{formatTime(playbackState.currentTime)}</span>
          <span>{formatTime(playbackState.duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center text-2xl transition-all"
        >
          {playbackState.isPlaying ? '⏸' : '▶'}
        </button>

        {/* Record */}
        <button
          onClick={onRecord}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
            isRecording
              ? 'bg-red-600 animate-pulse'
              : 'bg-dark-surface hover:bg-red-600'
          }`}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          ⏺
        </button>

        {/* Fullscreen */}
        <button
          onClick={onFullscreen}
          className="w-12 h-12 rounded-full bg-dark-surface hover:bg-dark-border flex items-center justify-center text-xl transition-all"
          title="Toggle Fullscreen"
        >
          ⛶
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <span className="text-xl">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={playbackState.volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm text-gray-400 w-12 text-right">
          {Math.round(playbackState.volume * 100)}%
        </span>
      </div>
    </div>
  );
};
