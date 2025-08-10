import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/signup (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'a@example.com', password: 'password', displayName: 'Alice' })
      .expect(201)
      .expect((res: request.Response) => {
        expect(res.body).toHaveProperty('userId');
        expect(res.body.email).toBe('a@example.com');
      });
  });

  it('/auth/login (POST)', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'b@example.com', password: 'password', displayName: 'Bob' })
      .expect(201);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'b@example.com', password: 'password' })
      .expect(200)
      .expect((res: request.Response) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
      });
  });
});
