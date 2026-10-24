import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import { renderWithProviders } from '@/test/renderWithProviders';
import { HiringOpportunitiesSection } from './HiringOpportunitiesSection';

const drive = {
  id: 'drive-1', title: 'Existing Drive', subtitle: null, badgeText: null, badgeType: null,
  company: { id: 'company-1', name: 'Drive Co', logoUrl: null }, imageUrl: null, locationText: 'Pune',
  experienceText: null, isSponsored: false, destination: { type: 'internalJob', jobId: 'job-duplicate' },
};
const externalDrive = { ...drive, id: 'drive-external', title: 'External Drive', destination: { type: 'external', url: 'https://example.test/apply' } };
const promotion = (jobId: string, title: string, jobSlug: string) => ({
  jobId, jobSlug, title, companyName: 'Promoted Co', companyLogoUrl: null, bannerImageUrl: null, jobCategory: 'Internship',
  location: null, workplaceType: null, employmentType: 'Internship', minimumExperienceYears: null, maximumExperienceYears: null,
  educationRequirement: null, minimumSalary: null, maximumSalary: null, currencyCode: null, skills: [], postedAtUtc: null,
  detailsUrl: `/dashboard/jobs/${jobSlug}`,
});
const Location = () => <output data-testid="details-path">{useLocation().pathname}</output>;

const mount = () => renderWithProviders(<MemoryRouter initialEntries={['/dashboard']}><Routes>
  <Route path="/dashboard" element={<HiringOpportunitiesSection />} />
  <Route path="/dashboard/jobs/:slug" element={<Location />} />
</Routes></MemoryRouter>);

afterEach(() => vi.restoreAllMocks());

describe('HiringOpportunitiesSection', () => {
  it('keeps two dashboard opportunities as separate full-slide carousel items', async () => {
    vi.spyOn(apiClient, 'request').mockImplementation((config) => Promise.resolve({ data: { data:
      config.url === '/public/hiring-drives/home' ? [] : [
        promotion('phonepe-job', 'Intern, Company Secretary', 'phonepe-role'),
        promotion('hcltech-job', 'Developer Jobs at HCLTech (Chennai) | Freshers Eligible', 'hcltech-role'),
      ],
    } }));
    mount();

    const carousel = await screen.findByRole('region', { name: 'Hiring opportunities carousel' });
    expect(carousel).toHaveClass('hiring-ads-track-double');
    expect(carousel.querySelectorAll(':scope > article')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Intern, Company Secretary' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Developer Jobs at HCLTech (Chennai) | Freshers Eligible' })).toBeInTheDocument();
  });

  it('combines active promoted jobs with hiring drives, deduplicates only internal job IDs and routes by slug', async () => {
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) => Promise.resolve({ data: { data:
      config.url === '/public/hiring-drives/home' ? [drive, externalDrive] : [promotion('job-duplicate', 'Duplicate Promotion', 'duplicate'), promotion('job-2', 'Promoted QA Engineer', 'authoritative-slug')],
    } }));
    mount();
    expect(await screen.findByText('Existing Drive')).toBeInTheDocument();
    expect(screen.getByText('External Drive')).toBeInTheDocument();
    expect(screen.getByText('Promoted QA Engineer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous hiring opportunity' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next hiring opportunity' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Hiring opportunities pages' })).toBeInTheDocument();
    expect(screen.queryByText('Duplicate Promotion')).not.toBeInTheDocument();
    const promotedCard = screen.getByText('Promoted QA Engineer').closest('article');
    expect(promotedCard).toBeTruthy();
    expect(promotedCard!.querySelectorAll('button')).toHaveLength(1);
    expect(within(promotedCard as HTMLElement).getByText('Promoted')).toBeInTheDocument();
    fireEvent.click(within(promotedCard as HTMLElement).getByRole('button', { name: 'View Opportunity' }));
    expect(screen.getByTestId('details-path')).toHaveTextContent('/dashboard/jobs/authoritative-slug');
    expect(request.mock.calls.some(([config]) => config.url === '/job-promotions/active')).toBe(true);
  });

  it('keeps Hiring Drives visible if the promotion API fails', async () => {
    vi.spyOn(apiClient, 'request').mockImplementation((config) => config.url === '/job-promotions/active'
      ? Promise.reject(new Error('promotion API unavailable'))
      : Promise.resolve({ data: { data: [drive] } }));
    mount();
    expect(await screen.findByText('Existing Drive')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Promoted jobs are temporarily unavailable/)).toBeInTheDocument());
  });

  it('shows a compact empty state with a Browse jobs route when both feeds are empty', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { data: [] } });
    mount();
    expect(await screen.findByText(/No opportunities are available right now/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse jobs' })).toHaveAttribute('href', '/dashboard/jobs');
    expect(screen.queryByRole('button', { name: 'Next hiring opportunity' })).not.toBeInTheDocument();
  });
});
