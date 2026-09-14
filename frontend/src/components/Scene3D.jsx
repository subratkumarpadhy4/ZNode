import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

export default function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 3.5, 16], fov: 55 }}
      style={{ background: '#08090d', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.22} />

      <directionalLight
        position={[14, 22, 12]}
        intensity={1.6}
        color="#ffe8c4"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0005}
      />

      <directionalLight
        position={[-14, 12, -10]}
        intensity={0.3}
        color="#8b95a8"
      />

      <FactoryRoom />

      <OrbitControls
        target={[0, 3, 0]}
        minDistance={4}
        maxDistance={22}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.15}
        minAzimuthAngle={-Math.PI / 2.2}
        maxAzimuthAngle={Math.PI / 2.2}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
}
