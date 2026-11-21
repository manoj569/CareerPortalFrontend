import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';

import { enrollmentRecognition, goalInsights } from '../api/journeyWorkApi';
import { useJourneyRead } from '../hooks/useJourneyWork';
import type { AcceleratorJourneyResponse } from '../types/journey';

export function JourneyInsights({ journey }: { journey: AcceleratorJourneyResponse }) {
  const query = useJourneyRead(
    async () => ({
      goal: journey.goalId ? await goalInsights(journey.goalId) : null,
      enrollment: journey.enrollmentId ? await enrollmentRecognition(journey.enrollmentId) : null,
    }),
    journey.journeyContextId ?? '',
  );
  if (query.error)
    return (
      <Alert severity="error" action={<Button onClick={query.reload}>Retry</Button>}>
        {query.error}
      </Alert>
    );
  if (!query.value)
    return <CircularProgress size={24} aria-label="Loading progress and insights" />;
  const { goal, enrollment } = query.value;
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Progress &amp; insights</Typography>
      {(goal || journey.summary) && (
        <Typography>
          Career readiness {goal?.readiness.total ?? journey.summary?.readiness}%
        </Typography>
      )}
      {goal && (
        <>
          <Typography>{goal.readiness.mainBlocker}</Typography>
          <Typography variant="h6">Skill passport</Typography>
          {goal.passport.skills.length === 0 && (
            <Typography>No demonstrated skills yet.</Typography>
          )}
          {goal.passport.skills.map((skill) => (
            <Typography key={skill.competencyId}>
              {skill.skillName} · Proficiency level {skill.proficiency} · {skill.evidenceCount}{' '}
              evidence records
            </Typography>
          ))}
          <Typography variant="h6">Readiness history</Typography>
          {goal.history.length === 0 && <Typography>No readiness history yet.</Typography>}
          {goal.history.map((item) => (
            <Typography key={item.id}>
              {new Date(item.calculatedAtUtc).toLocaleDateString()} · {item.total}%
            </Typography>
          ))}
        </>
      )}
      {enrollment && (
        <>
          <Typography variant="h6">Learning proficiency</Typography>
          <Typography>
            {enrollment.proficiency.band ?? enrollment.proficiency.status}
            {enrollment.proficiency.score != null && ` · ${enrollment.proficiency.score}%`}
          </Typography>
          {enrollment.proficiency.demonstratedCompetencies?.map((skill) => (
            <Typography key={skill.competencyId}>
              {skill.name} · Proficiency level {skill.proficiency}
            </Typography>
          ))}
          <Typography variant="h6">Achievements</Typography>
          {enrollment.achievements.length === 0 && <Typography>No achievements yet.</Typography>}
          {enrollment.achievements.map((item) => (
            <Typography key={item.id}>
              {item.title} · {item.description}
            </Typography>
          ))}
        </>
      )}
      {!goal && !enrollment && (
        <Typography>No readiness data is available for this journey.</Typography>
      )}
    </Stack>
  );
}
