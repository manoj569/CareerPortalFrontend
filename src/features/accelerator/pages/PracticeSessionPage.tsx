import { useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { answerPractice, getPractice, getPracticeResults } from '../api/journeyWorkApi';
import { useJourneyMutation, useJourneyRead } from '../hooks/useJourneyWork';

export function PracticeSessionPage({
  sessionId,
  contextId,
  refresh,
}: {
  sessionId: string;
  contextId: string | null;
  refresh: () => void;
}) {
  const session = useJourneyRead(async () => {
    if (!sessionId) return null;
    const data = await getPractice(sessionId);
    return data.journeyContextId === contextId
      ? { data, result: await getPracticeResults(sessionId) }
      : null;
  }, sessionId ?? '');
  const mutation = useJourneyMutation();
  const [questionId, setQuestionId] = useState('');
  const [answer, setAnswer] = useState('');
  const updated = () => {
    session.reload();
    refresh();
  };
  const question = session.value?.data.questions.find((item) => item.id === questionId);
  let options: string[] = [];
  if (question && question.type <= 2) {
    try {
      const values: unknown = JSON.parse(question.publicOptionsJson);
      if (Array.isArray(values) && values.every((value) => typeof value === 'string'))
        options = values;
    } catch {
      /* Invalid options are shown below. */
    }
  }
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  return (
    <Stack spacing={2}>
      {mutation.error && <Alert severity="error">{mutation.error}</Alert>}
      {session.error && (
        <Alert severity="error" action={<Button onClick={session.reload}>Retry</Button>}>
          {session.error}
        </Alert>
      )}
      {sessionId && !session.error && session.value === undefined && (
        <CircularProgress size={24} aria-label="Loading practice session" />
      )}
      {sessionId && session.value === null && (
        <Alert severity="info">This practice session is unavailable in this journey.</Alert>
      )}
      {session.value && sessionId && (
        <Stack spacing={2}>
          <Typography>
            Score {session.value.result.scorePercent}% · {session.value.result.answeredCount} of{' '}
            {session.value.result.questionCount} answered
          </Typography>
          {session.value.data.questions.map((item) => (
            <Button
              key={item.id}
              disabled={mutation.pending}
              onClick={() => {
                setQuestionId(item.id);
                setAnswer('');
                setSelectedOptions([]);
              }}
            >
              Open question {item.sequence}
            </Button>
          ))}
          {question && (
            <>
              <Typography>{question.prompt}</Typography>
              {question.type <= 2 ? (
                options.length ? (
                  <Stack direction="row" flexWrap="wrap" spacing={1}>
                    {options.map((option) => (
                      <Button
                        key={option}
                        aria-pressed={selectedOptions.includes(option)}
                        disabled={mutation.pending}
                        variant={selectedOptions.includes(option) ? 'contained' : 'outlined'}
                        onClick={() =>
                          setSelectedOptions((previous) =>
                            question.type === 1
                              ? [option]
                              : previous.includes(option)
                                ? previous.filter((value) => value !== option)
                                : [...previous, option],
                          )
                        }
                      >
                        {option}
                      </Button>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="error">Question options are unavailable.</Alert>
                )
              ) : (
                <TextField
                  label="Your answer"
                  value={answer}
                  multiline
                  onChange={(event) => setAnswer(event.target.value)}
                />
              )}
              <Button
                variant="contained"
                loading={mutation.pending}
                disabled={question.type <= 2 ? !selectedOptions.length : !answer.trim()}
                onClick={() => {
                  const payload = JSON.stringify({
                    answer:
                      question.type === 1
                        ? selectedOptions[0]
                        : question.type === 2
                          ? options.filter((option) => selectedOptions.includes(option))
                          : answer.trim(),
                  });
                  void mutation.run(
                    `${question.id}/${payload}`,
                    (key) => answerPractice(sessionId, question.id, payload, key),
                    () => {
                      setQuestionId('');
                      updated();
                    },
                    updated,
                  );
                }}
              >
                Submit practice answer
              </Button>
            </>
          )}
          {session.value.result.evaluations.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
              {item.classification} · {item.explanation} {item.suggestedImprovement}
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
