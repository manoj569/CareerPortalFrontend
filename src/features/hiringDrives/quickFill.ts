import { getSafeExternalUrl } from '@/utils/safeExternalUrl';
import type { HiringDriveInput } from './types';

export type QuickFillField = keyof HiringDriveInput | 'companyName' | 'input';
export interface QuickFillResult {
  values: Partial<HiringDriveInput>;
  errors: Partial<Record<QuickFillField, string>>;
  unresolvedCompany?: string;
}

const normalized = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');
const keyName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const aliases: Record<string, QuickFillField> = {
  company: 'companyName', companyname: 'companyName', companyid: 'companyId',
  title: 'title', jobtitle: 'title', subtitle: 'subtitle', description: 'description',
  badge: 'badgeText', badgetext: 'badgeText', batch: 'badgeText', badgebatch: 'badgeText',
  experience: 'experienceText', experiencetext: 'experienceText', location: 'locationText',
  locationtext: 'locationText', campaignimageurl: 'imageUrl', imageurl: 'imageUrl',
  externalapplyurl: 'applyUrl', applyurl: 'applyUrl', startat: 'startAtUtc', startdate: 'startAtUtc', startatutc: 'startAtUtc',
  endat: 'endAtUtc', enddate: 'endAtUtc', endatutc: 'endAtUtc', displayorder: 'displayOrder',
  issponsored: 'isSponsored', sponsored: 'isSponsored', showonhome: 'showOnHome',
  isactive: 'isActive', active: 'isActive', jobid: 'jobId', badgetype: 'badgeType',
};
const booleanValue = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  if (/^(true|yes|1)$/i.test(value.trim())) return true;
  if (/^(false|no|0)$/i.test(value.trim())) return false;
  return undefined;
};

export const parseHiringDriveQuickFill = (
  input: string,
  companies: ReadonlyArray<{ id: string; name: string }>,
): QuickFillResult => {
  const values: Partial<HiringDriveInput> = {};
  const errors: QuickFillResult['errors'] = {};
  const raw: Record<string, unknown> = {};
  const text = input.trim();
  if (!text) return { values, errors: { input: 'Paste campaign data to auto fill.' } };
  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
      Object.assign(raw, parsed);
    } catch {
      return { values, errors: { input: 'Enter valid campaign JSON.' } };
    }
  } else {
    let invalidLine = false;
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const split = line.match(/^\s*([^:]+)\s*:\s*(.*?)\s*$/);
      if (split) raw[split[1]!] = split[2]!;
      else invalidLine = true;
    }
    if (invalidLine) errors.input = 'Use one campaign field per line in Name: Value format.';
  }

  let companyName: string | undefined;
  for (const [rawKey, rawValue] of Object.entries(raw)) {
    const field = aliases[keyName(rawKey)];
    if (!field) continue;
    if (field === 'input') continue;
    if (rawValue === null || rawValue === '') continue;
    if (field === 'companyName') {
      if (typeof rawValue === 'string') companyName = rawValue.trim();
      continue;
    }
    if (field === 'isSponsored' || field === 'showOnHome' || field === 'isActive') {
      const value = booleanValue(rawValue);
      if (value === undefined) errors[field] = 'Enter true/false or yes/no.';
      else Object.assign(values, { [field]: value });
      continue;
    }
    if (field === 'displayOrder') {
      const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
      if (!Number.isInteger(value) || value < 0) errors.displayOrder = 'Use a non-negative whole number.';
      else values.displayOrder = value;
      continue;
    }
    if (field === 'startAtUtc' || field === 'endAtUtc') {
      const date = typeof rawValue === 'string' || typeof rawValue === 'number' ? new Date(rawValue) : null;
      if (!date || !Number.isFinite(date.getTime())) errors[field] = 'Enter a valid date and time.';
      else values[field] = date.toISOString();
      continue;
    }
    if (typeof rawValue !== 'string' && typeof rawValue !== 'number') {
      errors[field] = 'Enter text for this field.';
      continue;
    }
    const value = String(rawValue).trim();
    if (field === 'applyUrl' || field === 'imageUrl') {
      const safe = getSafeExternalUrl(value);
      if (!safe?.startsWith('https://')) errors[field] = 'Enter a valid HTTPS URL.';
      else values[field] = safe;
    } else if (field === 'badgeType') {
      if (!['hiring', 'walkIn', 'openings', 'featured'].includes(value)) errors.badgeType = 'Select a valid badge type.';
      else values.badgeType = value as HiringDriveInput['badgeType'];
    } else if (field === 'companyId' || field === 'jobId') {
      if (value && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        errors[field] = 'Enter a valid CareerHarbor ID.';
      } else values[field] = value || null;
    } else {
      values[field] = value;
    }
  }
  let unresolvedCompany: string | undefined;
  if (companyName) {
    const match = companies.find((company) => normalized(company.name) === normalized(companyName));
    if (match) values.companyId = match.id;
    else {
      delete values.companyId;
      unresolvedCompany = companyName;
    }
  }
  return { values, errors, unresolvedCompany };
};
