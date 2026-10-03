import { useParams } from 'react-router-dom';
import {
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { useGetCareerDisputeQuery } from '../api/trustApi';
import { DisputeDetail } from '../components/DisputeDetail';

import {
  GuidanceError,
  GuidanceLoading,
  GuidanceNavigation,
  GuidancePage,
} from '../components/GuidanceUI';

export default function ConsultantDisputePage() {
  const { id = '' } = useParams();

  const query = useGetCareerDisputeQuery({
    audience: 'consultant',
    id,
  });

  return (
    <GuidancePage
      title="Dispute detail"
      description="Review the dispute status, submitted evidence, and responses."
    >
      <GuidanceNavigation owner />

      {query.isLoading ? (
        <GuidanceLoading />
      ) : query.isError ? (
        <GuidanceError
          error={query.error}
          retry={query.refetch}
        />
      ) : (
        query.data && (
          <Paper
            variant="outlined"
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
              borderRadius: 3,
            }}
          >
            <Stack spacing={2}>
              <Typography
                component="h2"
                variant="h5"
                fontWeight={800}
              >
                Booking dispute
              </Typography>

              <DisputeDetail
                dispute={query.data}
                audience="consultant"
                refreshing={query.isFetching}
              />
            </Stack>
          </Paper>
        )
      )}
    </GuidancePage>
  );
}