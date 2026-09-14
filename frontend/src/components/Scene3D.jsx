import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

export default function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
      camera={{ position: [0, 18, 215], fov: 50, near: 0.8, far: 3600 }}
      style={{ background: '#5c6b7a', width: '100%', height: '100%' }}
    >
      {/* Change 5 — cool hemisphere: sky neutral blue-gray, ground cool dark */}
      <hemisphereLight args={['#c8d8e8', '#5a6068', 0.52]} />
      <ambientLight intensity={0.3} color="#cdd8e2" />

      {/* Key light — neutral white with very slight cool bias (was warm #f2f4f6) */}
      <directionalLight
        position={[110, 150, 80]}
        intensity={0.82}
        color="#dce8f2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={780}
        shadow-camera-left={-320}
        shadow-camera-right={320}
        shadow-camera-top={360}
        shadow-camera-bottom={-360}
        shadow-bias={-0.0002}
      />
      {/* Fill — cooler tone (was #b7c9d8) */}
      <directionalLight position={[-80, 50, -50]} intensity={0.24} color="#a0b4cc" />
      {/* Front fill — reduced to not over-brighten the far wall */}
      <directionalLight position={[0, 28, 220]} intensity={0.06} color="#a8bece" />

      <FactoryRoom />

      <OrbitControls
        target={[0, 10, -168]}
        minDistance={18}
        maxDistance={520}
        minPolarAngle={Math.PI / 14}
        maxPolarAngle={Math.PI / 2.12}
        enablePan
        enableZoom
        enableRotate
      />
    </Canvas>
  );
}
