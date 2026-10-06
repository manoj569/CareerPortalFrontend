import { Alert, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import type {
  ReplacementReviewActionRequest,
  ResumeContent,
  ResumeReplacementDecision,
} from '../types/aiResumeModels';
import type { ResumeSection } from '../types/resumeSections';
import { WorkflowPanel } from './AnalysisScreen';

export type ReviewReplacement = (
  targetId: string,
  request: ReplacementReviewActionRequest,
) => Promise<string | null>;

const targetSection = (targetId: string): ResumeSection | null => {
  if (targetId.startsWith('SRC-SUMMARY-')) return 'Professional Summary';
  if (targetId.startsWith('SRC-EXP-')) return 'Experience';
  if (targetId.startsWith('SRC-PROJECT-')) return 'Projects';
  if (targetId.startsWith('SRC-ADDITIONAL-')) return 'Additional Info';
  return null;
};

const Replacement = ({
  decision,
  busy,
  onReview,
  onEditingChange,
}: {
  decision: ResumeReplacementDecision;
  busy: boolean;
  onReview: ReviewReplacement;
  onEditingChange?: (targetId: string | null) => void;
}) => {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { proposal, status, editedText } = decision;
  const submit = async (request: ReplacementReviewActionRequest) => {
    if (saving || busy) return;
    setSaving(true);
    setError(null);
    try {
      const failure = await onReview(proposal.targetId, request);
      setError(failure);
      if (!failure) {
        setDraft(null);
        onEditingChange?.(null);
      }
    } finally {
      setSaving(false);
    }
  };
  const disabled = busy || saving;
  return (
    <WorkflowPanel tint="#f8fbff">
      <Stack spacing={2}>
        <Chip
          size="small"
          variant="outlined"
          label={
            status === 'original'
              ? 'Using original text'
              : status === 'edited'
                ? 'Manual wording saved'
                : 'Suggestion accepted'
          }
          sx={{ alignSelf: 'flex-start' }}
        />
        <Typography fontWeight={700}>Original</Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{proposal.originalText}</Typography>
        <Typography fontWeight={700}>AI Suggestion</Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{proposal.replacementText}</Typography>
        {editedText && (
          <>
            <Typography fontWeight={700}>Saved edit</Typography>
            <Typography>{editedText}</Typography>
          </>
        )}
        {proposal.matchedJdTerms.length > 0 && (
          <>
            <Typography fontWeight={700}>Matched JD terms</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {proposal.matchedJdTerms.map((term, index) => (
                <Chip key={index} label={term} size="small" variant="outlined" />
              ))}
            </Stack>
          </>
        )}
        {proposal.reason && (
          <>
            <Typography fontWeight={700}>Reason</Typography>
            <Typography color="text.secondary">{proposal.reason}</Typography>
          </>
        )}
        {error && (
          <Alert severity="error" aria-live="polite">
            {error}
          </Alert>
        )}
        {draft !== null && (
          <>
            <TextField
              label="Replacement text"
              multiline
              minRows={4}
              fullWidth
              value={draft}
              disabled={disabled}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                disabled={disabled || !draft.trim()}
                onClick={() => void submit({ action: 'edit', replacementText: draft })}
              >
                Save changes
              </Button>
              <Button
                disabled={disabled}
                onClick={() => {
                  setDraft(null);
                  onEditingChange?.(null);
                }}
              >
                Cancel edit
              </Button>
            </Stack>
          </>
        )}
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button
            variant="contained"
            disabled={disabled}
            onClick={() => void submit({ action: 'accept' })}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            disabled={disabled}
            onClick={() => void submit({ action: 'original' })}
          >
            Keep Original
          </Button>
          <Button
            variant="outlined"
            disabled={disabled}
            onClick={() => {
              setDraft(editedText ?? proposal.replacementText);
              onEditingChange?.(proposal.targetId);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            disabled={disabled}
            onClick={() => void submit({ action: 'reset' })}
          >
            Reset to original
          </Button>
        </Stack>
      </Stack>
    </WorkflowPanel>
  );
};

export const ResumeSectionEditor = ({
  section,
  content,
  replacements,
  revision,
  busy,
  onReview,
  editingTarget,
  onEditingChange,
}: {
  section: ResumeSection;
  content: ResumeContent;
  replacements: ResumeReplacementDecision[];
  revision: number;
  busy: boolean;
  onReview: ReviewReplacement;
  editingTarget?: string | null;
  onEditingChange?: (targetId: string | null) => void;
}) => {
  const decisions = replacements.filter(
    (decision) => targetSection(decision.proposal.targetId) === section,
  );
  const immutable =
    section === 'Skills'
      ? content.skills
      : section === 'Education'
        ? content.education.map(
            (entry) =>
              `${entry.qualification}, ${entry.institution} (${entry.startDate}–${entry.endDate})`,
          )
        : section === 'Certifications'
          ? content.certifications.map((entry) => `${entry.name}, ${entry.issuer} ${entry.date}`)
          : null;
  return (
    <Stack spacing={2}>
      {immutable ? (
        <>
          <Typography color="text.secondary">These source facts remain unchanged.</Typography>
          {immutable.map((text, index) => (
            <Typography key={index}>{text}</Typography>
          ))}
        </>
      ) : decisions.length === 0 ? (
        <Typography color="text.secondary">
          No wording changes for this section. Your original content is retained.
        </Typography>
      ) : (
        decisions.map((decision, index) =>
          decision.status === 'rejected' ? (
            <WorkflowPanel key={index}>
              <Typography>{decision.proposal.originalText}</Typography>
              <Typography color="text.secondary">
                Using original text. This suggestion was skipped because it was not sufficiently
                supported by your resume.
              </Typography>
            </WorkflowPanel>
          ) : (
            <Replacement
              key={`${decision.proposal.targetId}:${revision}`}
              decision={decision}
              busy={busy || Boolean(editingTarget && editingTarget !== decision.proposal.targetId)}
              onReview={onReview}
              onEditingChange={onEditingChange}
            />
          ),
        )
      )}
    </Stack>
  );
};
