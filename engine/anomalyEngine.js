'use strict';

const EPSILON = 1e-6;
const Z_THRESHOLD_POWER = 3.0;

function getEffectiveSigma(mean, sigma) {
  const floor = Math.max(Math.abs(mean) * 0.02, EPSILON);
  return Math.max(Math.abs(sigma), floor);
}

function detect(reading, baseline) {
  // Step 1 — Handle empty baseline
  if (baseline.count === 0) {
    return { zKw: 0, zTemp: 0, flags: [], isAnomaly: false, temperatureDeviation: 0, reason: 'BASELINE_NOT_READY' };
  }

  // Step 2 — Compute effective sigma for kW
  const effectiveSigmaKw = getEffectiveSigma(baseline.mean, baseline.stdev);

  // Step 3 — Zero-mean guard for kW
  if (baseline.mean === 0 && baseline.stdev === 0) {
    const tempMean0 = baseline.tempMean ?? 25;
    const tempStdev0 = baseline.tempStdev ?? 5;
    const effectiveSigmaTemp0 = getEffectiveSigma(tempMean0, tempStdev0);
    const zTemp0 = (reading.temp - tempMean0) / effectiveSigmaTemp0;
    const temperatureDeviation0 = reading.temp - tempMean0;

    if (reading.kw === 0) {
      return { zKw: 0, zTemp: zTemp0, flags: [], isAnomaly: false, temperatureDeviation: temperatureDeviation0, reason: 'NORMAL' };
    } else {
      return { zKw: null, zTemp: zTemp0, flags: ['ZERO_BASELINE_DEVIATION'], isAnomaly: false, temperatureDeviation: temperatureDeviation0, reason: 'ZERO_BASELINE_DEVIATION' };
    }
  }

  // Step 4 — Compute Z for kW
  const zKw = (reading.kw - baseline.mean) / effectiveSigmaKw;

  // Step 5 — Compute Z for temperature
  const tempMean = baseline.tempMean ?? 25;
  const tempStdev = baseline.tempStdev ?? 5;
  const effectiveSigmaTemp = getEffectiveSigma(tempMean, tempStdev);
  const zTemp = (reading.temp - tempMean) / effectiveSigmaTemp;

  // Step 6 — Compute temperature deviation
  const temperatureDeviation = reading.temp - tempMean;

  // Step 7 — Classify anomaly by kW only
  let flags = [];
  if (zKw > Z_THRESHOLD_POWER) flags.push('ENERGY_WASTE');
  else if (zKw < -Z_THRESHOLD_POWER) flags.push('OPERATIONAL_ANOMALY');

  const isAnomaly = flags.length > 0;
  const reason = isAnomaly ? flags[0] : 'NORMAL';

  // Step 8 — Return result
  return { zKw, zTemp, flags, isAnomaly, temperatureDeviation, reason };
}

module.exports = { detect };
