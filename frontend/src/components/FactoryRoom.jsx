import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useStore } from '../store.js';

export const ROOM_WIDTH = 380;
export const ROOM_DEPTH = 640;
export const ROOM_HEIGHT = 124;

const MACHINE_LAYOUT = [
  { id: 'M1', type: 'CNC',     pos: [-118, 0,  88], scale: 2.775 },
  { id: 'M2', type: 'FURNACE', pos: [   0, 0, -168], scale: 3.075 },
  { id: 'M3', type: 'KILN',    pos: [ 132, 0,  96], scale: 2.85  },
];

const STEEL = '#5a6570';
const STEEL_DARK = '#454e57';
const CONCRETE = '#8a857b';
const WALL = '#b7b0a4';
const DADO = '#4e5c68';

function statusColor(machine, incident) {
  if (!machine) return '#22c55e';
  if (incident?.status === 'ACKNOWLEDGED') return '#ef4444';
  if (incident?.status === 'VERIFYING') return '#3b82f6';
  if (incident?.status === 'OPEN') return '#f59e0b';
  if (machine.anomaly?.is_anomaly) return '#f59e0b';
  return '#22c55e';
}

function beaconGlow(machine, incident) {
  if (incident?.status === 'ACKNOWLEDGED') return { intensity: 14, distance: 22 };
  if (incident?.status === 'VERIFYING') return { intensity: 5, distance: 16 };
  if (incident?.status === 'OPEN' || machine?.anomaly?.is_anomaly) return { intensity: 8, distance: 18 };
  return { intensity: 1.1, distance: 10 };
}

function StatusBeacon({ color, intensity, distance, y }) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.22, 0.34, 0.42, 12]} />
        <meshStandardMaterial color="#1a1f26" roughness={0.82} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.42, 20, 20]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <pointLight
        position={[0, 0, 0]}
        color={color}
        intensity={intensity}
        distance={distance}
        decay={2}
      />
    </group>
  );
}

function BasePlate({ width, depth }) {
  return (
    <mesh receiveShadow position={[0, 0.05, 0]}>
      <boxGeometry args={[width, 0.1, depth]} />
      <meshStandardMaterial color="#6f6b63" roughness={0.96} metalness={0} />
    </mesh>
  );
}

function MachineLabel({ machineId, type, machine, color, y = 16 }) {
  const kw = machine ? `${(machine.metrics?.excess_kw ?? 0).toFixed(1)} kW` : '— kW';
  return (
    <Html position={[0, y, 0]} center distanceFactor={28} style={{ pointerEvents: 'none' }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        border: `3px solid ${color}`,
        borderRadius: 8,
        padding: '10px 16px',
        color: '#0f172a',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        whiteSpace: 'nowrap',
        boxShadow: '0 10px 28px rgba(15,23,42,0.16)',
      }}>
        <div style={{ color: '#64748b', fontSize: 12, letterSpacing: 0.8, fontWeight: 600 }}>
          {machineId} · {type}
        </div>
        <div style={{ color, fontWeight: 700, fontSize: 20 }}>{kw}</div>
      </div>
    </Html>
  );
}

function GuardRing({ width, depth }) {
  const posts = [
    [-width / 2, -depth / 2], [width / 2, -depth / 2],
    [-width / 2, depth / 2], [width / 2, depth / 2],
  ];
  return (
    <group>
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.7, z]}>
          <cylinderGeometry args={[0.12, 0.12, 1.4, 10]} />
          <meshStandardMaterial color="#b89620" roughness={0.5} metalness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 1.15, -depth / 2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, width, 8]} />
        <meshStandardMaterial color="#b89620" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, 1.15, depth / 2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, width, 8]} />
        <meshStandardMaterial color="#b89620" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[-width / 2, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, depth, 8]} />
        <meshStandardMaterial color="#b89620" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[width / 2, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, depth, 8]} />
        <meshStandardMaterial color="#b89620" roughness={0.5} metalness={0.25} />
      </mesh>
    </group>
  );
}

function CncMachine({ onSelect }) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh receiveShadow position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 16]} />
        <meshStandardMaterial color="#3d4550" roughness={0.85} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 4.6, 0]}>
        <boxGeometry args={[16, 9.2, 11]} />
        <meshStandardMaterial color="#7b8590" roughness={0.42} metalness={0.28} />
      </mesh>
      <mesh position={[0, 5.2, 5.6]}>
        <boxGeometry args={[10, 4.6, 0.14]} />
        <meshStandardMaterial color="#7eb4d8" roughness={0.08} metalness={0.15} transparent opacity={0.45} />
      </mesh>
      <mesh castShadow position={[9.6, 3.6, 0]}>
        <boxGeometry args={[3.2, 7.2, 6.2]} />
        <meshStandardMaterial color="#4d5660" roughness={0.42} metalness={0.22} />
      </mesh>
      <mesh position={[9.6, 4.4, 3.2]}>
        <boxGeometry args={[1.6, 1.2, 0.08]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} />
      </mesh>
      <mesh position={[-7.2, 1.1, 7.2]}>
        <boxGeometry args={[4.4, 2.2, 2.4]} />
        <meshStandardMaterial color="#5c6670" roughness={0.5} metalness={0.35} />
      </mesh>
      <GuardRing width={22} depth={16} />
    </group>
  );
}

function FurnaceMachine({ onSelect }) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh receiveShadow position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#3d4550" roughness={0.85} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
        <cylinderGeometry args={[6.6, 7.4, 3.2, 28]} />
        <meshStandardMaterial color="#78828c" roughness={0.48} metalness={0.34} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 9.1, 0]}>
        <cylinderGeometry args={[5.2, 5.5, 12, 32]} />
        <meshStandardMaterial color="#6c757e" roughness={0.4} metalness={0.38} emissive="#5a3a28" emissiveIntensity={0.14} />
      </mesh>
      <mesh position={[0, 9.2, 5.4]}>
        <boxGeometry args={[2.8, 4.4, 0.2]} />
        <meshStandardMaterial color="#3d4650" roughness={0.45} metalness={0.45} />
      </mesh>
      <mesh castShadow position={[0, 16.2, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 2.4, 16]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.45} metalness={0.55} />
      </mesh>
      <GuardRing width={18} depth={18} />
    </group>
  );
}

function KilnMachine({ onSelect }) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh receiveShadow position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 14]} />
        <meshStandardMaterial color="#3d4550" roughness={0.85} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 5.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[4.6, 4.6, 26, 32]} />
        <meshStandardMaterial color="#9a8a70" roughness={0.58} metalness={0.12} />
      </mesh>
      {[-9, 0, 9].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 1.7, 0]}>
          <boxGeometry args={[2.4, 3.4, 6.2]} />
          <meshStandardMaterial color="#4a525a" roughness={0.52} metalness={0.38} />
        </mesh>
      ))}
      <mesh castShadow position={[-14.6, 5.1, 0]}>
        <boxGeometry args={[3.4, 6.6, 6.4]} />
        <meshStandardMaterial color="#5a636c" roughness={0.45} metalness={0.28} />
      </mesh>
      <mesh castShadow position={[14.6, 5.1, 0]}>
        <boxGeometry args={[3.4, 6.6, 6.4]} />
        <meshStandardMaterial color="#5a636c" roughness={0.45} metalness={0.28} />
      </mesh>
      <GuardRing width={30} depth={14} />
    </group>
  );
}

const PIPE_COLOR = '#3d5c66';
const PIPE_JOINT = '#334e56';
const HEADER_Y = 3.4;
const HEADER_Z = 12;
const RISER_TOP = 7.2;
const PIPE_R = 2.1;
const BRANCH_R = 1.7;

function PipeMaterial({ joint = false }) {
  return (
    <meshStandardMaterial
      color={joint ? PIPE_JOINT : PIPE_COLOR}
      roughness={0.72}
      metalness={0.12}
    />
  );
}

function PipeJoint({ position, radius = 2.6 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 14, 14]} />
      <PipeMaterial joint />
    </mesh>
  );
}

function MachinePipes() {
  const xs = MACHINE_LAYOUT.map((m) => m.pos[0]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const headerLen = xMax - xMin;
  const headerX = (xMin + xMax) / 2;

  return (
    <group>
      <mesh position={[headerX, HEADER_Y, HEADER_Z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[PIPE_R, PIPE_R, headerLen, 14]} />
        <PipeMaterial />
      </mesh>
      {MACHINE_LAYOUT.map((m) => {
        const [x, , z] = m.pos;
        const zMid = (z + HEADER_Z) / 2;
        const runLen = Math.abs(z - HEADER_Z);
        const riserLen = RISER_TOP - HEADER_Y;
        return (
          <group key={`pipe-${m.id}`}>
            <mesh position={[x, HEADER_Y, zMid]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[BRANCH_R, BRANCH_R, Math.max(runLen, 0.4), 14]} />
              <PipeMaterial />
            </mesh>
            <mesh position={[x, HEADER_Y + riserLen / 2, z]}>
              <cylinderGeometry args={[BRANCH_R, BRANCH_R, riserLen, 14]} />
              <PipeMaterial />
            </mesh>
            <PipeJoint position={[x, HEADER_Y, HEADER_Z]} />
            <PipeJoint position={[x, HEADER_Y, z]} radius={2.4} />
            <PipeJoint position={[x, RISER_TOP, z]} radius={2.3} />
          </group>
        );
      })}
    </group>
  );
}

function HighBayFixture({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[4.8, 0.35, 1.4]} />
        <meshStandardMaterial color="#4a525a" roughness={0.42} metalness={0.45} />
      </mesh>
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[4.4, 0.08, 1.15]} />
        <meshStandardMaterial color="#d8c89a" roughness={0.35} emissive="#c4b070" emissiveIntensity={0.22} />
      </mesh>
    </group>
  );
}

function IColumn({ position }) {
  const h = ROOM_HEIGHT;
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, h, 2.2]} />
        <meshStandardMaterial color={STEEL} roughness={0.52} metalness={0.32} />
      </mesh>
      <mesh position={[0, h / 2, 1.15]} castShadow>
        <boxGeometry args={[2.0, h, 0.24]} />
        <meshStandardMaterial color={STEEL} roughness={0.52} metalness={0.32} />
      </mesh>
      <mesh position={[0, h / 2, -1.15]} castShadow>
        <boxGeometry args={[2.0, h, 0.24]} />
        <meshStandardMaterial color={STEEL} roughness={0.52} metalness={0.32} />
      </mesh>
    </group>
  );
}

export default function FactoryRoom() {
  const machines = useStore((s) => s.machines);
  const incidents = useStore((s) => s.incidents);
  const selectMachine = useStore((s) => s.selectMachine);

  const colXs = [-150, -50, 50, 150];
  const pillarXs = [-150, 150];
  const colZs = [-250, -150, -50, 50, 150, 250];
  const pillarZs = colZs.filter((z) => z !== 250);
  const bayXs = [-140, -70, 0, 70, 140];
  const bayZs = [-240, -160, -80, 0, 80, 160, 240];

  return (
    <group>
      {/* Exterior apron so the open bays don't look into a void */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[900, 1200]} />
        <meshStandardMaterial color="#5a6270" roughness={0.88} />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.92} metalness={0.02} />
      </mesh>

      {[-150, -75, 0, 75, 150].map((x) => (
        <mesh key={`jx-${x}`} position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.28, ROOM_DEPTH]} />
          <meshStandardMaterial color="#5a564f" roughness={0.95} />
        </mesh>
      ))}
      {[-240, -160, -80, 0, 80, 160, 240].map((z) => (
        <mesh key={`jz-${z}`} position={[0, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ROOM_WIDTH, 0.28]} />
          <meshStandardMaterial color="#5a564f" roughness={0.95} />
        </mesh>
      ))}

      {[-72, 72].map((x) => (
        <mesh key={`lane-${x}`} position={[x, 0.03, 16]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.85, 420]} />
          <meshStandardMaterial color="#c9a227" roughness={0.7} />
        </mesh>
      ))}

      {/* Roof deck + bright skylights */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#7c848c" roughness={0.82} emissive="#4a525a" emissiveIntensity={0.22} side={THREE.DoubleSide} />
      </mesh>
      {[-220, -110, 0, 110, 220].map((z) => (
        <mesh key={`sky-${z}`} position={[0, ROOM_HEIGHT - 0.04, z]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[90, 16]} />
          <meshStandardMaterial color="#9eb4c4" roughness={0.22} metalness={0.04} emissive="#6a8498" emissiveIntensity={0.18} />
        </mesh>
      ))}

      {/* Three walls; south side is open loading bays */}
      {[
        [0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2, [ROOM_WIDTH, ROOM_HEIGHT, 0.55]],
        [-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0, [0.55, ROOM_HEIGHT, ROOM_DEPTH]],
        [ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0, [0.55, ROOM_HEIGHT, ROOM_DEPTH]],
      ].map(([x, y, z, args], i) => (
        <mesh key={`wall-${i}`} receiveShadow position={[x, y, z]}>
          <boxGeometry args={args} />
          <meshStandardMaterial color={WALL} roughness={0.88} metalness={0.02} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* South end: wide open loading bays under a header (camera looks in from here) */}
      <mesh position={[-168, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]}>
        <boxGeometry args={[44, ROOM_HEIGHT, 0.55]} />
        <meshStandardMaterial color={WALL} roughness={0.88} />
      </mesh>
      <mesh position={[168, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]}>
        <boxGeometry args={[44, ROOM_HEIGHT, 0.55]} />
        <meshStandardMaterial color={WALL} roughness={0.88} />
      </mesh>
      <mesh position={[0, ROOM_HEIGHT - 5, ROOM_DEPTH / 2]}>
        <boxGeometry args={[292, 10, 0.7]} />
        <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.28} />
      </mesh>


      {[
        [0, 1.7, -ROOM_DEPTH / 2 + 0.32, [ROOM_WIDTH, 3.4, 0.1]],
        [-ROOM_WIDTH / 2 + 0.32, 1.7, 0, [0.1, 3.4, ROOM_DEPTH]],
        [ROOM_WIDTH / 2 - 0.32, 1.7, 0, [0.1, 3.4, ROOM_DEPTH]],
      ].map(([x, y, z, args], i) => (
        <mesh key={`dado-${i}`} position={[x, y, z]}>
          <boxGeometry args={args} />
          <meshStandardMaterial color={DADO} roughness={0.8} metalness={0.06} />
        </mesh>
      ))}

      {[-220, -110, 0, 110, 220].map((z) =>
        [-1, 1].map((side) => (
          <mesh key={`win-${side}-${z}`} position={[side * (ROOM_WIDTH / 2 - 0.38), 44, z]}>
            <boxGeometry args={[0.12, 32, 28]} />
            <meshStandardMaterial
              color="#6a8aa0"
              roughness={0.14}
              metalness={0.08}
              emissive="#3d5566"
              emissiveIntensity={0.16}
            />
          </mesh>
        ))
      )}

      {pillarXs.flatMap((x) => pillarZs.map((z) => (
        <IColumn key={`col-${x}-${z}`} position={[x, 0, z]} />
      )))}

      {colZs.map((z) => (
        <mesh key={`girder-${z}`} position={[0, ROOM_HEIGHT - 1.4, z]}>
          <boxGeometry args={[ROOM_WIDTH, 1.5, 1.8]} />
          <meshStandardMaterial color="#5d6670" roughness={0.52} metalness={0.28} />
        </mesh>
      ))}
      {colXs.map((x) => (
        <mesh key={`purlin-${x}`} position={[x, ROOM_HEIGHT - 1.05, 0]}>
          <boxGeometry args={[0.7, 0.7, ROOM_DEPTH]} />
          <meshStandardMaterial color="#616a73" roughness={0.52} metalness={0.26} />
        </mesh>
      ))}

      {bayXs.flatMap((x) => bayZs.map((z) => (
        <HighBayFixture key={`hb-${x}-${z}`} position={[x, ROOM_HEIGHT - 2.6, z]} />
      )))}

      {MACHINE_LAYOUT.map((layout) => {
        const machine = machines[layout.id];
        const incident = incidents[layout.id];
        const color = statusColor(machine, incident);
        const glow = beaconGlow(machine, incident);
        const onSelect = () => selectMachine(layout.id);
        const beaconY = layout.type === 'FURNACE' ? 22.2 : layout.type === 'KILN' ? 14.1 : 13.4;
        const plate = layout.type === 'FURNACE'
          ? [20, 20]
          : layout.type === 'KILN'
            ? [32, 16]
            : [24, 18];
        return (
          <group key={layout.id} position={layout.pos} scale={layout.scale}>
            <BasePlate width={plate[0]} depth={plate[1]} />
            {layout.type === 'CNC' && <CncMachine onSelect={onSelect} />}
            {layout.type === 'FURNACE' && <FurnaceMachine onSelect={onSelect} />}
            {layout.type === 'KILN' && <KilnMachine onSelect={onSelect} />}
            <StatusBeacon
              color={color}
              intensity={glow.intensity}
              distance={glow.distance}
              y={beaconY}
            />
            <MachineLabel
              machineId={layout.id}
              type={layout.type}
              machine={machine}
              color={color}
              y={beaconY + 3.2}
            />
          </group>
        );
      })}

      <MachinePipes />
    </group>
  );
}
