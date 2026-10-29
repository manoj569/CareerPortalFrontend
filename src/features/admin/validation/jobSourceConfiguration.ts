import { AtsType } from '../types/jobSourceModels';

const tokenPattern = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,254}$/;
const rawPath = (value: string) => value.trim().replace(/^https?:\/\/[^/]+/i, '');
const publicHttps = (url: URL) =>
  url.protocol === 'https:' &&
  !url.port &&
  !url.username &&
  !url.password &&
  !url.hash &&
  url.hostname.includes('.') &&
  !url.hostname.endsWith('.local') &&
  !url.hostname.endsWith('.localhost') &&
  !/^\d+(?:\.\d+){3}$/.test(url.hostname) &&
  !url.hostname.startsWith('[');

export interface WorkdaySiteRoot {
  host: string;
  tenant: string;
  shard: string;
  locale: string | null;
  site: string;
  canonicalUrl: string;
  canonicalIdentifier: string;
  cxsJobsUrl: string;
}

const workdayHostPattern =
  /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)\.(wd([0-9]+))\.myworkdayjobs\.com$/i;
const workdayPathPattern =
  /^\/(?:([A-Za-z]{2,3}-(?:[A-Za-z]{2}|[0-9]{3})|)\/)?([A-Za-z0-9][A-Za-z0-9_-]{0,127})\/?$/;

/** Parses the public HTTPS Workday site-root contract used by the backend. */
export const parseWorkdaySiteRoot = (value: string): WorkdaySiteRoot | null => {
  const text = value.trim();
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }

  const hostMatch = workdayHostPattern.exec(url.hostname);
  const pathStart = text.indexOf('/', text.indexOf('://') + 3);
  const path = pathStart < 0 ? '' : text.slice(pathStart);
  const pathMatch = workdayPathPattern.exec(path);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash ||
    text.includes('?') ||
    text.includes('#') ||
    text.includes('\\') ||
    path.includes('%') ||
    !hostMatch ||
    !hostMatch[3] ||
    !/[1-9]/.test(hostMatch[3]) ||
    !pathMatch
  )
    return null;

  const host = url.hostname.toLowerCase();
  const tenant = hostMatch[1]!.toLowerCase();
  const shard = hostMatch[2]!.toLowerCase();
  const locale = pathMatch[1] || null;
  const site = pathMatch[2]!;
  if (['job', 'search'].includes(site.toLowerCase())) return null;
  const canonicalUrl = `https://${host}/${locale ? `${locale}/` : ''}${site}`;
  return {
    host,
    tenant,
    shard,
    locale,
    site,
    canonicalUrl,
    canonicalIdentifier: `${tenant}/${site}`,
    cxsJobsUrl: `https://${host}/wday/cxs/${tenant}/${encodeURIComponent(site)}/jobs`,
  };
};

// The server remains authoritative and persists any identity derived from a board root.
export const sourceConfigurationError = (
  type: AtsType,
  value: string,
  identifier: string | null,
): string | null => {
  if (type === AtsType.Custom) return null;
  const token = identifier?.trim() || '';
  if (type === AtsType.RippleHire) {
    let url: URL;
    try { url = new URL(value.trim()); } catch { return 'Enter a valid RippleHire career URL.'; }
    const tenant = /^[a-z0-9][a-z0-9-]{0,62}\.ripplehire\.com$/.test(url.hostname);
    const publicUrl = new URL(url);
    publicUrl.hash = '';
    if (!publicHttps(publicUrl) || value.includes('\\'))
      return 'RippleHire discovery requires a public HTTPS career URL on port 443 without credentials or IP addresses.';
    if (!token && (!tenant || !url.search)) {
      if (url.hash || (tenant && !['/', '/candidate/'].includes(url.pathname)))
        return 'Enter the employer career page or RippleHire tenant root or /candidate/ entry without a job fragment.';
      return null;
    }
    if (url.protocol !== 'https:' || url.port || url.username || url.password ||
        (url.hash && url.hash !== '#list' && !url.hash.startsWith('#list/')) ||
        !/^[a-z0-9][a-z0-9-]{0,62}\.ripplehire\.com$/.test(url.hostname) ||
        url.pathname !== '/candidate/' || value.includes('\\') || value.includes('%'))
      return 'Use https://{tenant}.ripplehire.com/candidate/?token={public-career-token} without a job fragment. Custom domains and legacy /ripplehire/ URLs are unsupported.';
    const pairs = Array.from(url.searchParams.entries());
    if (pairs.some(([key, entry]) => !['token', 'source', 'lang'].includes(key) || !/^[A-Za-z0-9_-]{1,255}$/.test(entry)) ||
        new Set(pairs.map(([key]) => key)).size !== pairs.length ||
        url.searchParams.getAll('token').length !== 1 ||
        (url.searchParams.has('lang') && url.searchParams.get('lang') !== 'en'))
      return 'Provide one public career token, with optional source and lang=en only. Never use a private candidate link.';
    return token && token !== url.searchParams.get('token')
      ? 'The ATS Identifier must match the public career token in the URL, or be left blank.' : null;
  }
  if (type === AtsType.SmartRecruiters) {
    if (!token) return 'Enter the SmartRecruiters company identifier.';
    if (
      token.includes('://') ||
      /[/\\?#]/.test(token) ||
      Array.from(identifier ?? '').some((character) => {
        const code = character.charCodeAt(0);
        return code <= 31 || (code >= 127 && code <= 159);
      })
    )
      return 'Enter a company identifier, not a URL or path, without query, fragment or control characters.';
    return null;
  }
  if (type === AtsType.Workday) {
    const root = parseWorkdaySiteRoot(value);
    if (!root)
      return 'Use a public HTTPS Workday site root, optionally with a locale, on tenant.wd<number>.myworkdayjobs.com.';
    if (!token) return null;
    const identifierRoot = parseWorkdaySiteRoot(token);
    if (identifierRoot) {
      return identifierRoot.host === root.host && identifierRoot.site === root.site
        ? null
        : 'Workday identifier URL must match the career-page host and site.';
    }
    if (token.includes('://')) return 'Enter a valid public Workday career-site root.';
    if (![root.tenant, root.site, root.canonicalIdentifier].some((part) => part.toLowerCase() === token.toLowerCase()))
      return 'Workday identifier must match the URL tenant/site, tenant or career site. Leave it blank to derive it.';
    return null;
  }
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  const path = rawPath(value);
  if (type === AtsType.SuccessFactors) {
    const board = /^\/go\/[A-Za-z0-9_-]+\/([0-9]+)\/?$/.exec(path);
    if (!publicHttps(url) || url.search || !board || value.includes('\\'))
      return 'Use a public HTTPS /go/board/numeric-id career URL.';
    return token && token !== board[1]
      ? 'The identifier must match the numeric board ID in the career URL.'
      : null;
  }
  const hosts =
    type === AtsType.Greenhouse
      ? ['boards.greenhouse.io', 'job-boards.greenhouse.io']
      : type === AtsType.Lever
        ? ['jobs.lever.co', 'jobs.eu.lever.co']
        : ['jobs.ashbyhq.com'];
  let derived: string | undefined;
  if (publicHttps(url) && hosts.includes(url.hostname)) {
    const parts = path.replace(/^\/+|\/+$/g, '').split('/');
    if (
      parts.length !== 1 ||
      !tokenPattern.test(parts[0] ?? '') ||
      path.includes('%') ||
      path.includes('\\')
    )
      return 'Use the provider board root, not a job URL.';
    derived = parts[0];
  }
  if (!token && !derived) return 'Enter a board identifier or the provider board root URL.';
  if (token && !tokenPattern.test(token))
    return 'The board identifier must be one safe path segment, not a URL.';
  if (token && derived && token !== derived)
    return 'The identifier must match the board URL, including its case.';
  return null;
};

export const sourceIdentifierHelp: Record<AtsType, string> = {
  [AtsType.RippleHire]:
    'Leave ATS Identifier blank for automatic discovery. For manual fallback, paste the complete public https://{tenant}.ripplehire.com/candidate/?token=... URL into Career Page URL; the identifier may be blank or match its token. Optional source and lang=en only. Never use private candidate links or internal shareToken values. Discovery requires a supported public link and may require manual configuration.',
  [AtsType.SmartRecruiters]:
    'SmartRecruiters Company Identifier: enter the company identifier from the SmartRecruiters career URL. For https://careers.smartrecruiters.com/ExampleCompany, enter ExampleCompany. Public postings do not require credentials.',
  [AtsType.Custom]: 'Optional for Custom; ingestion is unsupported.',
  [AtsType.Greenhouse]:
    'Exact board token. Leave blank with a boards.greenhouse.io or job-boards.greenhouse.io board root.',
  [AtsType.Lever]:
    'Exact site token. Leave blank with a jobs.lever.co or jobs.eu.lever.co board root.',
  [AtsType.Ashby]:
    'Exact board name, including case. Leave blank with a jobs.ashbyhq.com board root.',
  [AtsType.SuccessFactors]:
    'Numeric board ID from the HTTPS /go/board/id URL. Leave blank to derive it.',
  [AtsType.Workday]:
    'Paste the public Workday career-site root, for example: https://company.wd5.myworkdayjobs.com/External. CareerHarbor derives the tenant, site, and CXS endpoint.',
};
