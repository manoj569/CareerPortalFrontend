import type { FormValues } from '../components/GuidanceForm';

export const textValue = (
  values: FormValues,
  name: string,
): string => String(values[name] ?? '').trim();

export const numberValue = (
  values: FormValues,
  name: string,
): number => Number(values[name]);

export const optionalText = (
  values: FormValues,
  name: string,
): string | null => textValue(values, name) || null;