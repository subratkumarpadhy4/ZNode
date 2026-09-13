import React from 'react';
import { useStore } from '../store.js';

const CI = 0.716; // current grid carbon intensity

export default function EmissionsTab() {
  const machines = useStore((s) => s.machines);
  const list = Object.values(machines);

  const totalCO2 = list.reduce((sum, m) => sum + (m.carbon?.co2_rate_kg_hr || 0), 0);

  return (
    <div className="tab-content">
      <h2 className="section-title">Emissions</h2>

      <div className="kpi-row">
        <div className="kpi-tile">
          <div className="kpi-value">{totalCO2.toFixed(2)}</div>
          <div className="kpi-label">Total CO₂ kg/hr</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-value">{CI}</div>
          <div className="kpi-label">Grid CI (kg/kWh)</div>
        </div>
      </div>

      <table className="data-table" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>Machine</th>
            <th>CO₂ Rate (kg/hr)</th>
            <th>CI (kg/kWh)</th>
            <th>kW</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan={4} className="feed-empty">Waiting for data…</td></tr>
          ) : (
            list.map((m) => (
              <tr key={m.machine_id}>
                <td className="feed-machine">{m.machine_id}</td>
                <td>{m.carbon?.co2_rate_kg_hr?.toFixed(3) ?? '—'}</td>
                <td>{CI}</td>
                <td>{m.metrics?.excess_kw?.toFixed(2) ?? '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
