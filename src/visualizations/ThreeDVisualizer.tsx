import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { AudioData, VisualizationSettings } from '../types';
import { AudioSphere } from './3D/AudioSphere';
import { AudioCubes } from './3D/AudioCubes';
import { AudioWaves3D } from './3D/AudioWaves3D';

interface Props {
  audioData: AudioData | null;
  settings: VisualizationSettings;
  width: number;
  height: number;
}

export const ThreeDVisualizer: React.FC<Props> = ({ audioData, settings, width, height }) => {
  const renderScene = () => {
    // Determine which 3D visualization to show based on complexity
    if (settings.complexity < 0.4) {
      return <AudioSphere audioData={audioData} settings={settings} />;
    } else if (settings.complexity < 0.7) {
      return <AudioCubes audioData={audioData} settings={settings} />;
    } else {
      return <AudioWaves3D audioData={audioData} settings={settings} />;
    }
  };

  return (
    <div style={{ width, height, background: settings.colorPalette.backgroundColor }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color={settings.colorPalette.colors[0]} />

        {renderScene()}

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={settings.speed}
        />
      </Canvas>
    </div>
  );
};
