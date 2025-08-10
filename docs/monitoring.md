# Monitoring and Alerting

## Metrics Endpoint

The backend exposes Prometheus compatible metrics at `GET /metrics`.
Key metrics:

- `messages_total`: number of messages processed.
- `http_request_duration_seconds`: histogram of request latencies.
- `http_errors_total`: counter of HTTP 5xx responses.
- `open_connections`: gauge of active socket connections.

## Dashboard

Example Grafana dashboard JSON is available at `monitoring/grafana/dashboard.json`.
It visualizes message rate, P95 request latency, 5xx error rate and open connections.

## Alert Rules

Prometheus alert rules are defined in `monitoring/prometheus/alerts.yml`.
Alerts:

- **HighRequestLatency**: triggers when P95 latency exceeds 500ms for 5 minutes.
- **HighErrorRate**: triggers when 5xx error rate exceeds 1% for 5 minutes.

## Notification

Alerts are sent to the `#ops-alerts` Slack channel and to `ops@example.com`.

## Runbook

1. **HighRequestLatency**
   - Check recent deployments or infrastructure issues.
   - Examine application logs and metrics to find slow endpoints.
   - Scale the service if sustained high load is observed.
2. **HighErrorRate**
   - Inspect logs for stack traces.
   - Roll back recent changes if necessary.
   - Engage on-call engineer if unresolved within 15 minutes.

Update this document when alert destinations or procedures change.
