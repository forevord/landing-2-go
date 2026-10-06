export const SERVICE_VALUES = [
  'brama-przesuwna',
  'brama-skrzydlowa',
  'furtka',
  'ogrodzenie',
  'automatyka',
  'balustrada',
  'zadaszenie',
  'nie-wiem',
] as const;

export type ServiceValue = (typeof SERVICE_VALUES)[number];

export function isServiceValue(value: string): value is ServiceValue {
  return (SERVICE_VALUES as readonly string[]).includes(value);
}
