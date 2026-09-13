'use strict';

jest.setTimeout(15000);

const app = require('../../server');
const { io: ioc } = require('socket.io-client');
const { resetContext } = require('../../services/context');

let serverUrl;

beforeAll(done => {
  app.httpServer.listen(0, () => {
    serverUrl = `http://localhost:${app.httpServer.address().port}`;
    app.broadcaster.start();
    done();
  });
});

afterAll(done => {
  app.broadcaster.stop();
  // Force-close all socket.io connections so httpServer.close() can fire
  app.httpServer.closeAllConnections?.();
  app.io?.close();
  app.httpServer.close(() => done());
});

beforeEach(() => {
  resetContext();
  app.broadcaster.pending.clear();
});

// ── helpers ───────────────────────────────────────────────────────────────────

function validReading(overrides = {}) {
  return {
    machine_id: 'M1', type: 'CNC', operating_state: 'ACTIVE_CUTTING',
    kw: 50, temp: 200, production_rate: 100, units_produced: 1000,
    defects: 2, timestamp: Math.floor(Date.now() / 1000),
    ...overrides
  };
}

async function postReading(body) {
  return fetch(`${serverUrl}/api/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

/**
 * Connect a socket.io client and return a Promise that resolves with
 * { client, snapshot } once the initial snapshot event has been received.
 * Registering `once('snapshot')` BEFORE connecting avoids the race where
 * the server emits snapshot before the listener is attached.
 */
function connectAndWaitForSnapshot() {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('snapshot timeout')), 5000);
    const client = ioc(serverUrl, { forceNew: true });
    client.once('snapshot', snapshot => {
      clearTimeout(timer);
      resolve({ client, snapshot });
    });
    client.once('connect_error', err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function waitForEvent(socket, event, timeoutMs = 2000) {
  return Promise.race([
    new Promise(resolve => socket.once(event, resolve)),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), timeoutMs)
    )
  ]);
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('WebSocket (Socket.io)', () => {
  test('Test 1 — client receives snapshot on connect', async () => {
    const { client, snapshot } = await connectAndWaitForSnapshot();
    client.disconnect();

    expect(Array.isArray(snapshot)).toBe(true);
    expect(snapshot.length).toBe(3);
    expect(snapshot.map(s => s.machine_id).sort()).toEqual(['M1', 'M2', 'M3']);
  });

  test('Test 2 — client receives machine-update after telemetry POST', async () => {
    const { client } = await connectAndWaitForSnapshot();

    const updatePromise = waitForEvent(client, 'machine-update');
    await postReading(validReading());
    const data = await updatePromise;
    client.disconnect();

    expect(Array.isArray(data)).toBe(true);
    expect(data.some(d => d.machine_id === 'M1')).toBe(true);
  });

  test('Test 3 — per-machine coalescing within 500ms window', async () => {
    const { client } = await connectAndWaitForSnapshot();

    const updates = [];
    client.on('machine-update', data => updates.push(data));

    // POST 5 readings rapidly (in parallel)
    await Promise.all([...Array(5)].map(() => postReading(validReading())));

    // Wait 800ms — enough for at most one 500ms interval flush after the requests land
    await new Promise(resolve => setTimeout(resolve, 800));
    client.disconnect();

    // All 5 readings for M1 should be coalesced into at most 2 broadcast batches
    expect(updates.length).toBeLessThanOrEqual(2);
    // Each batch has at most one entry per machine
    for (const batch of updates) {
      const ids = batch.map(d => d.machine_id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test('Test 4 — anomaly flag appears in broadcast', async () => {
    // Build baseline before connecting so warm-up events don't interfere
    for (let i = 0; i < 5; i++) await postReading(validReading());

    const { client } = await connectAndWaitForSnapshot();

    const anomalyPromise = new Promise(resolve => {
      client.on('machine-update', data => {
        const m1 = data.find(d => d.machine_id === 'M1');
        if (m1 && m1.anomaly.is_anomaly) resolve(m1);
      });
    });

    await postReading(validReading({ kw: 9000 }));
    const m1 = await Promise.race([
      anomalyPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('anomaly broadcast timeout')), 2000))
    ]);
    client.disconnect();

    expect(m1.anomaly.is_anomaly).toBe(true);
    expect(m1.anomaly.flags).toContain('ENERGY_WASTE');
    expect(m1.incident).not.toBeNull();
    expect(m1.incident.status).toBe('OPEN');
  });

  test('Test 5 — lifecycle events forwarded in broadcast', async () => {
    // Build baseline, create incident
    for (let i = 0; i < 5; i++) await postReading(validReading());
    await postReading(validReading({ kw: 9000 })); // OPEN incident

    const { client } = await connectAndWaitForSnapshot();

    const closedPromise = new Promise(resolve => {
      client.on('machine-update', data => {
        const m1 = data.find(d => d.machine_id === 'M1');
        if (m1 && m1.lifecycleEvents.some(ev => ev.type === 'INCIDENT_CLOSED')) {
          resolve(m1);
        }
      });
    });

    // 3 normal readings trigger UNACKNOWLEDGED_SELF_RECOVERY → OK result with INCIDENT_CLOSED
    for (let i = 0; i < 3; i++) await postReading(validReading());

    const m1 = await Promise.race([
      closedPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('lifecycle event timeout')), 2000))
    ]);
    client.disconnect();

    expect(m1.lifecycleEvents.some(ev => ev.type === 'INCIDENT_CLOSED')).toBe(true);
  });
});
