import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ReferralJobCard } from './ReferralJobCard';
import { ReferralContactDetailsPage } from '@/pages/ReferralContactDetailsPage';
import type { PublicReferralJob } from '../types/referralModels';
const job: PublicReferralJob = {
  jobId: 'job-1',
  referralId: 'op-1',
  jobTitle: 'Engineer',
  companyName: 'Example',
  location: 'Pune',
  referrerLabel: 'Employee Referrer',
  referralAvailable: true,
  remainingReferralSlots: 2,
};
describe('public referral privacy', () => {
  it('renders a generic label and never renders legacy identity or photo', () => {
    const unsafe = {
      ...job,
      referrerName: 'Secret Person',
      referrerProfileImageUrl: 'https://example.test/private.jpg',
    };
    render(<ReferralJobCard job={unsafe} onSeeDetails={() => {}} />);
    expect(screen.getByText('Employee Referrer')).toBeInTheDocument();
    expect(screen.queryByText(/Secret Person/)).not.toBeInTheDocument();
    expect(document.querySelector('img[src*="private.jpg"]')).toBeNull();
    expect(screen.getByText('Contact details are private until acceptance.')).toBeInTheDocument();
  });
  it('shows server capacity and disables requests when exhausted', () => {
    render(<ReferralJobCard job={{ ...job, remainingReferralSlots: 0 }} onSeeDetails={() => {}} />);
    expect(screen.getByText('0 referral slots remaining')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request Referral/ })).toBeDisabled();
  });
  it('old contact links explain acceptance and never fetch protected contact', async () => {
    render(
      <MemoryRouter>
        <ReferralContactDetailsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Contact access requires an accepted/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'View my referral requests' }));
  });
});
