const express = require('express');
const promClient = require('prom-client');

const app = express();
const register = new promClient.Registry();

promClient.collectDefaultMetrics({ register });

const messageCounter = new promClient.Counter({
  name: 'messages_total',
  help: 'Total messages processed',
  registers: [register]
});

const requestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['code'],
  registers: [register]
});

const errorCounter = new promClient.Counter({
  name: 'http_errors_total',
  help: 'Total HTTP 5xx errors',
  registers: [register]
});

const requestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.05,0.1,0.2,0.3,0.4,0.5,0.75,1,2,5],
  registers: [register]
});

const connectionGauge = new promClient.Gauge({
  name: 'open_connections',
  help: 'Number of open socket connections',
  registers: [register]
});

app.use((req, res, next) => {
  const end = requestDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    end({ code: res.statusCode });
    requestCounter.inc({ code: res.statusCode });
    if (res.statusCode >= 500) {
      errorCounter.inc();
    }
  });
  next();
});

app.post('/messages', (req, res) => {
  messageCounter.inc();
  res.status(201).json({ status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

let connections = 0;
server.on('connection', (socket) => {
  connections++;
  connectionGauge.set(connections);
  socket.on('close', () => {
    connections--;
    connectionGauge.set(connections);
  });
});

module.exports = { app, server };
