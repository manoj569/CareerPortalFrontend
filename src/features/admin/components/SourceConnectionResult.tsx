import { Alert, Stack, TextField, Typography } from '@mui/material';
import type {
  AtsType,
  JobSourceConnectionResult,
  RippleHireDiscoveryResult,
} from '../types/jobSourceModels';
import { isVerifiedSourceConnection } from '../utils/sourceConnectionVerification';

export const SourceDiscoveryDetails = ({
  discovery,
}: {
  discovery?: RippleHireDiscoveryResult | null;
}) =>
  discovery ? (
    <Stack spacing={1} sx={{ overflowWrap: 'anywhere' }}>
      <Typography>Discovery status: {discovery.status}</Typography>
      <Typography variant="body2">{discovery.reasonCode}</Typography>
      {discovery.validationErrors?.map((message, index) => (
        <Typography key={index} variant="body2">
          {message}
        </Typography>
      ))}
      {discovery.resolvedCareerPageUrl && (
        <TextField
          label="Resolved public RippleHire URL"
          value={discovery.resolvedCareerPageUrl}
          fullWidth
          multiline
          slotProps={{ input: { readOnly: true } }}
        />
      )}
      {discovery.manualConfigurationRequired && (
        <Typography variant="body2">
          Paste the employer's complete public RippleHire candidate URL containing its career token
          into Career Page URL, then detect and test again. You can also retry discovery. Never use
          private candidate links.
        </Typography>
      )}
    </Stack>
  ) : null;

export const SourceConnectionResult = ({
  result,
  provider,
}: {
  result: JobSourceConnectionResult | null;
  provider: AtsType;
}) => (
  <Stack spacing={1.5}>
    <Alert severity={isVerifiedSourceConnection(result, provider) ? 'success' : 'error'}>
      {result?.message ||
        'The server did not confirm a connection. Check the source configuration and try again.'}
      {result?.reasonCode ? ` (${result.reasonCode})` : ''}
      {result?.statusCode ? ` — HTTP ${result.statusCode}` : ''}
    </Alert>
    <SourceDiscoveryDetails discovery={result?.discovery} />
  </Stack>
);
