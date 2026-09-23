# Wama public frontend study

High-fidelity Next.js App Router reconstruction of the publicly observable homepage at `wama.com.br`.

## Run

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
npm run qa
```

`npm run qa` expects the development server at `http://localhost:3000` and uses the locally installed Chromium browser.

Copy `.env.example` to `.env.local` to set the canonical production URL and contact email.

## Structure

- `src/app`: App Router, metadata, robots and sitemap.
- `src/components`: layout, sections, UI and SEO markup.
- `src/animations`: GSAP, ScrollTrigger and Lenis integration.
- `src/data`: replaceable copy, branding and public media mapping.
- `public/media`: localized public reference imagery and video previews.
- `docs`: audit, design system, responsive/motion specifications, asset provenance and QA evidence.

The public reference remains the destination for case and article links. The contact form opens an email draft and does not use a private backend.
