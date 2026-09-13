'use strict';

const { detect } = require('../../engine/anomalyEngine');

describe('AnomalyEngine — detect()', () => {
  test('Test 1 — Empty baseline returns not-ready', () => {
    const r = detect({ kw: 50, temp: 80 }, { mean: 0, stdev: 0, count: 0 });
    expect(r.isAnomaly).toBe(false);
    expect(r.reason).toBe('BASELINE_NOT_READY');
  });

  test('Test 2 — Normal reading', () => {
    const r = detect({ kw: 51, temp: 80 }, { mean: 51.2, stdev: 2.4, count: 20 });
    expect(r.isAnomaly).toBe(false);
    expect(r.flags).toEqual([]);
  });

  test('Test 3 — High-power anomaly', () => {
    const r = detect({ kw: 85, temp: 80 }, { mean: 51.2, stdev: 2.4, count: 20 });
    expect(r.isAnomaly).toBe(true);
    expect(r.flags).toContain('ENERGY_WASTE');
    expect(r.zKw).toBeCloseTo(14.08, 1);
  });

  test('Test 4 — Low-power anomaly', () => {
    const r = detect({ kw: 20, temp: 80 }, { mean: 51.2, stdev: 2.4, count: 20 });
    expect(r.isAnomaly).toBe(true);
    expect(r.flags).toContain('OPERATIONAL_ANOMALY');
    expect(r.zKw).toBeCloseTo(-13, 0);
  });

  test('Test 5 — Zero-sigma, non-zero mean (stable machine)', () => {
    const r = detect({ kw: 50, temp: 80 }, { mean: 50, stdev: 0, count: 20 });
    expect(r.zKw).toBe(0);
    expect(r.isAnomaly).toBe(false);
  });

  test('Test 6 — Zero-sigma, non-zero reading', () => {
    const r = detect({ kw: 100, temp: 80 }, { mean: 50, stdev: 0, count: 20 });
    expect(r.isAnomaly).toBe(true);
    expect(r.flags).toContain('ENERGY_WASTE');
  });

  test('Test 7 — Zero-mean, zero-sigma, zero reading (legitimate idle)', () => {
    const r = detect({ kw: 0, temp: 25 }, { mean: 0, stdev: 0, count: 5 });
    expect(r.isAnomaly).toBe(false);
    expect(r.reason).toBe('NORMAL');
  });

  test('Test 8 — Zero-mean, zero-sigma, non-zero reading', () => {
    const r = detect({ kw: 5, temp: 25 }, { mean: 0, stdev: 0, count: 5 });
    expect(r.isAnomaly).toBe(false);
    expect(r.reason).toBe('ZERO_BASELINE_DEVIATION');
    expect(r.flags).toContain('ZERO_BASELINE_DEVIATION');
  });

  test('Test 9 — Result object is immutable', () => {
    const baseline = { mean: 51.2, stdev: 2.4, count: 20 };
    const before = JSON.stringify(baseline);
    detect({ kw: 85, temp: 80 }, baseline);
    expect(JSON.stringify(baseline)).toBe(before);
  });

  test('Test 10 — Temperature contributes to output but does not trigger anomaly', () => {
    const r = detect({ kw: 51, temp: 200 }, { mean: 51.2, stdev: 2.4, count: 20 });
    expect(r.isAnomaly).toBe(false);
    expect(r.zTemp).toBeGreaterThan(2);
  });
});
