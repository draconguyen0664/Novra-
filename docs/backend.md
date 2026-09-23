# Backend

The backend uses Next.js Route Handlers and Prisma. Public endpoints include contact, newsletter, AI consultation, projects, blog, services, pricing and FAQs. Admin endpoints require a signed, HTTP-only session cookie.

`POST /api/contact` applies a body size limit, same-origin checks, IP rate limiting, a honeypot, a minimum form completion time, localized Zod validation and plain-text sanitization before persistence. Email notifications are sent after the database transaction. Email failure does not discard a stored inquiry.

The AI endpoint calls the configured provider from the server. Without `OPENAI_API_KEY`, it returns a localized, explicit unavailable response and does not invent an AI answer.

Rate limiting uses a process-local store. For horizontally scaled deployments, replace `src/lib/security.ts` with a shared Redis-compatible limiter.
