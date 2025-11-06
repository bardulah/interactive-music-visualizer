import { useState, useEffect, useRef } from 'react';
import { VisualizationSettings, Preset } from './types';
import { AudioUpload } from './components/AudioUpload';
import { Visualizer } from './components/Visualizer';
import { ControlPanel } from './components/ControlPanel';
import { PlaybackControls } from './components/PlaybackControls';
import { PresetSelector } from './components/PresetSelector';
import { AudioEffectsPanel } from './components/AudioEffectsPanel';
import { SharingPanel } from './components/SharingPanel';
import { StreamingPanel } from './components/StreamingPanel';
import { ShaderEditor } from './components/ShaderEditor';
import { MIDIPanel } from './components/MIDIPanel';
import { useAudioVisualizer } from './hooks/useAudioVisualizer';
import { PresetManager } from './utils/presetManager';
import { colorPalettes, suggestPaletteFromAudio } from './utils/colorPalettes';
import { AudioEffects } from './utils/audioEffects';
import { SharingManager } from './utils/sharing';
import { CustomShader } from './utils/shaderManager';
import { MIDIController } from './utils/midiController';

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

  // Audio Effects
  const [audioEffects, setAudioEffects] = useState<AudioEffects>({
    reverbEnabled: false,
    reverbAmount: 0.3,
    echoEnabled: false,
    echoDelay: 0.5,
    echoFeedback: 0.4,
    filterEnabled: false,
    filterType: 'lowpass',
    filterFrequency: 1000,
    filterQ: 1.0,
    distortionEnabled: false,
    distortionAmount: 0.3,
  });

  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>();
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Feature panels visibility
  const [activePanel, setActivePanel] = useState<'controls' | 'effects' | 'sharing' | 'streaming' | 'shader' | 'midi'>('controls');

  // Custom shader (for future use)
  const [, setCustomShader] = useState<CustomShader | null>(null);

  // MIDI Controller
  const [midiController] = useState(() => new MIDIController());

  const visualizerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load presets and settings from URL on mount
  useEffect(() => {
    const defaultPresets = PresetManager.getDefaultPresets();
    const savedPresets = PresetManager.getAllPresets();
    setPresets([...defaultPresets, ...savedPresets]);

    // Load settings from URL if present
    const urlSettings = SharingManager.loadFromURL();
    if (urlSettings) {
      setSettings(urlSettings);
    }
  }, []);

  // Update smoothing when settings change
  useEffect(() => {
    setSmoothingTimeConstant(settings.smoothing);
  }, [settings.smoothing, setSmoothingTimeConstant]);

  // Auto-suggest color palette based on audio
  useEffect(() => {
    if (audioData && fileName) {
      const suggestedPalette = suggestPaletteFromAudio(audioData.avgFrequency, audioData.bassLevel);
      // Only auto-switch if user hasn't manually selected
      if (settings.colorPalette === colorPalettes[0]) {
        setSettings(prev => ({ ...prev, colorPalette: suggestedPalette }));
      }
    }
  }, [audioData, fileName, settings.colorPalette]);

  const handleFileSelect = async (file: File) => {
    await loadAudio(file);
  };

  const handleStreamingTrackSelect = async (previewUrl: string, trackName: string) => {
    // Create a blob from the preview URL
    const response = await fetch(previewUrl);
    const blob = await response.blob();
    const file = new File([blob], trackName, { type: 'audio/mpeg' });
    await loadAudio(file);
  };

  const handleSettingsChange = (newSettings: VisualizationSettings) => {
    setSettings(newSettings);
  };

  const handleMIDIChange = (parameter: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [parameter]: value,
    }));

    // Also update volume if it's the volume parameter
    if (parameter === 'volume') {
      setVolume(value);
    }
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

  const handleImportPreset = (preset: Preset) => {
    setSettings(preset.settings);
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
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    if (!isRecording) {
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

  const renderSidePanel = () => {
    switch (activePanel) {
      case 'controls':
        return (
          <>
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
          </>
        );
      case 'effects':
        return (
          <AudioEffectsPanel
            effects={audioEffects}
            onEffectsChange={setAudioEffects}
          />
        );
      case 'sharing':
        return (
          <SharingPanel
            settings={settings}
            currentPreset={presets.find(p => p.id === selectedPresetId)}
            onImportPreset={handleImportPreset}
          />
        );
      case 'streaming':
        return (
          <StreamingPanel
            onTrackSelect={handleStreamingTrackSelect}
          />
        );
      case 'shader':
        return (
          <ShaderEditor
            onShaderSelect={setCustomShader}
          />
        );
      case 'midi':
        return (
          <MIDIPanel
            midiController={midiController}
            onMIDIChange={handleMIDIChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-dark-bg">
      {!fileName ? (
        // Landing page with upload
        <div className="flex items-center justify-center h-full p-8">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold mb-4 glow-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Music Visualizer Pro
              </h1>
              <p className="text-xl text-gray-400 mb-2">
                Transform your music into mesmerizing visual art
              </p>
              <p className="text-sm text-gray-500">
                Now with 3D, Audio Effects, Shaders, MIDI & Streaming
              </p>
            </div>
            <AudioUpload onFileSelect={handleFileSelect} />

            {/* Features Grid */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Features
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '🎨', name: '8 Viz Styles', desc: '2D & 3D' },
                  { icon: '🎛️', name: 'Audio FX', desc: 'Reverb, Echo, Filters' },
                  { icon: '🎹', name: 'MIDI Control', desc: 'Hardware Support' },
                  { icon: '✨', name: 'Custom Shaders', desc: 'GLSL Support' },
                  { icon: '🎵', name: 'Spotify', desc: 'Stream Music' },
                  { icon: '📤', name: 'Share', desc: 'Export & Social' },
                  { icon: '💾', name: 'Presets', desc: 'Save Configs' },
                  { icon: '📹', name: 'Record', desc: 'Video Export' },
                ].map((feature) => (
                  <div
                    key={feature.name}
                    className="glass-effect rounded-lg p-4 text-center hover:bg-dark-surface transition-all"
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-xs text-gray-400">{feature.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Main visualizer interface
        <div className="flex h-full">
          {/* Sidebar with controls */}
          {showControls && (
            <div className="w-80 p-4 overflow-y-auto bg-dark-bg border-r border-dark-border flex flex-col">
              {/* Panel Tabs */}
              <div className="grid grid-cols-3 gap-1 mb-4">
                {[
                  { key: 'controls', icon: '🎛️', label: 'Controls' },
                  { key: 'effects', icon: '🎚️', label: 'Effects' },
                  { key: 'sharing', icon: '📤', label: 'Share' },
                  { key: 'streaming', icon: '🎵', label: 'Stream' },
                  { key: 'shader', icon: '✨', label: 'Shaders' },
                  { key: 'midi', icon: '🎹', label: 'MIDI' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActivePanel(tab.key as any)}
                    className={`px-2 py-2 rounded-lg text-xs transition-all ${
                      activePanel === tab.key
                        ? 'bg-purple-600 text-white'
                        : 'bg-dark-surface hover:bg-dark-border'
                    }`}
                  >
                    <div>{tab.icon}</div>
                    <div className="mt-1">{tab.label}</div>
                  </button>
                ))}
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {renderSidePanel()}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-4 border-t border-dark-border">
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
