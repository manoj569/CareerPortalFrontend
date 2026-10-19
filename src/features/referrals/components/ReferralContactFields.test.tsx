import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  contactMethods,
  initialContacts,
  ReferralContactFields,
  type ContactErrors,
  type ContactForm,
} from './ReferralContactFields';

function Form({
  initial = initialContacts,
  errors = {},
}: {
  initial?: ContactForm;
  errors?: ContactErrors;
}) {
  const [value, setValue] = useState(initial);
  return <ReferralContactFields value={value} errors={errors} onChange={setValue} />;
}

describe('referral contact fields', () => {
  it.each(contactMethods)('provides an accessible checkbox and $label input', async (method) => {
    render(<Form />);
    const checkbox = screen.getByRole('checkbox', { name: method.name });
    const input = screen.getByLabelText(new RegExp(method.label));
    expect(input).toHaveAttribute('type', method.type);
    expect(input).toHaveAttribute('placeholder', method.placeholder);
    if (method.key !== 'linkedin') {
      expect(input).toBeDisabled();
      await userEvent.click(checkbox);
    }
    expect(checkbox).toBeChecked();
    expect(input).toBeEnabled();
    expect(input).toBeRequired();
  });

  it('allows all three methods together and preserves values when toggled', async () => {
    render(<Form />);
    for (const method of contactMethods) {
      const checkbox = screen.getByRole('checkbox', { name: method.name });
      if (method.key !== 'linkedin') await userEvent.click(checkbox);
      const input = screen.getByLabelText(new RegExp(method.label));
      await userEvent.type(input, 'saved-value');
      await userEvent.click(checkbox);
      expect(input).toBeDisabled();
      expect(input).not.toBeRequired();
      await userEvent.click(checkbox);
      expect(input).toHaveValue('saved-value');
    }
    expect(
      screen.getAllByRole('checkbox').every((checkbox) => (checkbox as HTMLInputElement).checked),
    ).toBe(true);
  });

  it('associates errors with selected inputs and hides errors for unselected methods', () => {
    render(
      <Form errors={{ linkedin: 'Enter your LinkedIn profile.', email: 'Enter your email.' }} />,
    );
    expect(screen.getByLabelText(/LinkedIn profile/)).toHaveAccessibleDescription(
      'Enter your LinkedIn profile.',
    );
    expect(screen.getByLabelText(/LinkedIn profile/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('Enter your email.')).not.toBeInTheDocument();
  });
});
