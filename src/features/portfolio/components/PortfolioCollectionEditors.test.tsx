import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EmploymentType } from '@/features/jobs/types/jobModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import type * as PortfolioApiModule from '../api/portfolioApi';
import {
  useAddPortfolioCertificationMutation,
  useAddPortfolioEducationMutation,
  useAddPortfolioExperienceMutation,
  useAddPortfolioLinkMutation,
  useAddPortfolioProjectMutation,
  useDeletePortfolioCertificationMutation,
  useDeletePortfolioEducationMutation,
  useDeletePortfolioExperienceMutation,
  useDeletePortfolioLinkMutation,
  useDeletePortfolioProjectMutation,
  useUpdatePortfolioCertificationMutation,
  useUpdatePortfolioEducationMutation,
  useUpdatePortfolioExperienceMutation,
  useUpdatePortfolioLinkMutation,
  useUpdatePortfolioProjectMutation,
} from '../api/portfolioApi';
import type { PortfolioEditorResponse } from '../types/portfolioModels';
import { PortfolioCollectionEditors } from './PortfolioCollectionEditors';

vi.mock('./PortfolioCustomSectionsEditor', () => ({
  PortfolioCustomSectionsEditor: () => <div>Custom sections editor</div>,
}));
vi.mock('../api/portfolioApi', async (importOriginal) => {
  const actual = await importOriginal<typeof PortfolioApiModule>();
  return {
    ...actual,
    useAddPortfolioCertificationMutation: vi.fn(),
    useAddPortfolioEducationMutation: vi.fn(),
    useAddPortfolioExperienceMutation: vi.fn(),
    useAddPortfolioLinkMutation: vi.fn(),
    useAddPortfolioProjectMutation: vi.fn(),
    useDeletePortfolioCertificationMutation: vi.fn(),
    useDeletePortfolioEducationMutation: vi.fn(),
    useDeletePortfolioExperienceMutation: vi.fn(),
    useDeletePortfolioLinkMutation: vi.fn(),
    useDeletePortfolioProjectMutation: vi.fn(),
    useUpdatePortfolioCertificationMutation: vi.fn(),
    useUpdatePortfolioEducationMutation: vi.fn(),
    useUpdatePortfolioExperienceMutation: vi.fn(),
    useUpdatePortfolioLinkMutation: vi.fn(),
    useUpdatePortfolioProjectMutation: vi.fn(),
  };
});

const experience = {
  companyName: 'Career Harbor',
  description: 'Built candidate workflows.',
  displayOrder: 0,
  employmentType: EmploymentType.FullTime,
  endDate: null,
  id: 'experience-id',
  isCurrent: true,
  jobTitle: 'Frontend engineer',
  location: 'Pune',
  startDate: '2025-01-01',
};

const portfolio = {
  certifications: [],
  customSections: [],
  education: [],
  experiences: [experience],
  professionalLinks: [],
  projects: [],
} as unknown as PortfolioEditorResponse;

const makeMutation = () => {
  const unwrap = vi.fn().mockResolvedValue(undefined);
  const trigger = vi.fn((payload?: unknown) => {
    void payload;
    return { unwrap };
  });
  return { trigger, tuple: [trigger, { isLoading: false }] as never };
};

const addExperience = makeMutation();
const updateExperience = makeMutation();
const deleteExperience = makeMutation();

const mutationHooks = [
  useAddPortfolioCertificationMutation,
  useAddPortfolioEducationMutation,
  useAddPortfolioLinkMutation,
  useAddPortfolioProjectMutation,
  useDeletePortfolioCertificationMutation,
  useDeletePortfolioEducationMutation,
  useDeletePortfolioLinkMutation,
  useDeletePortfolioProjectMutation,
  useUpdatePortfolioCertificationMutation,
  useUpdatePortfolioEducationMutation,
  useUpdatePortfolioLinkMutation,
  useUpdatePortfolioProjectMutation,
] as const;

describe('portfolio collection builder', () => {
  beforeEach(() => {
    addExperience.trigger.mockClear();
    updateExperience.trigger.mockClear();
    deleteExperience.trigger.mockClear();
    vi.mocked(useAddPortfolioExperienceMutation).mockReturnValue(addExperience.tuple);
    vi.mocked(useUpdatePortfolioExperienceMutation).mockReturnValue(updateExperience.tuple);
    vi.mocked(useDeletePortfolioExperienceMutation).mockReturnValue(deleteExperience.tuple);
    mutationHooks.forEach((hook) => vi.mocked(hook).mockReturnValue(makeMutation().tuple));
  });

  it('shows real item counts and adds an experience with the existing contract', async () => {
    renderWithProviders(<PortfolioCollectionEditors portfolio={portfolio} />);

    const section = screen.getByRole('heading', { name: 'Experience' }).closest('section')!;
    expect(within(section).getByText('1')).toBeVisible();
    await userEvent.click(within(section).getByRole('button', { name: 'Add experience' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Job title' }), 'Staff engineer');
    await userEvent.type(screen.getByRole('textbox', { name: 'Company name' }), 'Harbor Labs');
    await userEvent.type(screen.getByLabelText('Start date'), '2026-01-01');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(addExperience.trigger).toHaveBeenCalledWith({
        companyName: 'Harbor Labs',
        description: null,
        displayOrder: 1,
        employmentType: null,
        endDate: null,
        isCurrent: false,
        jobTitle: 'Staff engineer',
        location: null,
        startDate: '2026-01-01',
      }),
    );
  });

  it('edits by stable ID and requires confirmation before deletion', async () => {
    renderWithProviders(<PortfolioCollectionEditors portfolio={portfolio} />);
    const section = screen.getByRole('heading', { name: 'Experience' }).closest('section')!;

    await userEvent.click(within(section).getByRole('button', { name: 'Edit' }));
    const jobTitle = screen.getByRole('textbox', { name: 'Job title' });
    expect(jobTitle).toHaveValue('Frontend engineer');
    await userEvent.clear(jobTitle);
    await userEvent.type(jobTitle, 'Senior frontend engineer');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(updateExperience.trigger).toHaveBeenCalledOnce());
    const updatePayload = updateExperience.trigger.mock.calls[0]?.[0] as {
      data: { jobTitle: string };
      id: string;
    };
    expect(updatePayload.id).toBe('experience-id');
    expect(updatePayload.data.jobTitle).toBe('Senior frontend engineer');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const refreshedSection = screen.getByRole('heading', { name: 'Experience' }).closest('section')!;
    await userEvent.click(within(refreshedSection).getByRole('button', { name: 'Delete' }));
    expect(deleteExperience.trigger).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: 'Delete record?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete record' }));
    expect(deleteExperience.trigger).toHaveBeenCalledWith('experience-id');
  });
});
