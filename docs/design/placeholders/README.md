# Image Placeholders

The SVGs in this folder are temporary. They are drawn in the brand palette (graphite `#0F172A`,
steel `#334155`, accent `#C2410C`), at the correct aspect ratios and with proper `viewBox` values,
so the layout will not shift when real photographs replace them — keep the ratio and the swap is clean.

The served copies of these SVGs live in `public/images/placeholders/`; this folder keeps the shot list for the photographer.

| File | Used in | Format | Replace with |
|---|---|---|---|
| `hero-gate.svg` | Hero, above the fold | 16:9, 1600×900 | The headline shot: a complete aluminium sliding gate, three-quarter angle |
| `service-paving.svg` | "Brukarstwo" card | 4:3, 1200×900 | A finished driveway shot from above at an angle, texture of the laying pattern visible |
| `service-earthworks.svg` | "Pod klucz" card | 4:3, 1200×900 | An excavator on site, ideally with people — machinery mid-work |
| `before-driveway.svg` | Before/after slider | 16:9, 1600×900 | The yard before the work. **Must be shot from the same position as the "after"** |
| `after-driveway.svg` | Before/after slider | 16:9, 1600×900 | The same yard after handover |
| `avatar.svg` | Testimonials | 1:1, 160×160 | A customer photograph — only with written consent |

## Shot List for the Photographer

The minimum that covers the whole page:

1. **Hero** — one gate shot during golden hour, three-quarter angle, house and driveway visible. Landscape.
2. **Three services** — one frame each for gates, paving and earthworks.
3. **Gallery** — six different sites, ideally across several towns. The captions in the content already
   name Gdańsk, Rumia, Gdynia, Sopot, Pruszcz Gdański and Kartuzy, so either shoot there or edit the captions.
4. **Before/after** — at least one pair from an identical position, on a tripod. This is the strongest
   proof available for paving work and is worth a dedicated visit to the site before work begins.
5. **Details** — macro of a weld seam and a profile end. It backs the "laser welding" claim better than text does.
6. **Crew and machinery** — a branded excavator, the team at work. This is what makes "0 subcontractors" credible.

Shoot landscape, in RAW, no filters. Delivered to the site as AVIF plus WebP inside `<picture>`,
always with explicit `width` and `height`.

## If Photography Is Not Ready by Launch

Free licences that permit commercial use without attribution:

- **Unsplash** — unsplash.com/license — queries: `aluminium gate`, `sliding gate house`,
  `paving stones driveway`, `excavator construction site`
- **Pexels** — pexels.com/license — same queries
- **Pixabay** — pixabay.com/service/license-summary

Note that stock photography is a stopgap. It undercuts trust in exactly the place the page is trying to
build it: a visitor from Gdańsk recognises none of the sites. On the pre-launch checklist (Step 10),
swapping stock for real photographs is a blocking item.
