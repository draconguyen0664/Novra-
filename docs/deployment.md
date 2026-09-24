# Deployment

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Generate a long random `AUTH_SECRET`.
3. Configure `NEXT_PUBLIC_SITE_URL` with the production origin.
4. Configure contact values and the email provider variables.
5. If CMS images use an external storage host, set `CMS_IMAGE_BASE_URL` to its HTTPS base URL.
6. Run `npm ci`, `npm run prisma:generate`, `npm run db:migrate` and `npm run build`.
7. Create the first admin with `npm run admin:create`.

Optional AI consultation requires `OPENAI_API_KEY` and may override `OPENAI_MODEL`.

Uploaded images are represented by URLs. `src/lib/storage.ts` defines the adapter boundary; connect an object storage provider before enabling file upload controls in the CMS. Next.js only optimizes remote images under `CMS_IMAGE_BASE_URL`; rebuild after changing this value.

Before release, verify `/vi`, `/en`, both contact routes, language switching, form validation, database insertion, email delivery and the protected admin workflows.
