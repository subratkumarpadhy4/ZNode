import React from 'react';
import { useStore } from '../store.js';

export default function TopBar() {
  const machines = useStore((s) => s.machines);
  const incidents = useStore((s) => s.incidents);

  const totalLoss = Object.values(machines)
    .reduce((sum, m) => sum + (m.metrics?.loss_rupees_per_hour || 0), 0);

  const hasAnomaly = Object.values(machines).some((m) => m.anomaly?.is_anomaly);
  const hasOpenIncident = Object.values(incidents).some(
    (inc) => inc && inc.status === 'OPEN'
  );
  const hasAcknowledged = Object.values(incidents).some(
    (inc) => inc && inc.status === 'ACKNOWLEDGED'
  );

  let statusColor = '#22c55e';
  let statusText = '🟢 System OK';
  if (hasAnomaly) { statusColor = '#f59e0b'; statusText = '🟡 Anomaly Detected'; }
  if (hasOpenIncident) { statusColor = '#f59e0b'; statusText = '🟡 Incident OPEN'; }
  if (hasAcknowledged) { statusColor = '#ef4444'; statusText = '🔴 Incident Acknowledged'; }

  return (
    <div className="topbar">
      <span className="topbar-title">⚡ ZNode</span>
      <span className="topbar-loss">₹ Loss Rate: ₹{Math.round(totalLoss)}/hr</span>
      <span className="topbar-status" style={{ color: statusColor }}>{statusText}</span>
    </div>
  );
}
