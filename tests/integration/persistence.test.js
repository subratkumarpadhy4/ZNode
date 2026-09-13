'use strict';

const fs = require('fs');
const path = require('path');
const { Persistence } = require('../../db/persistence');
const { bootstrap } = require('../../db/bootstrap');
const { BaselineStore } = require('../../engine/baselineStore');
const { IncidentEngine } = require('../../engine/incidentEngine');
const { SettlingTracker, processReading } = require('../../services/orchestrator');
const { MACHINE_REGISTRY } = require('../../config/machines');

let tmpPath;

beforeEach(() => {
  tmpPath = path.join('/tmp', `znode_test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.db`);
});

afterEach(() => {
  [tmpPath, `${tmpPath}-wal`, `${tmpPath}-shm`].forEach(f => {
    try { fs.unlinkSync(f); } catch {}
  });
});

// ── helpers ──────────────────────────────────────────────────────────────────

function makeTestContext(persistence) {
  const machineRegistry = {};
  for (const id of Object.keys(MACHINE_REGISTRY)) {
    machineRegistry[id] = {
      ...MACHINE_REGISTRY[id],
      lastOperatingState: undefined,
      pendingStateChangeEvents: []
    };
  }
  return {
    baselineStore: new BaselineStore(),
    incidentEngine: new IncidentEngine(),
    settling: new SettlingTracker(),
    config: { current_CI: 0.716, current_tariff: 9, settlingMs: 100, scenarios: [] },
    machineRegistry,
    persistence
  };
}

function validReading(overrides = {}) {
  return {
    machine_id: 'M1', type: 'CNC', operating_state: 'ACTIVE_CUTTING',
    kw: 50, temp: 200, production_rate: 100, units_produced: 1000,
    defects: 2, timestamp: Math.floor(Date.now() / 1000),
    ...overrides
  };
}

function syntheticIncident(overrides = {}) {
  return {
    id: `inc_test_${Math.random().toString(36).slice(2, 8)}`,
    machine_id: 'M1',
    operating_state: 'ACTIVE_CUTTING',
    status: 'OPEN',
    closeReason: null,
    flags: new Set(['ENERGY_WASTE']),
    anomalyStreak: 2,
    maxAnomalyStreak: 2,
    normalRunLength: 0,
    verificationCounter: 0,
    startedAt: Date.now(),
    closedAt: null,
    ...overrides
  };
}

// ── tests ────────────────────────────────────────────────────────────────────

describe('Persistence', () => {
  test('Test 1 — stores and retrieves machines', () => {
    const p = new Persistence(tmpPath);
    p.upsertMachine({ id: 'M1', type: 'CNC', energy_source: 'ELECTRIC', last_operating_state: 'ACTIVE_CUTTING' });
    const rows = p.loadMachines();
    p.close();

    expect(rows.length).toBe(1);
    expect(rows[0].id).toBe('M1');
    expect(rows[0].type).toBe('CNC');
    expect(rows[0].last_operating_state).toBe('ACTIVE_CUTTING');
  });

  test('Test 2 — stores and retrieves active incidents', () => {
    const p = new Persistence(tmpPath);
    const inc = syntheticIncident();
    p.upsertIncident(inc);
    const rows = p.loadActiveIncidents();
    p.close();

    expect(rows.length).toBe(1);
    expect(rows[0].id).toBe(inc.id);
    expect(rows[0].state).toBe('OPEN');
    expect(JSON.parse(rows[0].flags)).toContain('ENERGY_WASTE');
  });

  test('Test 3 — loadActiveIncidents excludes closed incidents', () => {
    const p = new Persistence(tmpPath);
    p.upsertIncident(syntheticIncident({ id: 'inc_open', status: 'OPEN' }));
    p.upsertIncident(syntheticIncident({
      id: 'inc_closed', status: 'CLOSED', closeReason: 'STATE_CHANGE', closedAt: Date.now()
    }));
    const rows = p.loadActiveIncidents();
    p.close();

    expect(rows.length).toBe(1);
    expect(rows[0].id).toBe('inc_open');
  });

  test('Test 4 — loadClosedIncidents returns closed incidents ordered by closed_at ASC', () => {
    const p = new Persistence(tmpPath);
    const base = Date.now();
    p.upsertIncident(syntheticIncident({ id: 'inc_c', status: 'CLOSED', closeReason: 'STATE_CHANGE', closedAt: base + 200 }));
    p.upsertIncident(syntheticIncident({ id: 'inc_a', status: 'CLOSED', closeReason: 'STATE_CHANGE', closedAt: base + 0 }));
    p.upsertIncident(syntheticIncident({ id: 'inc_b', status: 'CLOSED', closeReason: 'STATE_CHANGE', closedAt: base + 100 }));
    const rows = p.loadClosedIncidents('M1', 100);
    p.close();

    expect(rows.map(r => r.id)).toEqual(['inc_a', 'inc_b', 'inc_c']);
  });

  test('Test 5 — lifecycle events are stored', () => {
    const p = new Persistence(tmpPath);
    const event = { incident_id: 'inc_test_001', type: 'INCIDENT_CREATED', reason: null, timestamp: Date.now() };
    p.insertLifecycleEvent(event);
    const row = p.db.prepare('SELECT * FROM lifecycle_events WHERE incident_id = ?').get('inc_test_001');
    p.close();

    expect(row).toBeDefined();
    expect(row.type).toBe('INCIDENT_CREATED');
  });

  test('Test 6 — restart preserves machine state', () => {
    const p1 = new Persistence(tmpPath);
    const ctx1 = makeTestContext(p1);

    // Feed one reading — this triggers upsertMachine
    processReading(validReading(), ctx1);
    p1.close();

    // Reopen and bootstrap
    const p2 = new Persistence(tmpPath);
    const ctx2 = makeTestContext(p2);
    bootstrap(p2, ctx2);
    p2.close();

    expect(ctx2.machineRegistry['M1'].lastOperatingState).toBe('ACTIVE_CUTTING');
  });

  test('Test 7 — restart preserves active incidents', () => {
    const p1 = new Persistence(tmpPath);
    const ctx1 = makeTestContext(p1);

    // Build baseline (5 normal readings) then spike to create incident
    for (let i = 0; i < 5; i++) processReading(validReading(), ctx1);
    processReading(validReading({ kw: 9000 }), ctx1);

    expect(ctx1.incidentEngine.getActive('M1')).not.toBeNull();
    p1.close();

    // Reopen and bootstrap
    const p2 = new Persistence(tmpPath);
    const ctx2 = makeTestContext(p2);
    bootstrap(p2, ctx2);
    p2.close();

    const restored = ctx2.incidentEngine.getActive('M1');
    expect(restored).not.toBeNull();
    expect(restored.status).toBe('OPEN');
    expect(restored.machine_id).toBe('M1');
  });
});
