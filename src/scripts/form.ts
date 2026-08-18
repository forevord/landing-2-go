import { validateLead, type FieldErrors, type LeadInput } from '../lib/validate';

interface ClientMessages {
  errors: Record<string, string>;
  submitting: string;
}

function readForm(form: HTMLFormElement): LeadInput & { thanks: string } {
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
    thanks: str('thanks'),
    attribution: {
      utmSource: str('utm_source') || undefined,
      utmMedium: str('utm_medium') || undefined,
      utmCampaign: str('utm_campaign') || undefined,
      utmTerm: str('utm_term') || undefined,
      utmContent: str('utm_content') || undefined,
      gclid: str('gclid') || undefined,
      pageUrl: str('page_url') || undefined,
    },
  };
}

function paintErrors(
  form: HTMLFormElement,
  errors: FieldErrors,
  messages: Record<string, string>,
): void {
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
  const messages = JSON.parse(form.dataset.messages ?? '{}') as ClientMessages;
  const button = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const label = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const banner = form.querySelector<HTMLElement>('[data-form-error]')!;
  const idleLabel = label.textContent ?? '';

  // Validate on blur, never on keystroke: correcting a half-typed value is noise.
  form.querySelectorAll<HTMLElement>('input, select').forEach((field) => {
    field.addEventListener('blur', () => {
      const payload = readForm(form);
      paintErrors(form, validateLead(payload, variant), messages.errors);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = readForm(form);
    const errors = validateLead(payload, variant);

    paintErrors(form, errors, messages.errors);
    if (Object.keys(errors).length > 0) {
      focusFirstInvalid(form, errors);
      return;
    }

    button.disabled = true;
    label.textContent = messages.submitting;
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
        paintErrors(form, body.errors, messages.errors);
        focusFirstInvalid(form, body.errors);
      } else {
        banner.textContent = messages.errors.server;
        banner.classList.remove('hidden');
      }
    } catch {
      banner.textContent = messages.errors.network;
      banner.classList.remove('hidden');
    } finally {
      button.disabled = false;
      label.textContent = idleLabel;
    }
  });
}

document.querySelectorAll<HTMLFormElement>('form.lead-form').forEach(initForm);
