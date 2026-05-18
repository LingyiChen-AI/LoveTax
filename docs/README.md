# zchat

A self-hosted couples daily-deduction web app.

- See `docs/superpowers/specs/2026-05-18-couples-app-design.md` for the design spec.
- See `docs/superpowers/plans/2026-05-18-couples-app.md` for the implementation plan.
- See `docs/deployment.md` for production deployment.

## Local dev

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d   # Postgres + Mailpit
npm install
npm run db:migrate
npm run seed:admin                                # optional
npm run dev
```

Open http://localhost:30001. Emails land in http://localhost:8025 (Mailpit).

## Tests

```bash
npm test                       # unit
docker compose -f docker-compose.test.yml up -d
npm run test:integration
npm run test:e2e
```
