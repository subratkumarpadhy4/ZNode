import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

export default function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 12, 40], fov: 55 }}
      style={{ background: '#08090d', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.3} />

      {/* Key — fill only */}
      <directionalLight position={[20, 40, 18]} intensity={0.8} color="#fff3dd" />

      {/* Cool fill */}
      <directionalLight position={[-25, 20, -20]} intensity={0.22} color="#8b95a8" />

      {/* Five point lights — y = ROOM_HEIGHT - 6 = 62, matching fixture positions */}
      <pointLight position={[  0, 62,   0]} intensity={300} distance={140} decay={1.4} color="#fff3dd" />
      <pointLight position={[-36, 62, -75]} intensity={180} distance={140} decay={1.4} color="#fff3dd" />
      <pointLight position={[ 36, 62,  75]} intensity={180} distance={140} decay={1.4} color="#fff3dd" />
      <pointLight position={[-36, 62,  75]} intensity={150} distance={140} decay={1.4} color="#fff3dd" />
      <pointLight position={[ 36, 62, -75]} intensity={150} distance={140} decay={1.4} color="#fff3dd" />

      <FactoryRoom />

      <OrbitControls
        target={[0, 8, 0]}
        minDistance={8}
        maxDistance={120}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
}
