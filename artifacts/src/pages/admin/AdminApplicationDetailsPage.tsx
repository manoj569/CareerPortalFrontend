import { useParams } from 'react-router-dom';

import { AdminUnavailableState } from '@/features/admin/components/AdminUnavailableState';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminApplicationDetailsPage = () => {
  const { applicationId = '' } = useParams<{ applicationId: string }>();
  useDocumentMetadata(
    'Application details unavailable | Career Portal',
    'Administrator application-detail capability information.',
  );
  return (
    <AdminUnavailableState
      description={`The backend exposes no authorized administrator application-details contract for ${applicationId || 'this application'}. No candidate data, resume, notes, or status actions are shown.`}
      title="Application details unavailable"
    />
  );
};
