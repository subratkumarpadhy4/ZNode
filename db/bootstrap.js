'use strict';

function bootstrap(persistence, context) {
  const { machineRegistry, incidentEngine } = context;

  // 1. Hydrate machine state
  const rows = persistence.loadMachines();
  for (const row of rows) {
    const machine = machineRegistry[row.id];
    if (!machine) continue;
    machine.lastOperatingState = row.last_operating_state ?? undefined;
    machine.pendingStateChangeEvents = [];
  }

  // 2. Hydrate active incidents
  const activeIncidents = persistence.loadActiveIncidents();
  for (const row of activeIncidents) {
    const incident = {
      id: row.id,
      machine_id: row.machine_id,
      operating_state: row.operating_state,
      status: row.state,
      closeReason: row.close_reason,
      flags: new Set(JSON.parse(row.flags)),
      anomalyStreak: row.anomaly_streak,
      maxAnomalyStreak: row.max_anomaly_streak,
      normalRunLength: row.normal_run_length,
      verificationCounter: row.verification_counter,
      verificationSamples: [],
      startedAt: row.created_at,
      closedAt: null,
      verificationStartedAt: null,
      state_change_during_repair: false
    };
    incidentEngine.restoreActive(incident);
  }

  // 3. Hydrate closed incident history per machine
  for (const machineId of Object.keys(machineRegistry)) {
    const closed = persistence.loadClosedIncidents(machineId, 100);
    incidentEngine.restoreHistory(machineId, closed.map(row => ({
      ...row,
      status: row.state,
      flags: new Set(JSON.parse(row.flags))
    })));
  }
}

module.exports = { bootstrap };
