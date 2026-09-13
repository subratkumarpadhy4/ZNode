require('dotenv').config();
const express = require('express');
const validationMiddleware = require('./middleware/validation');
const telemetryController = require('./controllers/telemetryController');
const incidentController = require('./controllers/incidentController');
const { bootstrap } = require('./db/bootstrap');
const context = require('./services/context');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.post('/api/telemetry', validationMiddleware.validateTelemetry, telemetryController.handleTelemetry);

app.post('/api/incidents/:machine_id/acknowledge', incidentController.acknowledge);
app.post('/api/incidents/:machine_id/claim-fixed', incidentController.claimFixed);

if (require.main === module) {
  bootstrap(context.persistence, context);

  process.on('SIGINT', () => {
    context.persistence.close();
    process.exit(0);
  });

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
