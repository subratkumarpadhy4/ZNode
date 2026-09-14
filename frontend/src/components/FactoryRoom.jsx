import * as THREE from 'three';

const ROOM_WIDTH  = 40;
const ROOM_DEPTH  = 60;
const ROOM_HEIGHT = 12;

// Overhead factory light fixture — emissive strip + point light pool on floor
function OverheadLight({ position }) {
  return (
    <group position={position}>
      {/* Fluorescent tube mesh — emissive warm white */}
      <mesh>
        <boxGeometry args={[4, 0.06, 0.22]} />
        <meshStandardMaterial
          color="#fff8e7"
          emissive="#fff8e7"
          emissiveIntensity={3.5}
          roughness={1}
          metalness={0}
        />
      </mesh>
      {/* Fixture housing — dark metal box */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[4.2, 0.12, 0.3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.4} />
      </mesh>
      {/* Point light that pools light down on the floor */}
      <pointLight
        color="#ffe8c0"
        intensity={18}
        distance={14}
        decay={2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.001}
      />
    </group>
  );
}

export default function FactoryRoom() {
  return (
    <group>
      {/* ─── FLOOR ─────────────────────────────────────────────────────── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH, 20, 30]} />
        <meshStandardMaterial
          color="#1a1d24"
          roughness={0.92}
          metalness={0.08}
        />
      </mesh>

      {/* ─── CEILING ───────────────────────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial
          color="#0c0e14"
          roughness={1.0}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ─── BACK WALL ─────────────────────────────────────────────────── */}
      <mesh receiveShadow position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.3]} />
        <meshStandardMaterial color="#131621" roughness={0.98} metalness={0} />
      </mesh>

      {/* ─── LEFT WALL ─────────────────────────────────────────────────── */}
      <mesh receiveShadow position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#131621" roughness={0.98} metalness={0} />
      </mesh>

      {/* ─── RIGHT WALL ────────────────────────────────────────────────── */}
      <mesh receiveShadow position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#131621" roughness={0.98} metalness={0} />
      </mesh>

      {/* ─── CEILING GIRDERS (structural, dark steel) ──────────────────── */}
      {[-22, -11, 0, 11, 22].map((z) => (
        <mesh key={`girder-${z}`} position={[0, ROOM_HEIGHT - 0.35, z]} castShadow receiveShadow>
          <boxGeometry args={[ROOM_WIDTH, 0.55, 0.75]} />
          <meshStandardMaterial color="#0a0d14" roughness={0.85} metalness={0.3} />
        </mesh>
      ))}

      {/* ─── OVERHEAD LIGHT FIXTURES (between girders) ─────────────────── */}
      {[-16.5, -5.5, 5.5, 16.5].map((z) => (
        <OverheadLight key={`light-${z}`} position={[0, ROOM_HEIGHT - 0.05, z]} />
      ))}

      {/* ─── SUPPORT COLUMNS ───────────────────────────────────────────── */}
      {[
        [-12, -18],
        [ 12, -18],
        [-12,   0],
        [ 12,   0],
        [-12,  18],
        [ 12,  18],
      ].map(([x, z], i) => (
        <mesh key={`col-${i}`} position={[x, ROOM_HEIGHT / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[0.75, ROOM_HEIGHT, 0.75]} />
          <meshStandardMaterial color="#0a0d14" roughness={0.88} metalness={0.25} />
        </mesh>
      ))}
    </group>
  );
}
