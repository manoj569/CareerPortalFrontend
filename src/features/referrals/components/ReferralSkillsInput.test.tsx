import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { ReferralSkillsInput } from './ReferralSkillsInput';
const submit = vi.fn();
const Example = () => {
  const [skills, setSkills] = useState<string[]>([]);
  return (
    <form
      style={{ width: '100%', maxWidth: 360 }}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <ReferralSkillsInput value={skills} onChange={setSkills} />
      <output aria-label="Skills payload">{JSON.stringify(skills)}</output>
    </form>
  );
};
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  submit.mockClear();
});
it('adds trimmed skill chips by Add and Enter, prevents case-insensitive duplicates and removes chips', async () => {
  render(<Example />);
  const input = screen.getByRole('textbox', { name: /Skills/ });
  await userEvent.type(input, '  .NET  ');
  await userEvent.click(screen.getByRole('button', { name: 'Add skill' }));
  expect(screen.getByRole('button', { name: 'Remove skill .NET' })).toBeVisible();
  await userEvent.type(input, 'SQL Server{Enter}');
  await userEvent.type(input, ' .net {Enter}');
  expect(screen.getByLabelText('Skills payload')).toHaveTextContent('[".NET","SQL Server"]');
  expect(submit).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Remove skill .NET' }));
  expect(screen.getByLabelText('Skills payload')).toHaveTextContent('["SQL Server"]');
  expect(screen.queryByRole('button', { name: 'Remove skill .NET' })).not.toBeInTheDocument();
});
it('supports adding and keyboard removal at a 360px mobile viewport', async () => {
  vi.stubGlobal('innerWidth', 360);
  render(<Example />);
  fireEvent.resize(window);
  await userEvent.type(screen.getByRole('textbox', { name: /Skills/ }), 'React{Enter}');
  const remove = screen.getByRole('button', { name: 'Remove skill React' });
  remove.focus();
  await userEvent.keyboard('{Enter}');
  expect(screen.getByLabelText('Skills payload')).toHaveTextContent('[]');
  expect(submit).not.toHaveBeenCalled();
});
it('shows required skills validation and disables adding whitespace', () => {
  render(<ReferralSkillsInput value={[]} onChange={vi.fn()} error="Add at least one skill." />);
  expect(screen.getByText('Add at least one skill.')).toBeVisible();
  expect(screen.getByRole('textbox', { name: /Skills/ })).toHaveAttribute('aria-invalid', 'true');
  fireEvent.change(screen.getByRole('textbox', { name: /Skills/ }), { target: { value: '   ' } });
  expect(screen.getByRole('button', { name: 'Add skill' })).toBeDisabled();
});
