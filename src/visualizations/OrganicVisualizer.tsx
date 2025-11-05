import { useEffect, useRef } from 'react';
import { AudioData, VisualizationSettings } from '../types';

interface Props {
  audioData: AudioData | null;
  settings: VisualizationSettings;
  width: number;
  height: number;
}

export const OrganicVisualizer: React.FC<Props> = ({ audioData, settings, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
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
      ctx.fillStyle = settings.colorPalette.backgroundColor + '30';
      ctx.fillRect(0, 0, width, height);

      timeRef.current += 0.01 * settings.speed;

      if (audioData) {
        const { frequencyData, avgFrequency } = audioData;

        // Create organic blob shapes
        const blobCount = Math.floor(2 + settings.complexity * 3);

        for (let blob = 0; blob < blobCount; blob++) {
          const points = 20 + Math.floor(settings.complexity * 20);
          const baseRadius = 50 + blob * 60;
          const offset = blob * Math.PI * 0.5;

          const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, baseRadius * 2
          );

          const colorIndex = blob % settings.colorPalette.colors.length;
          const color = settings.colorPalette.colors[colorIndex];

          gradient.addColorStop(0, color + 'AA');
          gradient.addColorStop(0.5, color + '44');
          gradient.addColorStop(1, color + '00');

          ctx.fillStyle = gradient;
          ctx.beginPath();

          // Generate organic shape with Perlin-like noise simulation
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const freqIndex = Math.floor((i / points) * 128) % frequencyData.length;
            const freqValue = frequencyData[freqIndex] / 255;

            // Create organic movement
            const noiseX = Math.sin(timeRef.current + angle * 3 + offset) * 0.3;
            const noiseY = Math.cos(timeRef.current * 1.5 + angle * 2 + offset) * 0.3;
            const audioInfluence = freqValue * settings.sensitivity * 0.5;

            const radius = baseRadius * (1 + noiseX + noiseY + audioInfluence);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              // Use quadratic curves for smoother, organic shapes
              const prevAngle = ((i - 1) / points) * Math.PI * 2;
              const prevFreqIndex = Math.floor(((i - 1) / points) * 128) % frequencyData.length;
              const prevFreqValue = frequencyData[prevFreqIndex] / 255;
              const prevNoiseX = Math.sin(timeRef.current + prevAngle * 3 + offset) * 0.3;
              const prevNoiseY = Math.cos(timeRef.current * 1.5 + prevAngle * 2 + offset) * 0.3;
              const prevAudioInfluence = prevFreqValue * settings.sensitivity * 0.5;
              const prevRadius = baseRadius * (1 + prevNoiseX + prevNoiseY + prevAudioInfluence);

              const cpx = centerX + Math.cos((angle + prevAngle) / 2) * ((radius + prevRadius) / 2);
              const cpy = centerY + Math.sin((angle + prevAngle) / 2) * ((radius + prevRadius) / 2);

              ctx.quadraticCurveTo(cpx, cpy, x, y);
            }
          }

          ctx.closePath();
          ctx.fill();

          // Add glow
          ctx.shadowBlur = 30 * settings.complexity;
          ctx.shadowColor = color;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }

        // Add flowing particles
        const particleCount = Math.floor(avgFrequency / 20);
        ctx.globalAlpha = 0.6;

        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + timeRef.current;
          const distance = 100 + (frequencyData[i % frequencyData.length] / 255) * 200;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          const size = 2 + (frequencyData[i % frequencyData.length] / 255) * 4;

          ctx.fillStyle = settings.colorPalette.colors[i % settings.colorPalette.colors.length];
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

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
