import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import {
  AIApplyFailureKind,
  AIApplyRunStatus,
  type AIApplyApplication,
} from '../types/aiApplyModels';
import { AIApplyHandoffCard } from './AIApplyHandoffCard';

const application = (
  failureKind: AIApplyFailureKind,
  status = AIApplyRunStatus.WaitingForUser,
): AIApplyApplication => ({
  id: 'application-id',
  jobId: 'job-id',
  status,
  priority: 0,
  scheduledAtUtc: '',
  startedAtUtc: null,
  completedAtUtc: null,
  retryCount: 0,
  failureKind,
  requiresUserInput: true,
  matchScore: null,
  createdAtUtc: '',
  jobTitle: 'Frontend Engineer',
  companyName: 'Northstar Labs',
  progressState: 'WaitingForCandidate',
  submittedAtUtc: null,
  updatedAtUtc: '',
  resumeUsed: null,
});
const renderCard = (failureKind: AIApplyFailureKind, status?: AIApplyRunStatus) =>
  render(
    <MemoryRouter>
      <AIApplyHandoffCard application={application(failureKind, status)} detailed />
    </MemoryRouter>,
  );

const actionableApplication = (failureKind: AIApplyFailureKind): AIApplyApplication => ({
  ...application(failureKind),
  externalApplication: {
    canOpen: true,
    displayName: failureKind === AIApplyFailureKind.LoginRequired ? 'Workday' : 'Greenhouse',
    site: 5,
    url: 'https://candidate-safe.example/application?token=backend',
  },
  actions: {
    canCancel: true,
    canContinue: true,
    canOpenExternalApplication: true,
    requiresCandidateAction: true,
  },
  message: 'Complete the required action, then continue your application.',
});

describe('AI Apply manual handoff card', () => {
  it('shows truthful login instructions without collecting credentials or fabricating a link', () => {
    renderCard(AIApplyFailureKind.LoginRequired);
    expect(screen.getByRole('heading', { name: 'Sign in required' })).toBeVisible();
    expect(
      screen.getByText(/never ask you to share your job-site password, OTP, or MFA/i),
    ).toBeVisible();
    expect(screen.queryByLabelText(/password|OTP|authenticator/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /open job site/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continue|retry/i })).not.toBeInTheDocument();
  });

  it('requires human verification on the external site and offers no solving behavior', () => {
    renderCard(AIApplyFailureKind.HumanVerificationRequired);
    expect(screen.getByRole('heading', { name: 'Verification required' })).toBeVisible();
    expect(screen.getByText(/cannot complete automatically/i)).toBeVisible();
    expect(screen.queryByText(/solve CAPTCHA|bypass verification/i)).not.toBeInTheDocument();
  });

  it('treats submission-unconfirmed as review and never as submitted or retryable', () => {
    renderCard(AIApplyFailureKind.SubmissionUnconfirmed, AIApplyRunStatus.NeedsReview);
    expect(screen.getByRole('heading', { name: 'Submission needs review' })).toBeVisible();
    expect(screen.getByText(/avoid a duplicate application/i)).toBeVisible();
    expect(screen.queryByText(/^Submitted$/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry|submit again/i })).not.toBeInTheDocument();
  });

  it('opens only the backend-provided external URL with safe new-tab attributes', () => {
    render(
      <MemoryRouter>
        <AIApplyHandoffCard
          application={actionableApplication(AIApplyFailureKind.LoginRequired)}
          detailed
        />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /open application site/i });
    expect(link).toHaveAttribute(
      'href',
      'https://candidate-safe.example/application?token=backend',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText(/sign in to Workday in the new tab/i)).toBeVisible();
  });

  it('does not expose an external link when either backend capability is false', () => {
    const value = actionableApplication(AIApplyFailureKind.LoginRequired);
    value.actions = { ...value.actions!, canOpenExternalApplication: false };
    render(
      <MemoryRouter>
        <AIApplyHandoffCard application={value} detailed />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link', { name: /open application site/i })).not.toBeInTheDocument();
  });

  it('shows manual verification guidance without credential fields', () => {
    render(
      <MemoryRouter>
        <AIApplyHandoffCard
          application={actionableApplication(AIApplyFailureKind.HumanVerificationRequired)}
          detailed
        />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/complete CAPTCHA, OTP, MFA, or other verification directly/i),
    ).toBeVisible();
    expect(
      screen.queryByRole('textbox', { name: /password|otp|mfa|captcha/i }),
    ).not.toBeInTheDocument();
  });

  it('renders and disables Continue strictly from backend capability', async () => {
    const onContinue = vi.fn();
    const value = actionableApplication(AIApplyFailureKind.LoginRequired);
    const { rerender } = render(
      <MemoryRouter>
        <AIApplyHandoffCard application={value} detailed onContinue={onContinue} />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole('button', { name: /continue application/i }));
    expect(onContinue).toHaveBeenCalledOnce();
    rerender(
      <MemoryRouter>
        <AIApplyHandoffCard application={value} continuing detailed onContinue={onContinue} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /continuing application/i })).toBeDisabled();
    rerender(
      <MemoryRouter>
        <AIApplyHandoffCard
          application={{ ...value, actions: { ...value.actions!, canContinue: false } }}
          detailed
          onContinue={onContinue}
        />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button', { name: /continue application/i })).not.toBeInTheDocument();
  });

  it('never offers Continue for submission uncertainty even if a contradictory capability arrives', () => {
    const value = actionableApplication(AIApplyFailureKind.SubmissionUnconfirmed);
    value.status = AIApplyRunStatus.NeedsReview;
    render(
      <MemoryRouter>
        <AIApplyHandoffCard application={value} detailed onContinue={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button', { name: /continue application/i })).not.toBeInTheDocument();
    expect(screen.getByText(/no automatic retry is available/i)).toBeVisible();
  });
});
