import { AudioEffects } from '../utils/audioEffects';

interface Props {
  effects: AudioEffects;
  onEffectsChange: (effects: AudioEffects) => void;
  className?: string;
}

export const AudioEffectsPanel: React.FC<Props> = ({ effects, onEffectsChange, className = '' }) => {
  const filterTypes: BiquadFilterType[] = ['lowpass', 'highpass', 'bandpass', 'notch'];

  return (
    <div className={`glass-effect rounded-xl p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-6 glow-text">Audio Effects</h2>

      {/* Reverb */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Reverb</label>
          <input
            type="checkbox"
            checked={effects.reverbEnabled}
            onChange={(e) => onEffectsChange({ ...effects, reverbEnabled: e.target.checked })}
            className="w-4 h-4"
          />
        </div>
        {effects.reverbEnabled && (
          <>
            <label className="block text-xs text-gray-400 mb-1">
              Amount: {(effects.reverbAmount * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={effects.reverbAmount}
              onChange={(e) => onEffectsChange({ ...effects, reverbAmount: parseFloat(e.target.value) })}
              className="w-full"
            />
          </>
        )}
      </div>

      {/* Echo/Delay */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Echo</label>
          <input
            type="checkbox"
            checked={effects.echoEnabled}
            onChange={(e) => onEffectsChange({ ...effects, echoEnabled: e.target.checked })}
            className="w-4 h-4"
          />
        </div>
        {effects.echoEnabled && (
          <>
            <label className="block text-xs text-gray-400 mb-1">
              Delay: {effects.echoDelay.toFixed(2)}s
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={effects.echoDelay}
              onChange={(e) => onEffectsChange({ ...effects, echoDelay: parseFloat(e.target.value) })}
              className="w-full mb-2"
            />
            <label className="block text-xs text-gray-400 mb-1">
              Feedback: {(effects.echoFeedback * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.1"
              value={effects.echoFeedback}
              onChange={(e) => onEffectsChange({ ...effects, echoFeedback: parseFloat(e.target.value) })}
              className="w-full"
            />
          </>
        )}
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Filter</label>
          <input
            type="checkbox"
            checked={effects.filterEnabled}
            onChange={(e) => onEffectsChange({ ...effects, filterEnabled: e.target.checked })}
            className="w-4 h-4"
          />
        </div>
        {effects.filterEnabled && (
          <>
            <label className="block text-xs text-gray-400 mb-1">Type</label>
            <select
              value={effects.filterType}
              onChange={(e) => onEffectsChange({ ...effects, filterType: e.target.value as BiquadFilterType })}
              className="w-full mb-2 px-2 py-1 rounded bg-dark-surface border border-dark-border"
            >
              {filterTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <label className="block text-xs text-gray-400 mb-1">
              Frequency: {effects.filterFrequency.toFixed(0)}Hz
            </label>
            <input
              type="range"
              min="20"
              max="20000"
              step="10"
              value={effects.filterFrequency}
              onChange={(e) => onEffectsChange({ ...effects, filterFrequency: parseFloat(e.target.value) })}
              className="w-full mb-2"
            />
            <label className="block text-xs text-gray-400 mb-1">
              Q: {effects.filterQ.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={effects.filterQ}
              onChange={(e) => onEffectsChange({ ...effects, filterQ: parseFloat(e.target.value) })}
              className="w-full"
            />
          </>
        )}
      </div>

      {/* Distortion */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Distortion</label>
          <input
            type="checkbox"
            checked={effects.distortionEnabled}
            onChange={(e) => onEffectsChange({ ...effects, distortionEnabled: e.target.checked })}
            className="w-4 h-4"
          />
        </div>
        {effects.distortionEnabled && (
          <>
            <label className="block text-xs text-gray-400 mb-1">
              Amount: {(effects.distortionAmount * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={effects.distortionAmount}
              onChange={(e) => onEffectsChange({ ...effects, distortionAmount: parseFloat(e.target.value) })}
              className="w-full"
            />
          </>
        )}
      </div>
    </div>
  );
};
