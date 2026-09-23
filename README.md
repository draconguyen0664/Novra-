# Novra website

Production-ready Next.js App Router website for Novra with Vietnamese and English routes, localized SEO, GSAP motion, a PostgreSQL/Prisma backend, a validated project inquiry form and a protected admin CMS.

## Development

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

The public site starts at `/vi` and `/en`. See `docs/` for database, backend, contact, admin, i18n and deployment instructions.

## Validation

```bash
npm run typecheck
npm run lint
npm run prisma:validate
npm run prisma:generate
npm run build
```
