# AGENTS Instructions

- Use Node.js version specified in `.nvmrc` (v20) and npm as the package manager.
- Start infrastructure services with `docker compose up -d`.
  - PostgreSQL is exposed on port 5432.
  - Redis is exposed on port 6379.
- Development servers:
  - API: `npm run dev:api` (http://localhost:3000)
  - Web: `npm run dev:web` (http://localhost:4200)
- Testing:
  - API tests: `npm run test:api`
  - Web tests: `npm run test:web`
  - End-to-end tests: `npm run e2e`
- Quality checks: run `npm run lint` and `npm run typecheck` before committing.
