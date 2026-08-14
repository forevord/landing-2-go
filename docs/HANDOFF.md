# Handoff — StalBruk landing page

**Date:** 2026-08-14
**Branch:** `feat/landing-mvp` (pushed, `6b49be4`)
**Other branches:** `redesign-wip` (`3c6bd3f`, the imported Custo reference), `main` (docs only)

---

## Where the project stands

The site is functionally complete and visually mid-redesign.

**Working and verified:** bilingual Polish/English static build (six pages), lead form with client and server validation posting to a Cloudflare Pages Function that fans out to Web3Forms and Telegram, honeypot spam trap, scroll reveals, language hint, before/after slider, sitemap, robots, JSON-LD, and a CI guard that fails if Polish copy appears outside `src/i18n/`.

**Lighthouse:** 100 / 100 / 100 / 100 on desktop. On mobile, accessibility, best practices and SEO are 100 and performance measures 99 (LCP 2.1s, CLS 0, TBT 0ms) against `dist/` served over plain HTTP on this machine. The same run on the commit before the section rebuild gives the identical 99 / 2.1s, so the rebuild costs nothing — the earlier 100 / 1.7s figure came from a different serving setup and is not reproducible here. Compare against a freshly measured baseline, not against the number in this file.

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

## Open item 1 — a responsive report that does not reproduce

The client reports the layout "does not narrow" and that there is effectively one fixed container.

Two rounds of measurement now say otherwise.

**Round one** (spot widths): the container is `max-w-page` (1280px), correctly centred, and `document.documentElement.scrollWidth === clientWidth` at 1024, 1280, 1440, 1780 and 375px.

**Round two** (the VS Code preview pane hypothesis): the preview pane is an iframe, so the page was loaded into an iframe and the iframe resized — the same rendering path the client's screenshot came through. The container tracks the frame exactly (420px frame → 420px container, 600 → 600, 900 → 900, 1100 → 1100), and a sweep from 320 to 1920px in 32px steps found no width with horizontal overflow. The layout reflows correctly inside an embedded pane.

So the page is not the cause. What remains is the viewing environment — most likely the pane's own zoom level, which changes the CSS-pixel viewport without changing the visible pane width and makes a wide pane render the narrow layout (or the reverse).

**Before changing any layout code, get:**
- the exact viewport width where it breaks, and the browser
- whether it reproduces in a standalone Chrome/Safari window as well as the editor preview
- a screenshot with devtools open showing the viewport size

Do not "fix" this speculatively. Changing breakpoints without a reproduction risks breaking the widths that currently work.

## Open item 2 — aligning the page with the Custo reference (done)

The reference is `redesign/DESIGN.md` plus `tokens.json`, `variables.css`, `theme.css`. Read it first.

The design system in `src/styles/global.css` and the hero (`Hero.astro`, `TopBar.astro`) were rebuilt on it: gunmetal canvas `#9ea29f`, obsidian type, the 57 → 15px scale with tracking left alone, 8px radii, pill primary button.

The remaining sections have now been recomposed on it too:

- **`.section` and `.split`** in `global.css` carry the reference's 110px band gap (76px below `lg`) and its two-column text block — a 280px caption rail, heading and body beside it, 24px apart. Both are single knobs; change them there, not per section.
- `TrustBar`, `Pain`, `WhyUs`, `Services`, `Gallery`, `Process`, `Contacts` all open with that block: the section's `title` string is the caption, its `lead` string is the `h2`. No new copy was needed for the change.
- `Services` sits on a gunmetal band with each photograph in a paper card at 20px padding — the reference's product image card — instead of bleeding into the section.
- `Gallery` is a three-up card grid (one column on mobile). It replaced a horizontal snap-scroller that hid four of the six photographs behind a gesture.
- `Process` and `Contacts` are graphite `#4b514d`, not black; every rule and muted tone on them is a white alpha.
- `Footer` went the other way, to paper white with a hairline top rule, which is what the reference specifies and stops the page ending in one unbroken dark tail.
- `--color-bg` (`#f2f2f0`) and `--color-ink-soft` are gone. The first was not one of the reference's three surfaces and nothing referenced the second any more.

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
