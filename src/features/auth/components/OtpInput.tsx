import { Stack, TextField } from '@mui/material';
import { type ClipboardEvent, type KeyboardEvent, useRef } from 'react';

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  describedBy?: string;
  autoFocus?: boolean;
}

const digitsOnly = (value: string): string => value.replace(/\D/g, '').slice(0, OTP_LENGTH);

export const OtpInput = ({
  value,
  onChange,
  disabled = false,
  hasError = false,
  describedBy,
  autoFocus = false,
}: OtpInputProps) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '');

  const focusAt = (index: number) => inputRefs.current[index]?.focus();

  const updateDigit = (index: number, rawValue: string) => {
    const incoming = digitsOnly(rawValue);
    if (incoming.length > 1) {
      const next = [...digits];
      incoming.split('').forEach((digit, offset) => {
        if (index + offset < OTP_LENGTH) next[index + offset] = digit;
      });
      const nextValue = next.join('');
      onChange(nextValue);
      focusAt(Math.min(index + incoming.length, OTP_LENGTH - 1));
      return;
    }

    const next = [...digits];
    next[index] = incoming;
    onChange(next.join(''));
    if (incoming && index < OTP_LENGTH - 1) focusAt(index + 1);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = digitsOnly(event.clipboardData.getData('text'));
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    focusAt(Math.min(pasted.length, OTP_LENGTH) - 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      onChange(next.join(''));
      focusAt(index - 1);
    }
    if (event.key === 'ArrowLeft' && index > 0) focusAt(index - 1);
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) focusAt(index + 1);
  };

  return (
    <Stack aria-label="Six-digit OTP" direction="row" role="group" spacing={{ xs: 0.75, sm: 1 }}>
      {digits.map((digit, index) => (
        <TextField
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          error={hasError}
          key={index}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          inputRef={(element: HTMLInputElement | null) => {
            inputRefs.current[index] = element;
          }}
          slotProps={{
            htmlInput: {
              'aria-describedby': describedBy,
              'aria-label': `OTP digit ${index + 1} of ${OTP_LENGTH}`,
              autoComplete: index === 0 ? 'one-time-code' : 'off',
              inputMode: 'numeric',
              maxLength: 1,
              pattern: '[0-9]*',
              style: {
                fontSize: '1.25rem',
                fontWeight: 700,
                paddingInline: 0,
                textAlign: 'center',
              },
            },
          }}
          value={digit}
        />
      ))}
    </Stack>
  );
};
