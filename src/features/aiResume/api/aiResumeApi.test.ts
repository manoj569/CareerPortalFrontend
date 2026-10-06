import { ApiRequestError } from '@/api/apiError';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createAppStore } from '@/store/store';
import { aiResumeApi, downloadTailoredResume } from './aiResumeApi';
import { PaymentStatus } from '@/features/payments/types/paymentModels';
const { request, get } = vi.hoisted(() => ({ request: vi.fn(), get: vi.fn() }));
vi.mock('@/api/apiClient', () => ({ apiClient: { request, get } }));
const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const key = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
let store = createAppStore();
beforeEach(() => {
  vi.clearAllMocks();
  store = createAppStore();
});
afterEach(() => {
  store.dispatch(aiResumeApi.util.resetApiState());
});
it('uses authoritative session/analysis/credit/purchase APIs with the backend envelopes and exact request bodies', async () => {
  request.mockResolvedValueOnce({ data: { data: { id, sourceResumeId: id } } });
  const created = await store
    .dispatch(aiResumeApi.endpoints.createResumeSession.initiate({ sourceResumeId: id, jobId: id }))
    .unwrap();
  expect(created.id).toBe(id);
  expect(request).toHaveBeenLastCalledWith(
    expect.objectContaining({
      url: '/ai-resume/sessions',
      method: 'POST',
      data: { sourceResumeId: id, jobId: id },
    }),
  );
  request.mockResolvedValueOnce({ data: { data: { id, analysis: { overallMatchScore: 73 } } } });
  const analysis = await store.dispatch(aiResumeApi.endpoints.analyzeResume.initiate(id)).unwrap();
  expect(analysis.analysis?.overallMatchScore).toBe(73);
  expect(request).toHaveBeenLastCalledWith(
    expect.objectContaining({ url: `/ai-resume/sessions/${id}/analyze`, method: 'POST' }),
  );
  request.mockResolvedValueOnce({ data: { data: { balance: 0, reserved: 0 } } });
  expect(
    (await store.dispatch(aiResumeApi.endpoints.getResumeCredits.initiate()).unwrap()).balance,
  ).toBe(0);
  request.mockResolvedValueOnce({
    data: {
      data: {
        merchantOrderId: 'air_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        status: PaymentStatus.Pending,
      },
    },
  });
  const purchase = await store
    .dispatch(
      aiResumeApi.endpoints.checkoutResume.initiate({
        packageCode: 'SERVER_CODE',
        idempotencyKey: key,
        sessionId: id,
      }),
    )
    .unwrap();
  expect(purchase.status).toBe(PaymentStatus.Pending);
  expect(request).toHaveBeenLastCalledWith(
    expect.objectContaining({
      url: '/ai-resume/checkout',
      method: 'POST',
      data: { packageCode: 'SERVER_CODE', idempotencyKey: key, sessionId: id },
    }),
  );
  request.mockResolvedValueOnce({ data: { data: { ...purchase, status: PaymentStatus.Paid } } });
  expect(
    (
      await store
        .dispatch(aiResumeApi.endpoints.getResumePurchase.initiate(purchase.merchantOrderId))
        .unwrap()
    ).status,
  ).toBe(PaymentStatus.Paid);
  expect(request).toHaveBeenLastCalledWith(
    expect.objectContaining({
      url: `/ai-resume/purchases/${purchase.merchantOrderId}`,
      method: 'GET',
    }),
  );
});
it('uses idempotent generation/regeneration and revision-aware editing with no payment request for edits', async () => {
  request.mockResolvedValue({
    data: { data: { id, sessionId: id, content: {}, editRevision: 2 } },
  });
  await store
    .dispatch(aiResumeApi.endpoints.generateResume.initiate({ sessionId: id, idempotencyKey: key }))
    .unwrap();
  expect(request).toHaveBeenLastCalledWith(
    expect.objectContaining({
      url: `/ai-resume/sessions/${id}/generate`,
      method: 'POST',
      data: { idempotencyKey: key },
    }),
  );
  await store
    .dispatch(
      aiResumeApi.endpoints.regenerateResume.initiate({ resumeId: id, idempotencyKey: key }),
    )
    .unwrap();
  expect(request).toHaveBeenLastCalledWith(
    expect.objectContaining({
      url: `/ai-resume/resumes/${id}/regenerate`,
      method: 'POST',
      data: { idempotencyKey: key },
    }),
  );
  const content = {
    contact: { name: 'Candidate', email: '', phone: '', location: '', links: [] },
    professionalSummary: 'Edited',
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    additionalInfo: [],
    evidence: [],
  };
  await store
    .dispatch(
      aiResumeApi.endpoints.editResume.initiate({ resumeId: id, expectedRevision: 2, content }),
    )
    .unwrap();
  expect(request).toHaveBeenLastCalledWith(
    expect.objectContaining({
      url: `/ai-resume/resumes/${id}`,
      method: 'PATCH',
      data: { expectedRevision: 2, content },
    }),
  );
  expect(request).toHaveBeenCalledTimes(3);
});
it.each(['pdf', 'docx', 'txt'] as const)(
  'retrieves backend %s as a blob without AI or payment calls',
  async (format) => {
    const blob = new Blob(['persisted resume']);
    get.mockResolvedValue({ data: blob });
    expect(await downloadTailoredResume(id, format)).toBe(blob);
    expect(get).toHaveBeenCalledWith(`/ai-resume/resumes/${id}/download`, {
      params: { format },
      responseType: 'blob',
    });
    expect(request).not.toHaveBeenCalled();
  },
);
it('handles owner authorization errors without returning private content', async () => {
  request.mockRejectedValue(new ApiRequestError({ status: 403, message: 'Forbidden' }));
  await expect(
    store.dispatch(aiResumeApi.endpoints.getTailoredResume.initiate(id)).unwrap(),
  ).rejects.toMatchObject({ status: 403 });
});

it('uses an operation-specific timeout for AI while keeping ordinary API requests unchanged', async () => {
  request.mockResolvedValue({ data: { data: { id, content: {}, analysis: {} } } });
  await store.dispatch(aiResumeApi.endpoints.analyzeResume.initiate(id)).unwrap();
  expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ timeout: 180_000 }));
  await store
    .dispatch(aiResumeApi.endpoints.generateResume.initiate({ sessionId: id, idempotencyKey: key }))
    .unwrap();
  expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ timeout: 180_000 }));
  await store
    .dispatch(
      aiResumeApi.endpoints.regenerateResume.initiate({ resumeId: id, idempotencyKey: key }),
    )
    .unwrap();
  expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ timeout: 180_000 }));
  await store.dispatch(aiResumeApi.endpoints.getResumeCredits.initiate()).unwrap();
  expect(request.mock.calls.at(-1)?.[0]).not.toHaveProperty('timeout');
});

it.each(['accept', 'original', 'edit', 'reset'] as const)(
  'reviews a replacement using exact %s PATCH contract without a provider or payment call',
  async (action) => {
    const data =
      action === 'edit'
        ? { expectedRevision: 4, action, replacementText: 'Supported source wording' }
        : { expectedRevision: 4, action };
    request.mockResolvedValueOnce({
      data: {
        data: {
          id,
          editRevision: 5,
          tailoring: { replacements: [] },
          documentCapabilities: { preservationMode: 'original_docx' },
        },
      },
    });
    const result = await store
      .dispatch(
        aiResumeApi.endpoints.reviewResumeReplacement.initiate({
          resumeId: id,
          targetId: 'SRC-EXP-001-BULLET-001',
          ...data,
        }),
      )
      .unwrap();
    expect(result.editRevision).toBe(5);
    expect(result.documentCapabilities?.preservationMode).toBe('original_docx');
    expect(request).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        url: `/ai-resume/resumes/${id}/replacements/SRC-EXP-001-BULLET-001`,
        method: 'PATCH',
        data,
      }),
    );
    expect(get).not.toHaveBeenCalled();
  },
);
