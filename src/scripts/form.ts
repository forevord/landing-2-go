import { validateLead, type FieldErrors, type LeadInput } from '../lib/validate';
import pl from '../i18n/pl.json';
import en from '../i18n/en.json';

const dictionaries = { pl, en } as const;
type Locale = keyof typeof dictionaries;

function readForm(form: HTMLFormElement): LeadInput & { locale: Locale; thanks: string } {
  const data = new FormData(form);
  const str = (key: string) => String(data.get(key) ?? '').trim();
  return {
    name: str('name') || undefined,
    phone: str('phone'),
    email: str('email') || undefined,
    service: str('service'),
    city: str('city') || undefined,
    message: str('message') || undefined,
    gdpr: data.get('gdpr') === 'on',
    hp: str('hp'),
    source: str('source') === 'full' ? 'full' : 'hero',
    locale: (str('locale') === 'en' ? 'en' : 'pl') as Locale,
    thanks: str('thanks'),
  };
}

function paintErrors(form: HTMLFormElement, errors: FieldErrors, locale: Locale): void {
  const messages = dictionaries[locale].form.errors as Record<string, string>;
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((node) => {
    const field = node.dataset.errorFor as keyof FieldErrors;
    const code = errors[field];
    node.textContent = code ? (messages[code] ?? messages.required) : '';
    const input = form.querySelector<HTMLElement>(`[name="${field}"]`);
    input?.setAttribute('aria-invalid', code ? 'true' : 'false');
  });
}

function focusFirstInvalid(form: HTMLFormElement, errors: FieldErrors): void {
  const first = Object.keys(errors)[0];
  if (!first) return;
  form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
}

function initForm(form: HTMLFormElement): void {
  const variant = form.dataset.variant === 'full' ? 'full' : 'compact';
  const button = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const label = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const banner = form.querySelector<HTMLElement>('[data-form-error]')!;
  const idleLabel = label.textContent ?? '';

  // Validate on blur, never on keystroke: correcting a half-typed value is noise.
  form.querySelectorAll<HTMLElement>('input, select').forEach((field) => {
    field.addEventListener('blur', () => {
      const payload = readForm(form);
      paintErrors(form, validateLead(payload, variant), payload.locale);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = readForm(form);
    const dict = dictionaries[payload.locale];
    const errors = validateLead(payload, variant);

    paintErrors(form, errors, payload.locale);
    if (Object.keys(errors).length > 0) {
      focusFirstInvalid(form, errors);
      return;
    }

    button.disabled = true;
    label.textContent = dict.form.submitting;
    banner.classList.add('hidden');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        window.location.assign(payload.thanks);
        return;
      }

      if (response.status === 422) {
        const body = (await response.json()) as { errors: FieldErrors };
        paintErrors(form, body.errors, payload.locale);
        focusFirstInvalid(form, body.errors);
      } else {
        banner.textContent = dict.form.errors.server;
        banner.classList.remove('hidden');
      }
    } catch {
      banner.textContent = dict.form.errors.network;
      banner.classList.remove('hidden');
    } finally {
      button.disabled = false;
      label.textContent = idleLabel;
    }
  });
}

document.querySelectorAll<HTMLFormElement>('form.lead-form').forEach(initForm);
