import { useRef, useState } from 'react';
import { Alert, Button, Checkbox, FormControlLabel, MenuItem, Rating, Stack, TextField, Typography } from '@mui/material';
import { plainText } from '../utils/presentation';

export type FormValues = Record<string, string | number | boolean>;
export interface GuidanceField { name: string; label: string; kind?: 'text' | 'number' | 'textarea' | 'checkbox' | 'select' | 'date' | 'time' | 'rating'; required?: boolean; maxLength?: number; min?: number; max?: number; step?: number; helper?: string; options?: { label: string; value: string | number }[]; }

export const GuidanceForm = ({ fields, initial = {}, onSubmit, submitLabel = 'Save changes', busy = false, error, validate, disabled = false, onCancel }: {
  fields: GuidanceField[]; initial?: FormValues; onSubmit: (values: FormValues) => Promise<unknown>;
  submitLabel?: string; busy?: boolean; error?: string | null; validate?: (values: FormValues) => string | null; disabled?: boolean; onCancel?: () => void;
}) => {
  const [values, setValues] = useState<FormValues>(initial);
  const [localError, setLocalError] = useState<string | null>(null);
  const lock = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const isBusy = busy || submitting;
  return <Stack component="form" spacing={2} onSubmit={(event) => {
    event.preventDefault();
    if (lock.current || isBusy || disabled) return;
    const required = fields.find((field) => field.required && (field.kind === 'checkbox' ? !values[field.name] : !String(values[field.name] ?? '').trim()));
    const unsafe = fields.some((field) => ['text', 'textarea', undefined].includes(field.kind) && !plainText(String(values[field.name] ?? '')));
    const issue = required ? `${required.label} is required.` : unsafe ? 'Use plain text without HTML or control characters.' : validate?.(values) ?? null;
    setLocalError(issue); if (issue) return;
    lock.current = true; setSubmitting(true);
    void onSubmit(values).finally(() => { lock.current = false; setSubmitting(false); });
  }}>
    {(error || localError) && <Alert severity="error" role="alert">{localError ?? error}</Alert>}
    {fields.map((field) => field.kind === 'checkbox' ? <FormControlLabel key={field.name} label={field.label} control={<Checkbox checked={Boolean(values[field.name])} required={field.required} disabled={isBusy || disabled} onChange={(_, checked) => setValues({ ...values, [field.name]: checked })} />} />
      : field.kind === 'rating' ? <Stack key={field.name}><Typography id={`${field.name}-label`}>{field.label}</Typography><Rating aria-labelledby={`${field.name}-label`} name={field.name} value={Number(values[field.name] ?? 0)} onChange={(_, value) => setValues({ ...values, [field.name]: value ?? 0 })} disabled={isBusy || disabled} /></Stack>
      : <TextField key={field.name} fullWidth label={field.label} name={field.name} required={field.required} disabled={isBusy || disabled}
        value={values[field.name] ?? ''} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
        type={field.kind === 'number' || field.kind === 'date' || field.kind === 'time' ? field.kind : 'text'} select={field.kind === 'select'} multiline={field.kind === 'textarea'} minRows={field.kind === 'textarea' ? 3 : undefined}
        helperText={field.helper} slotProps={{ htmlInput: { maxLength: field.maxLength, min: field.min, max: field.max, step: field.step }, inputLabel: field.kind === 'date' || field.kind === 'time' ? { shrink: true } : undefined }}>
        {field.options?.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
      </TextField>)}
    <Stack direction="row" spacing={1}><Button type="submit" variant="contained" disabled={isBusy || disabled}>{isBusy ? 'Saving…' : submitLabel}</Button>{onCancel && <Button disabled={isBusy} onClick={onCancel}>Cancel</Button>}</Stack>
  </Stack>;
};
