import { useParams } from 'react-router-dom';

import { AdminUnavailableState } from '@/features/admin/components/AdminUnavailableState';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminUserDetailsPage = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  useDocumentMetadata(
    'User administration unavailable | Career Portal',
    'Administrator user details capability information.',
  );
  return (
    <AdminUnavailableState
      description={`The current backend has no administrator user-details endpoint for ${userId || 'this user'}, and exposes no role, entitlement, application, payment-history, session-revocation, or account-status mutation contract.`}
      title="User details unavailable"
    />
  );
};
