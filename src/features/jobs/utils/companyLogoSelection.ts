import type { PopularCompany } from '../types/jobModels';
import { safeCompanyLogoUrl } from './companyLogoUrl';

export const COMPANY_LOGO_LIMIT = 24;

interface CompanyLogo {
  key: string;
  name: string;
  logoUrl: string;
}

export const selectCompanyLogos = (companies: readonly PopularCompany[]): CompanyLogo[] => {
  const ids = new Set<string>();
  const names = new Set<string>();
  const result: CompanyLogo[] = [];
  for (const company of companies) {
    if (!company || typeof company !== 'object') continue;
    const name = typeof company.name === 'string' ? company.name.trim().replace(/\s+/g, ' ') : '';
    const id = typeof company.id === 'string' ? company.id.trim().toLowerCase() : '';
    const logoUrl = safeCompanyLogoUrl(company.logoUrl);
    const normalizedName = name.toLowerCase();
    if (
      !name ||
      !logoUrl ||
      !Number.isFinite(company.activeJobCount) ||
      company.activeJobCount <= 0
    )
      continue;
    if ((id && ids.has(id)) || names.has(normalizedName)) continue;
    if (id) ids.add(id);
    names.add(normalizedName);
    result.push({ key: id || normalizedName, name, logoUrl });
    if (result.length === COMPANY_LOGO_LIMIT) break;
  }
  return result;
};

