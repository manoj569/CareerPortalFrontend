import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { UserRole } from '@/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { ConsultantOnboardingResponse } from '../api/onboardingApi';
import { careerGuidanceApi } from '../api/careerGuidanceApi';
import ConsultantReviewSubmitPage from './ConsultantReviewSubmitPage';

const { request } = vi.hoisted(() => ({
  request: vi.fn<(config: { url: string; method?: string; data?: unknown }) => Promise<unknown>>(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
const fixture = (): ConsultantOnboardingResponse => ({
  id: 'consultant',
  revision: 'revision-1',
  status: 5,
  displayName: 'Test Consultant',
  professionalHeadline: 'Career coaching',
  bio: 'Professional guidance',
  profileImageUrl: null,
  location: 'Pune',
  professionalEmail: null,
  accountEmail: 'private-account@example.test',
  companyId: null,
  companyName: 'Test Company',
  currentRole: 'Coach',
  yearsOfExperience: 8,
  professionalType: 5,
  linkedInUrl: '',
  industry: 'Technology',
  functionalArea: 'Coaching',
  languages: ['English'],
  expertise: ['Interview preparation'],
  education: [
    {
      qualification: 'Degree A',
      institution: 'Institution A',
      fieldOfStudy: null,
      startYear: 2010,
      endYear: 2014,
      isCurrentlyStudying: false,
      displayOrder: 0,
    },
    {
      qualification: 'Degree B',
      institution: 'Institution B',
      fieldOfStudy: 'Coaching',
      startYear: 2015,
      endYear: null,
      isCurrentlyStudying: true,
      displayOrder: 1,
    },
  ],
  workExperience: [],
  services: [
    {
      id: 'service-1',
      title: 'Interview practice',
      serviceType: 'Video',
      description: 'Practice together',
      durationMinutes: 30,
      price: 750,
      currency: 'INR',
      isActive: true,
    },
    {
      id: 'service-2',
      title: 'CV review',
      serviceType: 'Video',
      description: '',
      durationMinutes: 15,
      price: 300,
      currency: 'INR',
      isActive: true,
    },
    {
      id: 'service-3',
      title: 'Inactive offering',
      serviceType: 'Video',
      description: '',
      durationMinutes: 15,
      price: 300,
      currency: 'INR',
      isActive: false,
    },
  ],
  availability: {
    timeZoneId: 'Europe/London',
    isAcceptingBookings: false,
    revision: 'revision-1',
    windows: [
      { dayOfWeek: 1, startTime: '09:00:00', endTime: '12:00:00', isActive: true },
      { dayOfWeek: 1, startTime: '14:00:00', endTime: '17:00:00', isActive: true },
      { dayOfWeek: 0, startTime: '08:00:00', endTime: '09:00:00', isActive: false },
    ],
  },
  submittedAtUtc: null,
  publicProfileConsentAtUtc: null,
  termsAcceptedAtUtc: null,
  policyVersion: '',
  rejectionFeedback: null,
  missingRequirements: ['CurrentPolicyAcceptance', 'PublicProfileConsent'],
});
const response = (value: unknown) => ({ data: { data: value } });
let current = fixture();
const renderPage = () =>
  renderWithProviders(
    <MemoryRouter>
      <Routes>
        <Route path="/login" element={<p>Sign in</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="*" element={<ConsultantReviewSubmitPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
    {
      auth: {
        status: 'authenticated',
        user: {
          id: 'owner',
          firstName: 'Test',
          lastName: 'Owner',
          email: 'owner@example.test',
          role: UserRole.Candidate,
        },
        isSubmitting: false,
        error: null,
        accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
      },
    },
  );
const consent = async () => {
  fireEvent.click(
    await screen.findByRole('checkbox', { name: 'I agree to the Consultant Terms & Conditions.' }),
  );
  fireEvent.click(screen.getByRole('checkbox', { name: /I consent to the selected/ }));
};
beforeEach(() => {
  current = fixture();
  request.mockReset().mockImplementation(() => Promise.resolve(response(current)));
});

describe('Consultant review and submit', () => {
  it('renders real active data, all education and same-day windows without account email or fallback person', async () => {
    renderPage();
    expect(await screen.findByText('Test Consultant')).toBeVisible();
    expect(screen.getByText(/Degree A, Institution A/)).toBeVisible();
    expect(screen.getByText(/Degree B, Institution B/)).toBeVisible();
    expect(screen.getByText('Interview practice')).toBeVisible();
    expect(screen.getByText('CV review')).toBeVisible();
    expect(screen.getByText(/₹750.00/)).toBeVisible();
    expect(screen.getByText('Europe/London')).toBeVisible();
    expect(screen.getByText('9:00 AM – 12:00 PM')).toBeVisible();
    expect(screen.getByText('2:00 PM – 5:00 PM')).toBeVisible();
    expect(screen.queryByText('Inactive offering')).not.toBeInTheDocument();
    expect(screen.queryByText('8:00 AM – 9:00 AM')).not.toBeInTheDocument();
    expect(screen.queryByText(current.accountEmail)).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit basic information' })).toHaveAttribute(
      'href',
      '/career-guidance/become-consultant/basic',
    );
    expect(screen.getByRole('link', { name: 'Edit professional details' })).toHaveAttribute(
      'href',
      '/career-guidance/become-consultant/professional',
    );
    expect(screen.getByRole('link', { name: 'Edit expertise & services' })).toHaveAttribute(
      'href',
      '/career-guidance/become-consultant/expertise',
    );
    expect(screen.getByRole('link', { name: 'Edit availability' })).toHaveAttribute(
      'href',
      '/career-guidance/become-consultant/availability',
    );
  });
  it('requires explicit consent and submits the exact revision/policy payload once, then shows Pending', async () => {
    let complete: ((value: unknown) => void) | undefined;
    request.mockImplementation(async (config) =>
      config.method === 'POST'
        ? new Promise((resolve) => {
            complete = resolve;
          })
        : response(current),
    );
    renderPage();
    expect(await screen.findByRole('button', { name: 'Submit for review' })).toBeDisabled();
    expect(screen.getByRole('heading', { name: 'Your profile is ready for review' })).toBeVisible();
    await consent();
    const button = screen.getByRole('button', { name: 'Submit for review' });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() =>
      expect(request.mock.calls.filter(([config]) => config.method === 'POST')).toHaveLength(1),
    );
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/career-guidance/me/onboarding/submit',
        method: 'POST',
        data: {
          revision: 'revision-1',
          policyVersion: 'career-guidance-v1',
          acceptIndependentGuidancePolicy: true,
          acceptPublicProfileConsent: true,
        },
      }),
    );
    const resolve = complete;
    if (!resolve) throw new Error('Expected pending submit request');
    current = {
      ...current,
      status: 1,
      revision: 'revision-2',
      submittedAtUtc: '2026-09-25T00:00:00Z',
      termsAcceptedAtUtc: '2026-09-25T00:00:00Z',
      publicProfileConsentAtUtc: '2026-09-25T00:00:00Z',
      policyVersion: 'career-guidance-v1',
      missingRequirements: [],
    };
    await act(() => {
      resolve(response(current));
      return Promise.resolve();
    });
    expect(await screen.findByText('Your consultant application is under review')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Submit for review' })).not.toBeInTheDocument();
  });
  it('uses newer server approval after submission rather than retaining the local Pending response', async () => {
    request.mockImplementation((config) => {
      if (config.method === 'POST') {
        current = { ...current, status: 1, revision: 'revision-2', submittedAtUtc: '2026-09-25T00:00:00Z', termsAcceptedAtUtc: '2026-09-25T00:00:00Z', publicProfileConsentAtUtc: '2026-09-25T00:00:00Z', policyVersion: 'career-guidance-v1', missingRequirements: [] };
      }
      return Promise.resolve(response(current));
    });
    const view = renderPage();
    await consent();
    fireEvent.click(screen.getByRole('button', { name: 'Submit for review' }));
    expect(await screen.findByRole('heading', { name: 'Your consultant application is under review' })).toBeVisible();
    current = { ...current, status: 2, revision: 'revision-3' };
    act(() => { view.store.dispatch(careerGuidanceApi.util.invalidateTags(['Career'])); });
    expect(await screen.findByRole('heading', { name: 'Your consultant profile is approved' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open Consultant Workspace' })).toBeVisible();
    expect(screen.queryByText("You're almost there!")).not.toBeInTheDocument();
  });
  it('blocks backend missing profile requirements even after both consent choices', async () => {
    current.missingRequirements.push('UsableAvailability');
    renderPage();
    await consent();
    expect(screen.getByText('Usable Availability')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Complete your consultant profile' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit for review' })).toBeDisabled();
  });
  it.each([
    { status: 1, title: 'Your consultant application is under review' },
    { status: 2, title: 'Your consultant profile is approved' },
    { status: 4, title: 'Consultant access is restricted' },
  ] as const)('handles $title without editable submission', async ({ status, title }) => {
    current.status = status;
    renderPage();
    expect(await screen.findByText(title)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Submit for review' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit basic information' })).not.toBeInTheDocument();
    expect(screen.queryByText("You're almost there!")).not.toBeInTheDocument();
    expect(screen.queryByText('Before submitting')).not.toBeInTheDocument();
    if (status === 2) expect(screen.getByRole('link', { name: 'Open Consultant Workspace' })).toHaveAttribute('href', '/career-guidance/consultant/profile');
  });
  it('shows rejection feedback with edit actions, requiring a material edit before resubmission', async () => {
    current.status = 3;
    current.rejectionFeedback = 'Please clarify your expertise.';
    renderPage();
    expect(await screen.findByText(/Review feedback: Please clarify/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Edit basic information' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Submit for review' })).not.toBeInTheDocument();
  });
  it('refetches on 409, resets consent and requires explicit review without retrying POST', async () => {
    request.mockImplementation((config) => {
      if (config.method === 'POST') {
        current = { ...current, revision: 'revision-2', displayName: 'Updated Consultant' };
        return Promise.reject(new ApiRequestError({ status: 409, message: 'Conflict' }));
      }
      return Promise.resolve(response(current));
    });
    renderPage();
    await consent();
    fireEvent.click(screen.getByRole('button', { name: 'Submit for review' }));
    expect(await screen.findByText('Updated Consultant')).toBeVisible();
    expect(screen.getByText(/Your profile changed/)).toBeVisible();
    expect(screen.getByRole('checkbox', { name: /I agree/ })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Submit for review' })).toBeDisabled();
    expect(request.mock.calls.filter(([config]) => config.method === 'POST')).toHaveLength(1);
  });
  it.each([
    { status: 400, message: 'Complete required service.', expected: /Complete required service/ },
    { status: 429, message: 'Limited', expected: /Too many requests/ },
    { status: 401, message: 'Expired', expected: /Sign in/ },
    {
      status: 500,
      message: 'private server details',
      expected: /We could not complete this request/,
    },
  ])('handles $status without false success', async ({ status, message, expected }) => {
    request.mockImplementation((config) => {
      if (config.method === 'POST') return Promise.reject(new ApiRequestError({ status, message }));
      return Promise.resolve(response(current));
    });
    renderPage();
    await consent();
    fireEvent.click(screen.getByRole('button', { name: 'Submit for review' }));
    expect(await screen.findByText(expected)).toBeVisible();
    expect(screen.queryByText('Your consultant application is under review')).not.toBeInTheDocument();
    expect(screen.queryByText('private server details')).not.toBeInTheDocument();
  });
  it('does not treat malformed submission as success or allow blind retry', async () => {
    request.mockImplementation((config) =>
      Promise.resolve(response(config.method === 'POST' ? { status: 1 } : current)),
    );
    renderPage();
    await consent();
    fireEvent.click(screen.getByRole('button', { name: 'Submit for review' }));
    expect(await screen.findByText(/submission response was unexpected/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit for review' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reload profile' })).toBeVisible();
  });
  it('handles malformed loaded data safely', async () => {
    request.mockResolvedValue(response({ status: 5 }));
    renderPage();
    expect(await screen.findByText(/could not load a complete profile response/)).toBeVisible();
  });
});
