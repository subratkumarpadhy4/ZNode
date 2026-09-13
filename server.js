require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const validationMiddleware = require('./middleware/validation');
const telemetryController = require('./controllers/telemetryController');
const incidentController = require('./controllers/incidentController');
const { bootstrap } = require('./db/bootstrap');
const { Broadcaster } = require('./services/broadcaster');
const context = require('./services/context');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.post('/api/telemetry', validationMiddleware.validateTelemetry, telemetryController.handleTelemetry);
app.post('/api/incidents/:machine_id/acknowledge', incidentController.acknowledge);
app.post('/api/incidents/:machine_id/claim-fixed', incidentController.claimFixed);

// ── Socket.io setup (always created so tests can use it) ─────────────────────
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const broadcaster = new Broadcaster(io, 500);
context.broadcaster = broadcaster;

function buildSnapshot(ctx) {
  return Object.keys(ctx.machineRegistry).map(machineId => {
    const machine = ctx.machineRegistry[machineId];
    const lastState = machine.lastOperatingState;
    const baseline = lastState ? ctx.baselineStore.get(machineId, lastState) : { mean: 0 };
    const incident = ctx.incidentEngine.getActive(machineId);
    return {
      machine_id: machineId,
      baseline_mean: baseline.mean,
      anomaly: { is_anomaly: false, flags: [], reason: null, z_kw: 0, z_temp: 0 },
      incident: incident ? {
        id: incident.id,
        status: incident.status,
        flags: [...incident.flags],
        max_anomaly_streak: incident.maxAnomalyStreak
      } : null,
      metrics: { loss_rupees_per_hour: 0, excess_kw: 0, confidence: null, signatures_matched: 0 },
      carbon: { co2_rate_kg_hr: 0 },
      lifecycleEvents: []
    };
  });
}

io.on('connection', (socket) => {
  socket.emit('snapshot', buildSnapshot(context));
});

app.get('/api/machines/snapshot', (req, res) => {
  res.json({ ok: true, machines: buildSnapshot(context) });
});

// ── Expose for tests ──────────────────────────────────────────────────────────
app.httpServer = httpServer;
app.broadcaster = broadcaster;
app.io = io;

if (require.main === module) {
  bootstrap(context.persistence, context);
  broadcaster.start();

  process.on('SIGINT', () => {
    broadcaster.stop();
    context.persistence.close();
    process.exit(0);
  });

  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
