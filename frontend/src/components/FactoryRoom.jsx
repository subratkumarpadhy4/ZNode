import * as THREE from 'three';

const ROOM_WIDTH  = 40;
const ROOM_DEPTH  = 60;
const ROOM_HEIGHT = 12;

export default function FactoryRoom() {
  return (
    <group>
      {/* FLOOR */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#2a2f3a" roughness={0.85} metalness={0.08} />
      </mesh>

      {/* CEILING */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#141821" roughness={1.0} side={THREE.DoubleSide} />
      </mesh>

      {/* BACK WALL */}
      <mesh receiveShadow position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.3]} />
        <meshStandardMaterial color="#1a1f2b" roughness={0.95} metalness={0} />
      </mesh>

      {/* LEFT WALL */}
      <mesh receiveShadow position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1a1f2b" roughness={0.95} metalness={0} />
      </mesh>

      {/* RIGHT WALL */}
      <mesh receiveShadow position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1a1f2b" roughness={0.95} metalness={0} />
      </mesh>

      {/* CEILING GIRDERS */}
      {[-22, -11, 0, 11, 22].map((z) => (
        <mesh key={`girder-${z}`} position={[0, ROOM_HEIGHT - 0.4, z]} castShadow>
          <boxGeometry args={[ROOM_WIDTH, 0.5, 0.7]} />
          <meshStandardMaterial color="#0f131c" roughness={0.9} metalness={0.2} />
        </mesh>
      ))}

      {/* COLUMNS */}
      {[
        [-12, -18],
        [ 12, -18],
        [-12,  18],
        [ 12,  18],
        [-12,   0],
        [ 12,   0],
      ].map(([x, z], i) => (
        <mesh
          key={`col-${i}`}
          position={[x, ROOM_HEIGHT / 2, z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.7, ROOM_HEIGHT, 0.7]} />
          <meshStandardMaterial color="#0f131c" roughness={0.9} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}
