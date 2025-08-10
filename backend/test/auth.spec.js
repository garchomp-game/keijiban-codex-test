"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../src/app.module");
describe('Auth', () => {
    let app;
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('/auth/signup (POST)', () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/signup')
            .send({ email: 'a@example.com', password: 'password', displayName: 'Alice' })
            .expect(201)
            .expect((res) => {
            expect(res.body).toHaveProperty('userId');
            expect(res.body.email).toBe('a@example.com');
        });
    });
    it('/auth/login (POST)', async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/signup')
            .send({ email: 'b@example.com', password: 'password', displayName: 'Bob' })
            .expect(201);
        return (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'b@example.com', password: 'password' })
            .expect(200)
            .expect((res) => {
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
        });
    });
});
//# sourceMappingURL=auth.spec.js.map