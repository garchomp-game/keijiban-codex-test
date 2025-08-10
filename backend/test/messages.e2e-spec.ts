import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('MessagesModule', () => {
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

  it('post message', async () => {
    const res = await request(app.getHttpServer())
      .post('/messages')
      .send({ roomId, body: 'hello' })
      .expect(201);
    const messageId = res.body.messageId;
    await request(app.getHttpServer())
      .get(`/rooms/${roomId}/messages`)
      .expect(200)
      .expect(resp => {
        expect(resp.body.some((m: any) => m.messageId === messageId)).toBeTruthy();
      });
  });
});
