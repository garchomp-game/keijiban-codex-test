"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
describe('InvitesModule', () => {
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
    it('create and accept invite', async () => {
        const inviteRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/invites')
            .send({ roomId })
            .expect(201);
        const token = inviteRes.body.token;
        await (0, supertest_1.default)(app.getHttpServer()).post('/invites/accept').send({ token }).expect(201);
        await (0, supertest_1.default)(app.getHttpServer()).post('/invites/accept').send({ token }).expect(404);
    });
});
//# sourceMappingURL=invites.e2e-spec.js.map