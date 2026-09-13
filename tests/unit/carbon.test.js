'use strict';

const { computeScope2, computeScenarioComparison } = require('../../engine/carbonEngine');

describe('CarbonEngine', () => {
  test('Test 1 — computeScope2 with standard grid CI', () => {
    const r = computeScope2({ kw: 85 }, { current_CI: 0.716 });
    expect(r.co2_rate_kg_hr).toBeCloseTo(60.86, 1);
    expect(r.current_CI).toBe(0.716);
  });

  test('Test 2 — computeScenarioComparison: solar (lower CI) → CO₂ avoided', () => {
    const results = computeScenarioComparison(
      { kw: 100 },
      0.716,
      [{ name: 'solar', CI: 0.1 }]
    );
    expect(results[0].signed_change_kg_hr).toBeGreaterThan(0);
    expect(results[0].display).toContain('avoided');
  });

  test('Test 3 — computeScenarioComparison: diesel (higher CI) → additional CO₂', () => {
    const results = computeScenarioComparison(
      { kw: 100 },
      0.716,
      [{ name: 'diesel', CI: 2.5 }]
    );
    expect(results[0].signed_change_kg_hr).toBeLessThan(0);
    expect(results[0].display).toContain('Additional');
  });

  test('Test 4 — computeScenarioComparison: identical CI → No change', () => {
    const results = computeScenarioComparison(
      { kw: 100 },
      0.716,
      [{ name: 'same', CI: 0.716 }]
    );
    expect(results[0].signed_change_kg_hr).toBeCloseTo(0, 5);
    expect(results[0].display).toContain('No change');
  });

  test('Test 5 — computeScenarioComparison returns one entry per scenario', () => {
    const scenarios = [
      { name: 'solar', CI: 0.1 },
      { name: 'wind', CI: 0.05 },
      { name: 'coal', CI: 0.9 }
    ];
    const results = computeScenarioComparison({ kw: 100 }, 0.716, scenarios);
    expect(results.length).toBe(3);
  });
});
