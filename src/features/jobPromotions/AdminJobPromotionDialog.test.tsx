import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import type { AdminJob } from '@/features/admin/types/adminModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { AdminJobPromotionDialog } from './AdminJobPromotionDialog';
import type { JobPromotionConfiguration } from './types';

const job = { id: 'job-1', title: 'QA Engineer', companyName: 'Example Co', status: 'Published' } as unknown as AdminJob;
const config: JobPromotionConfiguration = {
  jobId: 'job-1', jobSlug: 'qa-engineer', jobTitle: 'QA Engineer', isEnabled: true, isEligible: true,
  bannerImageUrl: '/api/job-promotions/job-1/banner', startsAtUtc: null, endsAtUtc: null, displayPriority: 0,
  createdAtUtc: '2026-01-01T00:00:00Z', updatedAtUtc: null, createdByUserId: null, updatedByUserId: null,
};
const admin = { status: 'authenticated' as const, user: { id: 'admin', firstName: 'Admin', lastName: 'User', email: 'admin@example.test', role: UserRole.Administrator }, isSubmitting: false, accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z', error: null };
const mount = (onSaved = vi.fn()) => renderWithProviders(<AdminJobPromotionDialog job={job} onClose={vi.fn()} onSaved={onSaved} />, { auth: admin });

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('AdminJobPromotionDialog', () => {
  it('loads the existing config and saves full settings without uploading or clearing an existing banner', async () => {
    const request = vi.spyOn(apiClient, 'request').mockImplementation((configArg) => Promise.resolve({ data: { data: configArg.method === 'PUT' ? { ...config, displayPriority: 4 } : config } }));
    mount();
    expect(await screen.findByText('Current status: Promoted')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Display priority' }), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(request.mock.calls.some(([arg]) => arg.url === '/admin/jobs/job-1/promotion' && arg.method === 'PUT')).toBe(true));
    const update = request.mock.calls.find(([arg]) => arg.url === '/admin/jobs/job-1/promotion' && arg.method === 'PUT')?.[0];
    expect(update?.data).toEqual({ isEnabled: true, startsAtUtc: null, endsAtUtc: null, displayPriority: 4 });
    expect(request.mock.calls.some(([arg]) => arg.url?.endsWith('/banner'))).toBe(false);
  });

  it('uploads a selected image as multipart field file after saving configuration', async () => {
    class MockUrl extends URL {
      static override createObjectURL = vi.fn(() => 'blob:preview');
      static override revokeObjectURL = vi.fn();
    }
    vi.stubGlobal('URL', MockUrl);
    const request = vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { data: config } });
    mount();
    await screen.findByText('Current status: Promoted');
    const file = new File(['image'], 'banner.png', { type: 'image/png' });
    fireEvent.change(document.querySelector('input[type="file"]')!, { target: { files: [file] } });
    expect(await screen.findByAltText('Selected promotional banner preview')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(request.mock.calls.some(([arg]) => arg.url?.endsWith('/banner'))).toBe(true));
    const upload = request.mock.calls.find(([arg]) => arg.url?.endsWith('/banner'))?.[0];
    expect(upload?.method).toBe('PUT');
    expect((upload?.data as FormData).get('file')).toBe(file);
  });

});
