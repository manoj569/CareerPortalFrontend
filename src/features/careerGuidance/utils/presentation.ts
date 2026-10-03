export const guidancePolicy =
  "Independent career guidance, not employer representation. No guaranteed job, interview or referral. Do not disclose employer-confidential information; comply with your employer's outside-work policies.";

export const localTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const utcInstant = (value: string): string => {
  const normalized = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
    ? value
    : `${value}Z`;

  const instant = new Date(normalized);

  if (!Number.isFinite(instant.getTime())) {
    throw new Error('Invalid UTC timestamp.');
  }

  return instant.toISOString();
};

export const dateTime = (
  value: string | null,
  timeZone = localTimeZone(),
): string => {
  if (!value) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(utcInstant(value)));
};

export const dateInZone = (
  value: string,
  timeZone = localTimeZone(),
): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(utcInstant(value)));

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? '';

  return `${part('year')}-${part('month')}-${part('day')}`;
};

export const addDays = (date: string, days: number) =>
  new Date(
    Date.parse(`${date}T12:00:00Z`) + days * 86400000,
  )
    .toISOString()
    .slice(0, 10);

export const money = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
  }).format(value);

export const enumLabel = (
  values: Record<number, string>,
  value: number,
) =>
  (values[value] ?? 'Unknown').replace(
    /([a-z])([A-Z])/g,
    '$1 $2',
  );

export const enumOptions = (
  values: Record<string, string | number>,
) =>
  Object.entries(values)
    .filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === 'number',
    )
    .map(([label, value]) => ({
      value,
      label: label.replace(/([a-z])([A-Z])/g, '$1 $2'),
    }));

export const safeMeetingUrl = (value: string | null) => {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.protocol === 'https:' &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
};

const isAllowedPlainTextCharacter = (character: string) => {
  const code = character.charCodeAt(0);

  return (
    code === 9 ||
    code === 10 ||
    code === 13 ||
    code >= 32
  );
};

export const plainText = (value: string) =>
  !value.includes('<') &&
  !value.includes('>') &&
  Array.from(value).every(isAllowedPlainTextCharacter);