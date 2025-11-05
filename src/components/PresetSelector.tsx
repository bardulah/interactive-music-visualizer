import { Preset } from '../types';

interface Props {
  presets: Preset[];
  selectedPresetId?: string;
  onSelectPreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
  className?: string;
}

export const PresetSelector: React.FC<Props> = ({
  presets,
  selectedPresetId,
  onSelectPreset,
  onDeletePreset,
  className = '',
}) => {
  if (presets.length === 0) {
    return null;
  }

  return (
    <div className={`glass-effect rounded-xl p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-4 glow-text">Presets</h2>
      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className={`p-3 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
              selectedPresetId === preset.id
                ? 'bg-purple-600'
                : 'bg-dark-surface hover:bg-dark-border'
            }`}
          >
            <div onClick={() => onSelectPreset(preset)} className="flex-1">
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs text-gray-400 mt-1">
                {preset.settings.type} • {preset.settings.colorPalette.name}
              </div>
            </div>
            {!preset.id.startsWith('default-') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePreset(preset.id);
                }}
                className="ml-2 px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
