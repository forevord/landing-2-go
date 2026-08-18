// Every "free quote" button used to point at #formularz — the form at the foot
// of the page — including the two standing next to the hero form. A visitor on
// the first screen was thrown past ten thousand pixels to reach a form that was
// already beside them.
//
// Each button now resolves to the nearest form that is actually rendered and
// still ahead of the visitor, and the href stays as the no-JS fallback.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function nearestForm(): HTMLElement | null {
  const forms = [...document.querySelectorAll<HTMLElement>('.lead-form')].filter(
    // offsetParent is null while a form is display:none — the hero card below
    // lg, the quick form above it.
    (form) => form.offsetParent !== null,
  );

  let best: HTMLElement | null = null;
  let bestDistance = Infinity;

  for (const form of forms) {
    const { top, bottom } = form.getBoundingClientRect();
    // Already scrolled past: the next form down is the nearer one.
    if (bottom < 80) continue;
    const distance = Math.abs(top);
    if (distance < bestDistance) {
      best = form;
      bestDistance = distance;
    }
  }

  return best;
}

document.querySelectorAll<HTMLAnchorElement>('a[data-cta-quote]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const form = nearestForm();
    if (!form) return; // Everything is behind us: fall through to #formularz.

    event.preventDefault();
    form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    form.querySelector<HTMLInputElement>('input[name="phone"]')?.focus({ preventScroll: true });
  });
});
