const MACHINE_REGISTRY = {
  M1: { type: 'CNC',     energy: 'ELECTRIC', allowed_states: ['IDLE','ACTIVE_CUTTING','SETUP','MAINTENANCE','COOLDOWN'] },
  M2: { type: 'FURNACE', energy: 'DIESEL',   allowed_states: ['IDLE','ACTIVE_BURN','SETUP','MAINTENANCE','COOLDOWN'] },
  M3: { type: 'KILN',    energy: 'COAL',     allowed_states: ['IDLE','ACTIVE_BURN','SETUP','MAINTENANCE','COOLDOWN'] }
};

function validateMachineConsistency(reading) {
  const machine = MACHINE_REGISTRY[reading.machine_id];
  if (!machine) {
    return { ok: false, reason: 'UNKNOWN_MACHINE' };
  }
  if (machine.type !== reading.type) {
    return { ok: false, reason: 'TYPE_MISMATCH' };
  }
  if (!machine.allowed_states.includes(reading.operating_state)) {
    return { ok: false, reason: 'INVALID_STATE_FOR_MACHINE' };
  }
  return { ok: true };
}

module.exports = {
  MACHINE_REGISTRY,
  validateMachineConsistency
};
