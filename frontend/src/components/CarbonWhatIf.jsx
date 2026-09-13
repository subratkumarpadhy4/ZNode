import React from 'react';
import { useStore } from '../store.js';

const SCENARIOS = [
  { name: 'Grid Mix',       ci: 0.716, type: 'baseline'   },
  { name: 'Solar-heavy',   ci: 0.400, type: 'avoided'    },
  { name: 'Full Renewable', ci: 0.000, type: 'avoided'    },
  { name: 'Diesel Backup',  ci: 0.850, type: 'additional' }
];

export default function CarbonWhatIf() {
  const machines = useStore((s) => s.machines);
  const selectedMachineId = useStore((s) => s.selectedMachineId);

  const list = Object.values(machines);

  let currentKw;
  let sourceLabel;
  if (selectedMachineId && machines[selectedMachineId]) {
    currentKw    = machines[selectedMachineId].metrics?.excess_kw || 0;
    sourceLabel  = `Machine ${selectedMachineId}`;
  } else {
    currentKw    = Math.max(...list.map((m) => m.metrics?.excess_kw || 0), 0);
    sourceLabel  = 'Highest-kW machine';
  }

  const baselineCO2 = currentKw * 0.716;

  return (
    <div className="tab-content" style={{ marginTop: 16 }}>
      <h2 className="section-title">Carbon What-If</h2>
      <p className="whatif-label">
        Based on: <strong>{sourceLabel}</strong> — {currentKw.toFixed(1)} kW
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>CI (kg/kWh)</th>
            <th>CO₂ at load (kg/hr)</th>
            <th>vs. Grid</th>
          </tr>
        </thead>
        <tbody>
          {SCENARIOS.map((s) => {
            const co2 = currentKw * s.ci;
            const delta = co2 - baselineCO2;
            let deltaLabel = '—';
            let deltaClass = 'whatif-baseline';
            if (s.type === 'avoided') {
              deltaLabel = `↓ ${Math.abs(delta).toFixed(3)} kg/hr saved`;
              deltaClass = 'whatif-avoided';
            } else if (s.type === 'additional') {
              deltaLabel = `↑ ${Math.abs(delta).toFixed(3)} kg/hr extra`;
              deltaClass = 'whatif-additional';
            }
            return (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td>{s.ci.toFixed(3)}</td>
                <td>{co2.toFixed(3)}</td>
                <td className={deltaClass}>{deltaLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
