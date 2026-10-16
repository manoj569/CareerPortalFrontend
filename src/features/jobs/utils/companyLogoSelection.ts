import type { CandidateCompanyLogo } from '../types/jobModels';
import { safeCompanyLogoUrl } from './companyLogoUrl';

interface CompanyLogo {
  key: string;
  name: string;
  logoUrl: string;
}

export const selectCompanyLogos = (companies: readonly CandidateCompanyLogo[]): CompanyLogo[] => {
  const ids = new Set<string>();
  const result: CompanyLogo[] = [];
  for (const company of companies) {
    if (!company || typeof company !== 'object') continue;
    const name = typeof company.name === 'string' ? company.name.trim().replace(/\s+/g, ' ') : '';
    const id = typeof company.companyId === 'string' ? company.companyId.trim().toLowerCase() : '';
    const logoUrl = safeCompanyLogoUrl(company.logoUrl);
    if (!id || !name || !logoUrl || ids.has(id)) continue;
    ids.add(id);
    result.push({ key: id, name, logoUrl });
  }
  return result;
};
