const Joi = require('joi');

const TelemetryPhase1Schema = Joi.object({
  machine_id: Joi.string().valid('M1', 'M2', 'M3').required(),
  type: Joi.string().valid('CNC', 'FURNACE', 'KILN').required(),
  operating_state: Joi.string().valid('IDLE', 'ACTIVE_CUTTING', 'ACTIVE_BURN', 'SETUP', 'MAINTENANCE', 'COOLDOWN').required(),
  kw: Joi.number().min(0).max(10000).required(),
  temp: Joi.number().min(-50).max(3000).required(),
  production_rate: Joi.number().min(0).max(100000).required(),
  units_produced: Joi.number().min(0).required(),
  defects: Joi.number().integer().min(0).required(),
  timestamp: Joi.number().integer().required()
}).unknown(false);

module.exports = {
  TelemetryPhase1Schema
};
