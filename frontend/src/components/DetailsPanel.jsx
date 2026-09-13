import React from 'react';
import { useStore } from '../store.js';
import { postAcknowledge, postClaimFixed, fetchSnapshot } from '../api.js';

export default function DetailsPanel() {
  const selectedMachineId = useStore((s) => s.selectedMachineId);
  const machine  = useStore((s) => s.machines[s.selectedMachineId]);
  const incident = useStore((s) => s.incidents[s.selectedMachineId]);
  const clearSelection = useStore((s) => s.clearSelection);
  const setSnapshot    = useStore((s) => s.setSnapshot);

  if (!selectedMachineId) return null;

  async function refresh() {
    try {
      const { machines } = await fetchSnapshot();
      setSnapshot(machines);
    } catch { /* silent */ }
  }

  async function handleAcknowledge() {
    await postAcknowledge(selectedMachineId);
    await refresh();
  }

  async function handleClaimFixed() {
    await postClaimFixed(selectedMachineId);
    await refresh();
  }

  return (
    <div className="details-overlay" onClick={(e) => { if (e.target === e.currentTarget) clearSelection(); }}>
      <div className="details-panel">
        <div className="details-header">
          <h2>Machine {selectedMachineId}</h2>
          <button className="close-btn" onClick={clearSelection} aria-label="Close">✕</button>
        </div>

        <div className="details-body">
          <div className="details-row">
            <span className="details-label">kW (current)</span>
            <span>{machine?.metrics?.excess_kw?.toFixed(2) ?? '—'}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Baseline Mean</span>
            <span>{machine?.baseline_mean != null ? machine.baseline_mean.toFixed(2) : '—'}</span>
          </div>
          <div className="details-row">
            <span className="details-label">₹/hr Loss</span>
            <span>₹{machine?.metrics?.loss_rupees_per_hour?.toFixed(0) ?? '—'}</span>
          </div>
          <div className="details-row">
            <span className="details-label">CO₂ Rate</span>
            <span>{machine?.carbon?.co2_rate_kg_hr?.toFixed(3) ?? '—'} kg/hr</span>
          </div>
          <div className="details-row">
            <span className="details-label">Anomaly</span>
            <span>
              {machine?.anomaly?.is_anomaly
                ? `⚠ ${machine.anomaly.flags.join(', ')}`
                : 'None'}
            </span>
          </div>
          <div className="details-row">
            <span className="details-label">Confidence</span>
            <span>{machine?.metrics?.confidence ?? 'N/A'}</span>
          </div>

          {incident && (
            <div className="incident-section">
              <h3>Active Incident</h3>
              <div className="details-row">
                <span className="details-label">Status</span>
                <span className={`incident-badge incident-badge--${incident.status.toLowerCase()}`}>
                  {incident.status}
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">Flags</span>
                <span>{incident.flags.join(', ')}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Max Streak</span>
                <span>{incident.max_anomaly_streak}</span>
              </div>
              <div className="details-actions">
                {incident.status === 'OPEN' && (
                  <button className="action-btn action-btn--warn" onClick={handleAcknowledge}>
                    Acknowledge
                  </button>
                )}
                {incident.status === 'ACKNOWLEDGED' && (
                  <button className="action-btn action-btn--info" onClick={handleClaimFixed}>
                    Claim Fixed
                  </button>
                )}
                {incident.status === 'VERIFYING' && (
                  <span className="verifying-note">Verifying repair…</span>
                )}
              </div>
            </div>
          )}

          {!incident && (
            <div className="no-incident">No active incident</div>
          )}
        </div>
      </div>
    </div>
  );
}
