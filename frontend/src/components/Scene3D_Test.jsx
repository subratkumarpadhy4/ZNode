import { Canvas } from '@react-three/fiber';

export default function Scene3D_Test() {
  return (
    <div style={{ width: '100%', height: '500px', background: '#0a0e1a' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </div>
  );
}
