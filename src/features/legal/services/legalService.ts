import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { LegalDocumentResponse } from '../types/legalModels';

export const legalService = {
  async getTermsOfUse(signal?: AbortSignal): Promise<LegalDocumentResponse> {
    const response = await apiClient.get<LegalDocumentResponse>(API_ENDPOINTS.LEGAL.TERMS_OF_USE, {
      signal,
    });
    return response.data;
  },
  async getPrivacyPolicy(signal?: AbortSignal): Promise<LegalDocumentResponse> {
    const response = await apiClient.get<LegalDocumentResponse>(
      API_ENDPOINTS.LEGAL.PRIVACY_POLICY,
      { signal },
    );
    return response.data;
  },
};
