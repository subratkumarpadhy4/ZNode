'use strict';

const { detect } = require('../engine/anomalyEngine');
const metricsEngine = require('../engine/metricsEngine');
const carbonEngine = require('../engine/carbonEngine');

class SettlingTracker {
  constructor() { this.active = new Map(); }
  start(machine_id, durationMs) { this.active.set(machine_id, { until: Date.now() + durationMs }); }
  isActive(machine_id) { const t = this.active.get(machine_id); return t && Date.now() < t.until; }
  clear(machine_id) { this.active.delete(machine_id); }
}

function processReading(reading, context) {
  const { baselineStore, incidentEngine, config, machineRegistry, settling } = context;

  // STEP 0 — machine must exist
  const machine = machineRegistry[reading.machine_id];
  if (!machine) {
    return { status: 'REJECTED', reason: 'UNKNOWN_MACHINE' };
  }

  // STEP 1 — state change detection
  const prevState = machine.lastOperatingState;

  if (prevState === undefined) {
    machine.lastOperatingState = reading.operating_state;
    machine.pendingStateChangeEvents = [];
    if (context.persistence) {
      context.persistence.upsertMachine({
        id: reading.machine_id,
        type: machine.type,
        energy_source: machine.energy,
        last_operating_state: reading.operating_state
      });
    }
  } else if (prevState !== reading.operating_state) {
    const stateChangeEvents = incidentEngine.onStateChange(
      reading.machine_id, prevState, reading.operating_state
    );
    machine.lastOperatingState = reading.operating_state;
    settling.start(reading.machine_id, config.settlingMs);
    machine.pendingStateChangeEvents = stateChangeEvents;
    if (context.persistence) {
      context.persistence.upsertMachine({
        id: reading.machine_id,
        type: machine.type,
        energy_source: machine.energy,
        last_operating_state: reading.operating_state
      });
    }
  }

  // STEP 2 — settling check
  if (settling.isActive(reading.machine_id)) {
    const events = machine.pendingStateChangeEvents || [];
    machine.pendingStateChangeEvents = [];
    return { status: 'SETTLING', machine: reading.machine_id, lifecycleEvents: events };
  }

  // STEP 3 — baseline lookup
  const baseline = baselineStore.get(reading.machine_id, reading.operating_state);

  // STEP 4 — anomaly detection
  const anomaly = detect(reading, baseline);

  // STEP 5 — incident update (with drift if verifying)
  let drift = null;
  const activeIncident = incidentEngine.getActive(reading.machine_id);
  if (activeIncident && activeIncident.status === 'VERIFYING') {
    drift = baselineStore.getDrift(reading.machine_id, reading.operating_state);
  }
  const { incident, lifecycleEvents } = incidentEngine.apply(reading, anomaly, drift);

  // Persist incident state (incident is null when closed; activeIncident is same object with CLOSED status)
  if (context.persistence) {
    const toSave = incident ?? activeIncident;
    if (toSave) context.persistence.upsertIncident(toSave);
  }

  // STEP 6 — metrics
  const loss = metricsEngine.computeLoss(reading, baseline, config.current_tariff);
  const confidence = metricsEngine.computeConfidence(anomaly, incident || activeIncident);

  // STEP 7 — carbon
  const carbon = carbonEngine.computeScope2(reading, {
    current_CI: config.current_CI,
    current_tariff: config.current_tariff
  });

  // STEP 8 — update baseline ONLY if NORMAL
  if (!anomaly.isAnomaly) {
    baselineStore.update(reading.machine_id, reading.operating_state, reading.kw);
  }

  // STEP 9 — return
  return {
    status: 'OK',
    machine: reading.machine_id,
    anomaly,
    incident,
    metrics: { loss, confidence },
    carbon,
    lifecycleEvents
  };
}

module.exports = { processReading, SettlingTracker };
