import { useState } from 'react';
import { CustomShader, ShaderManager } from '../utils/shaderManager';

interface Props {
  onShaderSelect: (shader: CustomShader) => void;
  className?: string;
}

export const ShaderEditor: React.FC<Props> = ({ onShaderSelect, className = '' }) => {
  const [shaders, setShaders] = useState<CustomShader[]>(ShaderManager.getAllShaders());
  const [selectedShader, setSelectedShader] = useState<CustomShader | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingShader, setEditingShader] = useState<CustomShader | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  const handleSelectShader = (shader: CustomShader) => {
    setSelectedShader(shader);
    onShaderSelect(shader);
  };

  const handleNewShader = () => {
    const newShader = ShaderManager.createTemplate();
    setEditingShader(newShader);
    setIsEditing(true);
    setValidationError('');
  };

  const handleEditShader = (shader: CustomShader) => {
    setEditingShader({ ...shader });
    setIsEditing(true);
    setValidationError('');
  };

  const handleSaveShader = () => {
    if (!editingShader) return;

    const validation = ShaderManager.validateShader(
      editingShader.vertexShader,
      editingShader.fragmentShader
    );

    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid shader');
      return;
    }

    ShaderManager.saveShader(editingShader);
    setShaders(ShaderManager.getAllShaders());
    setIsEditing(false);
    setEditingShader(null);
    setValidationError('');
  };

  const handleDeleteShader = (id: string) => {
    if (id.startsWith('default-')) {
      alert('Cannot delete default shaders');
      return;
    }

    if (confirm('Are you sure you want to delete this shader?')) {
      ShaderManager.deleteShader(id);
      setShaders(ShaderManager.getAllShaders());
    }
  };

  return (
    <div className={`glass-effect rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold glow-text">Custom Shaders</h2>
        <button
          onClick={handleNewShader}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all text-sm"
        >
          + New Shader
        </button>
      </div>

      {!isEditing ? (
        <>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {shaders.map((shader) => (
              <div
                key={shader.id}
                className={`p-3 rounded-lg transition-all cursor-pointer ${
                  selectedShader?.id === shader.id
                    ? 'bg-purple-600'
                    : 'bg-dark-surface hover:bg-dark-border'
                }`}
              >
                <div onClick={() => handleSelectShader(shader)} className="flex-1">
                  <div className="font-medium">{shader.name}</div>
                  {shader.id.startsWith('default-') && (
                    <span className="text-xs text-gray-400">Built-in</span>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  {!shader.id.startsWith('default-') && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditShader(shader);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteShader(shader.id);
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-all"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-dark-border text-sm text-gray-400">
            <p className="mb-2">
              <strong>Available Uniforms:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>u_time - Animation time</li>
              <li>u_bass, u_mid, u_treble - Frequency bands (0-1)</li>
              <li>u_color1, u_color2 - Theme colors</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Shader Name</label>
            <input
              type="text"
              value={editingShader?.name || ''}
              onChange={(e) =>
                setEditingShader(prev => prev ? { ...prev, name: e.target.value } : null)
              }
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Vertex Shader</label>
            <textarea
              value={editingShader?.vertexShader || ''}
              onChange={(e) =>
                setEditingShader(prev => prev ? { ...prev, vertexShader: e.target.value } : null)
              }
              className="w-full h-40 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg focus:border-purple-500 outline-none font-mono text-sm"
              spellCheck={false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fragment Shader</label>
            <textarea
              value={editingShader?.fragmentShader || ''}
              onChange={(e) =>
                setEditingShader(prev => prev ? { ...prev, fragmentShader: e.target.value } : null)
              }
              className="w-full h-60 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg focus:border-purple-500 outline-none font-mono text-sm"
              spellCheck={false}
            />
          </div>

          {validationError && (
            <div className="p-3 bg-red-900/30 border border-red-600 rounded-lg text-sm">
              {validationError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveShader}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all"
            >
              Save Shader
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingShader(null);
                setValidationError('');
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
