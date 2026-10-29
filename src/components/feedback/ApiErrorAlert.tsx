import { Alert, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { extractApiError } from '@/api/apiError';

export const ApiErrorAlert = ({
  error,
  fields = [],
}: {
  error: unknown;
  fields?: readonly string[];
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const details = extractApiError(typeof error === 'string' ? { message: error } : error);
  const mapped = new Set(fields.map((field) => field.toLowerCase()));
  const general = Object.entries(details.errors ?? {})
    .filter(([field]) => !mapped.has(field.replace(/^\$\./, '').toLowerCase()))
    .flatMap(([, messages]) => messages);
  return (
    <Alert severity="error" sx={{ overflowWrap: 'anywhere' }}>
      <Stack spacing={0.5}>
        <Typography variant="body2">{details.message}</Typography>
        {general.map((message, index) => (
          <Typography variant="body2" key={index}>
            {message}
          </Typography>
        ))}
        {(details.status || details.code) && (
          <Typography variant="body2">
            {[details.status ? `HTTP ${details.status}` : null, details.code]
              .filter(Boolean)
              .join(' — ')}
          </Typography>
        )}
        {details.reasonCodes && (
          <Typography variant="body2">
            {Object.values(details.reasonCodes).flat().join(', ')}
          </Typography>
        )}
        {details.traceId && (
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="body2">Trace ID: {details.traceId}</Typography>
            <Button
              size="small"
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(details.traceId!)
                  .then(() => setCopied(details.traceId!))
                  .catch(() => setCopied(null));
              }}
            >
              Copy trace ID
            </Button>
            {copied === details.traceId && (
              <Typography role="status" variant="body2">
                Trace ID copied
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Alert>
  );
};
