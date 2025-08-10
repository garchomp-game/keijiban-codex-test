import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
  private register: promClient.Registry;
  private httpRequestsTotal: promClient.Counter<string>;
  private httpRequestDuration: promClient.Histogram<string>;

  constructor() {
    this.register = new promClient.Registry();
    
    // Collect default metrics
    promClient.collectDefaultMetrics({ register: this.register });

    // Create custom metrics
    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      registers: [this.register],
    });
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
  }

  observeHttpRequestDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }
}
