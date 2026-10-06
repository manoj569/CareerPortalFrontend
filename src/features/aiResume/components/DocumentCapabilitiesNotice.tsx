import { Alert } from '@mui/material';
import type { ResumeDocumentCapabilities } from '../types/aiResumeModels';

export const DocumentCapabilitiesNotice = ({
  capabilities,
}: {
  capabilities: ResumeDocumentCapabilities | null | undefined;
}) => {
  if (!capabilities) return null;
  if (capabilities.preservationMode === 'original_docx' && capabilities.layoutPreserved)
    return (
      <Alert severity="info">
        Original formatting preserved. Text wrapping may change. Download DOCX to retain your
        original resume formatting.
      </Alert>
    );
  if (capabilities.preservationMode === 'rendered_fallback')
    return (
      <Alert severity="info">
        {capabilities.originalFileType === 'pdf' ? 'PDF' : 'Document'} tailoring uses
        CareerHarbor&apos;s rendered format. Upload DOCX for the best original-format preservation.
      </Alert>
    );
  return (
    <Alert severity="info">Original-format preservation is unavailable for this document.</Alert>
  );
};
