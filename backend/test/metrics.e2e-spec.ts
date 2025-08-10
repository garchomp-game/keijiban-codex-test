import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('MetricsModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /metrics should return prometheus metrics', async () => {
    const res = await request(app.getHttpServer())
      .get('/metrics')
      .expect(200);
    
    expect(res.text).toContain('# HELP');
    expect(res.text).toContain('# TYPE');
    expect(res.text).toContain('nodejs_version_info');
  });
});
