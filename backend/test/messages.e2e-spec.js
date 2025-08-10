"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
describe('MessagesModule', () => {
    let app;
    let roomId;
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({ imports: [app_module_1.AppModule] }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
        const roomRes = await (0, supertest_1.default)(app.getHttpServer()).post('/rooms').send({ name: 'Room', visibility: 'public' });
        roomId = roomRes.body.roomId;
    });
    afterAll(async () => {
        await app.close();
    });
    it('post message', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/messages')
            .send({ roomId, body: 'hello' })
            .expect(201);
        const messageId = res.body.messageId;
        await (0, supertest_1.default)(app.getHttpServer())
            .get(`/rooms/${roomId}/messages`)
            .expect(200)
            .expect(resp => {
            expect(resp.body.some((m) => m.messageId === messageId)).toBeTruthy();
        });
    });
});
//# sourceMappingURL=messages.e2e-spec.js.map