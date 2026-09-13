import React, { useState, useEffect } from 'react';
import { useStore } from '../store.js';
import { BACKEND } from '../api.js';

export default function KPITiles() {
  const machines = useStore((s) => s.machines);
  const incidents = useStore((s) => s.incidents);
  const [uptime, setUptime] = useState(null);

  useEffect(() => {
    const fetchUptime = async () => {
      try {
        const res = await fetch(`${BACKEND}/health`);
        const data = await res.json();
        setUptime(data.uptime);
      } catch { /* silent */ }
    };
    fetchUptime();
    const id = setInterval(fetchUptime, 10000);
    return () => clearInterval(id);
  }, []);

  const machineList = Object.values(machines);
  const totalLoss = machineList.reduce(
    (sum, m) => sum + (m.metrics?.loss_rupees_per_hour || 0), 0
  );
  const activeIncidents = Object.values(incidents).filter(
    (inc) => inc && inc.status !== 'CLOSED'
  ).length;
  const anomalyMachines = machineList.filter((m) => m.anomaly?.is_anomaly);
  const confidenceValues = anomalyMachines
    .map((m) => m.metrics?.confidence)
    .filter(Boolean);
  const meanConfidence = confidenceValues.length > 0
    ? confidenceValues[confidenceValues.length - 1]
    : 'N/A';
  const totalCO2 = machineList.reduce(
    (sum, m) => sum + (m.carbon?.co2_rate_kg_hr || 0), 0
  );

  const formatUptime = (s) => {
    if (s == null) return '—';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const tiles = [
    { label: 'Total ₹/hr Loss',    value: `₹${Math.round(totalLoss)}` },
    { label: 'Active Incidents',   value: activeIncidents },
    { label: 'Mean Confidence',    value: meanConfidence || 'N/A' },
    { label: 'CO₂ Rate (kg/hr)',   value: totalCO2.toFixed(1) },
    { label: 'Server Uptime',      value: formatUptime(uptime) },
    { label: 'Machines Tracked',   value: machineList.length }
  ];

  return (
    <div className="kpi-tiles">
      {tiles.map((tile) => (
        <div className="kpi-tile" key={tile.label}>
          <div className="kpi-value">{tile.value}</div>
          <div className="kpi-label">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
