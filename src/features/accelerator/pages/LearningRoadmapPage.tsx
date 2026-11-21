import { useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import {
  generateRoadmap,
  getRoadmap,
  recordActivityProgress,
  type Roadmap,
} from '../api/journeyWorkApi';
import { useJourneyMutation, useJourneyRead } from '../hooks/useJourneyWork';
import { NextAction, type AcceleratorJourneyResponse } from '../types/journey';

export function JourneyRoadmap({
  journey,
  refresh,
}: {
  journey: AcceleratorJourneyResponse;
  refresh: () => void;
}) {
  const roadmapId = journey.roadmapId;
  const query = useJourneyRead(
    () => (roadmapId ? getRoadmap(roadmapId) : Promise.resolve(null)),
    roadmapId ?? '',
  );
  const [generated, setGenerated] = useState<Roadmap>();
  const roadmap = query.value ?? (!roadmapId ? generated : undefined);
  const mutation = useJourneyMutation();
  const updated = () => {
    query.reload();
    refresh();
  };
  if (query.error)
    return (
      <Alert severity="error" action={<Button onClick={query.reload}>Retry</Button>}>
        {query.error}
      </Alert>
    );
  if (query.value === undefined) return <CircularProgress size={24} aria-label="Loading roadmap" />;

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Learning roadmap</Typography>
      {mutation.error && <Alert severity="error">{mutation.error}</Alert>}
      {!roadmap ? (
        <>
          <Typography>No roadmap has been created for this journey.</Typography>
          {journey.nextAction === NextAction.GenerateRoadmap && (
            <Button
              variant="contained"
              loading={mutation.pending}
              onClick={() =>
                void mutation.run(
                  'generate',
                  (key) => generateRoadmap(journey, key),
                  (result) => {
                    setGenerated(result);
                    refresh();
                  },
                  updated,
                )
              }
            >
              Generate roadmap
            </Button>
          )}
        </>
      ) : (
        <>
          <Typography>{roadmap.explanation}</Typography>
          <Typography>{roadmap.estimatedMinutes} estimated minutes</Typography>
          {roadmap.nodes.map((node) => (
            <Stack key={node.id} spacing={1}>
              <Typography>
                Milestone {node.sequence} · {node.progressPercent}%
              </Typography>
              <LinearProgress variant="determinate" value={node.progressPercent} />
            </Stack>
          ))}
          <Typography variant="h6">Activity schedule</Typography>
          {roadmap.schedule.length === 0 && <Typography>No activities scheduled.</Typography>}
          {roadmap.schedule.map((activity) => {
            const node = roadmap.nodes.find((item) => item.id === activity.roadmapNodeId);
            const kind = activity.status === 3 ? 2 : 1;
            return (
              <Paper key={activity.id} variant="outlined" sx={{ p: 2 }}>
                <Typography>{activity.title}</Typography>
                <Typography>
                  {new Date(activity.scheduledAtUtc).toLocaleDateString()} ·{' '}
                  {activity.estimatedMinutes} min
                </Typography>
                {activity.status === 4 ? (
                  'Completed'
                ) : node?.status === 1 ? (
                  'Locked'
                ) : (
                  <Button
                    disabled={mutation.pending}
                    onClick={() =>
                      void mutation.run(
                        `${activity.id}/${kind}`,
                        (key) => recordActivityProgress(activity, kind, key),
                        updated,
                        updated,
                      )
                    }
                  >
                    {kind === 1 ? 'Start activity' : 'Mark complete'}
                  </Button>
                )}
              </Paper>
            );
          })}
        </>
      )}
    </Stack>
  );
}
