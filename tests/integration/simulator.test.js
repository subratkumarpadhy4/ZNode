'use strict';

const path = require('path');
const { execSync } = require('child_process');
const { TelemetryPhase1Schema } = require('../../schema/telemetry');

const PROJECT_ROOT = path.join(__dirname, '../../');

function hasPython() {
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function buildReading(machineId, operatingState, scenario) {
  const snippet =
    `import sys;sys.path.insert(0,'simulator');` +
    `from scenarios import build_reading;` +
    `import json;` +
    `print(json.dumps(build_reading('${machineId}','${operatingState}','${scenario}',0)))`;
  const output = execSync(`python3 -c "${snippet}"`, { cwd: PROJECT_ROOT }).toString().trim();
  return JSON.parse(output);
}

const pythonAvailable = hasPython();
const maybeTest = pythonAvailable ? test : test.skip;

describe('Simulator — Schema Shape Validation', () => {
  maybeTest('Test 1 — M1 normal reading passes schema', () => {
    const reading = buildReading('M1', 'ACTIVE_CUTTING', 'normal');
    const { error } = TelemetryPhase1Schema.validate(reading);
    expect(error).toBeUndefined();
  });

  maybeTest('Test 2 — M2 normal reading passes schema', () => {
    const reading = buildReading('M2', 'ACTIVE_BURN', 'normal');
    const { error } = TelemetryPhase1Schema.validate(reading);
    expect(error).toBeUndefined();
  });

  maybeTest('Test 3 — M3 normal reading passes schema', () => {
    const reading = buildReading('M3', 'ACTIVE_BURN', 'normal');
    const { error } = TelemetryPhase1Schema.validate(reading);
    expect(error).toBeUndefined();
  });

  maybeTest('Test 4 — M1 idle reading passes schema', () => {
    const reading = buildReading('M1', 'IDLE', 'normal');
    const { error } = TelemetryPhase1Schema.validate(reading);
    expect(error).toBeUndefined();
  });

  maybeTest('Test 5 — M1 failing kw is significantly higher than M1 normal kw', () => {
    const normal = buildReading('M1', 'ACTIVE_CUTTING', 'normal');
    const failing = buildReading('M1', 'ACTIVE_CUTTING', 'failing');
    expect(failing.kw).toBeGreaterThan(normal.kw * 1.5);
  });
});
