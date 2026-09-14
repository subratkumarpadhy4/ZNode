import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

export default function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 7, 26], fov: 55 }}
      style={{ background: '#08090d', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.3} />

      {/* Key — fill only, no castShadow */}
      <directionalLight position={[15, 22, 12]} intensity={0.8} color="#fff3dd" />

      {/* Cool fill */}
      <directionalLight position={[-18, 12, -15]} intensity={0.22} color="#8b95a8" />

      {/* Five point lights at y=28 (ROOM_HEIGHT - 4), matching fixture positions */}
      <pointLight position={[  0, 28,   0]} intensity={150} distance={60} decay={1.4} color="#fff3dd" />
      <pointLight position={[-24, 28, -34]} intensity={90}  distance={60} decay={1.4} color="#fff3dd" />
      <pointLight position={[ 24, 28,  34]} intensity={90}  distance={60} decay={1.4} color="#fff3dd" />
      <pointLight position={[-24, 28,  34]} intensity={70}  distance={60} decay={1.4} color="#fff3dd" />
      <pointLight position={[ 24, 28, -34]} intensity={70}  distance={60} decay={1.4} color="#fff3dd" />

      <FactoryRoom />

      <OrbitControls
        target={[0, 2, 0]}
        minDistance={6}
        maxDistance={45}
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
