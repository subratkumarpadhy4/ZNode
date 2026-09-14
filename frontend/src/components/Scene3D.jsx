import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

export default function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 4, 16], fov: 50 }}
      style={{ background: '#0a0e1a', width: '100%', height: '100%' }}
    >
      {/* Low ambient — tube lights do the heavy lifting */}
      <ambientLight intensity={0.25} />

      {/* Warm key from upper-right for directionality and shadows */}
      <directionalLight
        position={[12, 20, 10]}
        intensity={1.4}
        color="#fff3dd"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={120}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0004}
      />

      {/* Cool fill from opposite side */}
      <directionalLight
        position={[-14, 10, -10]}
        intensity={0.3}
        color="#8b95a8"
      />

      <FactoryRoom />

      <OrbitControls
        target={[0, 1.5, 0]}
        minDistance={4}
        maxDistance={22}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.15}
        minAzimuthAngle={-Math.PI / 2.4}
        maxAzimuthAngle={Math.PI / 2.4}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
}
