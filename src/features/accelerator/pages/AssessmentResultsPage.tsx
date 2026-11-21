import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';

import { getAssessmentAttempt, getSkillGaps } from '../api/journeyWorkApi';
import { useJourneyRead } from '../hooks/useJourneyWork';
import type { AcceleratorJourneyResponse } from '../types/journey';

export function JourneyAssessmentResults({
  journey,
  score,
}: {
  journey: AcceleratorJourneyResponse;
  score?: number | null;
}) {
  const completedId = journey.assessment?.status === 6 ? journey.assessment.attemptId : null;
  const query = useJourneyRead(
    async () => {
      const [gaps, attempt] = await Promise.all([
        journey.enrollmentId || journey.goalId ? getSkillGaps(journey) : Promise.resolve([]),
        score === undefined && completedId
          ? getAssessmentAttempt(completedId)
          : Promise.resolve(null),
      ]);
      return { gaps, score: score ?? (attempt?.status === 6 ? attempt.score : null) };
    },
    `${journey.journeyContextId ?? ''}/${completedId ?? ''}`,
  );
  if (query.error)
    return (
      <Alert severity="error" action={<Button onClick={query.reload}>Retry</Button>}>
        {query.error}
      </Alert>
    );
  if (!query.value) return <CircularProgress size={24} aria-label="Loading skill gaps" />;
  const proficiency = ['Not assessed', 'Beginner', 'Developing', 'Intermediate', 'Advanced'];
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Skill gaps</Typography>
      {query.value.score != null && <Typography>Assessment score {query.value.score}%</Typography>}
      {query.value.gaps.length === 0 && <Typography>No skill gaps are available.</Typography>}
      {query.value.gaps.map((gap) => (
        <Typography key={gap.competencyId}>
          {gap.skillName} · {proficiency[gap.current] ?? gap.current} current
          {' · '}
          {proficiency[gap.required] ?? gap.required} required · Gap {gap.gap} · Confidence{' '}
          {Math.round(gap.confidence * 100)}%
        </Typography>
      ))}
    </Stack>
  );
}
