import { useEffect } from 'react';

import { setDocumentMetadata } from '@/utils/documentMetadata';

interface DocumentMetadataOptions {
  canonicalPath?: string | null;
  noIndex?: boolean;
}

export const useDocumentMetadata = (
  title: string,
  description: string,
  options: DocumentMetadataOptions = {},
): void => {
  const { canonicalPath, noIndex } = options;

  useEffect(() => {
    setDocumentMetadata({ canonicalPath, description, noIndex, title });
  }, [canonicalPath, description, noIndex, title]);
};
