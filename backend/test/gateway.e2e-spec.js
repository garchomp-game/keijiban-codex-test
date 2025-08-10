"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
const socket_io_client_1 = require("socket.io-client");
const supertest_1 = __importDefault(require("supertest"));
describe('Gateway', () => {
    let app;
    let url;
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({ imports: [app_module_1.AppModule] }).compile();
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
        const roomRes = await (0, supertest_1.default)(app.getHttpServer()).post('/rooms').send({ name: 'Room', visibility: 'public' });
        const roomId = roomRes.body.roomId;
        const socket = (0, socket_io_client_1.io)(`${url}/ws`, { transports: ['websocket'] });
        await new Promise(resolve => socket.on('connect', () => resolve()));
        await new Promise(resolve => socket.emit('room:join', { roomId }, () => resolve()));
        const delivered = new Promise(resolve => socket.on('message:delivered', resolve));
        socket.emit('message:send', { roomId, body: 'hi' });
        await delivered;
        socket.disconnect();
    });
});
//# sourceMappingURL=gateway.e2e-spec.js.map