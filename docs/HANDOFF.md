# Handoff — StalBruk landing page

**Date:** 2026-08-14
**Branch:** `feat/landing-mvp` (pushed, `6b49be4`)
**Other branches:** `redesign-wip` (`3c6bd3f`, the imported Custo reference), `main` (docs only)

---

## Where the project stands

The site is functionally complete and visually mid-redesign.

**Working and verified:** bilingual Polish/English static build (six pages), lead form with client and server validation posting to a Cloudflare Pages Function that fans out to Web3Forms and Telegram, honeypot spam trap, scroll reveals, language hint, before/after slider, sitemap, robots, JSON-LD, and a CI guard that fails if Polish copy appears outside `src/i18n/`.

**Lighthouse:** 100 / 100 / 100 / 100 on both desktop and mobile. LCP 0.6s desktop, 1.7s mobile, CLS 0. Keep it there — every change below must be re-measured.

**Test suite:** 21 pass, 1 fails on purpose (`carry no invented demo data`). That failure is the pre-launch gate; see below.

## Commands

```bash
npm run dev          # Astro dev server
npm run build        # static build into dist/
npm run preview      # wrangler pages dev dist — needed to exercise /api/lead
npm test             # vitest
npm run lint         # eslint + astro check
npm run check:copy   # fails if Polish diacritics appear outside src/i18n/
```

---

## Open item 1 — a responsive report I could not reproduce

The client reports the layout "does not narrow" and that there is effectively one fixed container.

I measured at 1024, 1280, 1440 and 1780px: the container is `max-w-page` (1280px), correctly centred, and `document.documentElement.scrollWidth === clientWidth` at every width including 375px. No horizontal overflow anywhere. So either the problem is outside the widths I tried, or it is specific to the viewing environment.

The screenshot that prompted the report was taken in what appears to be a VS Code preview pane rather than a standalone browser window, which is worth ruling out first — an embedded pane can report a layout viewport that does not match its rendered width.

**Before changing any layout code, get:**
- the exact viewport width where it breaks, and the browser
- whether it reproduces in a standalone Chrome/Safari window as well as the editor preview
- a screenshot with devtools open showing the viewport size

Do not "fix" this speculatively. Changing breakpoints without a reproduction risks breaking the widths that currently work.

## Open item 2 — finish aligning the page with the Custo reference

The reference is `redesign/DESIGN.md` plus `tokens.json`, `variables.css`, `theme.css`. Read it first.

The design system in `src/styles/global.css` and the hero (`Hero.astro`, `TopBar.astro`) were rebuilt on it: gunmetal canvas `#9ea29f`, obsidian type, the 57 → 15px scale with tracking left alone, 8px radii, pill primary button.

**The remaining sections have not been recomposed.** They were built during an earlier, darker pass and now merely inherit the new token values. They work and they pass contrast, but they do not yet read as the reference. Bring them across:

- `TrustBar`, `Pain`, `WhyUs` — the reference's two-column block: a small caption on the left, the large heading and body on the right, 24px column gap.
- `Services` — currently alternating full-width rows; keep the zigzag but move the photographs onto 8px-radius cards on a canvas band rather than bleeding them.
- `Gallery` — the reference's "product image card" grid: 8px radius, three up on desktop, one column on mobile.
- `Process`, `Contacts`, `Footer` — currently pure black. Consider the graphite `#4b514d` surface instead, which is the reference's dark tone.
- Section rhythm should be the reference's 110px.

**Two contrast rules that override the reference and are not negotiable:**
- White text on gunmetal is 2.58:1 and fails. Gunmetal takes black type only. Black at 75% opacity on it is 5.59:1 and is fine; at 60% it is 3.98:1 and is not.
- Graphite `#4b514d` on black is 2.09:1. Do not use it for text on the dark sections.

## Open item 3 — demo data must be replaced before launch

`src/i18n/{pl,en}.json` carry invented values: trust figures (12 years, 380 projects, 5-year warranty), phone `+48 601 234 567`, email, price from 6 500 PLN, lead time, company name and address. The NIP is deliberately impossible (`000-000-00-00`) so it cannot collide with a real company.

`_meta.demo: true` marks this, and `tests/i18n.test.ts` fails while it is true. Replace the values, set the flag to `false`, and the suite goes green. Do not clear the flag while the values are still invented.

The hardcoded `phone` and `email` constants in the six page files need updating alongside.

## Open item 4 — photography

`src/assets/photos/` holds ten licensed Unsplash images with attribution in `CREDITS.md`. They are a stopgap; the shot list for the real photographer is in `docs/design/placeholders/README.md`.

Two specific problems recorded in `CREDITS.md`:

- **The before/after pair is two different locations.** The slider claims one site photographed twice. That is fabricated evidence of work and must not ship — this is the one image slot where stock is not an acceptable stopgap.
- `gates.jpg` is a locked security shutter, not a driveway gate. It is deliberately unused; either re-source it or delete it.

## Open item 5 — Cloudflare deployment

Deferred at the client's request until the site was finished locally. `wrangler.toml` exists and `npm run preview` runs the Function locally.

Still to do, in the Cloudflare dashboard:
1. Connect the GitHub repository to a Pages project. Build command `npm run build`, output directory `dist`.
2. Add `WEB3FORMS_ACCESS_KEY`, `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as **secrets**, for Production and Preview.
3. Add `PUBLIC_CF_BEACON_TOKEN` once Web Analytics is enabled. The beacon is omitted entirely when the variable is unset, so nothing breaks before then.

**The lead delivery path has never been tested end to end** — no credentials exist yet. The honeypot path (200, nothing sent) and the validation path (422 with per-field codes) were verified against a local `wrangler pages dev`. Once the secrets are in place, submit a real test lead and confirm it arrives in both the inbox and the Telegram chat.

---

## Traps that have already cost time

**Tailwind 4 arbitrary values.** `rounded-[--radius-card]` and `max-w-[--page-max]` do not work — in v4 that syntax declares a custom property rather than reading one. Use the generated utility (`rounded-card`, `max-w-page`, from `--radius-*` and `--container-*` in `@theme`) or `var()` explicitly. This silently produced square corners and a full-width container twice.

**Custom CSS must live in `@layer components`.** At top level it comes after Tailwind's utilities in source order and overrides them. `.media { position: relative }` beat an `absolute` utility and pushed the entire hero content a thousand pixels down the page, leaving the first screen apparently empty.

**Scroll reveals need dwell time to verify.** A fast synthetic scroll skips the IntersectionObserver threshold and reports elements as hidden. Scroll in ~300px steps with ~250ms pauses before concluding anything is broken.

**The copy guard only catches Polish diacritics.** A hardcoded English string passes it. Keep user-visible text in `src/i18n/` by discipline, not by relying on the check.
