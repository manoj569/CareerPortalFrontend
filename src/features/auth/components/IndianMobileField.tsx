import { InputAdornment, TextField, Typography } from '@mui/material';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { sanitizeIndianMobileInput } from '../validation/authSchemas';

interface IndianMobileFieldProps {
  registration: UseFormRegisterReturn;
  errorMessage?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const IndianMobileField = ({
  registration,
  errorMessage,
  disabled = false,
  autoFocus = false,
}: IndianMobileFieldProps) => (
  <TextField
    autoComplete="tel-national"
    autoFocus={autoFocus}
    disabled={disabled}
    error={Boolean(errorMessage)}
    helperText={errorMessage}
    inputRef={registration.ref}
    label="Mobile number"
    name={registration.name}
    onBlur={(event) => void registration.onBlur(event)}
    onChange={(event) => {
      event.target.value = sanitizeIndianMobileInput(event.target.value);
      void registration.onChange(event);
    }}
    placeholder="Enter 10-digit mobile number"
    required
    slotProps={{
      htmlInput: { inputMode: 'numeric', maxLength: 10, pattern: '[6-9][0-9]{9}' },
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <Typography aria-hidden="true" color="text.secondary">
              +91
            </Typography>
          </InputAdornment>
        ),
      },
    }}
    type="tel"
  />
);
