import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AudioData, VisualizationSettings } from '../../types';
import * as THREE from 'three';

interface Props {
  audioData: AudioData | null;
  settings: VisualizationSettings;
}

export const AudioCubes: React.FC<Props> = ({ audioData, settings }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !audioData) return;

    const { frequencyData } = audioData;
    const cubes = groupRef.current.children;

    cubes.forEach((cube, i) => {
      if (cube instanceof THREE.Mesh) {
        const freqValue = frequencyData[i * 4] / 255;
        const scale = 0.5 + freqValue * settings.sensitivity * 2;
        cube.scale.y = scale;
        cube.rotation.y += 0.01 * settings.speed;
      }
    });

    groupRef.current.rotation.y += 0.001 * settings.speed;
  });

  const cubeCount = Math.floor(32 * settings.complexity);
  const radius = 5;

  return (
    <group ref={groupRef}>
      {Array.from({ length: cubeCount }).map((_, i) => {
        const angle = (i / cubeCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const colorIndex = i % settings.colorPalette.colors.length;

        return (
          <mesh key={i} position={[x, 0, z]}>
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshStandardMaterial
              color={settings.colorPalette.colors[colorIndex]}
              emissive={settings.colorPalette.colors[colorIndex]}
              emissiveIntensity={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
};
