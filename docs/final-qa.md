# Final QA — 2026-09-22

## Result

No open critical or major issues. The homepage is statically rendered, responsive, accessible without animation, and independent of private Wama infrastructure. Public reference media was downloaded locally and recorded in `asset-manifest.json`.

## Visual

- Audited at 1920×1080, 1440×900, 1366×768, 1280×800, 1024×768, 834×1194, 768×1024, 430×932, 412×915, 390×844, 375×812 and 360×800.
- Hero, clients, projects, services and statistics were compared section by section. At the measured check sizes, desktop section-height differences were below 0.5px; mobile project and service sections were corrected after comparison.
- Lower-page screenshots are in `docs/qa/`. Browser QA reports no horizontal overflow at any requested viewport.
- Responsive project, client, service, FAQ and blog grids follow the reference's desktop/tablet/mobile breakpoints at 1200px and 810px.

## Motion

- GSAP powers project entrances and the scrubbed, pinned character sequence.
- Lenis is synchronized with the GSAP ticker and ScrollTrigger, with native touch scrolling.
- Public video previews are lazy-attached near the viewport, muted, paused offscreen and supplied with local posters.
- GSAP contexts, ticker callbacks, observers, videos and Lenis are cleaned up on unmount.
- `prefers-reduced-motion` removes continuous/scrub motion and exposes readable static content.

## SEO

- Metadata API: default title, title template, description, canonical, Open Graph, Twitter and index/follow directives.
- One H1, semantic sections/articles, crawlable links and meaningful image alt text.
- Organization, WebSite, WebPage and FAQPage JSON-LD are present in server HTML.
- `/robots.txt` and `/sitemap.xml` return 200 and allow the homepage.
- Social preview is a real 1200×630 JPEG.

## Accessibility

- Skip link, visible keyboard focus, labelled navigation and one logical H1 hierarchy.
- Mobile menu supports Escape and focus cycling/return.
- FAQ uses buttons, `aria-expanded` and `aria-controls`.
- Form fields have labels and native required/email validation; selection buttons expose `aria-pressed`.

## Performance

- Server Components hold SEO-critical content; client code is limited to header/menu, accordion/form and the animation controller.
- Images use `next/image`; only the central above-the-fold hero cards receive priority.
- Below-the-fold videos use `preload="none"` and attach sources near the viewport.
- Lausanne fonts are local and loaded through `next/font`.

## Validation

- `npm run lint`: pass, zero warnings.
- `npm run build`: pass; `/`, `/robots.txt` and `/sitemap.xml` statically prerendered.
- `npm run qa`: pass at all 12 requested viewports, zero console errors, one H1, JSON-LD present, canonical/description present, no horizontal overflow.

## Minor limitations

- Case and article detail pages intentionally remain public external links. The requested work reproduces the public homepage and does not invent private content or backend behavior.
- The contact form opens a prefilled email draft. Connect an owned form endpoint before production if server-side lead collection is required.
