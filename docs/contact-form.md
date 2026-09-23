# Contact form

The contact form appears near the end of the homepage and at the localized contact routes. It uses React Hook Form and a shared Zod schema, with validation repeated by the server.

Supported service IDs are language independent: `business-website`, `landing-page`, `ecommerce`, `web-app`, `ui-ux`, `seo`, `design-system`, `consulting` and `other`.

Pricing links use a localized contact URL with `?service=<id>`. The selected service remains intact when switching languages.

The email integration uses the Resend-compatible HTTP API with `EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM` and `EMAIL_TO`. Customer confirmations follow the inquiry locale.
