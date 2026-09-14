import * as THREE from 'three';

const ROOM_WIDTH  = 120;  // was 80  → 1.5×
const ROOM_DEPTH  = 300;  // unchanged
const ROOM_HEIGHT = 68;   // was 45  → 1.5×

export default function FactoryRoom() {
  return (
    <group>
      {/* ─── FLOOR ─────────────────────────────────────── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#4a4d52" roughness={0.82} metalness={0.08} />
      </mesh>

      {/* ─── FLOOR JOINT LINES ─────────────────────────── */}
      {[-52, -27, 0, 27, 52].map((x) => (
        <mesh key={`jx-${x}`} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, ROOM_DEPTH]} />
          <meshBasicMaterial color="#1e2126" />
        </mesh>
      ))}
      {[-135, -67, 0, 67, 135].map((z) => (
        <mesh key={`jz-${z}`} position={[0, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ROOM_WIDTH, 0.1]} />
          <meshBasicMaterial color="#1e2126" />
        </mesh>
      ))}

      {/* ─── CEILING ───────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#2a2e35" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* ─── BACK WALL ─────────────────────────────────── */}
      <mesh receiveShadow position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.4]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.9} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* ─── LEFT WALL ─────────────────────────────────── */}
      <mesh receiveShadow position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.4, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.9} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* ─── RIGHT WALL ────────────────────────────────── */}
      <mesh receiveShadow position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.4, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.9} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* ─── FRONT WALL ────────────────────────────────── */}
      <mesh receiveShadow position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.4]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.9} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* ─── MAIN GIRDERS — no castShadow ─────────────── */}
      {[-120, -60, 0, 60, 120].map((z) => (
        <mesh key={`girder-${z}`} position={[0, ROOM_HEIGHT - 1, z]}>
          <boxGeometry args={[ROOM_WIDTH, 1.0, 1.6]} />
          <meshStandardMaterial color="#4a5260" roughness={0.7} metalness={0.35} />
        </mesh>
      ))}

      {/* ─── CROSS BEAMS — no castShadow ──────────────── */}
      {[-48, -24, 24, 48].map((x) => (
        <mesh key={`cross-${x}`} position={[x, ROOM_HEIGHT - 0.8, 0]}>
          <boxGeometry args={[0.8, 0.7, ROOM_DEPTH]} />
          <meshStandardMaterial color="#4a5260" roughness={0.7} metalness={0.35} />
        </mesh>
      ))}

      {/* ─── BACK WALL CONDUITS ────────────────────────── */}
      {[-48, -18, 18, 48].map((x) => (
        <mesh key={`cond-b-${x}`} position={[x, 14, -ROOM_DEPTH / 2 + 0.5]}>
          <cylinderGeometry args={[0.15, 0.15, 28, 12]} />
          <meshStandardMaterial color="#4a5058" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* ─── LEFT WALL CONDUITS ────────────────────────── */}
      {[-105, -52, 0, 52, 105].map((z) => (
        <mesh key={`cond-l-${z}`} position={[-ROOM_WIDTH / 2 + 0.5, 14, z]}>
          <cylinderGeometry args={[0.15, 0.15, 28, 12]} />
          <meshStandardMaterial color="#4a5058" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* ─── RIGHT WALL CONDUITS ───────────────────────── */}
      {[-105, -52, 0, 52, 105].map((z) => (
        <mesh key={`cond-r-${z}`} position={[ROOM_WIDTH / 2 - 0.5, 14, z]}>
          <cylinderGeometry args={[0.15, 0.15, 28, 12]} />
          <meshStandardMaterial color="#4a5058" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {/* ─── CEILING FIXTURES (5) ──────────────────────── */}
      {[
        [  0,   0],
        [-36, -75],
        [ 36,  75],
        [-36,  75],
        [ 36, -75],
      ].map(([x, z], i) => (
        <group key={`fixture-${i}`}>
          <mesh position={[x, ROOM_HEIGHT - 2.2, z]}>
            <boxGeometry args={[4.0, 0.6, 1.0]} />
            <meshStandardMaterial color="#1a1d24" roughness={0.6} metalness={0.4} />
          </mesh>
          <mesh position={[x, ROOM_HEIGHT - 2.6, z]}>
            <boxGeometry args={[3.6, 0.12, 0.5]} />
            <meshBasicMaterial color="#fff8e0" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
