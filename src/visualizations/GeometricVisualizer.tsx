import { useEffect, useRef } from 'react';
import { AudioData, VisualizationSettings } from '../types';

interface Props {
  audioData: AudioData | null;
  settings: VisualizationSettings;
  width: number;
  height: number;
}

export const GeometricVisualizer: React.FC<Props> = ({ audioData, settings, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = width / 2;
    const centerY = height / 2;

    const animate = () => {
      // Clear with fade
      ctx.fillStyle = settings.colorPalette.backgroundColor + '40';
      ctx.fillRect(0, 0, width, height);

      if (audioData) {
        const { frequencyData, bassLevel, midLevel, trebleLevel } = audioData;

        // Update rotation based on bass
        rotationRef.current += (bassLevel / 255) * 0.05 * settings.speed;

        // Draw multiple geometric layers
        const layers = Math.floor(3 + settings.complexity * 3);

        for (let layer = 0; layer < layers; layer++) {
          const radius = 50 + layer * (Math.min(width, height) * 0.15);
          const sides = 3 + Math.floor(layer * settings.complexity);
          const colorIndex = layer % settings.colorPalette.colors.length;
          const color = settings.colorPalette.colors[colorIndex];

          // React to different frequency ranges
          let freqReaction = 1;
          if (layer < layers / 3) {
            freqReaction = 1 + (bassLevel / 255) * settings.sensitivity;
          } else if (layer < (layers * 2) / 3) {
            freqReaction = 1 + (midLevel / 255) * settings.sensitivity;
          } else {
            freqReaction = 1 + (trebleLevel / 255) * settings.sensitivity;
          }

          const adjustedRadius = radius * freqReaction;

          // Draw polygon
          ctx.strokeStyle = color;
          ctx.lineWidth = 2 + settings.complexity;
          ctx.globalAlpha = 0.7;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(rotationRef.current * (layer % 2 === 0 ? 1 : -1));

          ctx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * adjustedRadius;
            const y = Math.sin(angle) * adjustedRadius;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          // Add glow effect
          ctx.shadowBlur = 20 * settings.complexity;
          ctx.shadowColor = color;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Fill with transparency
          ctx.fillStyle = color + '10';
          ctx.fill();

          ctx.restore();
        }

        // Draw connecting lines between shapes
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + rotationRef.current;
          const freqValue = frequencyData[i * 10] / 255;
          const lineLength = 100 + freqValue * 200 * settings.sensitivity;

          ctx.strokeStyle = settings.colorPalette.colors[i % settings.colorPalette.colors.length];
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + Math.cos(angle) * lineLength,
            centerY + Math.sin(angle) * lineLength
          );
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
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
