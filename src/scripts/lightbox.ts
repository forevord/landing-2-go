interface Photo {
  src: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
}

interface ProjectData {
  id: string;
  title: string;
  photos: Photo[];
}

const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
const dataNode = document.getElementById('lightbox-data');

if (dialog && dataNode) {
  const projects = JSON.parse(dataNode.textContent ?? '[]') as ProjectData[];
  const track = dialog.querySelector<HTMLElement>('[data-lb-track]')!;
  const title = dialog.querySelector<HTMLElement>('[data-lb-title]')!;
  const count = dialog.querySelector<HTMLElement>('[data-lb-count]')!;
  const prev = dialog.querySelector<HTMLButtonElement>('[data-lb-prev]')!;
  const next = dialog.querySelector<HTMLButtonElement>('[data-lb-next]')!;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let total = 0;
  let opener: HTMLElement | null = null;
  let frame = 0;

  const current = () => Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));

  const paint = () => {
    const index = current();
    count.textContent = `${index + 1} / ${total}`;
    prev.disabled = index === 0;
    next.disabled = index >= total - 1;
  };

  const goTo = (index: number, smooth = true) => {
    const clamped = Math.min(Math.max(index, 0), total - 1);
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: smooth && !reduceMotion ? 'smooth' : 'instant',
    });
  };

  const render = (project: ProjectData) => {
    title.textContent = project.title;
    total = project.photos.length;
    track.replaceChildren(
      ...project.photos.map((photo) => {
        const item = document.createElement('li');
        const img = document.createElement('img');
        img.src = photo.src;
        img.srcset = photo.srcset;
        img.sizes = '100vw';
        img.width = photo.width;
        img.height = photo.height;
        img.alt = photo.alt;
        img.loading = 'lazy';
        img.decoding = 'async';
        item.append(img);
        return item;
      }),
    );
  };

  const open = (id: string, index: number, trigger: HTMLElement) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    opener = trigger;
    render(project);
    dialog.showModal();
    goTo(index, false);
    paint();
  };

  document.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-lightbox]');
    // Modified clicks keep the browser's own behaviour: open the photo in a tab.
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open(link.dataset.lightbox ?? '', Number(link.dataset.index ?? 0), link);
  });

  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(paint);
  });

  prev.addEventListener('click', () => goTo(current() - 1));
  next.addEventListener('click', () => goTo(current() + 1));
  dialog.querySelector('[data-lb-close]')!.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') goTo(current() - 1);
    else if (event.key === 'ArrowRight') goTo(current() + 1);
    else return;
    event.preventDefault();
  });

  // A click on the dark field around a photo closes, as it does everywhere else.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || (event.target as Element).matches('.lightbox__track > li')) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    track.replaceChildren();
    opener?.focus();
  });
}
