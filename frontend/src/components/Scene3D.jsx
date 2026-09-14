import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [8, 8, 12], fov: 50 }}
      shadows
      gl={{ antialias: true }}
      style={{ background: '#0a0e1a', width: '100%', height: '100%' }}
    >
      {/* Main ambient fill */}
      <ambientLight intensity={0.45} />

      {/* Key light — upper right front */}
      <directionalLight
        position={[15, 25, 10]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      {/* Fill light — opposite side to reduce harsh shadows */}
      <directionalLight position={[-15, 15, -10]} intensity={0.4} />

      <FactoryRoom />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={60}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
