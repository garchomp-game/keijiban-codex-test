"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
describe('RoomsModule', () => {
    let app;
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({ imports: [app_module_1.AppModule] }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('create and list rooms', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/rooms')
            .send({ name: 'Room1', visibility: 'public' })
            .expect(201);
        const roomId = res.body.roomId;
        await (0, supertest_1.default)(app.getHttpServer()).get('/rooms').expect(200).expect(resp => {
            expect(resp.body.some((r) => r.roomId === roomId)).toBeTruthy();
        });
    });
});
//# sourceMappingURL=rooms.e2e-spec.js.map