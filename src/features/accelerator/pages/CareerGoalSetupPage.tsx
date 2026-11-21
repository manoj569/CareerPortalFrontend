import { useState, type FormEvent } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';

import { enrollInAcceleratorPath } from '../api/acceleratorApi';
import { useJourneyMutation } from '../hooks/useJourneyWork';
import { NextAction, type AcceleratorJourneyResponse } from '../types/journey';

export function JourneyEnrollment({
  journey,
  onDone,
}: {
  journey: AcceleratorJourneyResponse;
  onDone: () => void;
}) {
  const mutation = useJourneyMutation();
  const [current, setCurrent] = useState('');
  const [target, setTarget] = useState('');
  const [minutes, setMinutes] = useState('');
  const [date, setDate] = useState('');

  if (!journey.learningPathId || journey.nextAction !== NextAction.EnrollLearningPath) {
    return <Alert severity="info">Enrollment is unavailable for this journey.</Alert>;
  }
  const pathId = journey.learningPathId;
  function submit(event: FormEvent) {
    event.preventDefault();
    const details = {
      currentLevel: Number(current),
      targetLevel: Number(target),
      weeklyCommitmentMinutes: Number(minutes),
      targetCompletionAtUtc: new Date(`${date}T00:00:00Z`).toISOString(),
    };
    void mutation.run(
      JSON.stringify(details),
      (requestKey) =>
        enrollInAcceleratorPath(pathId, {
          ...details,
          requestKey,
        }),
      onDone,
    );
  }
  return (
    <Stack component="form" onSubmit={submit} spacing={2} sx={{ maxWidth: 480 }}>
      <Typography variant="h5">Enroll in {journey.title ?? 'this learning path'}</Typography>
      {mutation.error && <Alert severity="error">{mutation.error}</Alert>}
      <TextField
        label="Current level (0–5)"
        type="number"
        value={current}
        onChange={(event) => setCurrent(event.target.value)}
        required
        slotProps={{ htmlInput: { min: 0, max: 5 } }}
      />
      <TextField
        label="Target level (1–5)"
        type="number"
        value={target}
        onChange={(event) => setTarget(event.target.value)}
        required
        slotProps={{ htmlInput: { min: Math.max(1, Number(current)), max: 5 } }}
      />
      <TextField
        label="Minutes per week"
        type="number"
        value={minutes}
        onChange={(event) => setMinutes(event.target.value)}
        required
        slotProps={{ htmlInput: { min: 15, max: 10080 } }}
      />
      <TextField
        label="Target completion date"
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        required
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Button variant="contained" type="submit" loading={mutation.pending}>
        Enroll
      </Button>
    </Stack>
  );
}
