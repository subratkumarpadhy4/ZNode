'use strict';

const { BaselineStore } = require('../../engine/baselineStore');

describe('BaselineStore', () => {
  let store;

  beforeEach(() => {
    store = new BaselineStore();
  });

  test('Test 1 — Empty segment returns default', () => {
    expect(store.get('M1', 'ACTIVE_CUTTING')).toEqual({ mean: 0, stdev: 0, count: 0 });
  });

  test('Test 2 — Welford produces correct mean and stdev', () => {
    const values = [50, 51, 49, 50, 52, 51, 50, 49, 50, 51];
    for (const v of values) {
      store.update('M1', 'ACTIVE_CUTTING', v);
    }
    const b = store.get('M1', 'ACTIVE_CUTTING');
    expect(b.mean).toBeCloseTo(50.3, 1);
    expect(b.stdev).toBeCloseTo(0.9, 1);
    expect(b.count).toBe(10);
  });

  test('Test 3 — Segments are isolated', () => {
    for (let i = 0; i < 5; i++) store.update('M1', 'ACTIVE_CUTTING', 50);
    for (let i = 0; i < 5; i++) store.update('M2', 'ACTIVE_BURN', 100);

    const m1 = store.get('M1', 'ACTIVE_CUTTING');
    const m2 = store.get('M2', 'ACTIVE_BURN');
    expect(m1.mean).not.toBe(m2.mean);
    expect(m1.mean).toBeCloseTo(50, 5);
    expect(m2.mean).toBeCloseTo(100, 5);
  });

  test('Test 4 — freezeGolden captures rolling state', () => {
    for (const v of [50, 50, 50]) store.update('M1', 'ACTIVE_CUTTING', v);
    store.freezeGolden('M1', 'ACTIVE_CUTTING');
    store.update('M1', 'ACTIVE_CUTTING', 999);

    const golden = store.getGolden('M1', 'ACTIVE_CUTTING');
    expect(golden.mean).toBe(50);
  });

  test('Test 5 — freezeGolden is idempotent', () => {
    for (const v of [50, 50, 50]) store.update('M1', 'ACTIVE_CUTTING', v);
    store.freezeGolden('M1', 'ACTIVE_CUTTING');

    for (const v of [100, 100]) store.update('M1', 'ACTIVE_CUTTING', v);
    store.freezeGolden('M1', 'ACTIVE_CUTTING'); // should not overwrite

    const golden = store.getGolden('M1', 'ACTIVE_CUTTING');
    expect(golden.mean).toBe(50);
  });

  test('Test 6 — getDrift computes correctly', () => {
    for (const v of [50, 50, 50, 50]) store.update('M1', 'ACTIVE_CUTTING', v);
    store.freezeGolden('M1', 'ACTIVE_CUTTING');
    store.update('M1', 'ACTIVE_CUTTING', 55);

    const result = store.getDrift('M1', 'ACTIVE_CUTTING');
    expect(result).not.toBeNull();
    expect(result.drift).toBeGreaterThan(0);
  });

  test('Test 7 — getDrift returns null when golden is missing', () => {
    store.update('M1', 'ACTIVE_CUTTING', 50);
    expect(store.getDrift('M1', 'ACTIVE_CUTTING')).toBeNull();
  });

  test('Test 8 — Zero-variance is handled', () => {
    for (const v of [50, 50, 50, 50, 50]) store.update('M1', 'ACTIVE_CUTTING', v);
    const b = store.get('M1', 'ACTIVE_CUTTING');
    expect(b.stdev).toBe(0);
    expect(b.mean).toBe(50);
  });

  test('Test 9 — reset clears both baselines', () => {
    store.update('M1', 'ACTIVE_CUTTING', 50);
    store.freezeGolden('M1', 'ACTIVE_CUTTING');
    store.reset('M1', 'ACTIVE_CUTTING');

    expect(store.get('M1', 'ACTIVE_CUTTING')).toEqual({ mean: 0, stdev: 0, count: 0 });
    expect(store.getGolden('M1', 'ACTIVE_CUTTING')).toBeNull();
  });
});
