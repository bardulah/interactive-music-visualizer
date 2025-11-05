import { VisualizationSettings, VisualizationType } from '../types';
import { colorPalettes } from '../utils/colorPalettes';

interface Props {
  settings: VisualizationSettings;
  onSettingsChange: (settings: VisualizationSettings) => void;
  onSavePreset: () => void;
  className?: string;
}

export const ControlPanel: React.FC<Props> = ({ settings, onSettingsChange, onSavePreset, className = '' }) => {
  const visualizationTypes: { value: VisualizationType; label: string }[] = [
    { value: 'waveform', label: 'Waveform' },
    { value: 'particles', label: 'Particles' },
    { value: 'geometric', label: 'Geometric' },
    { value: 'organic', label: 'Organic' },
    { value: 'bars', label: 'Bars' },
    { value: 'spiral', label: 'Spiral' },
    { value: '3d', label: '3D Scene' },
  ];

  return (
    <div className={`glass-effect rounded-xl p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-6 glow-text">Controls</h2>

      {/* Visualization Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Visualization Style</label>
        <div className="grid grid-cols-2 gap-2">
          {visualizationTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onSettingsChange({ ...settings, type: type.value })}
              className={`px-4 py-2 rounded-lg transition-all ${
                settings.type === type.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-dark-surface hover:bg-dark-border'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Color Palette</label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {colorPalettes.map((palette) => (
            <button
              key={palette.name}
              onClick={() => onSettingsChange({ ...settings, colorPalette: palette })}
              className={`p-3 rounded-lg transition-all ${
                settings.colorPalette.name === palette.name
                  ? 'ring-2 ring-purple-500'
                  : 'hover:ring-1 ring-gray-600'
              }`}
              style={{ backgroundColor: palette.backgroundColor }}
            >
              <div className="flex gap-1 mb-2">
                {palette.colors.slice(0, 5).map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="text-xs">{palette.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Speed Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Speed: {settings.speed.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={settings.speed}
          onChange={(e) => onSettingsChange({ ...settings, speed: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Complexity Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Complexity: {(settings.complexity * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={settings.complexity}
          onChange={(e) => onSettingsChange({ ...settings, complexity: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Sensitivity Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Sensitivity: {(settings.sensitivity * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={settings.sensitivity}
          onChange={(e) => onSettingsChange({ ...settings, sensitivity: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Smoothing Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Smoothing: {(settings.smoothing * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="0.95"
          step="0.05"
          value={settings.smoothing}
          onChange={(e) => onSettingsChange({ ...settings, smoothing: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Save Preset Button */}
      <button
        onClick={onSavePreset}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all"
      >
        Save as Preset
      </button>
    </div>
  );
};
