import * as THREE from 'three';

const ROOM_WIDTH  = 50;
const ROOM_DEPTH  = 70;
const ROOM_HEIGHT = 20;

// Overhead fluorescent tube — emissive strip + point light pool
function TubeLight({ position }) {
  return (
    <group position={position}>
      {/* Glowing tube */}
      <mesh>
        <boxGeometry args={[6, 0.08, 0.18]} />
        <meshStandardMaterial
          color="#f0ecd8"
          emissive="#f0ecd8"
          emissiveIntensity={4}
          roughness={1}
          metalness={0}
        />
      </mesh>
      {/* Metal housing */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[6.3, 0.1, 0.26]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.5} />
      </mesh>
      {/* Light pool downward */}
      <pointLight
        color="#fffaf0"
        intensity={6}
        distance={16}
        decay={2}
      />
    </group>
  );
}

export default function FactoryRoom() {
  return (
    <group>
      {/* ─── FLOOR ─────────────────────────────────────────────── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#3a3d42" roughness={0.88} metalness={0.06} />
      </mesh>

      {/* ─── FLOOR EXPANSION JOINTS ────────────────────────────── */}
      {[-20, -10, 0, 10, 20].map((x) => (
        <mesh key={`jx-${x}`} position={[x, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, ROOM_DEPTH]} />
          <meshBasicMaterial color="#1a1d22" />
        </mesh>
      ))}
      {[-28, -14, 0, 14, 28].map((z) => (
        <mesh key={`jz-${z}`} position={[0, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ROOM_WIDTH, 0.06]} />
          <meshBasicMaterial color="#1a1d22" />
        </mesh>
      ))}

      {/* ─── CEILING ───────────────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#0e1116" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* ─── BACK WALL ─────────────────────────────────────────── */}
      <mesh receiveShadow position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.4]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.95} />
      </mesh>

      {/* ─── LEFT WALL ─────────────────────────────────────────── */}
      <mesh receiveShadow position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.4, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.95} />
      </mesh>

      {/* ─── RIGHT WALL ────────────────────────────────────────── */}
      <mesh receiveShadow position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.4, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.95} />
      </mesh>

      {/* ─── CEILING GIRDERS ───────────────────────────────────── */}
      {[-28, -14, 0, 14, 28].map((z) => (
        <mesh key={`girder-${z}`} position={[0, ROOM_HEIGHT - 1, z]}>
          <boxGeometry args={[ROOM_WIDTH, 0.6, 0.8]} />
          <meshStandardMaterial color="#0a0d12" roughness={0.85} metalness={0.2} />
        </mesh>
      ))}

      {/* ─── TUBE LIGHTS — between girders ─────────────────────── */}
      {[-21, -7, 7, 21].map((z) => (
        <TubeLight key={`tube-${z}`} position={[0, ROOM_HEIGHT - 1.1, z]} />
      ))}

      {/* ─── CHANGE 3 — ceiling fixture discs above each point light ── */}
      {[0, -15, 15].map((x, i) => (
        <mesh
          key={`fixture-${i}`}
          position={[x, 19.7, i === 0 ? 0 : i === 1 ? -15 : 15]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.6, 24]} />
          <meshBasicMaterial color="#fff8e0" />
        </mesh>
      ))}
    </group>
  );
}
