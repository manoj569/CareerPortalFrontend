import { useState } from 'react';
import { Alert, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';

import { getEnrollment, getLearningPath, getLesson, updateLesson } from '../api/journeyWorkApi';
import { useJourneyMutation, useJourneyRead } from '../hooks/useJourneyWork';

export function JourneyLessons({
  enrollmentId,
  refresh,
}: {
  enrollmentId: string;
  refresh: () => void;
}) {
  const query = useJourneyRead(async () => {
    const enrollment = await getEnrollment(enrollmentId);
    const { modules } = await getLearningPath(enrollment.pathSlug);
    return { enrollment, modules };
  }, enrollmentId);
  const [selection, setSelection] = useState<{ moduleId: string; lessonId: string }>();
  const selected =
    selection ??
    (query.value?.enrollment.currentModuleId && query.value.enrollment.currentLessonId
      ? {
          moduleId: query.value.enrollment.currentModuleId,
          lessonId: query.value.enrollment.currentLessonId,
        }
      : null);
  const lesson = useJourneyRead(
    () =>
      selected
        ? getLesson(enrollmentId, selected.moduleId, selected.lessonId)
        : Promise.resolve(null),
    `${enrollmentId}/${selected?.moduleId ?? ''}/${selected?.lessonId ?? ''}`,
  );
  const mutation = useJourneyMutation();
  const updated = () => {
    query.reload();
    lesson.reload();
    refresh();
  };
  if (query.error)
    return (
      <Alert severity="error" action={<Button onClick={query.reload}>Retry</Button>}>
        {query.error}
      </Alert>
    );
  if (!query.value) return <CircularProgress size={24} aria-label="Loading lessons" />;
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Skills &amp; learning</Typography>
      <Typography>Enrollment progress {query.value.enrollment.overallProgressPercent}%</Typography>
      {query.value.modules.map((module) => (
        <Paper key={module.id} variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">{module.title}</Typography>
          <Typography>{module.description}</Typography>
          {module.lessons.map((item) => (
            <Button
              key={item.id}
              disabled={mutation.pending}
              onClick={() => setSelection({ moduleId: module.id, lessonId: item.id })}
            >
              {item.title}
            </Button>
          ))}
        </Paper>
      ))}
      {query.value.modules.length === 0 && (
        <Typography>No learning modules are available.</Typography>
      )}
      {lesson.error && (
        <Alert severity="error" action={<Button onClick={lesson.reload}>Retry</Button>}>
          {lesson.error}
        </Alert>
      )}
      {mutation.error && <Alert severity="error">{mutation.error}</Alert>}
      {selected && !lesson.error && lesson.value === undefined && (
        <CircularProgress size={24} aria-label="Loading lesson" />
      )}
      {selected && lesson.value && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">{lesson.value.title}</Typography>
          <Typography>{lesson.value.description}</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{lesson.value.content}</Typography>
          {lesson.value.progressStatus === 3 ? (
            <Typography>Completed</Typography>
          ) : (
            <Button
              variant="contained"
              loading={mutation.pending}
              onClick={() => {
                const action = lesson.value?.progressStatus === 2 ? 'complete' : 'start';
                void mutation.run(
                  `${selected.lessonId}/${action}`,
                  (key) =>
                    updateLesson(enrollmentId, selected.moduleId, selected.lessonId, action, key),
                  updated,
                  updated,
                );
              }}
            >
              {lesson.value.progressStatus === 2 ? 'Complete lesson' : 'Start lesson'}
            </Button>
          )}
        </Paper>
      )}
    </Stack>
  );
}
