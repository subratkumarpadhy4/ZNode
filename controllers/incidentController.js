'use strict';

const { incidentEngine } = require('../services/context');

function acknowledge(req, res) {
  const { machine_id } = req.params;
  const incident = incidentEngine.acknowledge(machine_id);
  if (!incident) {
    return res.status(404).json({ ok: false, reason: 'NO_ACTIVE_INCIDENT' });
  }
  return res.status(200).json({
    ok: true,
    incident: { id: incident.id, status: incident.status, flags: [...incident.flags] }
  });
}

function claimFixed(req, res) {
  const { machine_id } = req.params;
  const incident = incidentEngine.claimFixed(machine_id);
  if (!incident) {
    return res.status(404).json({ ok: false, reason: 'NO_ACTIVE_INCIDENT' });
  }
  return res.status(200).json({
    ok: true,
    incident: { id: incident.id, status: incident.status, flags: [...incident.flags] }
  });
}

module.exports = { acknowledge, claimFixed };
