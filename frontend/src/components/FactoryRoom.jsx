import * as THREE from 'three';

const ROOM_WIDTH  = 50;
const ROOM_DEPTH  = 70;
const ROOM_HEIGHT = 20;

export default function FactoryRoom() {
  return (
    <group>
      {/* ─── FLOOR ─────────────────────────────────────────────────────── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#27282d" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* ─── CEILING ───────────────────────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#0a0c10" roughness={1.0} side={THREE.DoubleSide} />
      </mesh>

      {/* ─── BACK WALL ─────────────────────────────────────────────────── */}
      <mesh receiveShadow position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.3]} />
        <meshStandardMaterial color="#0f1116" roughness={0.95} metalness={0} />
      </mesh>

      {/* ─── LEFT WALL ─────────────────────────────────────────────────── */}
      <mesh receiveShadow position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#0f1116" roughness={0.95} metalness={0} />
      </mesh>

      {/* ─── RIGHT WALL ────────────────────────────────────────────────── */}
      <mesh receiveShadow position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#0f1116" roughness={0.95} metalness={0} />
      </mesh>

      {/* ─── CEILING GIRDERS — near top of taller room ─────────────────── */}
      {[-28, -14, 0, 14, 28].map((z) => (
        <mesh key={`girder-${z}`} position={[0, ROOM_HEIGHT - 1.5, z]} castShadow>
          <boxGeometry args={[ROOM_WIDTH, 0.6, 0.8]} />
          <meshStandardMaterial color="#080a0e" roughness={0.9} metalness={0.15} />
        </mesh>
      ))}

      {/* ─── SUPPORT COLUMNS — full height, new positions ──────────────── */}
      {[
        [-16, -22],
        [ 16, -22],
        [-16,   0],
        [ 16,   0],
        [-16,  22],
        [ 16,  22],
      ].map(([x, z], i) => (
        <mesh key={`col-${i}`} position={[x, ROOM_HEIGHT / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[0.9, ROOM_HEIGHT, 0.9]} />
          <meshStandardMaterial color="#080a0e" roughness={0.9} metalness={0.15} />
        </mesh>
      ))}

      {/* ─── BACK WALL CONDUITS ────────────────────────────────────────── */}
      {[-18, -6, 6, 18].map((x) => (
        <mesh key={`conduit-back-${x}`} position={[x, 8, -ROOM_DEPTH / 2 + 0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 16, 8]} />
          <meshStandardMaterial color="#1a1d24" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {/* ─── LEFT WALL CONDUITS ────────────────────────────────────────── */}
      {[-20, -10, 10, 20].map((z) => (
        <mesh key={`conduit-left-${z}`} position={[-ROOM_WIDTH / 2 + 0.3, 8, z]}>
          <cylinderGeometry args={[0.08, 0.08, 16, 8]} />
          <meshStandardMaterial color="#1a1d24" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {/* ─── RIGHT WALL CONDUITS ───────────────────────────────────────── */}
      {[-20, -10, 10, 20].map((z) => (
        <mesh key={`conduit-right-${z}`} position={[ROOM_WIDTH / 2 - 0.3, 8, z]}>
          <cylinderGeometry args={[0.08, 0.08, 16, 8]} />
          <meshStandardMaterial color="#1a1d24" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
