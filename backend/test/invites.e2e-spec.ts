import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('InvitesModule', () => {
  let app: INestApplication;
  let roomId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    const roomRes = await request(app.getHttpServer()).post('/rooms').send({ name: 'Room', visibility: 'public' });
    roomId = roomRes.body.roomId;
  });

  afterAll(async () => {
    await app.close();
  });

  it('create and accept invite', async () => {
    const inviteRes = await request(app.getHttpServer())
      .post('/invites')
      .send({ roomId })
      .expect(201);
    const token = inviteRes.body.token;
    await request(app.getHttpServer()).post('/invites/accept').send({ token }).expect(201);
    await request(app.getHttpServer()).post('/invites/accept').send({ token }).expect(404);
  });
});
