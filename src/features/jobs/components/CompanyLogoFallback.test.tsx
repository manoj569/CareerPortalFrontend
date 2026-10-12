import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CompanyLogoFallback } from './CompanyLogoFallback';
import { JobCard } from './JobCard';
import { ReferralJobCard } from '@/features/referrals/components/ReferralJobCard';
import { CandidateJobSummary } from '@/features/referrals/components/CandidateReferralUI';
import type { PublicJobSummary } from '../types/jobModels';
import type { PublicReferralJob } from '@/features/referrals/types/referralModels';

afterEach(() => vi.restoreAllMocks());

const job: PublicJobSummary = {
  id: 'job-1',
  referenceNumber: 'JOB-1',
  title: 'Engineer',
  slug: 'engineer',
  companyId: 'company-1',
  companyName: 'Deloitte',
  companySlug: 'deloitte',
  companyLogoUrl: 'https://assets.example.test/deloitte.svg',
  categoryId: 'category-1',
  categoryName: 'Engineering',
  location: 'Pune',
  minimumSalary: null,
  maximumSalary: null,
  currencyCode: 'INR',
  employmentType: 1,
  workplaceType: 3,
  experienceLevel: 3,
  isFeatured: false,
  publishedAtUtc: '2026-10-09T00:00:00Z',
  expiresAtUtc: null,
  minimumExperienceYears: null,
  maximumExperienceYears: null,
  internshipDurationMonths: null,
  isFlexibleDuration: false,
  department: null,
  roleCategory: null,
  educationRequirement: null,
  postedByType: null,
  companyType: null,
  industry: null,
};
const referral: PublicReferralJob = {
  jobId: job.id,
  jobTitle: job.title,
  companyName: job.companyName,
  companyLogoUrl: job.companyLogoUrl,
  location: job.location,
  referrerLabel: 'Employee Referrer',
  referralAvailable: true,
};

describe('shared company logos', () => {
  it('keeps the original blue circle for null and failed logos', () => {
    const { rerender } = render(<CompanyLogoFallback companyName="PwC" logoUrl={null} />);
    const initial = screen.getByRole('img', { name: 'PwC initials' });
    const fallbackStyle = window.getComputedStyle(initial);
    const background = fallbackStyle.backgroundColor;
    expect(background).not.toBe('rgba(0, 0, 0, 0)');
    expect(fallbackStyle.borderRadius).toBe('50%');
    expect(fallbackStyle.color).toBe('rgb(255, 255, 255)');
    expect(initial).toHaveTextContent('P');
    rerender(<CompanyLogoFallback companyName="PwC" logoUrl="https://example.test/pwc.svg" />);
    fireEvent.error(screen.getByRole('img', { name: 'PwC logo' }));
    expect(screen.getByRole('img', { name: 'PwC initials' })).toHaveStyle({ backgroundColor: background, borderRadius: '50%' });
  });

  it.each(['svg', 'png', 'webp'])('contains wide %s logos without fallback background or circular clipping', (format) => {
    render(<CompanyLogoFallback companyName="PwC" logoUrl={`https://example.test/pwc.${format}`}
      variant="circular" sx={{ bgcolor: 'primary.main', borderRadius: '50%' }} />);
    const image = screen.getByRole('img', { name: 'PwC logo' });
    Object.defineProperty(image, 'naturalWidth', { value: 600 });
    Object.defineProperty(image, 'naturalHeight', { value: 120 });
    fireEvent.load(image);
    expect(image.parentElement).not.toHaveClass('MuiAvatar-root');
    expect(image.parentElement).toHaveStyle({ 'background-color': 'rgba(0, 0, 0, 0)', 'border-radius': '0', 'max-width': '100%', overflow: 'hidden', 'align-items': 'center', 'justify-content': 'center' });
    expect(image).toHaveStyle({ objectFit: 'contain', objectPosition: 'center', maxWidth: '100%' });
  });
  it.each(['not a URL', 'https://', 'javascript:alert(1)', 'data:image/svg+xml,test', 'https://user:secret@example.test/logo.png'])(
    'uses the existing initials for invalid or unsafe URL %s', (logoUrl) => {
      const { container } = render(<CompanyLogoFallback companyName="Kyndryl" logoUrl={logoUrl} />);
      expect(screen.getByRole('img', { name: 'Kyndryl initials' })).toHaveTextContent('K');
      expect(container.querySelector('img')).toBeNull();
    },
  );

  it('renders the same supplied logo for multiple jobs with one CompanyId', () => {
    render(<MemoryRouter><JobCard job={job} /><JobCard job={{ ...job, id: 'job-2', title: 'Architect', slug: 'architect' }} /></MemoryRouter>);
    const images = screen.getAllByRole('img', { name: 'Deloitte logo' });
    expect(images).toHaveLength(2);
    images.forEach((image) => expect(image.parentElement).toHaveStyle({ 'background-color': 'rgba(0, 0, 0, 0)', 'border-radius': '0' }));
    images.forEach((image) => expect(image).toHaveAttribute('src', job.companyLogoUrl));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Architect' })).toBeVisible();
  });

  it('contains a lazy image in a fixed slot without Avatar eager preloading', () => {
    const preload = vi.spyOn(window, 'Image');
    render(<CompanyLogoFallback companyName="Deloitte" logoUrl={job.companyLogoUrl} />);
    const image = screen.getByRole('img', { name: 'Deloitte logo' });
    expect(image).toHaveAttribute('src', job.companyLogoUrl);
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image).toHaveAttribute('width', '52');
    expect(image).toHaveAttribute('height', '52');
    expect(image).toHaveStyle({ objectFit: 'contain', width: '100%', height: '100%' });
    expect(image.parentElement).toHaveStyle({ width: '52px', height: '52px', flexShrink: '0' });
    expect(preload).not.toHaveBeenCalled();
  });

  it.each([undefined, null, '', '   '])('uses initials when the logo field is %s', (logoUrl) => {
    const { container } = render(
      <CompanyLogoFallback companyName="  Northstar   Labs  " logoUrl={logoUrl} />,
    );
    expect(screen.getByRole('img', { name: 'Northstar Labs initials' })).toHaveTextContent('NL');
    expect(container.querySelector('img')).toBeNull();
  });

  it.each(['Deloitte', 'Microsoft', 'Future Provider'])(
    'uses only the supplied %s logo',
    (name) => {
      const url = `https://assets.example.test/${encodeURIComponent(name)}.png`;
      render(<CompanyLogoFallback companyName={name} logoUrl={url} />);
      expect(screen.getByRole('img', { name: `${name} logo` })).toHaveAttribute('src', url);
    },
  );

  it('removes a broken image, retains slot geometry and retries a changed logo', () => {
    const { container, rerender } = render(
      <CompanyLogoFallback
        companyName="Northstar Labs"
        logoUrl="/broken.png"
        size={62}
        variant="rounded"
        sx={{ bgcolor: '#f7f9fe', color: 'primary.main' }}
      />,
    );
    fireEvent.error(screen.getByRole('img', { name: 'Northstar Labs logo' }));
    const fallback = screen.getByRole('img', { name: 'Northstar Labs initials' });
    expect(fallback).toHaveTextContent('NL');
    expect(fallback).toHaveStyle({ width: '62px', height: '62px', backgroundColor: '#f7f9fe' });
    expect(container.querySelector('img')).toBeNull();
    rerender(<CompanyLogoFallback companyName="Microsoft" logoUrl="/microsoft.png" size={62} />);
    expect(screen.getByRole('img', { name: 'Microsoft logo' })).toHaveAttribute(
      'src',
      '/microsoft.png',
    );
  });

  it('supports old responses with no logo and unknown company names', () => {
    render(<CompanyLogoFallback />);
    expect(screen.getByRole('img', { name: 'Company initials' })).toHaveTextContent('CP');
  });

  it('uses the shared handling in Discover Jobs and Referred Jobs without changing their slots', () => {
    render(
      <MemoryRouter>
        <JobCard job={job} />
        <ReferralJobCard job={referral} onSeeDetails={vi.fn()} />
      </MemoryRouter>,
    );
    const images = screen.getAllByRole('img', { name: 'Deloitte logo' });
    expect(images).toHaveLength(2);
    expect(images[0]?.parentElement).toHaveStyle({ width: '52px', height: '52px' });
    expect(images[1]?.parentElement).toHaveStyle({ width: '62px', height: '62px' });
    images.forEach((image) => fireEvent.error(image));
    expect(screen.getAllByRole('img', { name: 'Deloitte initials' })).toHaveLength(2);
  });

  it('uses the shared logo and fallback in candidate request summaries', () => {
    render(
      <MemoryRouter>
        <CandidateJobSummary job={referral} />
      </MemoryRouter>,
    );
    const image = screen.getByRole('img', { name: 'Deloitte logo' });
    expect(image.parentElement).toHaveStyle({ width: '64px', height: '64px' });
    fireEvent.error(image);
    expect(screen.getByRole('img', { name: 'Deloitte initials' })).toHaveTextContent('D');
  });

  it('renders jobs from old API responses through the existing job card', () => {
    const oldJob = { ...job };
    delete oldJob.companyLogoUrl;
    render(
      <MemoryRouter>
        <JobCard job={oldJob} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: 'Deloitte initials' })).toHaveTextContent('D');
    expect(screen.getByRole('heading', { name: 'Engineer' })).toBeInTheDocument();
  });
});
