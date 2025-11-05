import { useEffect, useRef } from 'react';
import { AudioData, VisualizationSettings } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

interface Props {
  audioData: AudioData | null;
  settings: VisualizationSettings;
  width: number;
  height: number;
}

export const ParticleVisualizer: React.FC<Props> = ({ audioData, settings, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear with fade effect
      ctx.fillStyle = settings.colorPalette.backgroundColor + '20';
      ctx.fillRect(0, 0, width, height);

      if (audioData) {
        const { frequencyData, bassLevel } = audioData;

        // Create new particles based on audio
        const particleCount = Math.floor(settings.complexity * 10);
        if (particlesRef.current.length < particleCount && Math.random() < 0.3) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (bassLevel / 255) * 5 * settings.speed;

          particlesRef.current.push({
            x: width / 2,
            y: height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: (frequencyData[Math.floor(Math.random() * 50)] / 255) * 10 * settings.complexity,
            color: settings.colorPalette.colors[Math.floor(Math.random() * settings.colorPalette.colors.length)],
            life: 1.0,
          });
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        // Update position
        particle.x += particle.vx * settings.speed;
        particle.y += particle.vy * settings.speed;
        particle.life -= 0.01 * settings.speed;

        // Apply audio reactivity
        if (audioData) {
          const reactionStrength = audioData.avgFrequency / 255 * settings.sensitivity;
          particle.size = Math.max(1, particle.size * (1 + reactionStrength * 0.1));
        }

        // Draw particle
        if (particle.life > 0) {
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();

          // Add glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = particle.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        return particle.life > 0 &&
               particle.x > -50 && particle.x < width + 50 &&
               particle.y > -50 && particle.y < height + 50;
      });

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
