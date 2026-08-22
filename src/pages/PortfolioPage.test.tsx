import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as PortfolioApiModule from '@/features/portfolio/api/portfolioApi';
import {
  useCreatePortfolioMutation,
  useGetPortfolioPreviewQuery,
  useGetPortfolioQuery,
  usePublishPortfolioMutation,
  useUnpublishPortfolioMutation,
} from '@/features/portfolio/api/portfolioApi';
import type {
  PortfolioEditorResponse,
  PublicPortfolioResponse,
} from '@/features/portfolio/types/portfolioModels';
import { EmploymentType } from '@/features/jobs/types/jobModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PortfolioPage } from './PortfolioPage';

vi.mock('./ProfilePage', () => ({
  CandidateProfileContent: ({ openEditorRequest, publicPortfolioCard }: { openEditorRequest?: number; publicPortfolioCard?: ReactNode }) => (
    <>
      <button type="button">Save profile</button>
      {openEditorRequest ? (
        <div aria-label="Edit profile" role="dialog">
          <button aria-selected="true" role="tab" type="button">Basic details</button>
        </div>
      ) : null}
      {publicPortfolioCard}
    </>
  ),
}));
vi.mock('@/features/portfolio/components/PortfolioSettingsCard', () => ({
  PortfolioSettingsCard: () => <div>Settings editor</div>,
}));
vi.mock('@/features/portfolio/components/PortfolioCollectionEditors', () => ({
  PortfolioCollectionEditors: () => <div>Collection editors</div>,
}));
vi.mock('@/features/portfolio/api/portfolioApi', async (importOriginal) => {
  const actual = await importOriginal<typeof PortfolioApiModule>();
  return {
    ...actual,
    useCreatePortfolioMutation: vi.fn(),
    useGetPortfolioPreviewQuery: vi.fn(),
    useGetPortfolioQuery: vi.fn(),
    usePublishPortfolioMutation: vi.fn(),
    useUnpublishPortfolioMutation: vi.fn(),
  };
});

const editor: PortfolioEditorResponse = {
  certifications: [],
  customSections: [],
  displayName: 'Avery Patel',
  education: [],
  experiences: [],
  id: 'portfolio-id',
  isCreated: true,
  professionalLinks: [],
  profileSummary: 'Builds products.',
  projects: [],
  publishedAtUtc: null,
  resumeAvailable: false,
  resumeHeadline: 'Engineer',
  sectionSettings: [],
  skills: ['React'],
  slug: 'avery-patel',
  status: 'Draft',
  template: 'Professional',
};

const preview: PublicPortfolioResponse = {
  candidate: {
    displayName: 'Avery Patel',
    profileSummary: 'Builds products.',
    resumeHeadline: 'Engineer',
  },
  publishedAtUtc: null,
  sectionOrder: ['About', 'Skills'],
  sections: { skills: ['React'] },
  slug: 'avery-patel',
  template: 'Professional',
};

const query = (data?: unknown, overrides: Record<string, unknown> = {}) =>
  ({ data, isError: false, isLoading: false, refetch: vi.fn(), ...overrides }) as never;

const mutation = (value?: unknown, rejection?: unknown) => {
  const unwrap = rejection
    ? vi.fn().mockRejectedValue(rejection)
    : vi.fn().mockResolvedValue(value);
  const trigger = vi.fn(() => ({ unwrap }));
  return { trigger, tuple: [trigger, { isLoading: false }] as never };
};

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.search}</output>;
};

describe('Portfolio workspace', () => {
  beforeEach(() => {
    vi.mocked(useGetPortfolioQuery).mockReturnValue(query(editor));
    vi.mocked(useGetPortfolioPreviewQuery).mockReturnValue(query(preview));
    vi.mocked(useCreatePortfolioMutation).mockReturnValue(mutation(editor).tuple);
    vi.mocked(usePublishPortfolioMutation).mockReturnValue(
      mutation({ published: true, missingRequirements: [], portfolio: { ...editor, status: 'Published' } }).tuple,
    );
    vi.mocked(useUnpublishPortfolioMutation).mockReturnValue(mutation(editor).tuple);
  });

  const renderPage = (entry = '/dashboard/portfolio') =>
    renderWithProviders(
      <MemoryRouter initialEntries={[entry]}>
        <PortfolioPage />
        <LocationProbe />
      </MemoryRouter>,
    );

  it('shows a Draft before creation and explicitly creates a private draft', async () => {
    const create = mutation(editor);
    vi.mocked(useGetPortfolioQuery).mockReturnValue(
      query({ ...editor, id: null, isCreated: false, slug: null, status: null, template: null }),
    );
    vi.mocked(useCreatePortfolioMutation).mockReturnValue(create.tuple);
    renderPage();

    await userEvent.click(screen.getByRole('tab', { name: 'Portfolio builder' }));
    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: 'Create portfolio' }));
    expect(create.trigger).toHaveBeenCalledWith({ requestedSlug: null, template: 'Professional' });
  });

  it('keeps private profile saves independent from portfolio creation or publishing', async () => {
    const publish = mutation();
    vi.mocked(usePublishPortfolioMutation).mockReturnValue(publish.tuple);
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'Save profile' }));
    expect(publish.trigger).not.toHaveBeenCalled();
    expect(screen.getByText('Your profile stays private until you publish your portfolio.')).toBeVisible();
  });

  it('renders the candidate workspace header and dedicated URL-backed tabs', () => {
    renderPage();
    expect(screen.queryByRole('heading', { name: 'Portfolio readiness' })).not.toBeInTheDocument();
    expect(screen.getByText('CANDIDATE WORKSPACE')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Portfolio' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview portfolio' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit profile' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'View live portfolio' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unpublish' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Profile', 'Portfolio builder', 'Preview']);
  });

  it('opens the unified profile editor on Basic details', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    const editorDialog = screen.getByRole('dialog', { name: 'Edit profile' });
    expect(within(editorDialog).getByRole('tab', { name: 'Basic details' })).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps Draft when the backend rejects publication requirements and names them', async () => {
    const publish = mutation({ published: false, missingRequirements: ['skills', 'slug'], portfolio: editor });
    vi.mocked(usePublishPortfolioMutation).mockReturnValue(publish.tuple);
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: 'Portfolio builder' }));
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));

    expect(screen.queryByText('Complete these requirements before publishing:')).not.toBeInTheDocument();
    expect(publish.trigger).toHaveBeenCalledOnce();
  });

  it('surfaces a safe publication failure without reporting success', async () => {
    vi.mocked(usePublishPortfolioMutation).mockReturnValue(
      mutation(undefined, { message: 'Portfolio service is temporarily unavailable.', status: 503 }).tuple,
    );
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: 'Portfolio builder' }));
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));
    expect(await screen.findByText('Portfolio service is temporarily unavailable.')).toBeVisible();
    expect(screen.queryByText('Portfolio published.')).not.toBeInTheDocument();
  });

  it('shows published URL actions and requires confirmation before unpublishing', async () => {
    const unpublish = mutation(editor);
    vi.mocked(useGetPortfolioQuery).mockReturnValue(
      query({ ...editor, publishedAtUtc: '2026-08-12T00:00:00Z', status: 'Published' }),
    );
    vi.mocked(useUnpublishPortfolioMutation).mockReturnValue(unpublish.tuple);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: 'Portfolio builder' }));

    expect(screen.getByRole('link', { name: 'View live portfolio' })).toHaveAttribute('href', '/p/avery-patel');
    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('https://careerharbor.in/p/avery-patel'));
    expect(screen.getByRole('button', { name: 'Link copied' })).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Unpublish' }));
    expect(unpublish.trigger).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: 'Unpublish your portfolio?' });
    expect(within(dialog).getByText(/no longer be available/i)).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Unpublish portfolio' }));
    expect(unpublish.trigger).toHaveBeenCalledOnce();
  });

  it('restores the selected tab from URL state and updates it without discarding the page', async () => {
    renderPage('/dashboard/portfolio?tab=builder');
    expect(screen.getByRole('tab', { name: 'Portfolio builder' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Settings editor')).toBeVisible();

    await userEvent.click(screen.getByRole('tab', { name: 'Preview' }));
    expect(screen.getByTestId('location')).toHaveTextContent('?tab=preview');
    expect(await screen.findByRole('heading', { name: 'Portfolio preview' })).toBeVisible();
  });

  it('keeps tabs keyboard operable and available in the required order', async () => {
    renderPage();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Profile', 'Portfolio builder', 'Preview']);
    tabs[0]!.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tabs[1]).toHaveFocus();
  });

  it('renders preview loading, API error retry, empty, and backend success states', async () => {
    vi.mocked(useGetPortfolioPreviewQuery).mockReturnValue(query(undefined, { isLoading: true }));
    const loading = renderPage('/dashboard/portfolio?tab=preview');
    expect(screen.getByLabelText('Loading portfolio preview')).toBeVisible();
    loading.unmount();

    const refetch = vi.fn();
    vi.mocked(useGetPortfolioPreviewQuery).mockReturnValue(query(undefined, { isError: true, refetch }));
    const failed = renderPage('/dashboard/portfolio?tab=preview');
    expect(screen.getByText('Portfolio preview is unavailable.')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledOnce();
    failed.unmount();

    vi.mocked(useGetPortfolioPreviewQuery).mockReturnValue(query(undefined));
    const empty = renderPage('/dashboard/portfolio?tab=preview');
    expect(screen.getByText(/no portfolio preview is available yet/i)).toBeVisible();
    empty.unmount();

    vi.mocked(useGetPortfolioPreviewQuery).mockReturnValue(query(preview));
    renderPage('/dashboard/portfolio?tab=preview');
    expect(screen.getByRole('heading', { name: 'Avery Patel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Desktop preview width' })).toBePressed();
    await userEvent.click(screen.getByRole('button', { name: 'Mobile preview width' }));
    expect(screen.getByRole('button', { name: 'Mobile preview width' })).toBePressed();
  });

  it('never renders private salary or notice-period fields in public portfolio output', () => {
    vi.mocked(useGetPortfolioPreviewQuery).mockReturnValue(query({
      ...preview,
      candidate: {
        ...preview.candidate,
        email: 'private@example.com',
        mobile: '+91 99999 99999',
        profilePhotoUrl: 'https://private.example/photo.jpg',
      },
      sectionOrder: ['Experience'],
      sections: {
        experience: [{
          annualSalary: 2400000,
          companyName: 'Harbor Labs',
          description: 'Built accessible products.',
          displayOrder: 0,
          employmentType: EmploymentType.FullTime,
          endDate: null,
          id: 'experience-id',
          isCurrent: true,
          jobTitle: 'Engineer',
          location: null,
          noticePeriod: '30 days',
          skillsUsed: ['React'],
          startDate: '2024-01-01',
        }],
      },
    }));
    renderPage('/dashboard/portfolio?tab=preview');
    expect(screen.getByText('Harbor Labs')).toBeVisible();
    expect(screen.queryByText(/2400000|30 days/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/private@example\.com|99999 99999|private\.example/i)).not.toBeInTheDocument();
  });
});
