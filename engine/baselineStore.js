'use strict';

class BaselineStore {
  constructor() {
    this._rolling = new Map();
    this._golden = new Map();
  }

  _key(machine_id, operating_state) {
    return `${machine_id}:${operating_state}`;
  }

  get(machine_id, operating_state) {
    const key = this._key(machine_id, operating_state);
    return this._rolling.get(key) || { mean: 0, stdev: 0, count: 0 };
  }

  getGolden(machine_id, operating_state) {
    const key = this._key(machine_id, operating_state);
    return this._golden.get(key) || null;
  }

  update(machine_id, operating_state, value) {
    const key = this._key(machine_id, operating_state);
    const existing = this._rolling.get(key) || { mean: 0, stdev: 0, count: 0 };

    const n = existing.count + 1;
    let newMean, newStdev;

    if (existing.count === 0) {
      newMean = value;
      newStdev = 0;
    } else {
      newMean = existing.mean + (value - existing.mean) / n;
      const newVariance =
        (existing.stdev ** 2 * existing.count +
          (value - existing.mean) * (value - newMean)) /
        n;
      newStdev = Math.sqrt(Math.max(0, newVariance));
    }

    this._rolling.set(key, { mean: newMean, stdev: newStdev, count: n });
  }

  freezeGolden(machine_id, operating_state) {
    const key = this._key(machine_id, operating_state);
    if (this._golden.has(key)) return;

    const rolling = this._rolling.get(key);
    if (!rolling) return;

    this._golden.set(key, { ...rolling });
  }

  getDrift(machine_id, operating_state) {
    const rolling = this._rolling.get(this._key(machine_id, operating_state));
    const golden = this._golden.get(this._key(machine_id, operating_state));

    if (!rolling || !golden) return null;
    if (golden.mean === 0) return null;

    return {
      rolling: rolling.mean,
      golden: golden.mean,
      drift: Math.abs(rolling.mean - golden.mean) / golden.mean
    };
  }

  reset(machine_id, operating_state) {
    const key = this._key(machine_id, operating_state);
    this._rolling.delete(key);
    this._golden.delete(key);
  }
}

module.exports = { BaselineStore };
