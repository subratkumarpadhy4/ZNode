import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

export default function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 3, 14], fov: 55 }}
      style={{ background: '#0a0e1a', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />

      <directionalLight
        position={[10, 14, 8]}
        intensity={1.2}
        color="#f1f5f9"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />

      <directionalLight
        position={[-10, 8, -10]}
        intensity={0.4}
        color="#64748b"
      />

      <FactoryRoom />

      <OrbitControls
        target={[0, 2, 0]}
        minDistance={3}
        maxDistance={14}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.1}
        minAzimuthAngle={-Math.PI / 2.5}
        maxAzimuthAngle={Math.PI / 2.5}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
}
