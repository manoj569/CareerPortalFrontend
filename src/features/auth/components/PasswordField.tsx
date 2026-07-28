import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface PasswordFieldProps {
  autoComplete: 'current-password' | 'new-password';
  disabled?: boolean;
  errorMessage?: string;
  label: string;
  registration: UseFormRegisterReturn;
}

export const PasswordField = ({
  autoComplete,
  disabled = false,
  errorMessage,
  label,
  registration,
}: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      autoComplete={autoComplete}
      disabled={disabled}
      error={Boolean(errorMessage)}
      helperText={errorMessage}
      label={label}
      required
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={
                  isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
                }
                edge="end"
                onClick={() => setIsVisible((current) => !current)}
              >
                {isVisible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      type={isVisible ? 'text' : 'password'}
      {...registration}
    />
  );
};
