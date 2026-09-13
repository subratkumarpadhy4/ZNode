'use strict';

const { processReading } = require('../services/orchestrator');
const context = require('../services/context');

function handleTelemetry(req, res) {
  const result = processReading(req.validated, context);

  if (result.status === 'SETTLING' || result.status === 'REJECTED') {
    return res.status(202).json({
      ok: true,
      status: result.status,
      lifecycleEvents: result.lifecycleEvents || []
    });
  }

  // status === 'OK'
  return res.status(200).json({
    ok: true,
    status: 'OK',
    machine_id: result.machine,
    anomaly: result.anomaly,
    incident: result.incident ? {
      id: result.incident.id,
      status: result.incident.status,
      flags: [...result.incident.flags],
      anomaly_streak: result.incident.anomalyStreak,
      max_anomaly_streak: result.incident.maxAnomalyStreak
    } : null,
    metrics: result.metrics,
    carbon: result.carbon,
    lifecycleEvents: result.lifecycleEvents
  });
}

module.exports = { handleTelemetry };
