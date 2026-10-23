import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import { renderWithProviders } from '@/test/renderWithProviders';
import { HiringDrivesSection } from './HiringDrivesSection';
import { validateHiringDrive } from './validation';
import type { HiringDriveInput } from './types';
const drive = {
  id: 'drive-1',
  title: 'Graduate Engineer',
  subtitle: 'Software role',
  badgeText: 'Hiring Now',
  badgeType: 'hiring',
  company: { id: 'company-1', name: 'Example Company', logoUrl: 'https://example.com/logo.png' },
  imageUrl: null,
  locationText: 'Remote',
  experienceText: '0-1 year',
  destination: { type: 'internalJob', jobId: 'job-1' },
  isSponsored: true,
};
const mount = () =>
  renderWithProviders(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<HiringDrivesSection />} />
        <Route path="/jobs/:slug" element={<div>Job detail destination</div>} />
      </Routes>
    </MemoryRouter>,
  );
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe('hiring drives', () => {
  it('shows matching skeletons while loading', () => {
    vi.spyOn(apiClient, 'request').mockImplementation(() => new Promise(() => {}));
    mount();
    expect(screen.getAllByLabelText('Loading hiring opportunity')).toHaveLength(4);
  });
  it('renders API companies, logos, badges and sponsorship', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { data: [drive] } });
    mount();
    expect(await screen.findByText(drive.title)).toBeInTheDocument();
    expect(screen.getByAltText('Example Company logo')).toHaveAttribute(
      'src',
      drive.company.logoUrl,
    );
    expect(screen.getByText('Hiring Now')).toBeInTheDocument();
    expect(screen.getByText('Sponsored')).toBeInTheDocument();
  });
  it('hides the section for an empty response', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { data: [] } });
    mount();
    await waitFor(() => expect(screen.queryByRole('region')).not.toBeInTheDocument());
  });
  it('hides failures without breaking surrounding content', async () => {
    vi.spyOn(apiClient, 'request').mockRejectedValue(new Error('Unavailable'));
    renderWithProviders(
      <MemoryRouter>
        <div>Home remains available</div>
        <HiringDrivesSection />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.queryByLabelText('Loading hiring opportunity')).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByText('Home remains available')).toBeInTheDocument();
  });
  it('calls the click endpoint, prevents duplicates and uses internal navigation', async () => {
    let resolveClick!: (value: unknown) => void;
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      config.method === 'POST'
        ? new Promise((resolve) => {
            resolveClick = resolve;
          })
        : Promise.resolve({
            data: {
              data: [drive],
            },
          }),
    );
    mount();
    const button = await screen.findByRole('button', { name: `Apply now for ${drive.title}` });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(request.mock.calls.filter(([config]) => config.method === 'POST')).toHaveLength(1);
    expect(request.mock.calls.at(-1)?.[0].url).toBe('/public/hiring-drives/drive-1/click');
    expect(button).toBeDisabled();
    resolveClick({
      data: {
        data: { destinationType: 'internalJob', jobId: 'job-1', jobSlug: 'graduate-engineer' },
      },
    });
    expect(await screen.findByText('Job detail destination')).toBeInTheDocument();
    expect(request.mock.calls.filter(([config]) => config.url === '/jobs')).toHaveLength(0);
    expect(window.location.pathname).not.toContain('job-1');
  });
  it('does not search or navigate when an internal response lacks jobSlug', async () => {
    const request = vi
      .spyOn(apiClient, 'request')
      .mockImplementation((config) =>
        Promise.resolve({
          data: {
            data:
              config.method === 'POST'
                ? { destinationType: 'internalJob', jobId: 'job-1' }
                : [drive],
          },
        }),
      );
    mount();
    fireEvent.click(await screen.findByRole('button', { name: `Apply now for ${drive.title}` }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to open');
    expect(request.mock.calls.filter(([config]) => config.url === '/jobs')).toHaveLength(0);
    expect(window.location.pathname).not.toContain('job-1');
  });
  it('opens only the backend external destination with safe link attributes', async () => {
    vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      Promise.resolve({
        data: {
          data:
            config.method === 'POST'
              ? { destinationType: 'external', url: 'https://example.com/apply' }
              : [drive],
        },
      }),
    );
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.rel).toBe('noopener noreferrer');
      expect(this.target).toBe('_blank');
      expect(this.href).toBe('https://example.com/apply');
    });
    mount();
    fireEvent.click(await screen.findByRole('button', { name: `Apply now for ${drive.title}` }));
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
  });
  it('rejects unsafe backend destinations', async () => {
    vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      Promise.resolve({
        data: {
          data:
            config.method === 'POST'
              ? { destinationType: 'external', url: 'javascript:alert(1)' }
              : [drive],
        },
      }),
    );
    mount();
    fireEvent.click(await screen.findByRole('button', { name: `Apply now for ${drive.title}` }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to open');
  });
  it('moves the carousel forward and backward only when content overflows', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({
      data: { data: Array.from({ length: 5 }, (_, i) => ({ ...drive, id: `carousel-${i}` })) },
    });
    mount();
    await screen.findAllByText(drive.title);
    const track = document.querySelector('.hiring-track') as HTMLDivElement;
    Object.defineProperties(track, {
      clientWidth: { value: 360 },
      scrollWidth: { value: 1800 },
      scrollLeft: { value: 0, writable: true },
    });
    const scroll = vi.fn();
    track.scrollBy = scroll;
    fireEvent.resize(window);
    fireEvent.click(screen.getByRole('button', { name: 'Next hiring opportunities' }));
    expect(scroll).toHaveBeenLastCalledWith({ left: 360, behavior: 'smooth' });
    track.scrollLeft = 360;
    fireEvent.scroll(track);
    fireEvent.click(screen.getByRole('button', { name: 'Previous hiring opportunities' }));
    expect(scroll).toHaveBeenLastCalledWith({ left: -360, behavior: 'smooth' });
  });
  it('deduplicates visible card impressions', async () => {
    let visible!: IntersectionObserverCallback;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          visible = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    const request = vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { data: [drive] } });
    mount();
    await screen.findByText(drive.title);
    const entry = [{ isIntersecting: true, intersectionRatio: 0.8 }] as IntersectionObserverEntry[];
    visible(entry, {} as IntersectionObserver);
    visible(entry, {} as IntersectionObserver);
    await waitFor(() =>
      expect(
        request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/impressions'),
      ).toHaveLength(1),
    );
  });
});
describe('admin campaign validation', () => {
  const valid: HiringDriveInput = {
    title: 'Engineer',
    companyId: 'company',
    jobId: 'job',
    isActive: true,
    isSponsored: false,
    displayOrder: 0,
    startAtUtc: '2026-01-01T00:00:00Z',
    endAtUtc: '2026-12-31T00:00:00Z',
  };
  it('accepts valid creates and edits', () => expect(validateHiringDrive(valid)).toBeNull());
  it('requires a title and company', () =>
    expect(validateHiringDrive({ ...valid, title: ' ' })).toMatch(/required/));
  it('requires a selected internal job', () =>
    expect(validateHiringDrive({ ...valid, jobId: '', applyUrl: '' })).toMatch(/apply URL/));
  it('validates external URLs', () =>
    expect(
      validateHiringDrive({
        ...valid,
        applyUrl: 'javascript:alert(1)',
      }),
    ).toMatch(/URL/));
  it('validates dates and display order', () => {
    expect(validateHiringDrive({ ...valid, endAtUtc: valid.startAtUtc })).toMatch(/End date/);
    expect(validateHiringDrive({ ...valid, displayOrder: -1 })).toMatch(/Display order/);
  });
});
