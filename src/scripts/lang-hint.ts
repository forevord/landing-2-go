const STORAGE_KEY = 'lang-hint-dismissed';

function run(): void {
  const bar = document.querySelector<HTMLElement>('[data-lang-hint]');
  if (!bar) return;
  if (localStorage.getItem(STORAGE_KEY) === '1') return;

  const pageLocale = bar.dataset.pageLocale === 'en' ? 'en' : 'pl';
  const prefersPolish = navigator.languages.some((lang) => lang.toLowerCase().startsWith('pl'));

  // Only offer the switch when the browser disagrees with the page.
  const shouldOffer = pageLocale === 'pl' ? !prefersPolish : prefersPolish;
  if (!shouldOffer) return;

  bar.classList.remove('hidden');
  bar.classList.add('flex');

  bar.querySelector('[data-lang-hint-dismiss]')?.addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, '1');
    bar.remove();
  });
}

try {
  run();
} catch {
  // localStorage throws in some private-browsing modes. A missing hint is not
  // worth breaking the page over.
}
