'use strict';

function computeScope2(reading, config) {
  const co2RateKgHr = reading.kw * config.current_CI;
  return {
    co2_rate_kg_hr: co2RateKgHr,
    current_CI: config.current_CI
  };
}

function computeScenarioComparison(reading, currentCI, scenarios) {
  return scenarios.map(s => {
    const change = reading.kw * (currentCI - s.CI);
    let display;
    if (change > 0) display = `CO₂ avoided: ${change.toFixed(2)} kg/hr`;
    else if (change < 0) display = `Additional CO₂ emitted: ${Math.abs(change).toFixed(2)} kg/hr`;
    else display = 'No change';

    return {
      name: s.name,
      signed_change_kg_hr: change,
      display
    };
  });
}

module.exports = { computeScope2, computeScenarioComparison };
