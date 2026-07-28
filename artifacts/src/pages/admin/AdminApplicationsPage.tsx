import { AdminUnavailableState } from '@/features/admin/components/AdminUnavailableState';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminApplicationsPage = () => {
  useDocumentMetadata(
    'Application administration unavailable | Career Portal',
    'Administrator application capability information.',
  );
  return (
    <AdminUnavailableState
      description="The backend has no administrator applications list, detail, resume, status-transition, internal-note, history, or export endpoint. Candidate application history cannot safely substitute for an administrator workflow."
      title="Applications management unavailable"
    />
  );
};
