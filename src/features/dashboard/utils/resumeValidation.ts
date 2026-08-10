const MAXIMUM_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUMES: Record<string, string> = {
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pdf': 'application/pdf',
};

export const validateResume = (file: File): string | null => {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_RESUMES[extension] || ALLOWED_RESUMES[extension] !== file.type) {
    return 'Choose a PDF, DOC, or DOCX file.';
  }
  if (file.size <= 0 || file.size > MAXIMUM_RESUME_BYTES) {
    return 'Resume size must be between 1 byte and 5 MB.';
  }
  return null;
};

export const isAllowedResumeExtension = (value: string): boolean => {
  const extension = value.slice(value.lastIndexOf('.')).toLowerCase();
  return Object.hasOwn(ALLOWED_RESUMES, extension);
};
