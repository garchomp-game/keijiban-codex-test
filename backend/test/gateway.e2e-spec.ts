import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import request from 'supertest';

describe('Gateway', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    await app.listen(0);
    const server = app.getHttpServer();
    const address = server.address();
    const port = typeof address === 'string' ? 0 : address.port;
    url = `http://localhost:${port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('message:send emits delivered', async () => {
    const roomRes = await request(app.getHttpServer()).post('/rooms').send({ name: 'Room', visibility: 'public' });
    const roomId = roomRes.body.roomId;
    const socket: Socket = io(`${url}/ws`, { transports: ['websocket'] });
    await new Promise<void>(resolve => socket.on('connect', () => resolve()));
    await new Promise<void>(resolve => socket.emit('room:join', { roomId }, () => resolve()));
    const delivered = new Promise(resolve => socket.on('message:delivered', resolve));
    socket.emit('message:send', { roomId, body: 'hi' });
    await delivered;
    socket.disconnect();
  });
});
