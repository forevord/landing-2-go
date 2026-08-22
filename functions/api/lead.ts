import { isSpam, validateLead, type Attribution, type LeadInput } from '../../src/lib/validate';

interface Env {
  WEB3FORMS_ACCESS_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
}

const SERVICE_MARKERS: Record<string, string> = {
  'brama-przesuwna': '🚧',
  'brama-skrzydlowa': '🚧',
  'brama-przemyslowa': '🏭',
  automatyka: '⚙️',
  furtka: '🚪',
  ogrodzenie: '🧱',
  brukarstwo: '🧱',
  'pod-klucz': '🚜',
  'nie-wiem': '❓',
};

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** A one-line campaign summary: "google / cpc / bramy-gdansk · gclid: Cj0K…".
    Empty when the visitor arrived without any campaign parameters, in which
    case neither the message nor the email carries a source line at all. */
export function describeAttribution(attribution?: Attribution): string {
  if (!attribution) return '';

  const path = [attribution.utmSource, attribution.utmMedium, attribution.utmCampaign]
    .filter(Boolean)
    .join(' / ');

  const parts: string[] = [];
  if (path) parts.push(path);
  if (attribution.utmTerm) parts.push(`term: ${attribution.utmTerm}`);
  if (attribution.gclid) parts.push(`gclid: ${attribution.gclid}`);
  if (!parts.length && attribution.pageUrl) parts.push(attribution.pageUrl);

  return parts.join(' · ');
}

export function buildTelegramMessage(lead: LeadInput): string {
  const marker = SERVICE_MARKERS[lead.service] ?? '📩';
  const lines = [
    `${marker} <b>Nowe zgłoszenie</b> (${lead.source === 'hero' ? 'hero' : 'formularz'})`,
    '',
    `<b>Usługa:</b> ${escapeHtml(lead.service)}`,
    `<b>Telefon:</b> <code>${escapeHtml(lead.phone)}</code>`,
  ];
  if (lead.name) lines.push(`<b>Imię:</b> ${escapeHtml(lead.name)}`);
  if (lead.city) lines.push(`<b>Miejscowość:</b> ${escapeHtml(lead.city)}`);
  if (lead.email) lines.push(`<b>E-mail:</b> ${escapeHtml(lead.email)}`);
  if (lead.message) lines.push('', escapeHtml(lead.message));

  const origin = describeAttribution(lead.attribution);
  if (origin) lines.push('', `<b>Źródło:</b> ${escapeHtml(origin)}`);

  return lines.join('\n');
}

async function sendEmail(lead: LeadInput, env: Env): Promise<void> {
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: env.WEB3FORMS_ACCESS_KEY,
      subject: `Nowe zgłoszenie: ${lead.service}`,
      from_name: 'StalBruk — formularz',
      Usługa: lead.service,
      Telefon: lead.phone,
      Imię: lead.name ?? '—',
      Miejscowość: lead.city ?? '—',
      'E-mail': lead.email ?? '—',
      Wiadomość: lead.message ?? '—',
      Źródło: lead.source,
      Kampania: describeAttribution(lead.attribution) || '—',
      Strona: lead.attribution?.pageUrl ?? '—',
    }),
  });
  if (!response.ok) throw new Error(`web3forms ${response.status}`);
}

async function sendTelegram(lead: LeadInput, env: Env): Promise<void> {
  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        text: buildTelegramMessage(lead),
      }),
    },
  );
  if (!response.ok) throw new Error(`telegram ${response.status}`);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let payload: LeadInput;
  try {
    payload = (await request.json()) as LeadInput;
  } catch {
    return Response.json({ ok: false, errors: {} }, { status: 400 });
  }

  // A filled honeypot means a bot. Answer 200 so it never learns it was blocked.
  if (isSpam(payload)) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const variant = payload.source === 'hero' ? 'compact' : 'full';
  const errors = validateLead(payload, variant);
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  const results = await Promise.allSettled([sendEmail(payload, env), sendTelegram(payload, env)]);
  const failures = results.filter((r) => r.status === 'rejected');

  for (const failure of failures) {
    console.error('lead delivery failed:', (failure as PromiseRejectedResult).reason);
  }

  if (failures.length === results.length) {
    return Response.json({ ok: false, errors: {} }, { status: 502 });
  }

  return Response.json({ ok: true, partial: failures.length > 0 }, { status: 200 });
};
