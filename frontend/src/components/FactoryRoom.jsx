import * as THREE from 'three';

const ROOM_WIDTH  = 80;
const ROOM_DEPTH  = 100;
const ROOM_HEIGHT = 24;

export default function FactoryRoom() {
  return (
    <group>
      {/* ─── FLOOR ─────────────────────────────────────── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#4a4d52" roughness={0.82} metalness={0.08} />
      </mesh>

      {/* ─── FLOOR JOINT LINES ─────────────────────────── */}
      {[-35, -18, 0, 18, 35].map((x) => (
        <mesh key={`jx-${x}`} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, ROOM_DEPTH]} />
          <meshBasicMaterial color="#1e2126" />
        </mesh>
      ))}
      {[-45, -22, 0, 22, 45].map((z) => (
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
        <meshStandardMaterial color="#3a3f47" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* ─── LEFT WALL ─────────────────────────────────── */}
      <mesh receiveShadow position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.4, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* ─── RIGHT WALL ────────────────────────────────── */}
      <mesh receiveShadow position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.4, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* ─── MAIN GIRDERS — no castShadow ─────────────── */}
      {[-40, -20, 0, 20, 40].map((z) => (
        <mesh key={`girder-${z}`} position={[0, ROOM_HEIGHT - 1, z]}>
          <boxGeometry args={[ROOM_WIDTH, 0.7, 1.0]} />
          <meshStandardMaterial color="#4a5260" roughness={0.7} metalness={0.35} />
        </mesh>
      ))}

      {/* ─── CROSS BEAMS — no castShadow ──────────────── */}
      {[-32, -16, 16, 32].map((x) => (
        <mesh key={`cross-${x}`} position={[x, ROOM_HEIGHT - 0.7, 0]}>
          <boxGeometry args={[0.6, 0.5, ROOM_DEPTH]} />
          <meshStandardMaterial color="#4a5260" roughness={0.7} metalness={0.35} />
        </mesh>
      ))}

      {/* ─── WALL CONDUITS — no castShadow ────────────── */}
      {[-32, -12, 12, 32].map((x) => (
        <mesh key={`cond-b-${x}`} position={[x, 8, -ROOM_DEPTH / 2 + 0.5]}>
          <cylinderGeometry args={[0.1, 0.1, 16, 12]} />
          <meshStandardMaterial color="#4a5058" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {[-32, -12, 12, 32].map((z) => (
        <mesh key={`cond-l-${z}`} position={[-ROOM_WIDTH / 2 + 0.5, 8, z]}>
          <cylinderGeometry args={[0.1, 0.1, 16, 12]} />
          <meshStandardMaterial color="#4a5058" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {[-32, -12, 12, 32].map((z) => (
        <mesh key={`cond-r-${z}`} position={[ROOM_WIDTH / 2 - 0.5, 8, z]}>
          <cylinderGeometry args={[0.1, 0.1, 16, 12]} />
          <meshStandardMaterial color="#4a5058" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {/* ─── CEILING FIXTURES (5) — scaled to larger room ─ */}
      {[
        [  0,   0],
        [-24, -24],
        [ 24,  24],
        [-24,  24],
        [ 24, -24],
      ].map(([x, z], i) => (
        <group key={`fixture-${i}`}>
          <mesh position={[x, ROOM_HEIGHT - 1.8, z]}>
            <boxGeometry args={[3.0, 0.5, 0.8]} />
            <meshStandardMaterial color="#1a1d24" roughness={0.6} metalness={0.4} />
          </mesh>
          <mesh position={[x, ROOM_HEIGHT - 2.1, z]}>
            <boxGeometry args={[2.8, 0.1, 0.4]} />
            <meshBasicMaterial color="#fff8e0" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
