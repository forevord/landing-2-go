function initSlider(root: HTMLElement): void {
  const range = root.querySelector<HTMLInputElement>('[data-range]');
  const after = root.querySelector<HTMLElement>('[data-after]');
  const handle = root.querySelector<HTMLElement>('[data-handle]');
  if (!range || !after || !handle) return;

  const paint = (percent: number): void => {
    after.style.clipPath = `inset(0 0 0 ${percent}%)`;
    handle.style.left = `${percent}%`;
  };

  range.addEventListener('input', () => paint(Number(range.value)));
  paint(Number(range.value));
}

document.querySelectorAll<HTMLElement>('[data-before-after]').forEach(initSlider);
