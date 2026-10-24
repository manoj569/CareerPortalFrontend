import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import { renderWithProviders } from '@/test/renderWithProviders';
import { HiringOpportunitiesSection } from './HiringOpportunitiesSection';

if (typeof globalThis.cancelAnimationFrame !== 'function') {
  globalThis.cancelAnimationFrame = (handle => clearTimeout(handle));
}

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
const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query === '(max-width:767px)' ? width < 768 : false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }) as MediaQueryList,
  });
};

const mount = () => renderWithProviders(<MemoryRouter initialEntries={['/dashboard']}><Routes>
  <Route path="/dashboard" element={<HiringOpportunitiesSection />} />
  <Route path="/dashboard/jobs/:slug" element={<Location />} />
</Routes></MemoryRouter>);

afterEach(() => {
  vi.restoreAllMocks();
  if (originalMatchMedia) Object.defineProperty(window, 'matchMedia', originalMatchMedia);
  else Reflect.deleteProperty(window, 'matchMedia');
});

describe('HiringOpportunitiesSection', () => {
  it.each([360, 375, 393, 412, 430, 440])('uses one full-width slide at %ipx and advances a full slide to the next opportunity', async (width) => {
    setViewportWidth(width);
    vi.spyOn(apiClient, 'request').mockImplementation((config) => Promise.resolve({ data: { data:
      config.url === '/public/hiring-drives/home' ? [] : [
        promotion('phonepe-job', 'Intern, Company Secretary', 'phonepe-role'),
        promotion('hcltech-job', 'Developer Jobs at HCLTech (Chennai) | Freshers Eligible', 'hcltech-role'),
      ],
    } }));
    mount();

    await screen.findByRole('heading', { name: 'Intern, Company Secretary' });
    await screen.findByRole('heading', { name: 'Developer Jobs at HCLTech (Chennai) | Freshers Eligible' });
    const carousel = screen.getByRole('region', { name: 'Hiring opportunities carousel' });
    expect(carousel).toHaveClass('hiring-ads-track-double');
    expect(carousel).toHaveAttribute('data-items-per-view', '1');
    expect(carousel).toHaveAttribute('data-active-index', '0');
    expect(carousel).toHaveStyle({ display: 'flex', width: '100%' });
    const slides = carousel.querySelectorAll(':scope > .hiring-opportunity-slide');
    expect(slides).toHaveLength(2);
    expect(slides[0]).toHaveStyle({ flex: '0 0 100%', width: '100%', maxWidth: '100%' });
    expect(slides[1]).toHaveStyle({ flex: '0 0 100%', width: '100%', maxWidth: '100%' });

    Object.defineProperty(slides[1], 'offsetLeft', { configurable: true, value: width + 16 });
    const scrollTo = vi.fn();
    Object.defineProperty(carousel, 'scrollTo', { configurable: true, value: scrollTo });
    fireEvent.click(screen.getByRole('button', { name: 'Next hiring opportunity' }));

    await waitFor(() => expect(carousel).toHaveAttribute('data-active-index', '1'));
    expect(scrollTo).toHaveBeenCalledWith({ left: width + 16, behavior: 'smooth' });
  });

  it('uses full-width mobile slides for both a Hiring Drive and a promoted job', async () => {
    setViewportWidth(393);
    vi.spyOn(apiClient, 'request').mockImplementation((config) => Promise.resolve({ data: { data:
      config.url === '/public/hiring-drives/home' ? [drive] : [promotion('job-2', 'Promoted Engineer', 'promoted-role')],
    } }));
    mount();

    await screen.findByText('Existing Drive');
    await screen.findByText('Promoted Engineer');
    const carousel = screen.getByRole('region', { name: 'Hiring opportunities carousel' });
    const slides = carousel.querySelectorAll(':scope > .hiring-opportunity-slide');
    expect(carousel).toHaveAttribute('data-items-per-view', '1');
    expect(slides).toHaveLength(2);
    expect(slides[0]).toHaveStyle({ flex: '0 0 100%' });
    expect(slides[0]?.querySelector('.hiring-drive-card')).not.toBeNull();
    expect(slides[1]).toHaveStyle({ flex: '0 0 100%' });
    expect(slides[1]?.querySelector('.promoted-job-card')).not.toBeNull();
  });

  it.each([768, 1024])('keeps two items per view at %ipx and wider desktop widths', async (width) => {
    setViewportWidth(width);
    vi.spyOn(apiClient, 'request').mockImplementation((config) => Promise.resolve({ data: { data:
      config.url === '/public/hiring-drives/home' ? [] : [
        promotion('phonepe-job', 'Intern, Company Secretary', 'phonepe-role'),
        promotion('hcltech-job', 'Developer Jobs at HCLTech (Chennai) | Freshers Eligible', 'hcltech-role'),
      ],
    } }));
    mount();

    await screen.findByRole('heading', { name: 'Intern, Company Secretary' });
    await screen.findByRole('heading', { name: 'Developer Jobs at HCLTech (Chennai) | Freshers Eligible' });
    const carousel = screen.getByRole('region', { name: 'Hiring opportunities carousel' });
    expect(carousel).toHaveAttribute('data-items-per-view', '2');
    expect(carousel.style.display).toBe('');
    expect(carousel.querySelectorAll(':scope > .hiring-opportunity-slide')).toHaveLength(2);
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
