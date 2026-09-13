'use strict';

const { computeLoss, computeEnergyIntensity, computeEpochROI, computeConfidence } = require('../../engine/metricsEngine');

describe('MetricsEngine', () => {
  test('Test 1 — computeLoss with excess kW', () => {
    const r = computeLoss({ kw: 85 }, { mean: 51.2 }, 9);
    expect(r.excess_kw).toBeCloseTo(33.8, 1);
    expect(r.loss_rupees_per_hour).toBeCloseTo(304.2, 0);
  });

  test('Test 2 — computeLoss with no excess', () => {
    const r = computeLoss({ kw: 50 }, { mean: 51.2 }, 9);
    expect(r.excess_kw).toBe(0);
    expect(r.loss_rupees_per_hour).toBe(0);
  });

  test('Test 3 — computeEnergyIntensity with valid inputs', () => {
    const r = computeEnergyIntensity(100, 10);
    expect(r.value).toBeCloseTo(10.0, 5);
    expect(r.guards).toEqual([]);
  });

  test('Test 4 — computeEnergyIntensity with zero units', () => {
    const r = computeEnergyIntensity(100, 0);
    expect(r.value).toBeNull();
    expect(r.guards).toContain('INVALID_UNITS_PRODUCED');
  });

  test('Test 5 — computeEnergyIntensity with zero kWh', () => {
    const r = computeEnergyIntensity(0, 10);
    expect(r.value).toBeNull();
    expect(r.guards).toContain('INVALID_PRODUCTIVE_KWH');
  });

  test('Test 6 — computeEpochROI with valid inputs', () => {
    const prev = { machine_id: 'M1', operating_state: 'ACTIVE_CUTTING', machine_type: 'CNC', productive_kwh: 100, units_produced: 10 };
    const curr = { machine_id: 'M1', operating_state: 'ACTIVE_CUTTING', machine_type: 'CNC', productive_kwh: 20, units_produced: 10 };
    const r = computeEpochROI(prev, curr);
    expect(r.value).toBeCloseTo(0.80, 5);
    expect(r.guards).toEqual([]);
  });

  test('Test 7 — computeEpochROI with machine mismatch', () => {
    const prev = { machine_id: 'M1', operating_state: 'ACTIVE_CUTTING', machine_type: 'CNC', productive_kwh: 100, units_produced: 10 };
    const curr = { machine_id: 'M2', operating_state: 'ACTIVE_CUTTING', machine_type: 'CNC', productive_kwh: 20, units_produced: 10 };
    const r = computeEpochROI(prev, curr);
    expect(r.value).toBeNull();
    expect(r.guards).toContain('MACHINE_MISMATCH');
  });

  test('Test 8 — computeEpochROI with insufficient units', () => {
    const prev = { machine_id: 'M1', operating_state: 'ACTIVE_CUTTING', machine_type: 'CNC', productive_kwh: 100, units_produced: 3 };
    const curr = { machine_id: 'M1', operating_state: 'ACTIVE_CUTTING', machine_type: 'CNC', productive_kwh: 20, units_produced: 10 };
    const r = computeEpochROI(prev, curr);
    expect(r.value).toBeNull();
    const hasGuard = r.guards.includes('INSUFFICIENT_PREV_UNITS') || r.guards.includes('INSUFFICIENT_CURR_UNITS');
    expect(hasGuard).toBe(true);
  });

  test('Test 9 — computeConfidence with all three signatures', () => {
    const r = computeConfidence(
      { zKw: 5, zTemp: 3 },
      { maxAnomalyStreak: 4 }
    );
    expect(r.level).toBe('HIGH');
    expect(r.signatures_matched).toBe(3);
  });

  test('Test 10 — computeConfidence with only power signature', () => {
    const r = computeConfidence(
      { zKw: 5, zTemp: 1 },
      { maxAnomalyStreak: 1 }
    );
    expect(r.level).toBe('LOW');
    expect(r.signatures_matched).toBe(1);
  });
});
