import React from 'react';
import { useStore } from '../store.js';
import MachineBox from './MachineBox.jsx';

// Fixed SVG positions for M1, M2, M3
const POSITIONS = {
  M1: { x: 60,  y: 70 },
  M2: { x: 270, y: 70 },
  M3: { x: 480, y: 70 }
};

export default function MachineFloor() {
  const machines = useStore((s) => s.machines);
  const incidents = useStore((s) => s.incidents);

  return (
    <div className="machine-floor">
      <h2 className="section-title">Machine Floor</h2>
      <svg
        className="floor-svg"
        viewBox="0 0 700 220"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Machine floor plan"
      >
        {/* Floor outline */}
        <rect x="8" y="8" width="684" height="204" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="10" />

        {/* Grid lines */}
        <line x1="8" y1="108" x2="692" y2="108" stroke="#1e293b" strokeWidth="1" />
        <line x1="236" y1="8" x2="236" y2="212" stroke="#1e293b" strokeWidth="1" />
        <line x1="464" y1="8" x2="464" y2="212" stroke="#1e293b" strokeWidth="1" />

        {Object.keys(POSITIONS).map((id) => (
          <MachineBox
            key={id}
            machineId={id}
            machine={machines[id]}
            incident={incidents[id]}
            position={POSITIONS[id]}
          />
        ))}
      </svg>
    </div>
  );
}
