import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('RoomsModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('create and list rooms', async () => {
    const res = await request(app.getHttpServer())
      .post('/rooms')
      .send({ name: 'Room1', visibility: 'public' })
      .expect(201);
    const roomId = res.body.roomId;
    await request(app.getHttpServer()).get('/rooms').expect(200).expect(resp => {
      expect(resp.body.some((r: any) => r.roomId === roomId)).toBeTruthy();
    });
  });
});
