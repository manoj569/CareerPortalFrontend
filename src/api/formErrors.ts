import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

interface ValidationErrorLike {
  errors?: Record<string, string[]>;
  status?: number;
}

export const applyApiValidationErrors = <TFields extends FieldValues>(
  error: unknown,
  fields: readonly FieldPath<TFields>[],
  setError: UseFormSetError<TFields>,
): boolean => {
  if (!error || typeof error !== 'object') return false;
  const apiError = error as ValidationErrorLike;
  if (apiError.status !== 400 || !apiError.errors) return false;

  const fieldsByNormalizedName = new Map(
    fields.map((field) => [field.toLowerCase(), field] as const),
  );
  let applied = false;

  for (const [backendField, messages] of Object.entries(apiError.errors)) {
    const field = fieldsByNormalizedName.get(backendField.replace(/^\$\./, '').toLowerCase());
    const message = Array.isArray(messages) ? messages.filter((item): item is string => typeof item === 'string').join(' ') : undefined;
    if (!field || !message) continue;
    setError(field, { message, type: 'server' });
    applied = true;
  }

  return applied;
};
