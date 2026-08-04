import { renderWithProviders } from '@/test/renderWithProviders';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { OtpInput } from './OtpInput';

const ControlledOtp = () => {
  const [value, setValue] = useState('');
  return <OtpInput onChange={setValue} value={value} />;
};

describe('OtpInput', () => {
  it('accepts digits only and advances focus automatically', async () => {
    renderWithProviders(<ControlledOtp />);
    const user = userEvent.setup();
    const first = screen.getByLabelText('OTP digit 1 of 6');
    await user.type(first, 'a1');
    expect(first).toHaveValue('1');
    expect(screen.getByLabelText('OTP digit 2 of 6')).toHaveFocus();
    await user.type(screen.getByLabelText('OTP digit 2 of 6'), '!2');
    expect(screen.getByLabelText('OTP digit 2 of 6')).toHaveValue('2');
  });

  it('fills all inputs from a six-digit paste and removes symbols', async () => {
    renderWithProviders(<ControlledOtp />);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('OTP digit 1 of 6'));
    await user.paste('12-34 56abc');
    for (const [index, digit] of [...'123456'].entries()) {
      expect(screen.getByLabelText(`OTP digit ${index + 1} of 6`)).toHaveValue(digit);
    }
    expect(screen.getByLabelText('OTP digit 6 of 6')).toHaveFocus();
  });

  it('moves back and clears the previous digit when Backspace is pressed on an empty box', async () => {
    renderWithProviders(<ControlledOtp />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('OTP digit 1 of 6'), '12');
    const third = screen.getByLabelText('OTP digit 3 of 6');
    expect(third).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(screen.getByLabelText('OTP digit 2 of 6')).toHaveFocus();
    expect(screen.getByLabelText('OTP digit 2 of 6')).toHaveValue('');
  });
});
