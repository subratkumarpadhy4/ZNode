import { Grid } from '@react-three/drei';

const ROOM_WIDTH  = 30;   // X-axis (left to right)
const ROOM_DEPTH  = 50;   // Z-axis (front to back)
const ROOM_HEIGHT = 8;    // Y-axis (floor to ceiling girders)

export default function FactoryRoom() {
  return (
    <group>
      {/* FLOOR */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* GRID OVERLAY */}
      <Grid
        args={[ROOM_WIDTH, ROOM_DEPTH]}
        position={[0, 0.01, 0]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#1e293b"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#334155"
        fadeDistance={60}
        fadeStrength={1}
        infiniteGrid={false}
      />

      {/* BACK WALL (far, negative Z) */}
      <mesh receiveShadow position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.3]} />
        <meshStandardMaterial color="#111827" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* LEFT WALL */}
      <mesh receiveShadow position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#111827" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* RIGHT WALL */}
      <mesh receiveShadow position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#111827" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* CEILING GIRDERS — 5 beams spanning the full width */}
      {[-20, -10, 0, 10, 20].map((z) => (
        <mesh key={z} position={[0, ROOM_HEIGHT, z]} castShadow>
          <boxGeometry args={[ROOM_WIDTH, 0.4, 0.6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}

      {/* SUPPORT COLUMNS — 6 columns at inner grid intersections */}
      {[
        [-10, -15],
        [ 10, -15],
        [-10,   0],
        [ 10,   0],
        [-10,  15],
        [ 10,  15],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, ROOM_HEIGHT / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[0.6, ROOM_HEIGHT, 0.6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}
