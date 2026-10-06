import type { ImageMetadata } from 'astro';

/**
 * Gallery projects. Each folder under src/assets/projects/ is one job; its
 * photos are shown in filename order and the first one is the cover. The copy
 * for each folder lives in the dictionaries under `gallery.projects`, whose
 * order is the display order.
 *
 * Adding a project = one folder of photos + one dictionary entry per locale
 * with exactly one alt text per photo. `getProjects` refuses to build
 * otherwise, so a project cannot ship without alt text.
 */

export interface ProjectCopy {
  id: string;
  title: string;
  summary: string;
  scope: string[];
  photoAlts: string[];
}

export interface ProjectPhoto {
  image: ImageMetadata;
  alt: string;
}

export interface Project extends ProjectCopy {
  photos: ProjectPhoto[];
}

const modules = import.meta.glob<{ default: ImageMetadata }>('../assets/projects/*/*.jpg', {
  eager: true,
});

/** Folder slug → images, sorted by filename. */
export function photosByProject(
  source: Record<string, { default: ImageMetadata }> = modules,
): Map<string, ImageMetadata[]> {
  const byProject = new Map<string, [string, ImageMetadata][]>();
  for (const [path, mod] of Object.entries(source)) {
    const [slug, file] = path.split('/').slice(-2);
    const list = byProject.get(slug) ?? [];
    list.push([file, mod.default]);
    byProject.set(slug, list);
  }
  return new Map(
    [...byProject].map(([slug, list]) => [
      slug,
      list.sort(([a], [b]) => a.localeCompare(b)).map(([, image]) => image),
    ]),
  );
}

export function getProjects(
  copies: ProjectCopy[],
  photos: Map<string, ImageMetadata[]> = photosByProject(),
): Project[] {
  const problems: string[] = [];

  for (const slug of photos.keys()) {
    if (!copies.some((copy) => copy.id === slug)) {
      problems.push(`folder "${slug}" has no gallery.projects entry`);
    }
  }

  for (const copy of copies) {
    const images = photos.get(copy.id);
    if (!images) {
      problems.push(`gallery.projects entry "${copy.id}" has no photo folder`);
    } else if (images.length !== copy.photoAlts.length) {
      problems.push(
        `"${copy.id}" has ${images.length} photos but ${copy.photoAlts.length} photoAlts`,
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(`Gallery projects are out of sync:\n- ${problems.join('\n- ')}`);
  }

  return copies.map((copy) => ({
    ...copy,
    photos: photos.get(copy.id)!.map((image, index) => ({ image, alt: copy.photoAlts[index] })),
  }));
}

/** "{n} photos" in the right plural form; the dictionary carries one string per CLDR category. */
export function photoCount(
  count: number,
  locale: string,
  forms: Record<'one' | 'few' | 'many' | 'other', string>,
): string {
  const rule = new Intl.PluralRules(locale).select(count) as keyof typeof forms;
  return (forms[rule] ?? forms.other).replace('{n}', String(count));
}
