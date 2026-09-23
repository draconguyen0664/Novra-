# Public reference audit

Reference: https://wama.com.br/ — inspected 2026-09-21 using Chromium, public DOM, computed styles, viewport captures, scroll and interaction samples. No private endpoints or source repositories accessed. Raw evidence is in reference/. Measurements below are at 1440×900 before scroll reveals settle; translated entry elements can be 16–30px below their settled position.

## Section order and geometry

| Element | x / y | Width × height | Padding | Gap |
|---|---|---|---|---|
| Hero #hero | 0 / 0 | 1440 × 1230 | 156px 0px 160px | 0px |
| Clientes #clientes | 0 / 1230 | 1440 × 1079 | 160px 0px | 0px |
| Container  | 72 / 1420 | 1296 × 759 | 0px | 80px |
| Cases #cases | 0 / 2309 | 1440 × 9657 | 160px 0px | 100px |
| Palavras  | 0 / 11966 | 1440 × 4950 | 0px | 0px |
| Serviços #services | 0 / 16816 | 1440 × 1832 | 160px 0px | 100px |
| Big Numbers #big-numbers | 0 / 18648 | 1440 × 1858 | 160px 0px | 0px |
| FAQ  | 20 / 20506 | 1400 × 1819 | 160px 0px | 120px |
| Footer  | 72 / 22325 | 1296 × 1319 | 160px 0px | 80px |
| Footer  | 0 / 23643 | 1440 × 858 | 56px 0px | 0px |

1. Fixed navigation, 79px desktop, 90% container (max 1400px), 20px top/bottom; central navigation, left vector logo, right pill CTA. Text rolls vertically on hover. Dark sections switch the navigation theme.
2. Hero: H1 900px maximum, centered; body 600px maximum; 20px text gap, 64px gap to card fan. Fan 2.11765:1; gray #f7f7f7 clipping surface. Eight overlapping portrait cards, 0.62 aspect, height 67%, top 11%, 290% vertical transform origin; 12.5-degree spacing; continuous angular motion. Mobile fan deliberately overflows its short wrapper.
3. Clients: black, section header 20% label / remaining headline with 24px gap. Logo grid offset by same label column, five columns and three rows, 5px gap, dark #101010 tiles, 1.115:1 tile ratio. 14 client cells plus +200. Logos respond on hover.
4. Projects: 20 public cases. Two columns, 48px horizontal gap, 120px row gap. Every third spans both columns. 16:9 media, object-fit cover; 16px image-to-description gap, 6px tags, 8px title gap. Cards enter scaled to .9 then settle at 1; some previews play public videos. Hover enlarges preview and shows project affordance. Links resolve to public case pages.
5. Experience: 550vh section, sticky 100vh stage, four words replaced character by character through a clipped line. Dark gray gradient. Curved section boundaries. This is a pinned word sequence, not a conventional marquee.
6. Services: eight tiles in two asymmetric rows. First row width units 2/3/3/2; second 2/3/2/3. 24px columns, 96px rows. Square small previews, portrait 372×485 large previews, looping videos. 20px media/text gap, 6px title/body gap.
7. Statistics: black section, four white cards (309×248), 20px gaps. Desktop starts at offsets 0/200/400/600px, cards converge upward with scroll.
8–9. Manifesto/founder: same black section, 60px after stats, paired 638×630 panels, 20px gap. Umbrella photo on left, white quote panel on right, quote aligned near bottom, founder avatar 60px.
10. FAQ: 1400px outer container, inner 90%; left questions 868px, 80px gap, 312px sticky help column. First answer open initially, ten numbered items, 72px closed rows, thin pale borders.
11. Blog: inside FAQ region, 120px separation, 4-column grid, 20px gaps, 4:3 media, 12px card text padding. Responsive 4/3/2 cards.
12. Contact: black, 90% container, two columns with 80px gap, gray form panel, labels and pill multi-select controls. Public form submission is not exercised to avoid sending unsolicited contact.
13. Footer: black, 56px vertical padding, service/case/article/social links and address; large wordmark and small imagery.

## Scope
Homepage reconstruction. Case, blog, service and social destinations remain public external links unless a matching local route is implemented. No invented detail pages or copied private backend. Branding, text, media and links will live in replaceable data files.
