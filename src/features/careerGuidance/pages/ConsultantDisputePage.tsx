import { Alert } from '@mui/material';
import { useParams } from 'react-router-dom';

import {
  GuidanceError,
  GuidanceLoading,
  GuidanceNavigation,
  GuidancePage,
} from '../components/GuidanceUI';

import { DisputeDetail } from '../components/DisputeDetail';

import {
  useGetCareerDisputeQuery,
} from '../api/trustApi';

export default function ConsultantDisputePage() {
  const { id = '' } = useParams();

  const dispute = useGetCareerDisputeQuery(
    {
      audience: 'consultant',
      id,
    },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    },
  );

  return (
    <GuidancePage
      title="Dispute details"
      description="Review the dispute, booking context, status, and supporting evidence."
    >
      <GuidanceNavigation owner />

      {!id ? (
        <Alert severity="error">
          The dispute identifier is missing.
        </Alert>
      ) : dispute.isLoading ? (
        <GuidanceLoading />
      ) : dispute.isError ? (
        <GuidanceError
          error={dispute.error}
          retry={dispute.refetch}
        />
      ) : dispute.data ? (
        <DisputeDetail
          dispute={dispute.data}
          audience="consultant"
          refreshing={dispute.isFetching}
        />
      ) : (
        <Alert severity="info">
          The dispute could not be found.
        </Alert>
      )}
    </GuidancePage>
  );
}
