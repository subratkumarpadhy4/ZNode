'use strict';

const { BaselineStore } = require('../engine/baselineStore');
const { IncidentEngine } = require('../engine/incidentEngine');
const { SettlingTracker } = require('./orchestrator');
const { MACHINE_REGISTRY } = require('../config/machines');
const { Persistence } = require('../db/persistence');

const baselineStore = new BaselineStore();
const incidentEngine = new IncidentEngine();
const settling = new SettlingTracker();

// Deep-clone the registry so we can attach mutable runtime state
// (lastOperatingState, pendingStateChangeEvents) without touching the config file.
const machineRegistry = {};
for (const id of Object.keys(MACHINE_REGISTRY)) {
  machineRegistry[id] = {
    ...MACHINE_REGISTRY[id],
    lastOperatingState: undefined,
    pendingStateChangeEvents: []
  };
}

const config = {
  current_CI: 0.716,
  current_tariff: 9,
  settlingMs: process.env.DEMO_MODE === 'true' ? 1000 : 3000,
  scenarios: [
    { name: 'grid_mix',       CI: 0.716 },
    { name: 'solar_heavy',    CI: 0.400 },
    { name: 'full_renewable', CI: 0.000 },
    { name: 'diesel_backup',  CI: 0.850 }
  ]
};

function resetContext() {
  baselineStore._rolling.clear();
  baselineStore._golden.clear();
  incidentEngine.active.clear();
  incidentEngine.history.clear();
  settling.active.clear();
  for (const id of Object.keys(MACHINE_REGISTRY)) {
    machineRegistry[id].lastOperatingState = undefined;
    machineRegistry[id].pendingStateChangeEvents = [];
  }
}

const persistence = new Persistence(process.env.DB_PATH || 'znode.db');

module.exports = { baselineStore, incidentEngine, settling, machineRegistry, config, persistence, resetContext };
