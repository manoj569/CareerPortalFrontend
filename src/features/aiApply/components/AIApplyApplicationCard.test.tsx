import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AIApplyFailureKind, AIApplyRunStatus, type AIApplyApplication } from '../types/aiApplyModels';
import { AIApplyApplicationCard } from './AIApplyApplicationCard';

const application: AIApplyApplication = {
  id: 'application-id',
  jobId: 'job-id',
  jobTitle: 'Senior React Engineer',
  companyName: 'Northstar Labs',
  status: AIApplyRunStatus.Submitted,
  progressState: 'Submitted',
  priority: 0,
  scheduledAtUtc: '2026-09-04T10:00:00Z',
  startedAtUtc: '2026-09-04T10:01:00Z',
  completedAtUtc: '2026-09-04T10:05:00Z',
  submittedAtUtc: '2026-09-04T10:04:00Z',
  updatedAtUtc: '2026-09-04T10:05:00Z',
  retryCount: 0,
  failureKind: AIApplyFailureKind.None,
  requiresUserInput: false,
  matchScore: 91,
  createdAtUtc: '2026-09-04T09:59:00Z',
  resumeUsed: { fileName: 'historical-resume.pdf' },
};

describe('AI Apply application card metadata', () => {
  it('renders backend job metadata and truthful progress instead of a job id', () => {
    render(<MemoryRouter><AIApplyApplicationCard application={application} /></MemoryRouter>);
    expect(screen.getByText('Senior React Engineer')).toBeVisible();
    expect(screen.getByText('Northstar Labs')).toBeVisible();
    expect(screen.getByText('Submitted', { selector: '.MuiChip-label' })).toBeVisible();
    expect(screen.queryByText(/job-id/i)).not.toBeInTheDocument();
  });

  it('keeps null historical metadata honest', () => {
    render(
      <MemoryRouter>
        <AIApplyApplicationCard
          application={{ ...application, companyName: null, jobTitle: null, progressState: 'NeedsReview', submittedAtUtc: null }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Job application')).toBeVisible();
    expect(screen.getByText('NeedsReview')).toBeVisible();
    expect(screen.queryByText('Northstar Labs')).not.toBeInTheDocument();
  });
});
