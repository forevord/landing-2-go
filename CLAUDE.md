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
- The palette is achromatic. The primary button is obsidian (`--cta: #000000`), darkening to graphite on hover; on the graphite bands it inverts to `.btn-paper`, because a black pill there sits at 2.59:1 against its own background. Red survives only on form errors.
- Never publish invented testimonials or unresolved `{{PLACEHOLDER}}` values.
