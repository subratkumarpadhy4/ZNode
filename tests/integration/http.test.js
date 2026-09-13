'use strict';

const request = require('supertest');
const app = require('../../server');
const { resetContext, config } = require('../../services/context');

// Use a short settling window so state-change tests don't need real waits
beforeEach(() => {
  resetContext();
  config.settlingMs = 100;
});

function validReading(overrides = {}) {
  return {
    machine_id: 'M1',
    type: 'CNC',
    operating_state: 'ACTIVE_CUTTING',
    kw: 50,
    temp: 200,
    production_rate: 100,
    units_produced: 1000,
    defects: 2,
    timestamp: 1678886400000,
    ...overrides
  };
}

async function postReading(body) {
  return request(app)
    .post('/api/telemetry')
    .set('Content-Type', 'application/json')
    .send(body);
}

async function warmUp(n = 5, overrides = {}) {
  for (let i = 0; i < n; i++) {
    await postReading(validReading(overrides));
  }
}

describe('HTTP Integration Tests', () => {
  test('Test 1 — GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });

  test('Test 2 — Valid telemetry POST returns 200', async () => {
    const res = await postReading(validReading());
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.status).toBe('OK');
  });

  test('Test 3 — Invalid telemetry POST returns 400 with TYPE_MISMATCH', async () => {
    const res = await postReading(validReading({ type: 'FURNACE' }));
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.reason).toBe('TYPE_MISMATCH');
  });

  test('Test 4 — Anomalous reading creates OPEN incident', async () => {
    await warmUp(5);
    const res = await postReading(validReading({ kw: 9000 }));
    expect(res.status).toBe(200);
    expect(res.body.incident).not.toBeNull();
    expect(res.body.incident.status).toBe('OPEN');
  });

  test('Test 5 — Acknowledge endpoint moves incident to ACKNOWLEDGED', async () => {
    await warmUp(5);
    await postReading(validReading({ kw: 9000 }));
    const res = await request(app).post('/api/incidents/M1/acknowledge');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.incident.status).toBe('ACKNOWLEDGED');
  });

  test('Test 6 — Claim fixed endpoint moves incident to VERIFYING', async () => {
    await warmUp(5);
    await postReading(validReading({ kw: 9000 }));
    await request(app).post('/api/incidents/M1/acknowledge');
    const res = await request(app).post('/api/incidents/M1/claim-fixed');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.incident.status).toBe('VERIFYING');
  });

  test('Test 7 — Acknowledge with no active incident returns 404', async () => {
    const res = await request(app).post('/api/incidents/M2/acknowledge');
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.reason).toBe('NO_ACTIVE_INCIDENT');
  });

  test('Test 8 — State change returns 202 SETTLING', async () => {
    // Initialize M1 state with ACTIVE_CUTTING
    await postReading(validReading({ operating_state: 'ACTIVE_CUTTING' }));
    // State change to IDLE — should return SETTLING immediately
    const res = await postReading(validReading({
      operating_state: 'IDLE',
      kw: 5,
      // IDLE is valid for M1; no state-specific enums needed here — validation ensures consistency
    }));
    expect(res.status).toBe(202);
    expect(res.body.status).toBe('SETTLING');
  });
});
