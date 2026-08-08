import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ComposeJobRequest } from '@/features/admin/types/adminModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AdminComposeJobForm } from './AdminComposeJobForm';

const renderForm = (
  onSubmit = vi.fn<(request: ComposeJobRequest) => Promise<void>>().mockResolvedValue(undefined),
  props: Partial<React.ComponentProps<typeof AdminComposeJobForm>> = {},
) => {
  renderWithProviders(
    <AdminComposeJobForm isSaving={false} onCancel={vi.fn()} onSubmit={onSubmit} {...props} />,
  );
  return onSubmit;
};

const enterTitle = () =>
  userEvent.type(screen.getByRole('textbox', { name: /job title/i }), 'Platform Engineer');

describe('AdminComposeJobForm', () => {
  it('shows one open form without company/category selectors or mode controls', () => {
    renderForm();
    expect(screen.getByRole('textbox', { name: /company name/i })).toBeVisible();
    expect(screen.getByRole('textbox', { name: /category name/i })).toBeVisible();
    expect(screen.queryByRole('combobox', { name: /company|category/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /add new|use existing|clear selection/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/parent category/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recruiter contact (optional)' })).toBeVisible();
  });

  it('requires title, company, and category before submitting', async () => {
    const onSubmit = renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create draft' }));
    expect(await screen.findByText('Job title is required.')).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();

    await enterTitle();
    await userEvent.click(screen.getByRole('button', { name: 'Create draft' }));
    expect(await screen.findByText('Company name is required.')).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.type(screen.getByRole('textbox', { name: /company name/i }), 'New Company');
    await userEvent.click(screen.getByRole('button', { name: 'Create draft' }));
    expect(await screen.findByText('Category name is required.')).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits inline relationships and null optional values', async () => {
    const onSubmit = renderForm();
    await enterTitle();
    await userEvent.type(screen.getByRole('textbox', { name: /company name/i }), 'Northstar Labs');
    await userEvent.type(screen.getByRole('textbox', { name: /category name/i }), 'Engineering');
    await userEvent.click(screen.getByRole('button', { name: 'Create draft' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      job: { title: 'Platform Engineer', description: null, employmentType: null },
      company: { existingId: null, new: { name: 'Northstar Labs' } },
      category: { existingId: null, new: { name: 'Engineering', parentCategoryId: null } },
      recruiterContact: null,
    });
  });

  it('submits optional recruiter contact with sharing approval', async () => {
    const onSubmit = renderForm();
    await enterTitle();
    await userEvent.type(screen.getByRole('textbox', { name: /company name/i }), 'Northstar Labs');
    await userEvent.type(screen.getByRole('textbox', { name: /category name/i }), 'Engineering');
    await userEvent.type(screen.getByRole('textbox', { name: 'Recruiter name' }), 'Priya Sharma');
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Recruiter email' }),
      'priya@example.com',
    );
    await userEvent.click(
      screen.getByRole('checkbox', { name: /permission to share these recruiter/i }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create draft' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]?.[0].recruiterContact).toEqual({
      name: 'Priya Sharma',
      role: null,
      email: 'priya@example.com',
      phoneNumber: null,
      sharingApproved: true,
    });
  });

  it('submits inline company and category without retaining existing ids', async () => {
    const onSubmit = renderForm();
    await enterTitle();
    await userEvent.type(screen.getByRole('textbox', { name: /company name/i }), 'New Company');
    await userEvent.type(screen.getByRole('textbox', { name: /category name/i }), 'New Category');
    await userEvent.click(screen.getByRole('button', { name: 'Create draft' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      company: { existingId: null, new: { name: 'New Company', isVerified: false } },
      category: { existingId: null, new: { name: 'New Category', displayOrder: 0 } },
    });
  });

  it('maps backend relationship errors to their visible fields', () => {
    renderForm(undefined, {
      serverError: 'Validation failed.',
      serverFieldErrors: {
        'company.new.name': ['Enter a company name.'],
        'category.new.name': ['Enter a category name.'],
      },
    });
    expect(screen.getByText('Validation failed.')).toBeVisible();
    expect(screen.getByText('Enter a company name.')).toBeVisible();
    expect(screen.getByText('Enter a category name.')).toBeVisible();
  });

  it('disables submission while the mutation is pending', () => {
    renderForm(undefined, { isSaving: true });
    expect(screen.getByRole('button', { name: /Saving/ })).toBeDisabled();
  });
});
