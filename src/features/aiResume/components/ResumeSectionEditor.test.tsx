import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ResumeSectionEditor } from './ResumeSectionEditor';
import type { ResumeContent, ResumeReplacementDecision } from '../types/aiResumeModels';
const content: ResumeContent = {
  contact: { name: 'Fixture Candidate', email: '', phone: '', location: '', links: [] },
  professionalSummary: 'Original summary',
  skills: ['C#'],
  additionalInfo: [],
  evidence: [],
  experience: [
    {
      employer: 'Fixture employer',
      role: 'Developer',
      startDate: '2020',
      endDate: '2023',
      bullets: ['Built C# APIs.'],
    },
  ],
  projects: [{ name: 'Fixture project', technologies: ['C#'], bullets: ['Built tools.'] }],
  education: [
    { institution: 'Fixture college', qualification: 'BSc', startDate: '2017', endDate: '2020' },
  ],
  certifications: [{ name: 'Fixture certificate', issuer: 'Fixture issuer', date: '2023' }],
};
const decision: ResumeReplacementDecision = {
  proposal: {
    targetId: 'SRC-SUMMARY-001',
    originalText: 'Original summary',
    replacementText: 'Supported summary',
    sourceEvidenceIds: ['SRC-SUMMARY-001'],
    matchedJdTerms: ['supported'],
    reason: 'Emphasize supported work',
  },
  status: 'accepted',
  rejectionCategory: null,
  rejectionReason: null,
  editedText: null,
};
it.each(['Skills', 'Experience', 'Projects', 'Education', 'Certifications'] as const)(
  'never exposes editable identity or source lists in %s',
  (section) => {
    render(
      <ResumeSectionEditor
        section={section}
        content={content}
        replacements={[]}
        revision={2}
        busy={false}
        onReview={vi.fn()}
      />,
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add/ })).not.toBeInTheDocument();
  },
);
it('edits only a backend replacement target and preserves entered text on rejection', async () => {
  const onReview = vi.fn().mockResolvedValue('This wording is unsupported.');
  render(
    <ResumeSectionEditor
      section="Professional Summary"
      content={content}
      replacements={[decision]}
      revision={2}
      busy={false}
      onReview={onReview}
    />,
  );
  expect(screen.getByText('Original summary')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
  fireEvent.change(screen.getByLabelText('Replacement text'), {
    target: { value: 'Candidate edit' },
  });
  await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(onReview).toHaveBeenCalledWith('SRC-SUMMARY-001', {
    action: 'edit',
    replacementText: 'Candidate edit',
  });
  expect(await screen.findByText('This wording is unsupported.')).toBeVisible();
  expect(screen.getByLabelText('Replacement text')).toHaveValue('Candidate edit');
});
