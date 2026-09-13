'use strict';

const Database = require('better-sqlite3');

class Persistence {
  constructor(dbPath = 'znode.db') {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this._createSchema();
  }

  _createSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS machines (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        energy_source TEXT,
        last_operating_state TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        machine_id TEXT NOT NULL,
        operating_state TEXT NOT NULL,
        state TEXT NOT NULL,
        flags TEXT NOT NULL,
        anomaly_streak INTEGER NOT NULL,
        max_anomaly_streak INTEGER NOT NULL,
        normal_run_length INTEGER NOT NULL,
        verification_counter INTEGER NOT NULL,
        close_reason TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        closed_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_incidents_machine_state ON incidents(machine_id, state);

      CREATE TABLE IF NOT EXISTS lifecycle_events (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        type TEXT NOT NULL,
        reason TEXT,
        timestamp INTEGER NOT NULL
      );
    `);
  }

  upsertMachine({ id, type, energy_source, last_operating_state }) {
    this.db.prepare(`
      INSERT OR REPLACE INTO machines (id, type, energy_source, last_operating_state, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, type, energy_source || null, last_operating_state || null, Date.now());
  }

  upsertIncident(incident) {
    this.db.prepare(`
      INSERT OR REPLACE INTO incidents
        (id, machine_id, operating_state, state, flags, anomaly_streak, max_anomaly_streak,
         normal_run_length, verification_counter, close_reason, created_at, updated_at, closed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      incident.id,
      incident.machine_id,
      incident.operating_state,
      incident.status,
      JSON.stringify([...incident.flags]),
      incident.anomalyStreak,
      incident.maxAnomalyStreak,
      incident.normalRunLength,
      incident.verificationCounter,
      incident.closeReason || null,
      incident.startedAt,
      Date.now(),
      incident.closedAt || null
    );
  }

  insertLifecycleEvent(event) {
    const id = `ev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.db.prepare(`
      INSERT INTO lifecycle_events (id, incident_id, type, reason, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, event.incident_id, event.type, event.reason || null, event.timestamp);
    return id;
  }

  loadActiveIncidents() {
    return this.db.prepare(`SELECT * FROM incidents WHERE state != 'CLOSED'`).all();
  }

  loadClosedIncidents(machineId, limit = 100) {
    return this.db.prepare(`
      SELECT * FROM incidents
      WHERE machine_id = ? AND state = 'CLOSED'
      ORDER BY closed_at ASC
      LIMIT ?
    `).all(machineId, limit);
  }

  loadMachines() {
    return this.db.prepare('SELECT * FROM machines').all();
  }

  close() {
    this.db.close();
  }
}

module.exports = { Persistence };
