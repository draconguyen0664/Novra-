# Database

The application uses PostgreSQL through Prisma 6. The schema is in `prisma/schema.prisma`, and the initial SQL migration is under `prisma/migrations`.

Setup:

```bash
cp .env.example .env
npm run prisma:generate
npm run db:migrate
npm run db:seed
```

Core models include users, contact and project inquiries, newsletter subscribers, services, projects, blog posts, categories, pricing plans, FAQs, site settings and audit logs.

Public CMS routes return only published records. Admin pages query fresh data. Public pages fall back to the curated locale dictionaries when the database is unavailable or empty.
