import {
  AtsType,
  type JobSourceConnectionResult,
  type RippleHireDiscoveryResult,
} from '../types/jobSourceModels';

const isVerifiedDiscovery = (discovery: RippleHireDiscoveryResult | null | undefined) =>
  discovery?.succeeded === true &&
  ['Resolved', 'ManualUrlVerified'].includes(discovery.status) &&
  discovery.manualConfigurationRequired === false &&
  Boolean(discovery.resolvedCareerPageUrl);

export const isVerifiedSourceConnection = (
  result: JobSourceConnectionResult | null,
  provider: AtsType,
) =>
  result?.provider === provider &&
  result.configurationValid === true &&
  result.providerReachable === true &&
  result.listingReachable === true &&
  (provider !== AtsType.RippleHire || isVerifiedDiscovery(result.discovery));
