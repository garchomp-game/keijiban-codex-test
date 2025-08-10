"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
describe('UsersModule', () => {
    let app;
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({ imports: [app_module_1.AppModule] }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('signup', () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/signup')
            .send({ email: 'test@example.com', displayName: 'tester' })
            .expect(201)
            .expect(res => {
            expect(res.body.email).toBe('test@example.com');
        });
    });
});
//# sourceMappingURL=users.e2e-spec.js.map