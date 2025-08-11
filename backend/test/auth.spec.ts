import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { execSync } from 'child_process';

describe('Auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Initialize test database
    try {
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } catch (error) {
      console.log('Migration setup completed');
    }

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

  it('enforces single-use refresh token rotation', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'c@example.com', password: 'password', displayName: 'Carol' })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'c@example.com', password: 'password' })
      .expect(200);

    const refreshToken1 = loginRes.body.refreshToken;

    const refreshRes1 = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: refreshToken1 })
      .expect(200);

    const refreshToken2 = refreshRes1.body.refreshToken;

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: refreshToken1 })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: refreshToken2 })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: refreshToken2 })
      .expect(401);
  });

  it('invalidates refresh token on logout', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'd@example.com', password: 'password', displayName: 'Dave' })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'd@example.com', password: 'password' })
      .expect(200);

    const refreshToken = loginRes.body.refreshToken;

    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });
});
