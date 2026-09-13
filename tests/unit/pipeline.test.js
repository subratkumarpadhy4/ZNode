'use strict';

const { processReading, SettlingTracker } = require('../../services/orchestrator');
const { BaselineStore } = require('../../engine/baselineStore');
const { IncidentEngine } = require('../../engine/incidentEngine');

function makeContext() {
  return {
    baselineStore: new BaselineStore(),
    incidentEngine: new IncidentEngine(),
    settling: new SettlingTracker(),
    config: {
      current_CI: 0.716,
      current_tariff: 9,
      settlingMs: 100,
      scenarios: [{ name: 'solar', CI: 0.4 }]
    },
    machineRegistry: {
      M1: { type: 'CNC', energy: 'ELECTRIC', allowed_states: ['IDLE', 'ACTIVE_CUTTING'], lastOperatingState: undefined },
      M2: { type: 'FURNACE', energy: 'DIESEL', allowed_states: ['IDLE', 'ACTIVE_BURN'], lastOperatingState: undefined }
    }
  };
}

function normalReading(override = {}) {
  return { machine_id: 'M1', operating_state: 'ACTIVE_CUTTING', kw: 50, temp: 80, timestamp: Date.now(), ...override };
}

describe('Pipeline (Orchestrator)', () => {
  test('Test 1 — First reading initializes lastOperatingState', () => {
    const ctx = makeContext();
    processReading(normalReading(), ctx);
    expect(ctx.machineRegistry.M1.lastOperatingState).toBe('ACTIVE_CUTTING');
  });

  test('Test 2 — First reading returns OK with BASELINE_NOT_READY', () => {
    const ctx = makeContext();
    const result = processReading(normalReading(), ctx);
    expect(result.status).toBe('OK');
    expect(result.anomaly.reason).toBe('BASELINE_NOT_READY');
  });

  test('Test 3 — Second reading updates baseline to count 2', () => {
    const ctx = makeContext();
    processReading(normalReading(), ctx);
    processReading(normalReading(), ctx);
    const b = ctx.baselineStore.get('M1', 'ACTIVE_CUTTING');
    expect(b.count).toBe(2);
  });

  test('Test 4 — Anomalous reading after calibration creates OPEN incident', () => {
    const ctx = makeContext();
    for (let i = 0; i < 5; i++) processReading(normalReading(), ctx);
    const result = processReading(normalReading({ kw: 500 }), ctx);
    expect(result.status).toBe('OK');
    expect(result.incident.status).toBe('OPEN');
  });

  test('Test 5 — State change closes OPEN incident, returns SETTLING with INCIDENT_CLOSED', () => {
    const ctx = makeContext();
    // build baseline
    for (let i = 0; i < 5; i++) processReading(normalReading(), ctx);
    // create incident
    processReading(normalReading({ kw: 500 }), ctx);
    // state change
    const result = processReading(normalReading({ operating_state: 'IDLE', kw: 5 }), ctx);
    expect(result.status).toBe('SETTLING');
    expect(result.lifecycleEvents.some(ev => ev.type === 'INCIDENT_CLOSED')).toBe(true);
  });

  test('Test 6 — Reading within settling window returns SETTLING', () => {
    const ctx = makeContext();
    processReading(normalReading(), ctx);
    // trigger state change → settling starts
    processReading(normalReading({ operating_state: 'IDLE', kw: 5 }), ctx);
    // immediately send another reading in same window
    const result = processReading(normalReading({ operating_state: 'IDLE', kw: 5 }), ctx);
    expect(result.status).toBe('SETTLING');
  });

  test('Test 7 — Reading after settling window expires returns OK', async () => {
    const ctx = makeContext();
    processReading(normalReading(), ctx);
    // trigger state change → settling window of 100ms
    processReading(normalReading({ operating_state: 'IDLE', kw: 5 }), ctx);
    // wait for settling to expire
    await new Promise(r => setTimeout(r, 150));
    const result = processReading(normalReading({ operating_state: 'IDLE', kw: 5 }), ctx);
    expect(result.status).toBe('OK');
  });

  test('Test 8 — Full verification flow closes as REPAIRED_CLEAN', () => {
    const ctx = makeContext();
    // calibrate baseline
    for (let i = 0; i < 10; i++) processReading(normalReading(), ctx);
    // spike → incident
    processReading(normalReading({ kw: 500 }), ctx);
    ctx.incidentEngine.acknowledge('M1');
    ctx.incidentEngine.claimFixed('M1');
    // verify with 10 normal readings
    let lastResult;
    for (let i = 0; i < 10; i++) {
      lastResult = processReading(normalReading(), ctx);
    }
    expect(lastResult.lifecycleEvents.some(
      ev => ev.type === 'INCIDENT_CLOSED' && ev.reason === 'REPAIRED_CLEAN'
    )).toBe(true);
  });

  test('Test 9 — Carbon output is correct', () => {
    const ctx = makeContext();
    const reading = normalReading({ kw: 75 });
    const result = processReading(reading, ctx);
    expect(result.status).toBe('OK');
    expect(result.carbon.co2_rate_kg_hr).toBeCloseTo(75 * 0.716, 5);
  });

  test('Test 10 — Baseline is not updated on anomaly', () => {
    const ctx = makeContext();
    // build baseline
    for (let i = 0; i < 5; i++) processReading(normalReading(), ctx);
    const beforeMean = ctx.baselineStore.get('M1', 'ACTIVE_CUTTING').mean;
    // send spike
    processReading(normalReading({ kw: 500 }), ctx);
    const afterMean = ctx.baselineStore.get('M1', 'ACTIVE_CUTTING').mean;
    expect(afterMean).toBe(beforeMean);
  });
});
