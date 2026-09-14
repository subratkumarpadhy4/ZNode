const ROOM_WIDTH  = 30;
const ROOM_DEPTH  = 50;
const ROOM_HEIGHT = 8;

// Simple grid-line overlay using line segments — no extend() call, no drei Grid
function GridLines() {
  const lines = [];

  // Lines along X axis (Z-spaced)
  for (let z = -ROOM_DEPTH / 2; z <= ROOM_DEPTH / 2; z += 2) {
    lines.push(
      <line key={`z${z}`}>
        <bufferGeometry
          attach="geometry"
          onUpdate={(self) => {
            const pts = new Float32Array([
              -ROOM_WIDTH / 2, 0.01, z,
               ROOM_WIDTH / 2, 0.01, z,
            ]);
            self.setAttribute('position', { array: pts, itemSize: 3, count: 2 });
          }}
        />
        <lineBasicMaterial attach="material" color="#1e293b" opacity={0.6} transparent />
      </line>
    );
  }

  // Lines along Z axis (X-spaced)
  for (let x = -ROOM_WIDTH / 2; x <= ROOM_WIDTH / 2; x += 2) {
    lines.push(
      <line key={`x${x}`}>
        <bufferGeometry
          attach="geometry"
          onUpdate={(self) => {
            const pts = new Float32Array([
              x, 0.01, -ROOM_DEPTH / 2,
              x, 0.01,  ROOM_DEPTH / 2,
            ]);
            self.setAttribute('position', { array: pts, itemSize: 3, count: 2 });
          }}
        />
        <lineBasicMaterial attach="material" color="#1e293b" opacity={0.6} transparent />
      </line>
    );
  }

  return <group>{lines}</group>;
}

export default function FactoryRoom() {
  return (
    <group>
      {/* FLOOR */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#2d3748" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* GRID OVERLAY — manual lines, no drei Grid (avoids extend() at module scope crash) */}
      <GridLines />

      {/* BACK WALL (far, negative Z) */}
      <mesh receiveShadow position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.3]} />
        <meshStandardMaterial color="#1e2a3d" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* LEFT WALL */}
      <mesh receiveShadow position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1e2a3d" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* RIGHT WALL */}
      <mesh receiveShadow position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1e2a3d" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* CEILING GIRDERS — 5 beams spanning the full width */}
      {[-20, -10, 0, 10, 20].map((z) => (
        <mesh key={z} position={[0, ROOM_HEIGHT, z]} castShadow>
          <boxGeometry args={[ROOM_WIDTH, 0.4, 0.6]} />
          <meshStandardMaterial color="#1e2a3d" roughness={0.8} metalness={0.3} />
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
          <meshStandardMaterial color="#243447" roughness={0.85} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}
