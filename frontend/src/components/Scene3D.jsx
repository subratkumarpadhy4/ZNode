import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

// Room dimensions (must match FactoryRoom.jsx)
const ROOM_HEIGHT = 45;

export default function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 8, 30], fov: 55 }}
      style={{ background: '#08090d', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.3} />

      {/* Key — fill only, no castShadow */}
      <directionalLight position={[15, 28, 12]} intensity={0.8} color="#fff3dd" />

      {/* Cool fill */}
      <directionalLight position={[-18, 18, -15]} intensity={0.22} color="#8b95a8" />

      {/* Five point lights at y = ROOM_HEIGHT - 6, matching fixture positions */}
      <pointLight position={[  0, 39,   0]} intensity={200} distance={80} decay={1.4} color="#fff3dd" />
      <pointLight position={[-24, 39, -50]} intensity={120} distance={80} decay={1.4} color="#fff3dd" />
      <pointLight position={[ 24, 39,  50]} intensity={120} distance={80} decay={1.4} color="#fff3dd" />
      <pointLight position={[-24, 39,  50]} intensity={100} distance={80} decay={1.4} color="#fff3dd" />
      <pointLight position={[ 24, 39, -50]} intensity={100} distance={80} decay={1.4} color="#fff3dd" />

      <FactoryRoom />

      {/*
        Camera confinement rules:
        - minPolarAngle  Math.PI/2.2 (~82°) — camera cannot look too steeply down from above
          (prevents rising above the ceiling and seeing the black void on top)
        - maxPolarAngle  Math.PI/2.05 (~88°) — camera stays above the floor
        - minAzimuthAngle / maxAzimuthAngle  ±60° — prevents orbiting to see outside the side walls
        - maxDistance 30 — camera cannot pull far enough back to exit the front wall
        - enablePan false — panning would let the user drift outside the room
      */}
      <OrbitControls
        target={[0, 3, 0]}
        minDistance={6}
        maxDistance={30}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.95}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
}
