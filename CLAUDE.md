# landing-2-go — StalBruk landing page

Lead-generation landing page for a metal gates and block paving contractor in Gdańsk, Poland.

## Documents

- [`info/SPEC.md`](info/SPEC.md) — original product specification
- [`docs/superpowers/specs/2026-08-13-stalbruk-landing-design.md`](docs/superpowers/specs/2026-08-13-stalbruk-landing-design.md) — current design spec; supersedes parts of `info/SPEC.md`
- [`docs/content/`](docs/content/) — PL and EN copy drafts
- [`docs/design/placeholders/`](docs/design/placeholders/) — image placeholders and photographer shot list

## Stack

Astro (static) + TypeScript + Tailwind CSS, no React.
Hosting: Cloudflare Pages. Lead delivery: Cloudflare Pages Function → Web3Forms (email) + Telegram Bot API.
Locales: `/` = Polish (default), `/en/` = English.

## Commands

```bash
npm run dev          # Astro dev server
npm run build        # static build into dist/
npm run preview      # wrangler pages dev dist — needed to exercise /api/lead
npm test             # vitest
npm run lint         # eslint + astro check
npm run check:copy   # fails if Polish diacritics appear outside src/i18n/
```

## Conventions

- Write all documentation, code comments and commit messages in English.
- Reply to the user in Russian.
- No user-visible string may live outside `src/i18n/`.
- Animate only `transform` and `opacity`; never use `ease-in` for UI motion.
- The palette is obsidian, graphite, sand (`#f1efec`), paper and one accent: petrol `#14424c`. The gunmetal canvas `#9ea29f` was removed — it forbids white type (2.59:1) and read as an unpainted placeholder. The accent carries figures, icons, arrow links and focus rings; it must never appear on a dark band, where it measures 1.91:1 on obsidian and 1.6:1 on graphite.
- The primary button stays obsidian, darkening to graphite on hover; on the graphite bands it inverts to `.btn-paper`. Secondary actions on light surfaces use `.btn-outline` in the accent. Red survives only on form errors.
- Shadows are banned everywhere except the lead form, which has to read as a surface you act on rather than another paragraph.
- Every section opens with `SectionHeading.astro`: a full-width petrol band, kicker above the heading, `tone="dark"` on the graphite sections where petrol would sit at 1.6:1 against its own background. The heading measure is deliberately wide (56ch) — a narrow measure was what turned every heading into a five-line block with the row half empty.
- The hero photograph runs at full strength behind `.hero-scrim`, never behind a flat opacity veil. Changing the scrim, the band colour or the photograph means re-running the pixel probe described in `docs/HANDOFF.md` — contrast over a photograph is not something Lighthouse evaluates.
- Never publish invented testimonials or unresolved `{{PLACEHOLDER}}` values.
