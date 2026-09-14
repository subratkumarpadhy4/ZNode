import * as THREE from 'three';
import { Html } from '@react-three/drei';

const ROOM_WIDTH  = 50;
const ROOM_DEPTH  = 70;
const ROOM_HEIGHT = 20;

const MACHINES = [
  { id: 'M1', type: 'CNC',     kw: '50.2', color: '#10b981', pos: [-12, 0, 10] },
  { id: 'M2', type: 'FURNACE', kw: '23.6', color: '#f59e0b', pos: [  0, 0,  0] },
  { id: 'M3', type: 'KILN',    kw: '39.8', color: '#10b981', pos: [ 12, 0,-10] },
];

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
      {/* Light pool on the floor below */}
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

      {/* ─── WALLS ─────────────────────────────────────────────── */}
      <mesh receiveShadow position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.4]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.4, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.4, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.95} />
      </mesh>

      {/* ─── CEILING GIRDERS ───────────────────────────────────── */}
      {[-28, -14, 0, 14, 28].map((z) => (
        <mesh key={`girder-${z}`} position={[0, ROOM_HEIGHT - 1, z]} castShadow>
          <boxGeometry args={[ROOM_WIDTH, 0.6, 0.8]} />
          <meshStandardMaterial color="#0a0d12" roughness={0.85} metalness={0.2} />
        </mesh>
      ))}

      {/* ─── TUBE LIGHTS — mounted between girders ─────────────── */}
      {[-21, -7, 7, 21].map((z) => (
        <TubeLight key={`tube-${z}`} position={[0, ROOM_HEIGHT - 1.1, z]} />
      ))}

      {/* ─── MACHINES ──────────────────────────────────────────── */}
      {MACHINES.map((m) => (
        <group key={m.id} position={[m.pos[0], 0.8, m.pos[2]]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.6, 1.6, 1.6]} />
            <meshStandardMaterial
              color={m.color}
              roughness={0.35}
              metalness={0.25}
            />
          </mesh>

          {/* Floating label */}
          <Html
            position={[0, 2.2, 0]}
            center
            distanceFactor={12}
            style={{ pointerEvents: 'none' }}
          >
            <div style={{
              background: 'rgba(10,14,26,0.95)',
              border: `1px solid ${m.color}`,
              borderRadius: 4,
              padding: '6px 12px',
              color: '#f1f5f9',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 13,
              whiteSpace: 'nowrap',
              textAlign: 'left',
            }}>
              <div style={{ color: '#94a3b8', fontSize: 11, letterSpacing: 1 }}>
                {m.id} · {m.type}
              </div>
              <div style={{ color: m.color, fontWeight: 700, fontSize: 16 }}>
                {m.kw} kW
              </div>
            </div>
          </Html>
        </group>
      ))}

      {/* ─── PIPE NETWORK ──────────────────────────────────────── */}
      {/* Main horizontal header along X-axis */}
      <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 46, 16]} />
        <meshStandardMaterial color="#3a4049" roughness={0.4} metalness={0.75} />
      </mesh>

      {/* Per-machine riser, connector, and elbow */}
      {MACHINES.map((m) => {
        const dir = m.pos[0] < 0 ? 1 : m.pos[0] > 0 ? -1 : 0;
        return (
          <group key={`pipe-${m.id}`}>
            {/* Vertical riser from header up */}
            <mesh position={[m.pos[0], 0.2, m.pos[2]]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.4, 12]} />
              <meshStandardMaterial color="#3a4049" roughness={0.4} metalness={0.75} />
            </mesh>
            {/* Horizontal connector to machine side */}
            <mesh position={[m.pos[0] + dir * 0.4, 0.35, m.pos[2]]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.8, 12]} />
              <meshStandardMaterial color="#3a4049" roughness={0.4} metalness={0.75} />
            </mesh>
            {/* Elbow joint */}
            <mesh position={[m.pos[0] + dir * 0.8, 0.35, m.pos[2]]}>
              <sphereGeometry args={[0.13, 12, 12]} />
              <meshStandardMaterial color="#3a4049" roughness={0.4} metalness={0.75} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
