import { useEffect, useRef } from 'react';
import { AudioData, VisualizationSettings } from '../types';

interface Props {
  audioData: AudioData | null;
  settings: VisualizationSettings;
  width: number;
  height: number;
}

export const WaveformVisualizer: React.FC<Props> = ({ audioData, settings, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = settings.colorPalette.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    const { timeData } = audioData;
    const sliceWidth = width / timeData.length;
    const centerY = height / 2;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    settings.colorPalette.colors.forEach((color, i) => {
      gradient.addColorStop(i / (settings.colorPalette.colors.length - 1), color);
    });

    // Draw main waveform
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3 * settings.complexity;
    ctx.beginPath();

    timeData.forEach((value, i) => {
      const x = i * sliceWidth;
      const amplitude = ((value - 128) / 128) * centerY * settings.sensitivity;
      const y = centerY + amplitude;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw mirrored waveform for effect
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    timeData.forEach((value, i) => {
      const x = i * sliceWidth;
      const amplitude = ((value - 128) / 128) * centerY * settings.sensitivity;
      const y = centerY - amplitude;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Add glow effect
    ctx.shadowBlur = 20 * settings.complexity;
    ctx.shadowColor = settings.colorPalette.colors[0];
    ctx.stroke();
    ctx.shadowBlur = 0;

  }, [audioData, settings, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
};
