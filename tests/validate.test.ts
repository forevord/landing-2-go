import { describe, expect, it } from 'vitest';
import { validateLead, type LeadInput } from '../src/lib/validate';

const compactValid: LeadInput = {
  phone: '+48 600 123 456',
  service: 'brukarstwo',
  gdpr: true,
  source: 'hero',
};

const fullValid: LeadInput = {
  ...compactValid,
  name: 'Jan',
  city: 'Gdańsk',
  email: 'jan@example.com',
  message: 'Podjazd 40 m2',
  source: 'full',
};

describe('validateLead — compact variant', () => {
  it('accepts a minimal valid lead', () => {
    expect(validateLead(compactValid, 'compact')).toEqual({});
  });

  it('rejects a missing phone number', () => {
    expect(validateLead({ ...compactValid, phone: '' }, 'compact')).toEqual({ phone: 'required' });
  });

  it('rejects a phone number with fewer than 9 digits', () => {
    expect(validateLead({ ...compactValid, phone: '600 12' }, 'compact')).toEqual({
      phone: 'phoneInvalid',
    });
  });

  it('accepts a phone number written with separators', () => {
    expect(validateLead({ ...compactValid, phone: '(58) 555-11-22' }, 'compact')).toEqual({});
  });

  it('rejects an unknown service value', () => {
    expect(validateLead({ ...compactValid, service: 'kosmodrom' }, 'compact')).toEqual({
      service: 'serviceRequired',
    });
  });

  it('rejects a missing GDPR consent', () => {
    expect(validateLead({ ...compactValid, gdpr: false }, 'compact')).toEqual({
      gdpr: 'gdprRequired',
    });
  });

  it('does not require name or city', () => {
    expect(validateLead({ ...compactValid, name: undefined, city: undefined }, 'compact')).toEqual(
      {},
    );
  });
});

describe('validateLead — full variant', () => {
  it('accepts a complete lead', () => {
    expect(validateLead(fullValid, 'full')).toEqual({});
  });

  it('requires a name', () => {
    expect(validateLead({ ...fullValid, name: '' }, 'full')).toEqual({ name: 'required' });
  });

  it('rejects a one-character name', () => {
    expect(validateLead({ ...fullValid, name: 'J' }, 'full')).toEqual({ name: 'nameShort' });
  });

  it('requires a city', () => {
    expect(validateLead({ ...fullValid, city: '  ' }, 'full')).toEqual({ city: 'required' });
  });

  it('accepts an omitted email because it is optional', () => {
    expect(validateLead({ ...fullValid, email: undefined }, 'full')).toEqual({});
  });

  it('rejects a malformed email when one is supplied', () => {
    expect(validateLead({ ...fullValid, email: 'jan@' }, 'full')).toEqual({
      email: 'emailInvalid',
    });
  });

  it('reports every invalid field at once', () => {
    const errors = validateLead(
      { phone: '', service: '', gdpr: false, name: '', city: '', source: 'full' },
      'full',
    );
    expect(Object.keys(errors).sort()).toEqual(['city', 'gdpr', 'name', 'phone', 'service']);
  });
});
