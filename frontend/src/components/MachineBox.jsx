import React from 'react';
import { useStore } from '../store.js';

function getColor(machine, incident) {
  if (!machine) return '#94a3b8'; // no data yet
  if (incident?.status === 'ACKNOWLEDGED') return '#ef4444'; // red
  if (incident?.status === 'VERIFYING')    return '#3b82f6'; // blue
  if (incident?.status === 'OPEN')         return '#f59e0b'; // yellow
  if (machine.anomaly?.is_anomaly)         return '#f59e0b'; // yellow
  return '#22c55e'; // green — normal
}

export default function MachineBox({ machineId, machine, incident, position }) {
  const selectMachine = useStore((s) => s.selectMachine);
  const color = getColor(machine, incident);

  const kwLabel = machine
    ? `${(machine.metrics?.excess_kw ?? 0).toFixed(1)} kW`
    : 'No data';

  const statusLabel = incident
    ? incident.status
    : machine?.anomaly?.is_anomaly
      ? '⚠ Anomaly'
      : 'OK';

  return (
    <g style={{ cursor: 'pointer' }} onClick={() => selectMachine(machineId)}>
      <rect
        x={position.x}
        y={position.y}
        width={140}
        height={90}
        fill={color}
        rx="8"
        opacity="0.92"
      />
      {/* Machine ID */}
      <text
        x={position.x + 70}
        y={position.y + 28}
        textAnchor="middle"
        fill="#0f172a"
        fontWeight="bold"
        fontSize="18"
      >
        {machineId}
      </text>
      {/* kW */}
      <text
        x={position.x + 70}
        y={position.y + 52}
        textAnchor="middle"
        fill="#0f172a"
        fontSize="13"
      >
        {kwLabel}
      </text>
      {/* Status */}
      <text
        x={position.x + 70}
        y={position.y + 72}
        textAnchor="middle"
        fill="#0f172a"
        fontSize="11"
        fontWeight="600"
      >
        {statusLabel}
      </text>
    </g>
  );
}
