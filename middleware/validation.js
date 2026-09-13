const { TelemetryPhase1Schema } = require('../schema/telemetry');
const { validateMachineConsistency } = require('../config/machines');

function validateTelemetry(req, res, next) {
  const { error, value } = TelemetryPhase1Schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({ ok: false, reason: error.details[0].message });
  }

  const consistencyCheck = validateMachineConsistency(value);
  if (!consistencyCheck.ok) {
    return res.status(400).json({ ok: false, reason: consistencyCheck.reason });
  }

  req.validated = value;
  next();
}

module.exports = {
  validateTelemetry
};
