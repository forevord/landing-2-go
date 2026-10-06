import { describe, expect, it } from 'vitest';
import type { ImageMetadata } from 'astro';
import pl from '../src/i18n/pl.json';
import en from '../src/i18n/en.json';
import { getProjects, photoCount, type ProjectCopy } from '../src/lib/projects';

const img = (name: string) => ({ src: name }) as unknown as ImageMetadata;
const copy = (id: string, alts: number): ProjectCopy => ({
  id,
  title: id,
  summary: '',
  scope: [],
  photoAlts: Array.from({ length: alts }, (_, i) => `alt ${i}`),
});

describe('gallery projects', () => {
  it('match the photo folders in both locales', () => {
    expect(() => getProjects(pl.gallery.projects)).not.toThrow();
    expect(() => getProjects(en.gallery.projects)).not.toThrow();
  });

  it('refuse a folder without an entry, an entry without a folder, and missing alts', () => {
    const photos = new Map([
      ['a', [img('1'), img('2')]],
      ['orphan', [img('1')]],
    ]);
    expect(() => getProjects([copy('a', 1), copy('ghost', 0)], photos)).toThrowError(
      /orphan[\s\S]*2 photos but 1 photoAlts[\s\S]*ghost/,
    );
  });

  it('pairs each photo with its alt in order', () => {
    const [project] = getProjects([copy('a', 2)], new Map([['a', [img('1'), img('2')]]]));
    expect(project.photos.map((p) => p.alt)).toEqual(['alt 0', 'alt 1']);
  });
});

describe('photoCount', () => {
  it('uses Polish plural forms', () => {
    const forms = pl.gallery.photos;
    expect(photoCount(1, 'pl', forms)).toBe('1 zdjęcie');
    expect(photoCount(4, 'pl', forms)).toBe('4 zdjęcia');
    expect(photoCount(5, 'pl', forms)).toBe('5 zdjęć');
    expect(photoCount(22, 'pl', forms)).toBe('22 zdjęcia');
  });

  it('uses English plural forms', () => {
    expect(photoCount(1, 'en', en.gallery.photos)).toBe('1 photo');
    expect(photoCount(5, 'en', en.gallery.photos)).toBe('5 photos');
  });
});
