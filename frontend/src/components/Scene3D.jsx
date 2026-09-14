import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

export default function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 4, 18], fov: 55 }}
      style={{ background: '#08090d', width: '100%', height: '100%' }}
    >
      {/* Low ambient — makes walls readable, prevents pure black */}
      <ambientLight intensity={0.22} />

      {/* Key light from upper-right, inside the room */}
      <directionalLight
        position={[12, 14, 10]}
        intensity={1.2}
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

      {/* Cool fill from opposite side, weak */}
      <directionalLight
        position={[-14, 10, -12]}
        intensity={0.22}
        color="#8b95a8"
      />

      {/* Five overhead point lights matching the fixtures */}
      <pointLight position={[  0, 17,   0]} intensity={50} distance={32} decay={2} color="#fff3dd" castShadow />
      <pointLight position={[-15, 17, -15]} intensity={35} distance={26} decay={2} color="#fff3dd" />
      <pointLight position={[ 15, 17,  15]} intensity={35} distance={26} decay={2} color="#fff3dd" />
      <pointLight position={[-15, 17,  15]} intensity={28} distance={24} decay={2} color="#fff3dd" />
      <pointLight position={[ 15, 17, -15]} intensity={28} distance={24} decay={2} color="#fff3dd" />

      <FactoryRoom />

      <OrbitControls
        target={[0, 1.5, 0]}
        minDistance={4}
        maxDistance={24}
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
