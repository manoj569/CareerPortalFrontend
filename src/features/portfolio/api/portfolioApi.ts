import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import type { ApiResponse } from '@/types';
import type {
  CertificationRequest, CreatePortfolioRequest, CustomItemRequest, CustomSectionRequest,
  EducationRequest, ExperienceRequest, PortfolioCertification, PortfolioCustomItem,
  PortfolioCustomSection, PortfolioEducation, PortfolioEditorResponse, PortfolioExperience,
  PortfolioProfessionalLink, PortfolioProject, PortfolioPublishResponse,
  ProfessionalLinkRequest, ProjectRequest, PublicPortfolioResponse,
  UpdatePortfolioSettingsRequest,
} from '../types/portfolioModels';

const portfolioTags = ['Portfolio', 'PortfolioPreview'] as const;
const profileRecordTags = ['Portfolio', 'PortfolioPreview', 'Profile', 'ProfileCompletion'] as const;
const collectionMutation = (method: 'POST' | 'PUT', url: string, data: unknown) => ({ data, method, url });

export const portfolioApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getPortfolio: builder.query<PortfolioEditorResponse, void>({
      query: () => ({ url: API_ENDPOINTS.CANDIDATE.PORTFOLIO }),
      transformResponse: (response: ApiResponse<PortfolioEditorResponse>) => response.data,
      providesTags: ['Portfolio'],
    }),
    createPortfolio: builder.mutation<PortfolioEditorResponse, CreatePortfolioRequest>({
      query: (data) => ({ data, method: 'POST', url: API_ENDPOINTS.CANDIDATE.PORTFOLIO }),
      transformResponse: (response: ApiResponse<PortfolioEditorResponse>) => response.data,
      invalidatesTags: portfolioTags,
    }),
    updatePortfolioSettings: builder.mutation<PortfolioEditorResponse, UpdatePortfolioSettingsRequest>({
      query: (data) => ({ data, method: 'PUT', url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_SETTINGS }),
      transformResponse: (response: ApiResponse<PortfolioEditorResponse>) => response.data,
      invalidatesTags: portfolioTags,
    }),
    getPortfolioPreview: builder.query<PublicPortfolioResponse, void>({
      query: () => ({ url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_PREVIEW }),
      transformResponse: (response: ApiResponse<PublicPortfolioResponse>) => response.data,
      providesTags: ['PortfolioPreview'],
    }),
    publishPortfolio: builder.mutation<PortfolioPublishResponse, void>({
      query: () => ({ method: 'POST', url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_PUBLISH }),
      transformResponse: (response: ApiResponse<PortfolioPublishResponse>) => response.data,
      invalidatesTags: portfolioTags,
    }),
    unpublishPortfolio: builder.mutation<PortfolioEditorResponse, void>({
      query: () => ({ method: 'POST', url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_UNPUBLISH }),
      transformResponse: (response: ApiResponse<PortfolioEditorResponse>) => response.data,
      invalidatesTags: portfolioTags,
    }),
    getPublicPortfolio: builder.query<PublicPortfolioResponse, string>({
      query: (slug) => ({ url: API_ENDPOINTS.PUBLIC.PORTFOLIO(slug) }),
      transformResponse: (response: ApiResponse<PublicPortfolioResponse>) => response.data,
    }),
    getPortfolioEducation: builder.query<PortfolioEducation[], void>({ query: () => ({ url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_COLLECTION('education') }), transformResponse: (r: ApiResponse<PortfolioEducation[]>) => r.data, providesTags: portfolioTags }),
    getPortfolioExperiences: builder.query<PortfolioExperience[], void>({ query: () => ({ url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_COLLECTION('experiences') }), transformResponse: (r: ApiResponse<PortfolioExperience[]>) => r.data, providesTags: portfolioTags }),

    addPortfolioExperience: builder.mutation<PortfolioExperience, ExperienceRequest>({ query: (data) => collectionMutation('POST', API_ENDPOINTS.CANDIDATE.PORTFOLIO_COLLECTION('experiences'), data), transformResponse: (r: ApiResponse<PortfolioExperience>) => r.data, invalidatesTags: profileRecordTags }),
    updatePortfolioExperience: builder.mutation<PortfolioExperience, { id: string; data: ExperienceRequest }>({ query: ({ id, data }) => collectionMutation('PUT', API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('experiences', id), data), transformResponse: (r: ApiResponse<PortfolioExperience>) => r.data, invalidatesTags: profileRecordTags }),
    deletePortfolioExperience: builder.mutation<void, string>({ query: (id) => ({ method: 'DELETE', url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('experiences', id) }), invalidatesTags: profileRecordTags }),
    addPortfolioEducation: builder.mutation<PortfolioEducation, EducationRequest>({ query: (data) => collectionMutation('POST', API_ENDPOINTS.CANDIDATE.PORTFOLIO_COLLECTION('education'), data), transformResponse: (r: ApiResponse<PortfolioEducation>) => r.data, invalidatesTags: profileRecordTags }),
    updatePortfolioEducation: builder.mutation<PortfolioEducation, { id: string; data: EducationRequest }>({ query: ({ id, data }) => collectionMutation('PUT', API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('education', id), data), transformResponse: (r: ApiResponse<PortfolioEducation>) => r.data, invalidatesTags: profileRecordTags }),
    deletePortfolioEducation: builder.mutation<void, string>({ query: (id) => ({ method: 'DELETE', url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('education', id) }), invalidatesTags: profileRecordTags }),
    addPortfolioProject: builder.mutation<PortfolioProject, ProjectRequest>({ query: (data) => collectionMutation('POST', API_ENDPOINTS.CANDIDATE.PORTFOLIO_COLLECTION('projects'), data), transformResponse: (r: ApiResponse<PortfolioProject>) => r.data, invalidatesTags: portfolioTags }),
    updatePortfolioProject: builder.mutation<PortfolioProject, { id: string; data: ProjectRequest }>({ query: ({ id, data }) => collectionMutation('PUT', API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('projects', id), data), transformResponse: (r: ApiResponse<PortfolioProject>) => r.data, invalidatesTags: portfolioTags }),
    deletePortfolioProject: builder.mutation<void, string>({ query: (id) => ({ method: 'DELETE', url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('projects', id) }), invalidatesTags: portfolioTags }),
    addPortfolioCertification: builder.mutation<PortfolioCertification, CertificationRequest>({ query: (data) => collectionMutation('POST', API_ENDPOINTS.CANDIDATE.PORTFOLIO_COLLECTION('certifications'), data), transformResponse: (r: ApiResponse<PortfolioCertification>) => r.data, invalidatesTags: portfolioTags }),
    updatePortfolioCertification: builder.mutation<PortfolioCertification, { id: string; data: CertificationRequest }>({ query: ({ id, data }) => collectionMutation('PUT', API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('certifications', id), data), transformResponse: (r: ApiResponse<PortfolioCertification>) => r.data, invalidatesTags: portfolioTags }),
    deletePortfolioCertification: builder.mutation<void, string>({ query: (id) => ({ method: 'DELETE', url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('certifications', id) }), invalidatesTags: portfolioTags }),
    addPortfolioLink: builder.mutation<PortfolioProfessionalLink, ProfessionalLinkRequest>({ query: (data) => collectionMutation('POST', API_ENDPOINTS.CANDIDATE.PORTFOLIO_COLLECTION('links'), data), transformResponse: (r: ApiResponse<PortfolioProfessionalLink>) => r.data, invalidatesTags: portfolioTags }),
    updatePortfolioLink: builder.mutation<PortfolioProfessionalLink, { id: string; data: ProfessionalLinkRequest }>({ query: ({ id, data }) => collectionMutation('PUT', API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('links', id), data), transformResponse: (r: ApiResponse<PortfolioProfessionalLink>) => r.data, invalidatesTags: portfolioTags }),
    deletePortfolioLink: builder.mutation<void, string>({ query: (id) => ({ method: 'DELETE', url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('links', id) }), invalidatesTags: portfolioTags }),
    addPortfolioCustomSection: builder.mutation<PortfolioCustomSection, CustomSectionRequest>({ query: (data) => collectionMutation('POST', API_ENDPOINTS.CANDIDATE.PORTFOLIO_COLLECTION('custom-sections'), data), transformResponse: (r: ApiResponse<PortfolioCustomSection>) => r.data, invalidatesTags: portfolioTags }),
    updatePortfolioCustomSection: builder.mutation<PortfolioCustomSection, { id: string; data: CustomSectionRequest }>({ query: ({ id, data }) => collectionMutation('PUT', API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('custom-sections', id), data), transformResponse: (r: ApiResponse<PortfolioCustomSection>) => r.data, invalidatesTags: portfolioTags }),
    deletePortfolioCustomSection: builder.mutation<void, string>({ query: (id) => ({ method: 'DELETE', url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_RECORD('custom-sections', id) }), invalidatesTags: portfolioTags }),
    addPortfolioCustomItem: builder.mutation<PortfolioCustomItem, { sectionId: string; data: CustomItemRequest }>({ query: ({ sectionId, data }) => collectionMutation('POST', API_ENDPOINTS.CANDIDATE.PORTFOLIO_CUSTOM_ITEMS(sectionId), data), transformResponse: (r: ApiResponse<PortfolioCustomItem>) => r.data, invalidatesTags: portfolioTags }),
    updatePortfolioCustomItem: builder.mutation<PortfolioCustomItem, { sectionId: string; itemId: string; data: CustomItemRequest }>({ query: ({ sectionId, itemId, data }) => collectionMutation('PUT', API_ENDPOINTS.CANDIDATE.PORTFOLIO_CUSTOM_ITEM(sectionId, itemId), data), transformResponse: (r: ApiResponse<PortfolioCustomItem>) => r.data, invalidatesTags: portfolioTags }),
    deletePortfolioCustomItem: builder.mutation<void, { sectionId: string; itemId: string }>({ query: ({ sectionId, itemId }) => ({ method: 'DELETE', url: API_ENDPOINTS.CANDIDATE.PORTFOLIO_CUSTOM_ITEM(sectionId, itemId) }), invalidatesTags: portfolioTags }),
  }),
});

export const {
  useAddPortfolioCertificationMutation, useAddPortfolioCustomItemMutation,
  useAddPortfolioCustomSectionMutation, useAddPortfolioEducationMutation,
  useAddPortfolioExperienceMutation, useAddPortfolioLinkMutation, useAddPortfolioProjectMutation,
  useCreatePortfolioMutation, useDeletePortfolioCertificationMutation,
  useDeletePortfolioCustomItemMutation, useDeletePortfolioCustomSectionMutation,
  useDeletePortfolioEducationMutation, useDeletePortfolioExperienceMutation,
  useDeletePortfolioLinkMutation, useDeletePortfolioProjectMutation, useGetPortfolioPreviewQuery,
  useGetPortfolioQuery, useGetPublicPortfolioQuery, usePublishPortfolioMutation,
  useGetPortfolioEducationQuery, useGetPortfolioExperiencesQuery,
  useUnpublishPortfolioMutation, useUpdatePortfolioCertificationMutation,
  useUpdatePortfolioCustomItemMutation, useUpdatePortfolioCustomSectionMutation,
  useUpdatePortfolioEducationMutation, useUpdatePortfolioExperienceMutation,
  useUpdatePortfolioLinkMutation, useUpdatePortfolioProjectMutation,
  useUpdatePortfolioSettingsMutation,
} = portfolioApi;
