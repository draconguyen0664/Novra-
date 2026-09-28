# Backend

The backend uses Next.js Route Handlers and Prisma. Public endpoints include contact, newsletter, AI consultation, projects, blog, services, pricing and FAQs. Admin endpoints require a signed, HTTP-only session cookie.

`POST /api/contact` applies a body size limit, same-origin checks, IP rate limiting, a honeypot, a minimum form completion time, localized Zod validation and plain-text sanitization before persistence. Email notifications are sent after the database transaction. Email failure does not discard a stored inquiry.

The AI endpoint uses the official OpenAI server SDK and Responses API. It validates up to 20 recent user/assistant messages, enriches the system instructions with published services, pricing and FAQs from Prisma, and falls back to the current dictionaries when the database is unavailable. It returns structured JSON with HTTP 400, 429, 502 or 503 errors; without `OPENAI_API_KEY`, it returns `AI_NOT_CONFIGURED` and never invents an AI answer.

Rate limiting uses a process-local store. For horizontally scaled deployments, replace `src/lib/security.ts` with a shared Redis-compatible limiter.
