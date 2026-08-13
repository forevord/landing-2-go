import { describe, expect, it } from 'vitest';
import pl from '../src/i18n/pl.json';
import en from '../src/i18n/en.json';

function collectKeys(value: unknown, prefix = ''): Set<string> {
  const keys = new Set<string>();
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const path = `${prefix}${index}.`;
      keys.add(`${prefix}${index}`);
      collectKeys(item, path).forEach((k) => keys.add(k));
    });
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const path = `${prefix}${key}`;
      keys.add(path);
      collectKeys(child, `${path}.`).forEach((k) => keys.add(k));
    }
  }
  return keys;
}

function collectEmptyStrings(value: unknown, prefix = ''): string[] {
  const empty: string[] = [];
  if (typeof value === 'string' && value.trim() === '') {
    empty.push(prefix.replace(/\.$/, ''));
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => empty.push(...collectEmptyStrings(item, `${prefix}${index}.`)));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      empty.push(...collectEmptyStrings(child, `${prefix}${key}.`));
    }
  }
  return empty;
}

describe('dictionaries', () => {
  it('have identical key sets', () => {
    const plKeys = collectKeys(pl);
    const enKeys = collectKeys(en);
    const missingInEn = [...plKeys].filter((k) => !enKeys.has(k)).sort();
    const missingInPl = [...enKeys].filter((k) => !plKeys.has(k)).sort();
    expect(missingInEn).toEqual([]);
    expect(missingInPl).toEqual([]);
  });

  it('contain no empty strings', () => {
    expect(collectEmptyStrings(pl)).toEqual([]);
    expect(collectEmptyStrings(en)).toEqual([]);
  });

  it('leave no unresolved placeholders in production builds', () => {
    // This assertion is expected to FAIL until the client supplies the real data.
    // Un-skip it as the final pre-launch gate (Task 18).
    const serialised = JSON.stringify(pl) + JSON.stringify(en);
    const unresolved = serialised.match(/\{\{[A-Z_]+\}\}/g) ?? [];
    expect.soft(unresolved).toEqual([]);
  });
});
