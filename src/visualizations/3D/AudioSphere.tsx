import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AudioData, VisualizationSettings } from '../../types';
import * as THREE from 'three';

interface Props {
  audioData: AudioData | null;
  settings: VisualizationSettings;
}

export const AudioSphere: React.FC<Props> = ({ audioData, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.IcosahedronGeometry>(null);

  // Geometry is defined inline in the JSX below
  useMemo(() => {
    return new THREE.IcosahedronGeometry(2, 6);
  }, []);

  useFrame(() => {
    if (!meshRef.current || !geometryRef.current || !audioData) return;

    const mesh = meshRef.current;
    const geo = geometryRef.current;
    const positions = geo.attributes.position;

    // Update vertices based on audio data
    const { frequencyData, bassLevel } = audioData;

    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );

      // Get frequency value for this vertex
      const freqIndex = Math.floor((i / positions.count) * frequencyData.length);
      const freqValue = frequencyData[freqIndex] / 255;

      // Calculate displacement
      const distance = 2 + freqValue * settings.sensitivity * 2;
      vertex.normalize().multiplyScalar(distance);

      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    positions.needsUpdate = true;
    geo.computeVertexNormals();

    // Rotate based on bass
    mesh.rotation.y += (bassLevel / 255) * 0.01 * settings.speed;
    mesh.rotation.x += 0.001 * settings.speed;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry ref={geometryRef} args={[2, 6]} />
      <meshStandardMaterial
        color={settings.colorPalette.colors[0]}
        wireframe={settings.complexity < 0.5}
        emissive={settings.colorPalette.colors[1]}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};
