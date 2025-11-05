import { useEffect, useRef } from 'react';
import { AudioData, VisualizationSettings } from '../types';

interface Props {
  audioData: AudioData | null;
  settings: VisualizationSettings;
  width: number;
  height: number;
}

export const SpiralVisualizer: React.FC<Props> = ({ audioData, settings, width, height }) => {
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
      ctx.fillStyle = settings.colorPalette.backgroundColor + '20';
      ctx.fillRect(0, 0, width, height);

      if (audioData) {
        const { frequencyData, avgFrequency } = audioData;

        rotationRef.current += 0.01 * settings.speed;

        // Draw multiple spirals
        const spiralCount = Math.floor(2 + settings.complexity * 2);

        for (let spiral = 0; spiral < spiralCount; spiral++) {
          const points = 200;
          const maxRadius = Math.min(width, height) * 0.4;
          const spiralOffset = (spiral / spiralCount) * Math.PI * 2;

          ctx.strokeStyle = settings.colorPalette.colors[spiral % settings.colorPalette.colors.length];
          ctx.lineWidth = 2 + settings.complexity;
          ctx.globalAlpha = 0.7;

          ctx.beginPath();

          for (let i = 0; i < points; i++) {
            const progress = i / points;
            const angle = progress * Math.PI * 4 + rotationRef.current + spiralOffset;
            const freqIndex = Math.floor(progress * frequencyData.length * 0.5);
            const freqValue = frequencyData[freqIndex] / 255;
            const radius = progress * maxRadius * (1 + freqValue * settings.sensitivity * 0.5);

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }

            // Draw point at high frequencies
            if (freqValue > 0.7) {
              ctx.save();
              ctx.fillStyle = settings.colorPalette.colors[spiral % settings.colorPalette.colors.length];
              ctx.beginPath();
              ctx.arc(x, y, 2 + freqValue * 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }

          // Add glow
          ctx.shadowBlur = 15 * settings.complexity;
          ctx.shadowColor = settings.colorPalette.colors[spiral % settings.colorPalette.colors.length];
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw center pulse
        const pulseSize = 20 + (avgFrequency / 255) * 40 * settings.sensitivity;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
        gradient.addColorStop(0, settings.colorPalette.colors[0] + 'FF');
        gradient.addColorStop(1, settings.colorPalette.colors[0] + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        ctx.fill();
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
