import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import {
  interviewHistory,
  interviewRecommendations,
  interviewVersion,
  startInterview,
} from '../api/journeyWorkApi';
import { useJourneyMutation, useJourneyRead } from '../hooks/useJourneyWork';
import { InterviewWorkspace } from './LiveMockInterviewPage';
import { NextAction, type AcceleratorJourneyResponse } from '../types/journey';

export function JourneyInterviews({
  journey,
  refresh,
}: {
  journey: AcceleratorJourneyResponse;
  refresh: () => void;
}) {
  const contextId = journey.journeyContextId;
  const list = useJourneyRead(async () => {
    if (!contextId) return { recommendations: [], history: [] };
    const [recommendations, history] = await Promise.all([
      interviewRecommendations(journey),
      interviewHistory(journey),
    ]);
    return { recommendations, history };
  }, contextId ?? '');
  const [versionId, setVersionId] = useState<string>();
  const [selection, setSelection] = useState<{ id: string; report: boolean } | null>();
  const suggested = journey.summary?.activeInterviewId
    ? { id: journey.summary.activeInterviewId, report: false }
    : journey.nextAction === NextAction.ViewInterviewReport
      ? list.value?.history.find((item) => item.id === journey.nextResourceId && item.status === 5)
      : undefined;
  const selected =
    selection === undefined && suggested
      ? { id: suggested.id, report: !journey.summary?.activeInterviewId }
      : selection;
  const version = useJourneyRead(
    () => (versionId ? interviewVersion(versionId) : Promise.resolve(null)),
    versionId ?? '',
  );
  const [useAi, setUseAi] = useState(false);
  const mutation = useJourneyMutation();
  const ai = journey.entitlement.status === 'Active';
  if (selected && contextId)
    return (
      <InterviewWorkspace
        key={selected.id}
        sessionId={selected.id}
        showReport={selected.report}
        contextId={contextId}
        back={() => {
          setSelection(null);
          list.reload();
        }}
        refresh={refresh}
        ai={ai}
      />
    );
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Interview preparation</Typography>
      {list.error && (
        <Alert severity="error" action={<Button onClick={list.reload}>Retry</Button>}>
          {list.error}
        </Alert>
      )}
      {!list.value && !list.error && <CircularProgress size={24} aria-label="Loading interviews" />}
      {list.value?.recommendations.length === 0 && (
        <Typography>No interview recommendations are available.</Typography>
      )}
      {list.value?.recommendations.map((item) => (
        <Paper key={item.versionId} variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">{item.title}</Typography>
          <Typography>{item.reason}</Typography>
          <Button
            onClick={() => {
              setVersionId(item.versionId);
              setUseAi(false);
            }}
          >
            View interview
          </Button>
        </Paper>
      ))}
      {list.value?.history.map((item, index) => (
        <Button
          key={item.id}
          onClick={() => setSelection({ id: item.id, report: item.status === 5 })}
        >
          {item.status === 5 ? 'View report' : 'Open interview'} {index + 1}
        </Button>
      ))}
      {version.error && (
        <Alert severity="error" action={<Button onClick={version.reload}>Retry</Button>}>
          {version.error}
        </Alert>
      )}
      {versionId && version.value === undefined && !version.error && (
        <CircularProgress size={24} aria-label="Loading interview details" />
      )}
      {mutation.error && <Alert severity="error">{mutation.error}</Alert>}
      {versionId && version.value && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">{version.value.name}</Typography>
          <Typography>
            {version.value.description} · {version.value.estimatedMinutes} min
          </Typography>
          {version.value.sections.map((section) => (
            <Typography key={section.id}>{section.title}</Typography>
          ))}
          {ai && version.value.sections.some((section) => section.aiQuestionAvailable) && (
            <FormControlLabel
              label="Use AI questions"
              control={<Checkbox checked={useAi} onChange={(_, value) => setUseAi(value)} />}
            />
          )}
          <Button
            variant="contained"
            loading={mutation.pending}
            onClick={() =>
              void mutation.run(
                `${versionId}/${useAi}`,
                (key) => startInterview(journey, versionId, useAi, key),
                (session) => {
                  setSelection({ id: session.id, report: false });
                  refresh();
                },
                list.reload,
              )
            }
          >
            Start interview
          </Button>
        </Paper>
      )}
    </Stack>
  );
}
