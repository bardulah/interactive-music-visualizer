import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AudioData, VisualizationSettings } from '../../types';
import * as THREE from 'three';

interface Props {
  audioData: AudioData | null;
  settings: VisualizationSettings;
}

export const AudioWaves3D: React.FC<Props> = ({ audioData, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame(() => {
    if (!meshRef.current || !audioData) return;

    const mesh = meshRef.current;
    const geometry = mesh.geometry as THREE.PlaneGeometry;
    const positions = geometry.attributes.position;

    const { frequencyData, avgFrequency } = audioData;
    timeRef.current += 0.01 * settings.speed;

    // Update vertices to create wave effect
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);

      // Get frequency value based on position
      const freqIndex = Math.floor(((x + 5) / 10) * frequencyData.length);
      const freqValue = frequencyData[freqIndex] / 255;

      // Create wave with audio reactivity
      const wave = Math.sin(x * 0.5 + timeRef.current) * 0.5;
      const audioWave = freqValue * settings.sensitivity * 2;
      const z = wave + audioWave;

      positions.setZ(i, z);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();

    // Rotate slightly
    mesh.rotation.z += (avgFrequency / 255) * 0.001 * settings.speed;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]}>
      <planeGeometry args={[10, 10, 50, 50]} />
      <meshStandardMaterial
        color={settings.colorPalette.colors[0]}
        wireframe={true}
        emissive={settings.colorPalette.colors[1]}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};
