import { useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  getSkillGaps,
  practiceHistory,
  practiceRecommendations,
  startPractice,
} from '../api/journeyWorkApi';
import { useJourneyMutation, useJourneyRead } from '../hooks/useJourneyWork';
import type { AcceleratorJourneyResponse } from '../types/journey';
import { PracticeSessionPage } from './PracticeSessionPage';

type Props = { journey: AcceleratorJourneyResponse; refresh: () => void };

export function JourneyPractice({ journey, refresh }: Props) {
  const contextId = journey.journeyContextId;
  const list = useJourneyRead(async () => {
    if (!contextId) return { history: [], recommendations: [], gaps: [] };
    const [history, recommendations, gaps] = await Promise.all([
      practiceHistory(contextId),
      practiceRecommendations(contextId),
      getSkillGaps(journey),
    ]);
    return { history, recommendations, gaps };
  }, contextId ?? '');
  const [sessionId, setSessionId] = useState<string>();
  const mutation = useJourneyMutation();
  const [questionType, setQuestionType] = useState(1);
  const updated = () => {
    list.reload();
    refresh();
  };
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Practice</Typography>
      {list.error && (
        <Alert severity="error" action={<Button onClick={list.reload}>Retry</Button>}>
          {list.error}
        </Alert>
      )}
      {!list.value && !list.error && <CircularProgress size={24} aria-label="Loading practice" />}
      {mutation.error && <Alert severity="error">{mutation.error}</Alert>}
      {list.value?.recommendations.length === 0 && (
        <Typography>No practice recommendations are available.</Typography>
      )}
      {!!list.value?.recommendations.length && (
        <TextField
          select
          label="Question type"
          value={questionType}
          onChange={(event) => setQuestionType(Number(event.target.value))}
        >
          <MenuItem value={1}>Multiple choice</MenuItem>
          <MenuItem value={2}>Multiple select</MenuItem>
          <MenuItem value={3}>Short answer</MenuItem>
        </TextField>
      )}
      {list.value?.recommendations.map((item) => (
        <Paper key={item.competencyId} variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">
            {list.value?.gaps.find((gap) => gap.competencyId === item.competencyId)?.skillName ??
              'Recommended practice'}
          </Typography>
          <Typography>{item.reason}</Typography>
          <Button
            disabled={mutation.pending}
            onClick={() =>
              void mutation.run(
                `${item.competencyId}/${questionType}`,
                (requestKey) =>
                  startPractice(journey, {
                    requestKey,
                    competencyId: item.competencyId,
                    difficulty: item.recommendedDifficulty,
                    questionType,
                  }),
                (result) => {
                  setSessionId(result.id);
                  updated();
                },
                updated,
              )
            }
          >
            Start practice
          </Button>
        </Paper>
      ))}
      {list.value?.history.map((item, index) => (
        <Button key={item.id} onClick={() => setSessionId(item.id)}>
          Open practice session {index + 1}
        </Button>
      ))}
      {sessionId && (
        <PracticeSessionPage
          key={sessionId}
          sessionId={sessionId}
          contextId={contextId}
          refresh={updated}
        />
      )}
    </Stack>
  );
}
