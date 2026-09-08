import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAppStore } from '@/store/store';
import { aiApplyApi } from './aiApplyApi';
import { ExternalSessionSite } from '../types/aiApplyModels';

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));
vi.mock('@/api/apiClient', () => ({ apiClient: { request: mockRequest } }));

describe('AI Apply API', () => {
  beforeEach(() => mockRequest.mockReset());

  it('loads authoritative access', async () => {
    mockRequest.mockResolvedValue({ data: { data: { canUseAIApply: false } } });
    const store = createAppStore();
    await store.dispatch(aiApplyApi.endpoints.getAIApplyAccess.initiate()).unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', url: '/ai-apply/access' }),
    );
  });

  it('creates plan checkout with only the backend plan code', async () => {
    mockRequest.mockResolvedValue({ data: { data: { paymentId: 'payment-id' } } });
    const store = createAppStore();
    await store
      .dispatch(aiApplyApi.endpoints.createAIApplyCheckout.initiate('AIApplyPro'))
      .unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { planCode: 'AIApplyPro' },
        method: 'POST',
        url: '/payments/checkout',
      }),
    );
  });

  it('serializes settings without the response-only paused field', async () => {
    const request = {
      enabled: false,
      preferredStartTime: '09:00:00',
      timezone: 'Asia/Kolkata',
      preferredDays: [1, 2],
      autoResumeApplications: true,
      allowAIGeneratedAnswers: false,
      requireConfirmationBeforeSubmit: true,
    };
    mockRequest.mockResolvedValue({ data: { data: { ...request, paused: false } } });
    const store = createAppStore();
    await store.dispatch(aiApplyApi.endpoints.updateAIApplySettings.initiate(request)).unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ data: request, method: 'PUT', url: '/ai-apply/settings' }),
    );
  });

  it('uses the encoded rule endpoint for deletion', async () => {
    mockRequest.mockResolvedValue({ data: { data: null } });
    const store = createAppStore();
    await store.dispatch(aiApplyApi.endpoints.deleteAIApplyRule.initiate('rule/id')).unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', url: '/ai-apply/rules/rule%2Fid' }),
    );
  });

  it('loads dashboard results and bounded application history', async () => {
    mockRequest.mockResolvedValue({ data: { data: [] } });
    const store = createAppStore();
    await store.dispatch(aiApplyApi.endpoints.getAIApplyDashboard.initiate()).unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'GET', url: '/ai-apply/dashboard' }),
    );
    const params = { fromUtc: '2026-09-01T00:00:00.000Z', toUtc: '2026-09-03T00:00:00.000Z' };
    await store.dispatch(aiApplyApi.endpoints.getAIApplyApplications.initiate(params)).unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'GET', params, url: '/ai-apply/applications' }),
    );
  });

  it('loads, cancels, and refetches an application through ownership-safe endpoints', async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: 'application-id' } } });
    const store = createAppStore();
    await store
      .dispatch(aiApplyApi.endpoints.getAIApplyApplication.initiate('application-id'))
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: '/ai-apply/applications/application-id' }),
    );
    await store
      .dispatch(aiApplyApi.endpoints.cancelAIApplyApplication.initiate('application-id'))
      .unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/ai-apply/applications/application-id/cancel',
      }),
    );
  });

  it('continues one application through the dedicated endpoint without a request body', async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: 'application-id', status: 1 } } });
    const store = createAppStore();
    await store
      .dispatch(aiApplyApi.endpoints.continueAIApplyApplication.initiate('application/id'))
      .unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/ai-apply/applications/application%2Fid/continue',
      }),
    );
    expect(mockRequest.mock.calls.at(-1)?.[0]).toHaveProperty('data', undefined);
  });

  it('sends the exact analytics UTC range', async () => {
    const params = { fromUtc: '2026-08-27T00:00:00.000Z', toUtc: '2026-09-03T00:00:00.000Z' };
    mockRequest.mockResolvedValue({ data: { data: { totalApplications: 0 } } });
    const store = createAppStore();
    await store.dispatch(aiApplyApi.endpoints.getAIApplyAnalytics.initiate(params)).unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', params, url: '/ai-apply/analytics' }),
    );
  });

  it('loads pending questions with the canonical numeric status', async () => {
    mockRequest.mockResolvedValue({ data: { data: [] } });
    const store = createAppStore();
    await store.dispatch(aiApplyApi.endpoints.getAIApplyQuestions.initiate(1)).unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', params: { status: 1 }, url: '/ai-apply/questions' }),
    );
  });

  it('submits only the reviewed answer and save-to-memory choice', async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: 'question-id' } } });
    const store = createAppStore();
    const request = { answer: 'I have five years of TypeScript experience.', saveToMemory: false };
    await store
      .dispatch(aiApplyApi.endpoints.answerAIApplyQuestion.initiate({ id: 'question/id', request }))
      .unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: request,
        method: 'POST',
        url: '/ai-apply/questions/question%2Fid/answer',
      }),
    );
  });

  it('skips questions without a frontend-authored request body', async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: 'question-id' } } });
    const store = createAppStore();
    await store.dispatch(aiApplyApi.endpoints.skipAIApplyQuestion.initiate('question-id')).unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', url: '/ai-apply/questions/question-id/skip' }),
    );
    expect(mockRequest.mock.calls.at(-1)?.[0]).toHaveProperty('data', undefined);
  });

  it('updates and deletes saved answers through the exact contract', async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: 'answer-id' } } });
    const store = createAppStore();
    const request = { answer: 'Updated answer', isActive: false };
    await store
      .dispatch(aiApplyApi.endpoints.updateAIApplyAnswer.initiate({ id: 'answer-id', request }))
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: request, method: 'PUT', url: '/ai-apply/answers/answer-id' }),
    );
    await store.dispatch(aiApplyApi.endpoints.deleteAIApplyAnswer.initiate('answer-id')).unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'DELETE', url: '/ai-apply/answers/answer-id' }),
    );
    expect(mockRequest.mock.calls.at(-1)?.[0]).toHaveProperty('data', undefined);
  });

  it('loads external session metadata from the numeric site route', async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: 'session-id', status: 1 } } });
    const store = createAppStore();
    await store
      .dispatch(aiApplyApi.endpoints.getExternalSession.initiate(ExternalSessionSite.LinkedIn))
      .unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', url: '/ai-apply/external-sessions/6' }),
    );
  });

  it('starts normal and reconnect captures with only the backend reconnect flag', async () => {
    mockRequest.mockResolvedValue({ data: { data: { captureId: 'capture-id' } } });
    const store = createAppStore();
    await store
      .dispatch(
        aiApplyApi.endpoints.startExternalSessionCapture.initiate({
          site: ExternalSessionSite.Naukri,
          reconnect: false,
        }),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { reconnect: false },
        method: 'POST',
        url: '/ai-apply/external-sessions/7/capture',
      }),
    );
    await store
      .dispatch(
        aiApplyApi.endpoints.startExternalSessionCapture.initiate({
          site: ExternalSessionSite.Naukri,
          reconnect: true,
        }),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { reconnect: true } }),
    );
  });

  it('uses ownership-safe capture and revoke routes', async () => {
    mockRequest.mockResolvedValue({ data: { data: null } });
    const store = createAppStore();
    await store
      .dispatch(
        aiApplyApi.endpoints.cancelExternalSessionCapture.initiate({
          captureId: 'capture/id',
          site: ExternalSessionSite.Indeed,
        }),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/ai-apply/external-sessions/captures/capture%2Fid',
      }),
    );
    await store
      .dispatch(
        aiApplyApi.endpoints.revokeExternalSession.initiate({
          sessionId: 'session/id',
          site: ExternalSessionSite.Indeed,
        }),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/ai-apply/external-sessions/session%2Fid',
      }),
    );
  });
});
