import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

export default function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 3, 12], fov: 50 }}
      style={{ background: '#08090d', width: '100%', height: '100%' }}
    >
      {/* Atmospheric fog — creates depth, dark corners */}
      <fog attach="fog" args={['#08090d', 18, 55]} />

      {/* Ambient — barely visible, prevents pure black on back faces */}
      <ambientLight intensity={0.08} />

      {/* Key light — warm, from upper-right front */}
      <directionalLight
        position={[6, 14, 10]}
        intensity={0.6}
        color="#cdd5e0"
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

      {/* Cool fill — opposite side */}
      <directionalLight
        position={[-8, 8, -6]}
        intensity={0.12}
        color="#334155"
      />

      <FactoryRoom />

      <OrbitControls
        target={[0, 1, 0]}
        minDistance={4}
        maxDistance={22}
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={Math.PI / 2.2}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
}
