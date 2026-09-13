'use strict';

class IncidentEngine {
  constructor() {
    this.active = new Map();
    this.history = new Map();

    this._NORMAL_RUN_THRESHOLD = parseInt(process.env.NORMAL_RUN_THRESHOLD ?? '3', 10);
    this._VERIFY_COUNT = parseInt(process.env.VERIFY_COUNT ?? '10', 10);
    this._VERIFY_COUNT_DEMO = parseInt(process.env.VERIFY_COUNT_DEMO ?? '3', 10);
    this._VERIFY_TIMEOUT_MS = parseInt(process.env.VERIFY_TIMEOUT_MS ?? '300000', 10);
    this._DRIFT_THRESHOLD = parseFloat(process.env.DRIFT_THRESHOLD ?? '0.10');
    this._DEMO_MODE = (process.env.DEMO_MODE ?? 'false') === 'true';
  }

  verifyCount() {
    return this._DEMO_MODE ? this._VERIFY_COUNT_DEMO : this._VERIFY_COUNT;
  }

  _uuid() {
    return `inc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  _close(incident, reason) {
    incident.status = 'CLOSED';
    incident.closeReason = reason;
    incident.closedAt = Date.now();

    this.active.delete(incident.machine_id);

    if (!this.history.has(incident.machine_id)) {
      this.history.set(incident.machine_id, []);
    }
    this.history.get(incident.machine_id).push(incident);

    return { type: 'INCIDENT_CLOSED', incident_id: incident.id, timestamp: incident.closedAt, reason };
  }

  getActive(machine_id) {
    return this.active.get(machine_id) ?? null;
  }

  getHistory(machine_id) {
    return this.history.get(machine_id) ?? [];
  }

  apply(reading, anomaly, drift = null) {
    const { machine_id, operating_state } = reading;
    const lifecycleEvents = [];
    let incident = this.active.get(machine_id) ?? null;

    if (!incident) {
      if (!anomaly.isAnomaly) {
        return { incident: null, lifecycleEvents: [] };
      }

      // Create new incident
      incident = {
        id: this._uuid(),
        machine_id,
        operating_state,
        status: 'OPEN',
        closeReason: null,
        flags: new Set(anomaly.flags),
        anomalyStreak: 1,
        maxAnomalyStreak: 1,
        normalRunLength: 0,
        verificationCounter: 0,
        verificationSamples: [],
        startedAt: Date.now(),
        closedAt: null,
        verificationStartedAt: null,
        state_change_during_repair: false
      };

      this.active.set(machine_id, incident);
      lifecycleEvents.push({ type: 'INCIDENT_CREATED', incident_id: incident.id, timestamp: incident.startedAt });
      return { incident, lifecycleEvents };
    }

    // Active incident exists
    if (anomaly.isAnomaly) {
      incident.anomalyStreak += 1;
      incident.maxAnomalyStreak = Math.max(incident.maxAnomalyStreak, incident.anomalyStreak);
      incident.normalRunLength = 0;
      for (const flag of anomaly.flags) {
        incident.flags.add(flag);
      }

      if (incident.status === 'VERIFYING') {
        incident.verificationCounter = 0;
        incident.verificationSamples = [];
      }

      return { incident, lifecycleEvents: [] };
    }

    // Normal reading
    incident.anomalyStreak = 0;
    incident.normalRunLength += 1;

    if (incident.status === 'OPEN' && incident.normalRunLength >= this._NORMAL_RUN_THRESHOLD) {
      const ev = this._close(incident, 'UNACKNOWLEDGED_SELF_RECOVERY');
      lifecycleEvents.push(ev);
      return { incident: null, lifecycleEvents };
    }

    if (incident.status === 'VERIFYING') {
      // Check timeout first
      if ((Date.now() - incident.verificationStartedAt) > this._VERIFY_TIMEOUT_MS) {
        incident.status = 'ACKNOWLEDGED';
        incident.verificationCounter = 0;
        incident.verificationSamples = [];
        lifecycleEvents.push({ type: 'VERIFICATION_TIMEOUT', incident_id: incident.id, timestamp: Date.now() });
        return { incident, lifecycleEvents };
      }

      if (reading.operating_state === incident.operating_state) {
        if (incident.verificationSamples.length < 20) {
          incident.verificationSamples.push({ kw: reading.kw, timestamp: reading.timestamp });
        }
        incident.verificationCounter += 1;

        if (incident.verificationCounter >= this.verifyCount()) {
          const closeReason =
            drift && drift.drift > this._DRIFT_THRESHOLD
              ? 'REPAIRED_WITH_DRIFT'
              : 'REPAIRED_CLEAN';
          const ev = this._close(incident, closeReason);
          lifecycleEvents.push(ev);
          return { incident: null, lifecycleEvents };
        }
      }
    }

    return { incident, lifecycleEvents: [] };
  }

  onStateChange(machine_id, prevState, newState) {
    const lifecycleEvents = [];
    const incident = this.active.get(machine_id);

    if (!incident) return [];

    if (incident.status === 'OPEN') {
      const ev = this._close(incident, 'STATE_CHANGE');
      lifecycleEvents.push(ev);
      return lifecycleEvents;
    }

    if (incident.status === 'VERIFYING') {
      incident.status = 'ACKNOWLEDGED';
      incident.state_change_during_repair = true;
      incident.verificationCounter = 0;
      incident.verificationSamples = [];
      lifecycleEvents.push({ type: 'VERIFICATION_INTERRUPTED_BY_STATE_CHANGE', incident_id: incident.id, timestamp: Date.now() });
      return lifecycleEvents;
    }

    if (incident.status === 'ACKNOWLEDGED') {
      return [];
    }

    return lifecycleEvents;
  }

  acknowledge(machine_id) {
    const incident = this.active.get(machine_id);
    if (!incident || incident.status !== 'OPEN') return null;
    incident.status = 'ACKNOWLEDGED';
    return incident;
  }

  claimFixed(machine_id) {
    const incident = this.active.get(machine_id);
    if (!incident || incident.status !== 'ACKNOWLEDGED') return null;
    incident.status = 'VERIFYING';
    incident.verificationCounter = 0;
    incident.verificationSamples = [];
    incident.verificationStartedAt = Date.now();
    return incident;
  }
  restoreActive(incident) {
    this.active.set(incident.machine_id, incident);
  }

  restoreHistory(machineId, incidents) {
    this.history.set(machineId, incidents);
  }
}

module.exports = { IncidentEngine };
