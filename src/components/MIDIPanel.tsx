import { useState, useEffect } from 'react';
import { MIDIController, MIDIDevice, MIDIMapping } from '../utils/midiController';

interface Props {
  midiController: MIDIController;
  onMIDIChange: (parameter: string, value: number) => void;
  className?: string;
}

export const MIDIPanel: React.FC<Props> = ({ midiController, onMIDIChange, className = '' }) => {
  const [isSupported] = useState(MIDIController.isSupported());
  const [isInitialized, setIsInitialized] = useState(false);
  const [devices, setDevices] = useState<MIDIDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<string>('');
  const [mappings, setMappings] = useState<MIDIMapping[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [learningParameter, setLearningParameter] = useState<string>('');

  const availableParameters = [
    { key: 'speed', label: 'Speed', min: 0.1, max: 3 },
    { key: 'complexity', label: 'Complexity', min: 0.1, max: 1 },
    { key: 'sensitivity', label: 'Sensitivity', min: 0.1, max: 2 },
    { key: 'smoothing', label: 'Smoothing', min: 0, max: 0.95 },
    { key: 'volume', label: 'Volume', min: 0, max: 1 },
  ];

  useEffect(() => {
    if (isSupported) {
      midiController.initialize().then((success) => {
        if (success) {
          setIsInitialized(true);
          setDevices(midiController.getAvailableDevices());
          midiController.loadMappings();
          setMappings(midiController.getMappings());
        }
      });
    }
  }, [midiController, isSupported]);

  useEffect(() => {
    // Set up listeners for all parameters
    const cleanup: (() => void)[] = [];

    availableParameters.forEach(param => {
      const callback = (value: number) => {
        onMIDIChange(param.key, value);
      };

      midiController.addListener(param.key, callback);
      cleanup.push(() => midiController.removeListener(param.key, callback));
    });

    return () => {
      cleanup.forEach(fn => fn());
    };
  }, [midiController, onMIDIChange]);

  const handleConnectDevice = (deviceId: string) => {
    if (midiController.connectDevice(deviceId)) {
      setConnectedDevice(deviceId);
    }
  };

  const handleDisconnect = () => {
    midiController.disconnect();
    setConnectedDevice('');
  };

  const handleLearnControl = async (parameter: string) => {
    setIsLearning(true);
    setLearningParameter(parameter);

    const controlNumber = await midiController.learnControl();

    if (controlNumber >= 0) {
      const param = availableParameters.find(p => p.key === parameter);
      if (param) {
        midiController.setMapping(controlNumber, parameter, param.min, param.max);
        midiController.saveMappings();
        setMappings(midiController.getMappings());
      }
    }

    setIsLearning(false);
    setLearningParameter('');
  };

  const handleRemoveMapping = (controlNumber: number) => {
    midiController.removeMapping(controlNumber);
    midiController.saveMappings();
    setMappings(midiController.getMappings());
  };

  const handleClearMappings = () => {
    if (confirm('Clear all MIDI mappings?')) {
      midiController.clearMappings();
      midiController.saveMappings();
      setMappings([]);
    }
  };

  if (!isSupported) {
    return (
      <div className={`glass-effect rounded-xl p-6 ${className}`}>
        <h2 className="text-xl font-bold mb-4 glow-text">🎹 MIDI Controller</h2>
        <div className="p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg text-sm">
          <p className="font-medium mb-2">⚠️ MIDI Not Supported</p>
          <p className="text-gray-300">
            Your browser doesn't support the Web MIDI API. Try using Chrome, Edge, or Opera.
          </p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className={`glass-effect rounded-xl p-6 ${className}`}>
        <h2 className="text-xl font-bold mb-4 glow-text">🎹 MIDI Controller</h2>
        <p className="text-gray-400">Initializing MIDI...</p>
      </div>
    );
  }

  return (
    <div className={`glass-effect rounded-xl p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-6 glow-text">🎹 MIDI Controller</h2>

      {/* Device Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">MIDI Device</label>
        {devices.length === 0 ? (
          <p className="text-sm text-gray-400">No MIDI devices found. Connect a device and refresh.</p>
        ) : (
          <div className="space-y-2">
            <select
              value={connectedDevice}
              onChange={(e) => handleConnectDevice(e.target.value)}
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg"
            >
              <option value="">Select a device...</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.manufacturer})
                </option>
              ))}
            </select>
            {connectedDevice && (
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-all"
              >
                Disconnect
              </button>
            )}
          </div>
        )}
      </div>

      {/* Control Mappings */}
      {connectedDevice && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Control Mappings</h3>
              {mappings.length > 0 && (
                <button
                  onClick={handleClearMappings}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-all"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableParameters.map((param) => {
                const mapping = mappings.find(m => m.parameter === param.key);

                return (
                  <div
                    key={param.key}
                    className="p-3 bg-dark-surface rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{param.label}</div>
                      {mapping && (
                        <div className="text-xs text-gray-400">CC {mapping.controlNumber}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {mapping ? (
                        <button
                          onClick={() => handleRemoveMapping(mapping.controlNumber)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-all"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLearnControl(param.key)}
                          disabled={isLearning}
                          className={`px-3 py-1 rounded text-xs transition-all ${
                            isLearning && learningParameter === param.key
                              ? 'bg-yellow-600 animate-pulse'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isLearning && learningParameter === param.key ? 'Waiting...' : 'Learn'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-blue-900/30 border border-blue-600 rounded-lg text-xs">
            <p className="font-medium mb-1">💡 How to use:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Click "Learn" next to a parameter</li>
              <li>Move a knob/fader on your MIDI controller</li>
              <li>The control will be mapped automatically</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
};
