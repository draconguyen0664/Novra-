# Motion specification

Evidence: public computed transforms, scroll samples and interaction captures. Timings below are reconstruction estimates, not claims about private animation source.

| Element | Trigger | Initial → final | Timing / scroll |
|---|---|---|---|
| Hero heading/body | load | visible text enters subtly | ~.7s ease out |
| Hero fan | load / continuous / pointer | eight cards around a shared low pivot, 12.5° angular spacing | continuously rotating/recycling; pointer changes progression; preserve portrait crop and shadows |
| Navigation labels | hover | duplicate text rolls from below while original leaves above | ~.25s ease |
| Navigation | scroll | white/black theme depending on underlying section; word stage hides nav | fixed, no layout space |
| Clients | viewport | y30 to y0 / opacity0 to1 | ~.6s; grid logo hover flips/moves |
| Project cards | viewport | scale .9 to1 | ~.7s at top near viewport bottom; media 16:9, no permanent inset |
| Project previews | hover / visibility | image to looping video where present | muted; no audio; stop offscreen |
| Word stage | scroll | masked character y100% →0→-100%, slight rotation/opacity | sticky 100vh within 550vh; four sequential words, ~450vh scroll travel; reversible |
| Service tiles | viewport | media loop | public video visuals, no substitute generic animation |
| Stats | scroll desktop | y0/200/400/600 →0 | scrub, 4 columns; no stagger offset on small screens |
| FAQ | click | first open, others collapsed; plus →minus | ~.3s; single answer open, can close all |
| Contact chips | click | outlined to filled | immediate selection feedback |

Reduced motion: stop continuous fan, disable scrub/pinning and entry transforms, present four static words, static posters for videos; keep content visible without JS. Lenis desktop wheel smoothing via GSAP ticker, ScrollTrigger.update on Lenis scroll; native touch; complete cleanup on unmount.
