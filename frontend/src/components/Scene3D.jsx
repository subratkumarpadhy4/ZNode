import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

export default function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 1.8, 14], fov: 50 }}
      style={{ background: '#08090d', width: '100%', height: '100%' }}
    >
      {/* Ambient — very low, just prevents pure black */}
      <ambientLight intensity={0.12} />

      {/* Key light — warm white, from above and slightly right */}
      <directionalLight
        position={[6, 14, 10]}
        intensity={1.2}
        color="#f8fafc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0005}
      />

      {/* Fill light — cool, dim, from opposite side */}
      <directionalLight
        position={[-8, 8, -6]}
        intensity={0.25}
        color="#64748b"
      />

      <FactoryRoom />

      <OrbitControls
        target={[0, 1, 0]}
        minDistance={5}
        maxDistance={25}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.3}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
}
