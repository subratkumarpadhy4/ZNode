const { TelemetryPhase1Schema } = require('../../schema/telemetry');
const { validateMachineConsistency } = require('../../config/machines');

describe('Schema and Registry Validation', () => {
  const validReading = {
    machine_id: "M1",
    type: "CNC",
    operating_state: "ACTIVE_CUTTING",
    kw: 5000,
    temp: 200,
    production_rate: 100,
    units_produced: 1000,
    defects: 2,
    timestamp: 1678886400000
  };

  test('Valid reading passes both Joi and registry validation', () => {
    const { error, value } = TelemetryPhase1Schema.validate(validReading);
    expect(error).toBeUndefined();
    
    const result = validateMachineConsistency(value);
    expect(result.ok).toBe(true);
  });

  test('Missing field (kw) fails Joi', () => {
    const reading = { ...validReading };
    delete reading.kw;
    const { error } = TelemetryPhase1Schema.validate(reading);
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain('kw');
  });

  test('Wrong type for machine_id fails registry validation', () => {
    const reading = { ...validReading, type: "FURNACE" };
    const { error } = TelemetryPhase1Schema.validate(reading);
    // Joi will pass because FURNACE is a valid enum value for 'type'
    expect(error).toBeUndefined();
    
    const result = validateMachineConsistency(reading);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('TYPE_MISMATCH');
  });

  test('Invalid operating_state for the machine fails registry validation', () => {
    const reading = { ...validReading, operating_state: "ACTIVE_BURN" };
    const { error } = TelemetryPhase1Schema.validate(reading);
    expect(error).toBeUndefined();
    
    const result = validateMachineConsistency(reading);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('INVALID_STATE_FOR_MACHINE');
  });

  test('Negative kw fails Joi', () => {
    const reading = { ...validReading, kw: -10 };
    const { error } = TelemetryPhase1Schema.validate(reading);
    expect(error).toBeDefined();
  });

  test('Unknown field fails Joi (additionalProperties: false)', () => {
    const reading = { ...validReading, extra_field: "value" };
    const { error } = TelemetryPhase1Schema.validate(reading);
    expect(error).toBeDefined();
  });

  test('defects as a float fails Joi (must be integer)', () => {
    const reading = { ...validReading, defects: 2.5 };
    const { error } = TelemetryPhase1Schema.validate(reading);
    expect(error).toBeDefined();
  });
});
