import { apiClient } from '@/api/apiClient';
import type { PhonePeCheckoutResponse } from '@/features/payments/types/paymentModels';

import type { ApiResponse } from '../types/marketIntelligence';
import type {
  AcceleratorJourneyResponse,
  MarketJourneySelection,
  ProvisionAcceleratorJourneyRequest,
  ProvisionAcceleratorJourneyResponse,
} from '../types/journey';

type JourneyQuery =
  | (MarketJourneySelection & { journeyContextId?: never })
  | { journeyContextId: string; marketPathId?: never; marketSkillPathId?: never };

export async function provisionAcceleratorJourney(request: ProvisionAcceleratorJourneyRequest) {
  const { data } = await apiClient.post<ApiResponse<ProvisionAcceleratorJourneyResponse>>(
    '/accelerator/v1/journeys/provision',
    request,
  );
  return data.data;
}

export async function getAcceleratorJourney(params: JourneyQuery, signal?: AbortSignal) {
  const { data } = await apiClient.get<ApiResponse<AcceleratorJourneyResponse>>(
    '/accelerator/v1/journey',
    { params, signal },
  );
  return data.data;
}

export async function enrollInAcceleratorPath(
  pathId: string,
  request: {
    requestKey: string;
    currentLevel: number;
    targetLevel: number;
    weeklyCommitmentMinutes: number;
    targetCompletionAtUtc: string | null;
  },
) {
  const { data } = await apiClient.post<ApiResponse<{ id: string }>>(
    `/accelerator/v1/learning-paths/${encodeURIComponent(pathId)}/enrollments`,
    request,
  );
  return data.data;
}

export interface AcceleratorEntitlementResponse {
  status: string;
  startsAtUtc: string | null;
  endsAtUtc: string | null;
  usage: {
    feature: number;
    allocated: number;
    consumed: number;
    reserved: number;
    remaining: number;
  }[];
}

export async function getAcceleratorSubscription(signal?: AbortSignal) {
  const { data } = await apiClient.get<ApiResponse<AcceleratorEntitlementResponse>>(
    '/accelerator/v1/subscription',
    { signal },
  );
  return data.data;
}

export async function getAcceleratorPlan(signal?: AbortSignal) {
  const { data } = await apiClient.get<ApiResponse<{ checkoutAvailable: boolean }>>(
    '/accelerator/v1/plan',
    { signal },
  );
  return data.data;
}

export async function startAcceleratorCheckout(requestKey: string) {
  const { data } = await apiClient.post<ApiResponse<PhonePeCheckoutResponse>>(
    '/accelerator/v1/subscription/checkout',
    { requestKey },
  );
  return data.data;
}
