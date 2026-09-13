'use strict';

const { IncidentEngine } = require('../../engine/incidentEngine');

describe('IncidentEngine', () => {
  test('Test 1 — First anomaly creates an OPEN incident', () => {
    const e = new IncidentEngine();
    const { incident } = e.apply(
      { machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' },
      { isAnomaly: true, flags: ['ENERGY_WASTE'] }
    );
    expect(incident.status).toBe('OPEN');
    expect(incident.anomalyStreak).toBe(1);
  });

  test('Test 2 — Subsequent anomaly updates the same incident', () => {
    const e = new IncidentEngine();
    e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: true, flags: ['ENERGY_WASTE'] });
    const { incident } = e.apply(
      { machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' },
      { isAnomaly: true, flags: ['ENERGY_WASTE'] }
    );
    expect(incident.anomalyStreak).toBe(2);
  });

  test('Test 3 — Three consecutive normals auto-close an OPEN incident', () => {
    const e = new IncidentEngine();
    e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: true, flags: ['ENERGY_WASTE'] });
    e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: false, flags: [] });
    e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: false, flags: [] });
    const { incident, lifecycleEvents } = e.apply(
      { machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' },
      { isAnomaly: false, flags: [] }
    );
    expect(incident).toBe(null);
    expect(lifecycleEvents.some(ev => ev.type === 'INCIDENT_CLOSED' && ev.reason === 'UNACKNOWLEDGED_SELF_RECOVERY')).toBe(true);
  });

  test('Test 4 — State change closes an OPEN incident', () => {
    const e = new IncidentEngine();
    e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: true, flags: ['ENERGY_WASTE'] });
    const events = e.onStateChange('M1', 'ACTIVE_CUTTING', 'IDLE');
    expect(events.some(ev => ev.reason === 'STATE_CHANGE')).toBe(true);
    expect(e.getActive('M1')).toBe(null);
  });

  test('Test 5 — State change during VERIFYING returns to ACKNOWLEDGED', () => {
    const e = new IncidentEngine();
    e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: true, flags: ['ENERGY_WASTE'] });
    e.acknowledge('M1');
    e.claimFixed('M1');
    const events = e.onStateChange('M1', 'ACTIVE_CUTTING', 'IDLE');
    expect(events.some(ev => ev.type === 'VERIFICATION_INTERRUPTED_BY_STATE_CHANGE')).toBe(true);
    expect(e.getActive('M1').status).toBe('ACKNOWLEDGED');
    expect(e.getActive('M1').verificationCounter).toBe(0);
  });

  test('Test 6 — Acknowledge moves OPEN to ACKNOWLEDGED', () => {
    const e = new IncidentEngine();
    e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: true, flags: ['ENERGY_WASTE'] });
    const i = e.acknowledge('M1');
    expect(i.status).toBe('ACKNOWLEDGED');
  });

  test('Test 7 — Claim fixed moves ACKNOWLEDGED to VERIFYING', () => {
    const e = new IncidentEngine();
    e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: true, flags: ['ENERGY_WASTE'] });
    e.acknowledge('M1');
    const i = e.claimFixed('M1');
    expect(i.status).toBe('VERIFYING');
  });

  test('Test 8 — Ten normal readings in VERIFYING closes as REPAIRED_CLEAN', () => {
    const e = new IncidentEngine();
    e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: true, flags: ['ENERGY_WASTE'] });
    e.acknowledge('M1');
    e.claimFixed('M1');
    for (let i = 0; i < 10; i++) {
      e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: false, flags: [] });
    }
    expect(e.getActive('M1')).toBe(null);
    const history = e.getHistory('M1');
    expect(history[history.length - 1].closeReason).toBe('REPAIRED_CLEAN');
  });

  test('Test 9 — Close moves incident to history', () => {
    const e = new IncidentEngine();
    e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: true, flags: ['ENERGY_WASTE'] });
    e.onStateChange('M1', 'ACTIVE_CUTTING', 'IDLE');
    expect(e.getHistory('M1').length).toBe(1);
    expect(e.getActive('M1')).toBe(null);
  });

  test('Test 10 — Verification sample cap is enforced', () => {
    const original = process.env.VERIFY_COUNT;
    process.env.VERIFY_COUNT = '50';
    const e = new IncidentEngine();
    process.env.VERIFY_COUNT = original;

    e.apply({ machine_id: 'M1', operating_state: 'ACTIVE_CUTTING' }, { isAnomaly: true, flags: ['ENERGY_WASTE'] });
    e.acknowledge('M1');
    e.claimFixed('M1');

    for (let i = 0; i < 30; i++) {
      e.apply(
        { machine_id: 'M1', operating_state: 'ACTIVE_CUTTING', kw: 50, timestamp: Date.now() + i },
        { isAnomaly: false, flags: [] }
      );
    }

    const incident = e.getActive('M1');
    // May be closed already if count hit 50, or still open; either way samples never exceed 20
    const samples = incident
      ? incident.verificationSamples.length
      : e.getHistory('M1').slice(-1)[0]?.verificationSamples.length ?? 0;
    expect(samples).toBeLessThanOrEqual(20);
  });
});
