import * as THREE from 'three';

const ROOM_WIDTH  = 40;
const ROOM_DEPTH  = 60;
const ROOM_HEIGHT = 12;

export default function FactoryRoom() {
  return (
    <group>
      {/* FLOOR — warm dark gray, slight brown tint */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#27282d" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* CEILING — near black */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#0a0c10" roughness={1.0} side={THREE.DoubleSide} />
      </mesh>

      {/* BACK WALL — almost black, recedes into shadow */}
      <mesh receiveShadow position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.3]} />
        <meshStandardMaterial color="#0f1116" roughness={0.95} metalness={0} />
      </mesh>

      {/* LEFT WALL */}
      <mesh receiveShadow position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#0f1116" roughness={0.95} metalness={0} />
      </mesh>

      {/* RIGHT WALL */}
      <mesh receiveShadow position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#0f1116" roughness={0.95} metalness={0} />
      </mesh>

      {/* CEILING GIRDERS — dark steel */}
      {[-22, -11, 0, 11, 22].map((z) => (
        <mesh key={`girder-${z}`} position={[0, ROOM_HEIGHT - 0.4, z]} castShadow>
          <boxGeometry args={[ROOM_WIDTH, 0.5, 0.7]} />
          <meshStandardMaterial color="#080a0e" roughness={0.9} metalness={0.15} />
        </mesh>
      ))}

      {/* SUPPORT COLUMNS — dark steel */}
      {[
        [-12, -18],
        [ 12, -18],
        [-12,   0],
        [ 12,   0],
        [-12,  18],
        [ 12,  18],
      ].map(([x, z], i) => (
        <mesh key={`col-${i}`} position={[x, ROOM_HEIGHT / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[0.7, ROOM_HEIGHT, 0.7]} />
          <meshStandardMaterial color="#080a0e" roughness={0.9} metalness={0.15} />
        </mesh>
      ))}
    </group>
  );
}
