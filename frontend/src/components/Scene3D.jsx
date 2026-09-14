import { useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryRoom from './FactoryRoom';

const BTN = (active) => ({
  padding: '4px 14px',
  background: active ? '#2563eb' : '#1e293b',
  color: active ? '#fff' : '#64748b',
  border: `1px solid ${active ? '#3b82f6' : '#334155'}`,
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1,
  transition: 'all 0.15s',
});

export default function Scene3D() {
  const [floorBright, setFloorBright] = useState(true);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Floor brightness toggle */}
      <div style={{
        position: 'absolute', bottom: 12, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10, display: 'flex', gap: 3,
        background: 'rgba(10,14,22,0.72)', borderRadius: 6,
        padding: '4px 6px', backdropFilter: 'blur(4px)',
        border: '1px solid #1e293b',
      }}>
        <span style={{ color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: 1, alignSelf: 'center', paddingRight: 6 }}>FLOOR</span>
        <button style={BTN(!floorBright)} onClick={() => setFloorBright(false)}>DARK</button>
        <button style={BTN(floorBright)}  onClick={() => setFloorBright(true)}>BRIGHT</button>
      </div>

      <Canvas
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
        camera={{ position: [0, 150, 250], fov: 50, near: 0.8, far: 3600 }}
        style={{ background: '#5c6b7a', width: '100%', height: '100%' }}
      >
        <hemisphereLight args={['#c8d8e8', '#5a6068', 0.52]} />
        <ambientLight intensity={0.3} color="#cdd8e2" />

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
        <directionalLight position={[-80, 50, -50]} intensity={0.24} color="#a0b4cc" />
        <directionalLight position={[0, 28, 220]} intensity={0.06} color="#a8bece" />

        <FactoryRoom floorBright={floorBright} />

        <OrbitControls
          target={[0, 0, -100]}
          minDistance={18}
          maxDistance={520}
          minPolarAngle={Math.PI / 14}
          maxPolarAngle={Math.PI / 2.12}
          enablePan
          enableZoom
          enableRotate
        />
      </Canvas>
    </div>
  );
}
