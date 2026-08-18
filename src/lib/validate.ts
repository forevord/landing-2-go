import { isServiceValue } from './services';

/** Where the visit came from. Carried with the lead, never validated. */
export interface Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  pageUrl?: string;
}

export interface LeadInput {
  name?: string;
  phone: string;
  email?: string;
  service: string;
  city?: string;
  message?: string;
  gdpr: boolean;
  hp?: string;
  source: 'hero' | 'full';
  attribution?: Attribution;
}

export type ErrorCode =
  'required' | 'nameShort' | 'phoneInvalid' | 'emailInvalid' | 'serviceRequired' | 'gdprRequired';

export type FieldErrors = Partial<
  Record<'name' | 'phone' | 'email' | 'service' | 'city' | 'gdpr', ErrorCode>
>;

export type Variant = 'compact' | 'full';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PHONE_DIGITS = 9;

function countDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

export function validateLead(input: LeadInput, variant: Variant): FieldErrors {
  const errors: FieldErrors = {};

  const phone = (input.phone ?? '').trim();
  if (phone === '') {
    errors.phone = 'required';
  } else if (countDigits(phone) < MIN_PHONE_DIGITS) {
    errors.phone = 'phoneInvalid';
  }

  const service = (input.service ?? '').trim();
  if (service === '' || !isServiceValue(service)) {
    errors.service = 'serviceRequired';
  }

  if (input.gdpr !== true) {
    errors.gdpr = 'gdprRequired';
  }

  const email = (input.email ?? '').trim();
  if (email !== '' && !EMAIL_PATTERN.test(email)) {
    errors.email = 'emailInvalid';
  }

  if (variant === 'full') {
    const name = (input.name ?? '').trim();
    if (name === '') {
      errors.name = 'required';
    } else if (name.length < 2) {
      errors.name = 'nameShort';
    }

    const city = (input.city ?? '').trim();
    if (city === '') {
      errors.city = 'required';
    }
  }

  return errors;
}

export function isSpam(input: LeadInput): boolean {
  return (input.hp ?? '').trim() !== '';
}
