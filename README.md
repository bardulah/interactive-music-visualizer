# 🎵 Interactive Music Visualizer

A stunning real-time audio visualization tool that transforms your music into mesmerizing visual art. Built with React, TypeScript, and the Web Audio API.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### Core Functionality
- **Real-time Audio Processing**: Advanced FFT-based frequency analysis using Web Audio API
- **File Upload & Playback**: Drag-and-drop support for MP3, WAV, OGG, M4A, and more
- **Full Playback Controls**: Play, pause, seek, and volume control
- **Fullscreen Mode**: Immersive visualization experience with auto-hiding controls

### Visualization Styles
Choose from 6 unique visualization modes:
- **Waveform**: Classic oscilloscope-style waveform with mirrored effects
- **Particles**: Dynamic particle system that responds to bass and frequency
- **Geometric**: Rotating polygons that react to different frequency ranges
- **Organic**: Fluid, blob-like shapes with Perlin-noise-inspired movement
- **Bars**: Frequency spectrum bars with gradient colors and reflections
- **Spiral**: Hypnotic spiral patterns with frequency-reactive points

### Customization
- **10 Color Palettes**: Carefully curated color schemes (Neon Dreams, Ocean Deep, Cyber Pink, etc.)
- **Interactive Controls**:
  - Speed: 0.1x - 3x animation speed
  - Complexity: 10% - 100% detail level
  - Sensitivity: 10% - 200% audio reactivity
  - Smoothing: 0% - 95% frequency smoothing

### Presets & Recording
- **Save Custom Presets**: Store your favorite visualization configurations
- **3 Default Presets**: Ready-to-use starting points
- **Video Recording**: Export visualizations as WebM video files
- **LocalStorage Persistence**: Your presets are saved between sessions

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/interactive-music-visualizer.git

# Navigate to the project
cd interactive-music-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

## 🎮 Usage Guide

### Getting Started
1. **Upload Music**: Drag and drop an audio file or click to browse
2. **Choose a Style**: Select from 6 visualization modes
3. **Pick Colors**: Choose from 10 beautiful color palettes
4. **Fine-tune**: Adjust speed, complexity, sensitivity, and smoothing
5. **Save Preset**: Store your configuration for later use

### Keyboard Shortcuts
- **Space**: Play/Pause
- **F**: Toggle fullscreen
- **Escape**: Exit fullscreen

### Recording Videos
1. Click the record button (⏺) to start recording
2. The button will pulse red while recording
3. Click again to stop and download the video
4. Videos are saved as WebM format

### Presets
- **Load Preset**: Click any preset to apply its settings
- **Save Preset**: Customize your settings and click "Save as Preset"
- **Delete Preset**: Click the delete button on custom presets

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # React UI components
│   ├── AudioUpload.tsx     # File upload component
│   ├── ControlPanel.tsx    # Settings control panel
│   ├── PlaybackControls.tsx # Music playback UI
│   ├── PresetSelector.tsx  # Preset management
│   └── Visualizer.tsx      # Main visualizer container
├── hooks/               # Custom React hooks
│   ├── useAudioVisualizer.ts # Audio processing hook
│   └── useRecording.ts      # Video recording hook
├── utils/               # Utility functions
│   ├── audioProcessor.ts    # Web Audio API wrapper
│   ├── colorPalettes.ts     # Color scheme definitions
│   └── presetManager.ts     # LocalStorage management
├── visualizations/      # Visualization renderers
│   ├── WaveformVisualizer.tsx
│   ├── ParticleVisualizer.tsx
│   ├── GeometricVisualizer.tsx
│   ├── OrganicVisualizer.tsx
│   ├── BarsVisualizer.tsx
│   └── SpiralVisualizer.tsx
├── types/               # TypeScript type definitions
└── App.tsx             # Main application component
```

### Key Technologies
- **React 18**: UI framework with hooks and functional components
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Web Audio API**: Real-time audio analysis
- **Canvas API**: High-performance 2D rendering
- **MediaRecorder API**: Video capture and export

### Audio Processing Pipeline
1. **File Upload** → AudioContext creation
2. **Source Creation** → MediaElementAudioSource
3. **Analysis** → AnalyserNode with FFT
4. **Data Extraction** → Frequency & time domain data
5. **Band Separation** → Bass, mid, and treble levels
6. **Visualization** → Canvas rendering at 60 FPS

## 🎨 Color Palettes

| Name | Theme | Colors |
|------|-------|--------|
| Neon Dreams | Vibrant & Electric | Pink, Orange, Yellow, Purple, Blue |
| Ocean Deep | Cool & Calm | Deep blues and cyans |
| Sunset Fire | Warm & Pastel | Reds, oranges, yellows |
| Purple Haze | Mystical | Purple and magenta spectrum |
| Forest Mystique | Natural | Greens and earth tones |
| Cyber Pink | Futuristic | Hot pinks and magentas |
| Electric Blue | Tech | Blue spectrum |
| Golden Hour | Warm | Oranges and golds |
| Nebula | Cosmic | Purples and pinks |
| Midnight Aurora | Dark & Vivid | Neon on black |

## 🔧 Configuration

### Visualization Settings

```typescript
interface VisualizationSettings {
  type: 'waveform' | 'particles' | 'geometric' | 'organic' | 'bars' | 'spiral';
  colorPalette: ColorPalette;
  speed: number;        // 0.1 - 3.0
  complexity: number;   // 0.1 - 1.0
  sensitivity: number;  // 0.1 - 2.0
  smoothing: number;    // 0.0 - 0.95
}
```

### Audio Settings
- **FFT Size**: 2048 (adjustable in audioProcessor.ts)
- **Smoothing**: 0.8 default (configurable via UI)
- **Frequency Bands**:
  - Bass: 0-10% of frequency range
  - Mid: 10-50% of frequency range
  - Treble: 50-100% of frequency range

## 🌐 Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 14.5+)
- Opera: ✅ Full support

**Note**: Recording feature requires MediaRecorder API support.

## 📱 Mobile Support

The app is fully responsive and works on mobile devices:
- Touch-friendly controls
- Portrait and landscape modes
- Optimized performance for mobile GPUs

## 🚧 Future Enhancements

- [ ] WebGL/Three.js 3D visualizations
- [ ] Audio effects (reverb, echo, filters)
- [ ] Social sharing features
- [ ] Spotify/SoundCloud integration
- [ ] Custom shader support
- [ ] MIDI controller support
- [ ] Real-time collaboration
- [ ] VR mode with WebXR

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Web Audio API documentation and community
- Canvas API tutorials and examples
- Color palette inspiration from various design resources
- React and TypeScript communities

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: your-email@example.com

---

Made with ❤️ and 🎵 by [Your Name]
