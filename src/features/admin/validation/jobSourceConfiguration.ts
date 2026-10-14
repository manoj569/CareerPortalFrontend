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

// The server remains authoritative and persists any identity derived from a board root.
export const sourceConfigurationError = (
  type: AtsType,
  value: string,
  identifier: string | null,
): string | null => {
  if (type === AtsType.Custom) return null;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  const token = identifier?.trim() || '';
  const path = rawPath(value);
  if (type === AtsType.Workday) {
    const host = /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)\.wd[0-9]+\.myworkdayjobs\.com$/i.exec(
      url.hostname,
    );
    const site = /^\/(?:[a-z]{2}-[a-z]{2}\/)?([A-Za-z0-9][A-Za-z0-9_-]{0,127})\/?$/i.exec(path);
    if (!publicHttps(url) || url.search || !host || !site || value.includes('\\'))
      return 'Use a public HTTPS Workday site root, optionally with a locale, on tenant.wd<number>.myworkdayjobs.com.';
    if (
      token &&
      ![host[1]!, site[1]!, `${host[1]}/${site[1]}`].some(
        (part) => part.toLowerCase() === token.toLowerCase(),
      )
    )
      return 'Workday identifier must match the URL tenant/site, tenant or career site. Leave it blank to derive it.';
    return null;
  }
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
    'Tenant/site from the Workday URL, preserving site case. Leave blank to derive it; matching tenant or site shorthand is also accepted.',
};
