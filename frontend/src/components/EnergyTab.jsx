import React from 'react';
import { useStore } from '../store.js';

export default function EnergyTab() {
  const machines = useStore((s) => s.machines);
  const list = Object.values(machines);

  return (
    <div className="tab-content">
      <h2 className="section-title">Energy Analytics</h2>

      <table className="data-table">
        <thead>
          <tr>
            <th>Machine</th>
            <th>kW (current)</th>
            <th>Baseline Mean (kW)</th>
            <th>Excess kW</th>
            <th>₹/hr Loss</th>
            <th>Anomaly</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan={6} className="feed-empty">Waiting for data…</td></tr>
          ) : (
            list.map((m) => {
              const kw = m.metrics?.excess_kw ?? 0;
              const mean = m.baseline_mean ?? 0;
              const excess = mean > 0 ? Math.max(0, kw - mean) : kw;
              return (
                <tr key={m.machine_id} className={m.anomaly?.is_anomaly ? 'row-anomaly' : ''}>
                  <td className="feed-machine">{m.machine_id}</td>
                  <td>{kw.toFixed(2)}</td>
                  <td>{mean.toFixed(2)}</td>
                  <td>{excess.toFixed(2)}</td>
                  <td>₹{m.metrics?.loss_rupees_per_hour?.toFixed(0) ?? '—'}</td>
                  <td>
                    {m.anomaly?.is_anomaly
                      ? <span style={{ color: '#f59e0b' }}>⚠ {m.anomaly.flags.join(', ')}</span>
                      : <span style={{ color: '#22c55e' }}>OK</span>}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="session-intensity">
        <h3>Session Intensity</h3>
        <p>Session intensity: N/A <span className="hint">(tracked from Step 12)</span></p>
      </div>
    </div>
  );
}
