'use strict';

class Broadcaster {
  constructor(io, intervalMs = 500) {
    this.io = io;
    this.intervalMs = intervalMs;
    this.pending = new Map(); // machine_id → latest raw pipeline result
    this.timer = null;
  }

  enqueue(result) {
    this.pending.set(result.machine, result);
  }

  start() {
    this.timer = setInterval(() => {
      if (this.pending.size === 0) return;
      const batch = [...this.pending.values()].map(result => ({
        machine_id: result.machine,
        anomaly: {
          is_anomaly: result.anomaly.isAnomaly,
          flags: result.anomaly.flags,
          reason: result.anomaly.reason,
          z_kw: result.anomaly.zKw,
          z_temp: result.anomaly.zTemp
        },
        incident: result.incident ? {
          id: result.incident.id,
          status: result.incident.status,
          flags: [...result.incident.flags],
          max_anomaly_streak: result.incident.maxAnomalyStreak
        } : null,
        metrics: {
          loss_rupees_per_hour: result.metrics.loss.loss_rupees_per_hour,
          excess_kw: result.metrics.loss.excess_kw,
          confidence: result.metrics.confidence.level,
          signatures_matched: result.metrics.confidence.signatures_matched
        },
        carbon: {
          co2_rate_kg_hr: result.carbon.co2_rate_kg_hr
        },
        lifecycleEvents: result.lifecycleEvents || []
      }));
      this.pending.clear();
      if (batch.length > 0) {
        this.io.emit('machine-update', batch);
      }
    }, this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

module.exports = { Broadcaster };
