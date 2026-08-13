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

TBD — filled in after Step 1.

## Conventions

- Write all documentation, code comments and commit messages in English.
- Reply to the user in Russian.
- No user-visible string may live outside `src/i18n/`.
- Animate only `transform` and `opacity`; never use `ease-in` for UI motion.
- Buttons use `--cta: #C2410C` (contrast 5.17:1); `#EA580C` is for hover and accents only.
- Never publish invented testimonials or unresolved `{{PLACEHOLDER}}` values.
