import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('UsersModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('signup', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@example.com', displayName: 'tester' })
      .expect(201)
      .expect(res => {
        expect(res.body.email).toBe('test@example.com');
      });
  });
});
