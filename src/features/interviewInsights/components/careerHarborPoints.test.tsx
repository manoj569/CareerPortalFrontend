import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  CareerGuidanceComingSoonDialog,
  CareerHarborPointsIndicator,
} from './CareerHarborPointsActions';
import { CareerHarborPointsCard } from './CareerHarborPointsCard';
import type { CareerHarborPointsBalance } from '../types/interviewInsightModels';
const balance = (
  overrides: Partial<CareerHarborPointsBalance> = {},
): CareerHarborPointsBalance => ({
  totalPoints: 1320,
  mentorEligibilityThreshold: 3000,
  remainingPoints: 1680,
  isPointsEligibleForMentor: false,
  interviewInsightPublishedPoints: 5,
  interviewInsightHelpfulPoints: 400,
  referralOpportunitySharedPoints: 15,
  referralCandidateConfirmedPoints: 900,
  isPaidEligibilityAvailable: false,
  isPaidEligibleForMentor: false,
  ...overrides,
});
describe('CareerHarbor Points presentation', () => {
  it('renders a zero balance and threshold without fabricating an eligibility state', () => {
    render(
      <CareerHarborPointsCard
        balance={balance({
          totalPoints: 0,
          remainingPoints: 3000,
          interviewInsightPublishedPoints: 0,
          interviewInsightHelpfulPoints: 0,
          referralOpportunitySharedPoints: 0,
          referralCandidateConfirmedPoints: 0,
        })}
      />,
    );
    expect(screen.getByText('0 / 3,000 points')).toBeVisible();
    expect(screen.getByText('3,000 points to Mentor eligibility')).toBeVisible();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
  it('shows backend totals, remaining points, and reason breakdown', () => {
    render(<CareerHarborPointsCard balance={balance()} />);
    expect(screen.getByText('1,320 / 3,000 points')).toBeVisible();
    expect(screen.getByText('1,680 points to Mentor eligibility')).toBeVisible();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '3000');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1320');
    expect(screen.getByText('Candidate-confirmed referrals')).toBeVisible();
    expect(screen.getByText('900 pts')).toBeVisible();
    expect(screen.getByText('400 pts')).toBeVisible();
  });
  it('uses backend eligibility at the threshold and caps progress above 100%', () => {
    const eligible = balance({
      totalPoints: 3000,
      remainingPoints: 0,
      isPointsEligibleForMentor: true,
    });
    const { rerender } = render(<CareerHarborPointsCard balance={eligible} />);
    expect(screen.getByText('Mentor eligibility unlocked')).toBeVisible();
    expect(screen.getByText(/verification and onboarding are still required/i)).toBeVisible();
    expect(screen.queryByText(/approved mentor$/i)).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3000');
    rerender(
      <CareerHarborPointsCard
        balance={balance({
          totalPoints: 3500,
          remainingPoints: -500,
          isPointsEligibleForMentor: true,
        })}
      />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3000');
    expect(screen.queryByText(/-500/)).not.toBeInTheDocument();
  });
  it('hides the header indicator while points are unavailable and opens cached details when available', () => {
    const { rerender } = render(<CareerHarborPointsIndicator />);
    expect(screen.queryByRole('button', { name: /pts/i })).not.toBeInTheDocument();
    rerender(<CareerHarborPointsIndicator balance={balance()} />);
    fireEvent.click(screen.getByRole('button', { name: 'View CareerHarbor Points' }));
    expect(screen.getByText('How to earn points')).toBeVisible();
    expect(screen.getByText('1,680 points to Mentor eligibility')).toBeVisible();
  });
  it('shows a static threshold explanation without showing a fake balance when unavailable', () => {
    render(<CareerGuidanceComingSoonDialog balance={null} onClose={() => undefined} open />);
    expect(screen.getByText('Career Guidance · Coming soon')).toBeVisible();
    expect(screen.getByText(/Reach 3,000 points/)).toBeVisible();
    expect(screen.queryByText(/0 \/ 3,000/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /pay|unlock|become mentor/i }),
    ).not.toBeInTheDocument();
  });

  it('shows a live remaining balance in Career Guidance without claiming mentor approval', () => {
    render(<CareerGuidanceComingSoonDialog balance={balance()} onClose={() => undefined} open />);
    expect(screen.getByText('1,320 / 3,000 points')).toBeVisible();
    expect(screen.getByText('1,680 points to Mentor eligibility')).toBeVisible();
    expect(screen.getByText(/verification and approval will still be required/i)).toBeVisible();
    expect(screen.queryByText(/you are now a mentor/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pay|₹3,000|unlock now/i })).not.toBeInTheDocument();
  });
});
