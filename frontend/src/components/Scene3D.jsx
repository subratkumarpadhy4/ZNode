import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

export default function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 8, 12], fov: 55 }}
      style={{ background: '#0a0e1a', width: '100%', height: '100%' }}
    >
      {/* Change 4 — ambient raised to 0.25 so walls are visible */}
      <ambientLight intensity={0.25} />

      {/* Change 1 — key light moved inside room at Y=14 (below ceiling at Y=20) */}
      <directionalLight
        position={[10, 14, 8]}
        intensity={1.8}
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

      {/* Change 2 — three overhead point lights creating visible floor pools */}
      <pointLight
        position={[0, 12, 0]}
        intensity={40}
        distance={30}
        decay={2}
        color="#fff3dd"
        castShadow
      />
      <pointLight
        position={[-15, 12, -15]}
        intensity={25}
        distance={25}
        decay={2}
        color="#fff3dd"
      />
      <pointLight
        position={[15, 12, 15]}
        intensity={25}
        distance={25}
        decay={2}
        color="#fff3dd"
      />

      <FactoryRoom />

      <OrbitControls
        target={[0, 0, 0]}
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
