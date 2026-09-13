'use strict';

const { PRODUCTIVE_STATES_BY_TYPE } = require('../config/machine_types');

function computeLoss(reading, baseline, tariff) {
  const excessKw = Math.max(0, reading.kw - baseline.mean);
  const lossRupeesPerHour = excessKw * tariff;

  return {
    excess_kw: excessKw,
    loss_rupees_per_hour: lossRupeesPerHour,
    loss_rupees_per_day: lossRupeesPerHour * 24
  };
}

function computeEnergyIntensity(productiveKwh, unitsProduced) {
  if (!Number.isFinite(productiveKwh) || productiveKwh <= 0) {
    return { value: null, display: 'N/A (invalid productive kWh)', guards: ['INVALID_PRODUCTIVE_KWH'] };
  }
  if (!Number.isFinite(unitsProduced) || unitsProduced <= 0) {
    return { value: null, display: 'N/A (no production recorded)', guards: ['INVALID_UNITS_PRODUCED'] };
  }
  const intensity = productiveKwh / unitsProduced;
  return { value: intensity, display: `${intensity.toFixed(3)} kWh/unit`, guards: [] };
}

function computeEpochROI(previousEpoch, currentEpoch) {
  const fail = (reason) => ({ value: null, display: `N/A (${reason})`, guards: [reason] });

  if (!previousEpoch) return fail('NO_PREVIOUS_EPOCH');
  if (!currentEpoch) return fail('NO_CURRENT_EPOCH');
  if (previousEpoch.machine_id !== currentEpoch.machine_id) return fail('MACHINE_MISMATCH');
  if (previousEpoch.operating_state !== currentEpoch.operating_state) return fail('STATE_MISMATCH');

  const allowedStates = PRODUCTIVE_STATES_BY_TYPE[currentEpoch.machine_type] ?? [];
  if (!allowedStates.includes(currentEpoch.operating_state)) return fail('INVALID_PRODUCTIVE_STATE');

  if (!Number.isFinite(previousEpoch.productive_kwh) || previousEpoch.productive_kwh <= 0) return fail('INVALID_PREV_KWH');
  if (!Number.isFinite(currentEpoch.productive_kwh) || currentEpoch.productive_kwh <= 0) return fail('INVALID_CURR_KWH');
  if (!Number.isFinite(previousEpoch.units_produced) || previousEpoch.units_produced < 5) return fail('INSUFFICIENT_PREV_UNITS');
  if (!Number.isFinite(currentEpoch.units_produced) || currentEpoch.units_produced < 5) return fail('INSUFFICIENT_CURR_UNITS');

  const prevIntensity = previousEpoch.productive_kwh / previousEpoch.units_produced;
  const currIntensity = currentEpoch.productive_kwh / currentEpoch.units_produced;
  const improvement = (prevIntensity - currIntensity) / prevIntensity;

  return {
    value: improvement,
    display: `${(improvement * 100).toFixed(1)}% improvement`,
    prev: prevIntensity,
    curr: currIntensity,
    guards: []
  };
}

function computeConfidence(anomaly, incident) {
  const powerSignature = Math.abs(anomaly.zKw) > 3;
  const tempSignature  = Math.abs(anomaly.zTemp) > 2;
  const persistence    = (incident?.maxAnomalyStreak ?? 0) >= 3;

  const count = [powerSignature, tempSignature, persistence].filter(Boolean).length;

  let level = null;
  if (count === 3) level = 'HIGH';
  else if (count === 2) level = 'MEDIUM';
  else if (count === 1) level = 'LOW';

  return {
    level,
    signatures_matched: count,
    power_signature: powerSignature,
    temp_signature: tempSignature,
    persistence
  };
}

module.exports = { computeLoss, computeEnergyIntensity, computeEpochROI, computeConfidence };
