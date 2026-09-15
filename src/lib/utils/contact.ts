export function parsePhones(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[\n,;|]+/)
    .map((phone) => phone.trim())
    .filter(Boolean);
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
