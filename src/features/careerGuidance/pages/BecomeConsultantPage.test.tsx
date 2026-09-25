import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import type { AuthState } from '@/features/auth/store/authSlice';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { guidanceRoutes } from '../utils/routes';
import BecomeConsultantPage from './BecomeConsultantPage';

const { request } = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('@/api/apiClient', () => ({
  apiClient: { request },
}));

const draft = {
  data: {
    data: {
      id: 'existing-profile',
      revision: 'server-revision',
      status: 5,
    },
  },
};

const authenticated: AuthState = {
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
};

function renderPage(auth: AuthState = authenticated) {
  const router = createMemoryRouter(
    [
      {
        path: '/login',
        element: <p>Sign in</p>,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: guidanceRoutes.becomeConsultant,
            element: <BecomeConsultantPage />,
          },
          {
            path: guidanceRoutes.owner('profile'),
            element: <p>Existing profile destination</p>,
          },
        ],
      },
    ],
    {
      initialEntries: [guidanceRoutes.becomeConsultant],
    },
  );

  return {
    router,
    ...renderWithProviders(<RouterProvider router={router} />, { auth }),
  };
}

beforeEach(() => {
  request.mockReset().mockResolvedValue(draft);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Become a consultant Screen 1', () => {
  it('renders the reference sections with truthful product copy and a local image', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Share your experience.Guide the next generation.',
    );

    expect(screen.getByRole('heading', { name: 'How it works' })).toBeVisible();

    expect(
      screen.getByRole('heading', {
        name: 'Why consult on Career Harbor',
      }),
    ).toBeVisible();

    expect(screen.getByText('2. Platform review')).toBeVisible();

    expect(
      screen.queryByText(/10,000|Rahul|verified employee|Great consultation/i),
    ).not.toBeInTheDocument();

    expect(screen.getByRole('img', { name: 'Career professional' })).toHaveAttribute(
      'src',
      '/images/consultant-onboarding-hero.png',
    );

    expect(request).not.toHaveBeenCalled();
  });

  it('starts or resumes through the real API adapter and navigates only after success', async () => {
    let complete: ((value: typeof draft) => void) | undefined;

    request.mockReturnValue(
      new Promise<typeof draft>((resolve) => {
        complete = resolve;
      }),
    );

    const { router } = renderPage();

    const button = screen.getByRole('button', {
      name: 'Start application',
    });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(request).toHaveBeenCalledTimes(1);

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/career-guidance/me/onboarding',
        method: 'POST',
        data: undefined,
      }),
    );

    expect(
      screen.getByRole('button', {
        name: 'Starting application…',
      }),
    ).toBeDisabled();

    expect(router.state.location.pathname).toBe(guidanceRoutes.becomeConsultant);

const resolveRequest = complete;

if (!resolveRequest) {
  throw new Error('Expected pending onboarding request');
}

await act(() => {
  resolveRequest(draft);
  return Promise.resolve();
});
    expect(await screen.findByText('Existing profile destination')).toBeVisible();

    expect(router.state.location.pathname).toBe('/career-guidance/consultant/profile');
  });

  it('keeps failed requests on the landing page and allows an explicit retry', async () => {
    request.mockRejectedValueOnce(
      new ApiRequestError({
        status: 500,
        message: 'private details',
      }),
    );

    renderPage();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Start application',
      }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not start your application. Please try again.',
    );

    expect(screen.queryByText(/private details/)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Start application',
      }),
    );

    expect(await screen.findByText('Existing profile destination')).toBeVisible();
  });

  it('shows a retry-later message on 429 without automatically retrying', async () => {
    request.mockRejectedValue(
      new ApiRequestError({
        status: 429,
        message: 'rate limited',
      }),
    );

    renderPage();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Start application',
      }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please wait before trying again',
    );

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('preserves the login return route and makes no anonymous start request', async () => {
    const { router } = renderPage({
      ...authenticated,
      status: 'unauthenticated',
      user: null,
    });

    expect(await screen.findByText('Sign in')).toBeVisible();

    const locationState = router.state.location.state as {
      from?: {
        pathname?: string;
      };
    } | null;

    expect(locationState?.from?.pathname).toBe(guidanceRoutes.becomeConsultant);

    expect(request).not.toHaveBeenCalled();
  });

  it('does not navigate for a malformed successful response', async () => {
    request.mockResolvedValue({
      data: {
        data: {},
      },
    });

    const { router } = renderPage();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Start application',
      }),
    );

    expect(await screen.findByRole('alert')).toBeVisible();

    expect(router.state.location.pathname).toBe(guidanceRoutes.becomeConsultant);
  });

  it('smooth-scrolls Learn more to the steps without starting an application', async () => {
    const scroll = vi.fn();

    const previous = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'scrollIntoView',
    );

    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      value: scroll,
      configurable: true,
    });

    try {
      renderPage();

      await userEvent.click(
        screen.getByRole('button', {
          name: 'Learn more',
        }),
      );

      expect(scroll).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });

      expect(
        screen.getByRole('region', {
          name: 'How it works',
        }),
      ).toHaveFocus();

      expect(request).not.toHaveBeenCalled();
    } finally {
      if (previous) {
        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', previous);
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
      }
    }
  });
});