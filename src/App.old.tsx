import { useState, useEffect, useRef } from 'react';
import { VisualizationSettings, Preset } from './types';
import { AudioUpload } from './components/AudioUpload';
import { Visualizer } from './components/Visualizer';
import { ControlPanel } from './components/ControlPanel';
import { PlaybackControls } from './components/PlaybackControls';
import { PresetSelector } from './components/PresetSelector';
import { useAudioVisualizer } from './hooks/useAudioVisualizer';
import { PresetManager } from './utils/presetManager';
import { colorPalettes } from './utils/colorPalettes';

function App() {
  const {
    audioData,
    playbackState,
    fileName,
    loadAudio,
    togglePlayPause,
    seek,
    setVolume,
    setSmoothingTimeConstant,
  } = useAudioVisualizer();

  const [settings, setSettings] = useState<VisualizationSettings>({
    type: 'particles',
    colorPalette: colorPalettes[0],
    speed: 1.0,
    complexity: 0.7,
    sensitivity: 1.0,
    smoothing: 0.8,
  });

  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>();
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const visualizerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load presets on mount
  useEffect(() => {
    const defaultPresets = PresetManager.getDefaultPresets();
    const savedPresets = PresetManager.getAllPresets();
    setPresets([...defaultPresets, ...savedPresets]);
  }, []);

  // Update smoothing when settings change
  useEffect(() => {
    setSmoothingTimeConstant(settings.smoothing);
  }, [settings.smoothing, setSmoothingTimeConstant]);

  const handleFileSelect = async (file: File) => {
    await loadAudio(file);
  };

  const handleSettingsChange = (newSettings: VisualizationSettings) => {
    setSettings(newSettings);
  };

  const handleSavePreset = () => {
    const name = prompt('Enter preset name:');
    if (name) {
      const preset = PresetManager.savePreset(name, settings);
      setPresets([...presets, preset]);
    }
  };

  const handleSelectPreset = (preset: Preset) => {
    setSettings(preset.settings);
    setSelectedPresetId(preset.id);
  };

  const handleDeletePreset = (id: string) => {
    PresetManager.deletePreset(id);
    setPresets(presets.filter((p) => p.id !== id));
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowControls(false);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      setShowControls(true);
    }
  };

  const handleRecord = () => {
    // Find canvas element
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    if (!isRecording) {
      // Simple canvas recording using MediaRecorder
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visualization-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      canvasRef.current = canvas;
      (window as any).mediaRecorder = mediaRecorder;
      setIsRecording(true);
    } else {
      const mediaRecorder = (window as any).mediaRecorder;
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setShowControls(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle controls visibility in fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      const handleMouseMove = () => {
        setShowControls(true);
        // Hide controls after 3 seconds of inactivity
        setTimeout(() => {
          if (isFullscreen) {
            setShowControls(false);
          }
        }, 3000);
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isFullscreen]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-dark-bg">
      {!fileName ? (
        // Landing page with upload
        <div className="flex items-center justify-center h-full p-8">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold mb-4 glow-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Music Visualizer
              </h1>
              <p className="text-xl text-gray-400">
                Transform your music into mesmerizing visual art
              </p>
            </div>
            <AudioUpload onFileSelect={handleFileSelect} />

            {/* Default Presets Preview */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Visualization Styles
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Waveform', 'Particles', 'Geometric', 'Organic', 'Bars', 'Spiral'].map(
                  (style) => (
                    <div
                      key={style}
                      className="glass-effect rounded-lg p-4 text-center hover:bg-dark-surface transition-all"
                    >
                      <div className="text-3xl mb-2">
                        {style === 'Waveform' && '〰️'}
                        {style === 'Particles' && '✨'}
                        {style === 'Geometric' && '⬡'}
                        {style === 'Organic' && '🌊'}
                        {style === 'Bars' && '📊'}
                        {style === 'Spiral' && '🌀'}
                      </div>
                      <div className="font-medium">{style}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Main visualizer interface
        <div className="flex h-full">
          {/* Sidebar with controls */}
          {showControls && (
            <div className="w-80 p-4 overflow-y-auto bg-dark-bg border-r border-dark-border">
              <div className="space-y-4">
                <PresetSelector
                  presets={presets}
                  selectedPresetId={selectedPresetId}
                  onSelectPreset={handleSelectPreset}
                  onDeletePreset={handleDeletePreset}
                />

                <ControlPanel
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                  onSavePreset={handleSavePreset}
                />

                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="w-full px-4 py-2 bg-dark-surface hover:bg-dark-border rounded-lg transition-all"
                >
                  Load New Song
                </button>
              </div>
            </div>
          )}

          {/* Main visualizer area */}
          <div className="flex-1 flex flex-col">
            <div ref={visualizerRef} className="flex-1">
              <Visualizer
                audioData={audioData}
                settings={settings}
                className="w-full h-full"
              />
            </div>

            {/* Bottom controls */}
            {showControls && (
              <div className="p-4 bg-dark-bg border-t border-dark-border">
                <PlaybackControls
                  playbackState={playbackState}
                  onPlayPause={togglePlayPause}
                  onSeek={seek}
                  onVolumeChange={setVolume}
                  onFullscreen={handleFullscreen}
                  onRecord={handleRecord}
                  isRecording={isRecording}
                  fileName={fileName}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
