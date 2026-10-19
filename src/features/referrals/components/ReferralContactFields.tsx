import { Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';

export const contactMethods = [
  {
    key: 'linkedin',
    name: 'LinkedIn',
    label: 'LinkedIn profile',
    type: 'url',
    placeholder: 'https://www.linkedin.com/in/your-profile',
  },
  {
    key: 'email',
    name: 'Email',
    label: 'Email address',
    type: 'email',
    placeholder: 'you@example.com',
  },
  {
    key: 'phone',
    name: 'Phone',
    label: 'Phone number',
    type: 'tel',
    placeholder: '+91 9876543210',
  },
] as const;

export type ContactMethod = (typeof contactMethods)[number]['key'];
export type ContactForm = Record<ContactMethod, { selected: boolean; value: string }>;
export type ContactErrors = Partial<Record<ContactMethod, string>>;

export const initialContacts: ContactForm = {
  linkedin: { selected: true, value: '' },
  email: { selected: false, value: '' },
  phone: { selected: false, value: '' },
};

export function ReferralContactFields({
  value,
  errors,
  onChange,
  disabled = false,
}: {
  value: ContactForm;
  errors: ContactErrors;
  onChange: (value: ContactForm) => void;
  disabled?: boolean;
}) {
  return (
    <Stack gap={1.5} mt={1}>
      {contactMethods.map((method) => {
        const field = value[method.key];
        const error = field.selected ? errors[method.key] : undefined;
        return (
          <Stack
            key={method.key}
            direction={{ xs: 'column', md: 'row' }}
            gap={1}
            alignItems={{ md: 'flex-start' }}
          >
            <FormControlLabel
              sx={{ minWidth: 115, m: 0 }}
              label={method.name}
              control={
                <Checkbox
                  size="small"
                  disabled={disabled}
                  checked={field.selected}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      [method.key]: { ...field, selected: event.target.checked },
                    })
                  }
                />
              }
            />
            <TextField
              id={`referral-contact-${method.key}`}
              fullWidth
              size="small"
              label={method.label}
              type={method.type}
              placeholder={method.placeholder}
              required={field.selected}
              disabled={disabled || !field.selected}
              value={field.value}
              error={Boolean(error)}
              helperText={error}
              onChange={(event) =>
                onChange({ ...value, [method.key]: { ...field, value: event.target.value } })
              }
            />
          </Stack>
        );
      })}
    </Stack>
  );
}
