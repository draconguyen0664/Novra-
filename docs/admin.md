# Admin

Create the first administrator after applying the database migration:

```bash
ADMIN_NAME="Novra Admin" \
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="a-long-unique-password" \
npm run admin:create
```

The admin application is available at `/admin`. It provides inquiry search and status updates plus create, edit and delete flows for projects, blog posts, services, pricing plans and FAQs.

Passwords are hashed with bcrypt. Sessions are signed, expire after eight hours and are stored in HTTP-only, same-site cookies. Production cookies are secure. Mutating admin API routes verify the request origin and write audit records.
