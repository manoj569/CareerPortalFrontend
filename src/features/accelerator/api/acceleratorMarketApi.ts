import { apiClient } from '@/api/apiClient';

import type {
  ApiResponse,
  MarketPathCard,
  MarketPathDetail,
  MarketPathQuery,
  MarketRecommendation,
  MarketRoleGap,
  MarketSearchResult,
  MarketSkillPathQuery,
} from '../types/marketIntelligence';

const MARKET_BASE = '/accelerator/market';

const removeEmptyValues = <T extends Record<string, unknown>>(
  values: T,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '',
    ),
  );

export const getCareerPaths = async (
  query: MarketPathQuery = {},
): Promise<MarketPathCard[]> => {
  const response = await apiClient.get<ApiResponse<MarketPathCard[]>>(
    `${MARKET_BASE}/career-paths`,
    {
      params: removeEmptyValues({
        search: query.search,
        category: query.category,
        location: query.location,
        experience: query.experience,
        sort: query.sort,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 20,
      }),
    },
  );

  return response.data.data;
};

export const getCareerPath = async (
  id: string,
): Promise<MarketPathDetail> => {
  const response = await apiClient.get<ApiResponse<MarketPathDetail>>(
    `${MARKET_BASE}/career-paths/${encodeURIComponent(id)}`,
  );

  return response.data.data;
};

export const getCareerPathGaps = async (
  id: string,
): Promise<MarketRoleGap[]> => {
  const response = await apiClient.get<ApiResponse<MarketRoleGap[]>>(
    `${MARKET_BASE}/career-paths/${encodeURIComponent(id)}/my-gaps`,
  );

  return response.data.data;
};

export const getSkillPaths = async (
  query: MarketSkillPathQuery = {},
): Promise<MarketPathCard[]> => {
  const response = await apiClient.get<ApiResponse<MarketPathCard[]>>(
    `${MARKET_BASE}/skill-paths`,
    {
      params: removeEmptyValues({
        search: query.search,
        category: query.category,
        roleId: query.roleId,
        location: query.location,
        experience: query.experience,
        sort: query.sort,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 20,
      }),
    },
  );

  return response.data.data;
};

export const getSkillPath = async (
  id: string,
): Promise<MarketPathDetail> => {
  const response = await apiClient.get<ApiResponse<MarketPathDetail>>(
    `${MARKET_BASE}/skill-paths/${encodeURIComponent(id)}`,
  );

  return response.data.data;
};

export const searchMarketPaths = async (
  query: string,
): Promise<MarketSearchResult> => {
  const response = await apiClient.get<ApiResponse<MarketSearchResult>>(
    `${MARKET_BASE}/search`,
    {
      params: {
        q: query,
      },
    },
  );

  return response.data.data;
};

export const getCareerPathRecommendations = async (): Promise<
  MarketRecommendation[]
> => {
  const response = await apiClient.get<
    ApiResponse<MarketRecommendation[]>
  >(`${MARKET_BASE}/recommendations/career-paths`);

  return response.data.data;
};

export const getSkillPathRecommendations = async (): Promise<
  MarketRecommendation[]
> => {
  const response = await apiClient.get<
    ApiResponse<MarketRecommendation[]>
  >(`${MARKET_BASE}/recommendations/skill-paths`);

  return response.data.data;
};