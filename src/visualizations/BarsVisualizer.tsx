import { useEffect, useRef } from 'react';
import { AudioData, VisualizationSettings } from '../types';

interface Props {
  audioData: AudioData | null;
  settings: VisualizationSettings;
  width: number;
  height: number;
}

export const BarsVisualizer: React.FC<Props> = ({ audioData, settings, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = settings.colorPalette.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const { frequencyData } = audioData;
    const barCount = Math.floor(64 * settings.complexity);
    const barWidth = width / barCount;
    const dataStep = Math.floor(frequencyData.length / barCount);

    // Draw bars
    for (let i = 0; i < barCount; i++) {
      const dataIndex = i * dataStep;
      const value = frequencyData[dataIndex];
      const barHeight = (value / 255) * height * settings.sensitivity;

      const x = i * barWidth;
      const y = height - barHeight;

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(x, height, x, y);
      const colorIndex = Math.floor((i / barCount) * settings.colorPalette.colors.length);
      const color = settings.colorPalette.colors[colorIndex];
      const nextColor = settings.colorPalette.colors[(colorIndex + 1) % settings.colorPalette.colors.length];

      gradient.addColorStop(0, color);
      gradient.addColorStop(1, nextColor);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 2, barHeight);

      // Add glow effect on top
      if (value > 100) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.fillRect(x, y, barWidth - 2, 5);
        ctx.shadowBlur = 0;
      }
    }

    // Draw reflection
    ctx.globalAlpha = 0.2;
    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(0, -height);

    for (let i = 0; i < barCount; i++) {
      const dataIndex = i * dataStep;
      const value = frequencyData[dataIndex];
      const barHeight = (value / 255) * height * settings.sensitivity * 0.5;

      const x = i * barWidth;
      const y = height - barHeight;

      const gradient = ctx.createLinearGradient(x, height, x, y);
      const colorIndex = Math.floor((i / barCount) * settings.colorPalette.colors.length);
      const color = settings.colorPalette.colors[colorIndex];

      gradient.addColorStop(0, color + '00');
      gradient.addColorStop(1, color);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 2, barHeight);
    }

    ctx.restore();
    ctx.globalAlpha = 1;

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
