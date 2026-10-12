import type { AdminCompany, AdminCompanyRequest } from '../types/adminModels';

export const isHttpsCompanyLogoUrl = (value: string): boolean => {
  if (!/^https:\/\//i.test(value.trim())) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
};

// PUT replaces all editable fields. Merge logo edits with the latest complete company.
export const companyLogoUpdateRequest = (
  company: AdminCompany,
  websiteUrl: string | null,
  logoUrl: string | null,
): AdminCompanyRequest => ({
  name: company.name,
  slug: company.slug,
  description: company.description,
  industry: company.industry,
  location: company.location,
  employeeCount: company.employeeCount,
  isVerified: company.isVerified,
  companyType: company.companyType ?? null,
  websiteUrl,
  logoUrl,
});
