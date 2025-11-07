import { useEffect, useRef, useState } from 'react';
import { AudioData, VisualizationSettings } from '../types';
import {
  WaveformVisualizer,
  ParticleVisualizer,
  GeometricVisualizer,
  OrganicVisualizer,
  BarsVisualizer,
  SpiralVisualizer,
  ThreeDVisualizer,
} from '../visualizations';

interface Props {
  audioData: AudioData | null;
  settings: VisualizationSettings;
  className?: string;
}

export const Visualizer: React.FC<Props> = ({ audioData, settings, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const renderVisualizer = () => {
    const props = {
      audioData,
      settings,
      width: dimensions.width,
      height: dimensions.height,
    };

    switch (settings.type) {
      case 'waveform':
        return <WaveformVisualizer {...props} />;
      case 'particles':
        return <ParticleVisualizer {...props} />;
      case 'geometric':
        return <GeometricVisualizer {...props} />;
      case 'organic':
        return <OrganicVisualizer {...props} />;
      case 'bars':
        return <BarsVisualizer {...props} />;
      case 'spiral':
        return <SpiralVisualizer {...props} />;
      case '3d':
        return <ThreeDVisualizer {...props} />;
      default:
        return <WaveformVisualizer {...props} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ backgroundColor: settings.colorPalette.backgroundColor }}
    >
      {renderVisualizer()}
    </div>
  );
};
