# Experience motion audit

Audit date: 2026-09-22  
Reference: https://wama.com.br/  
Local: http://localhost:3000/

## Inspection method

The reference was measured at 1440, 1024, 768, 430, and 390 pixels wide with a 900-pixel viewport height. Each viewport was sampled at 0%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90%, and 100% of this section's scroll travel. The audit records each rendered character's transform, opacity, and viewport position. Screenshots and raw reports are in `docs/experience-motion/`.

## Reference structure

- The outer section is `550vh`, or 4,950 pixels with the 900-pixel audit viewport.
- The outer section is relative and clips its contents.
- A 100vh inner stage remains sticky at `top: 0`; the reference does not add a separate pin spacer.
- The word band remains vertically centered for the full scroll distance.
- All four words occupy the same centered layer.
- A horizontal overflow mask clips characters while they cross the top or bottom edge.
- Characters move independently from left to right.

## Measured typography and travel

| Viewport width | Font size | Line height / character travel |
| --- | ---: | ---: |
| 1440 | 96px | 115.2px |
| 1024 | 48px | 57.6px |
| 768 | 34px | 40.8px |
| 430 | 34px | 40.8px |
| 390 | 34px | 40.8px |

The animation uses no observable horizontal translation, scale, or rotation. Entering characters travel from `translateY(100%)` to `0`; exiting characters travel from `0` to `translateY(-100%)`. Opacity follows the same per-character progress from 0 to 1 or 1 to 0.

## Reference checkpoints

The following values are mean character opacity for each visible transition. Individual letters are staggered, so the partially visible fragments are intentional.

| Progress | Observable state |
| ---: | --- |
| 0% | Experiência fully visible |
| 10% | Experiência begins leaving from its first letter; mean opacity 0.99 |
| 20% | Experiência 0.44; Inovação begins entering at 0.13 |
| 30% | Experiência gone; Inovação 0.83 |
| 40% | Inovação fully visible |
| 50% | Inovação 0.47; Design begins entering at 0.11 |
| 60% | Design 0.81 |
| 70% | Design fully visible |
| 80% | Design 0.48; Tecnologia begins entering at 0.07 |
| 90% | Design gone; Tecnologia 0.75 |
| 100% | Tecnologia fully visible |

The outgoing and incoming words overlap briefly during each handoff. Both directions stagger left to right. Scrolling upward reverses the same timeline naturally.

## Implementation

`ExperienceMotion.tsx` is the only client boundary for this section. It renders each character as a reusable mask-and-character span pair, owns a scoped GSAP context, and drives one ScrollTrigger timeline with direct scrub behavior. ScrollTrigger pins the 100vh stage from `top top` for another `450vh`; `pinSpacing: true` produces an effective section height of `550vh`. The shared Lenis controller remains synchronized through `ScrollTrigger.update()` and GSAP's ticker.

The global page motion controller no longer writes transforms to these characters. The Experience timeline initializes in both browser motion-preference modes because the previous reduced-motion branch could leave this required scroll interaction static.

## Comparison result

The final automated comparison uses every character across all 11 checkpoints and all five viewports:

- Section height match: exact at all five widths.
- Mean character opacity error: 0.0047.
- Mean normalized vertical-position error: 0.0047 of one line height.
- Runtime console and page errors: 0.
- Runtime pin audit: the pin spacer and section are both 4,950 pixels at a 900-pixel viewport; the stage remains at the viewport top through the active sequence.
- Motion-preference audit: `no-preference` and `reduce` produce the same scrubbed checkpoint states, preventing a static fallback.
- Quarter-point comparison at 0%, 25%, 50%, 75%, and 100% matches the same visible-word sequence and fragment timing.
- Reverse-scroll comparison returned a maximum state error of 0; the timeline retraces exactly when scrolling upward.
- Typography sizes and transform distances match the measured responsive values.

The detailed local result is stored in `docs/experience-motion/local-v2-detail.json`.
