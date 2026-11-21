import { useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  evaluateProject,
  projectDetail,
  projectHistory,
  projectRecommendations,
  projectWorkspace,
  startProject,
  submitProject,
} from '../api/journeyWorkApi';
import { useJourneyMutation, useJourneyRead } from '../hooks/useJourneyWork';
import type { AcceleratorJourneyResponse } from '../types/journey';

export function JourneyProjects({
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
      projectRecommendations(journey),
      projectHistory(contextId),
    ]);
    return { recommendations, history };
  }, contextId ?? '');
  const [version, setVersion] = useState<string>();
  const [selectedProject, setSelectedProject] = useState<string | null>();
  const projectId =
    selectedProject === undefined ? journey.summary?.activeProjectId : selectedProject;
  const detail = useJourneyRead(
    () => (version ? projectDetail(version) : Promise.resolve(null)),
    version ?? '',
  );
  const mutation = useJourneyMutation();
  if (projectId && contextId)
    return (
      <Workspace
        projectId={projectId}
        contextId={contextId}
        back={() => {
          setSelectedProject(null);
          list.reload();
        }}
        refresh={refresh}
        ai={journey.entitlement.status === 'Active'}
      />
    );
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Build projects</Typography>
      {list.error && (
        <Alert severity="error" action={<Button onClick={list.reload}>Retry</Button>}>
          {list.error}
        </Alert>
      )}
      {!list.value && !list.error && <CircularProgress size={24} aria-label="Loading projects" />}
      {list.value?.recommendations.length === 0 && (
        <Typography>No project recommendations are available.</Typography>
      )}
      {list.value?.recommendations.map((item) => (
        <Paper key={item.projectVersionId} variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">{item.title}</Typography>
          <Typography>{item.reason}</Typography>
          <Button onClick={() => setVersion(item.projectVersionId)}>View project</Button>
        </Paper>
      ))}
      {list.value?.history.map((item, index) => (
        <Button key={item.id} onClick={() => setSelectedProject(item.id)}>
          Open project {index + 1} · {item.progressPercent}%
        </Button>
      ))}
      {detail.error && (
        <Alert severity="error" action={<Button onClick={detail.reload}>Retry</Button>}>
          {detail.error}
        </Alert>
      )}
      {version && detail.value === undefined && !detail.error && (
        <CircularProgress size={24} aria-label="Loading project details" />
      )}
      {mutation.error && <Alert severity="error">{mutation.error}</Alert>}
      {version && detail.value && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">{detail.value.title}</Typography>
          <Typography>{detail.value.businessContext}</Typography>
          <Typography>{detail.value.instructions}</Typography>
          <Button
            variant="contained"
            loading={mutation.pending}
            onClick={() =>
              void mutation.run(
                version,
                (key) => startProject(journey, version, key),
                (project) => {
                  setSelectedProject(project.id);
                  refresh();
                },
                list.reload,
              )
            }
          >
            Start project
          </Button>
        </Paper>
      )}
    </Stack>
  );
}

function Workspace({
  projectId,
  contextId,
  back,
  refresh,
  ai,
}: {
  projectId: string;
  contextId: string;
  back: () => void;
  refresh: () => void;
  ai: boolean;
}) {
  const query = useJourneyRead(() => projectWorkspace(projectId), projectId);
  const mutation = useJourneyMutation();
  const [assignment, setAssignment] = useState<string>();
  const [draft, setDraft] = useState('');
  const updated = () => {
    query.reload();
    refresh();
  };
  const workspace = query.value;
  return (
    <Stack spacing={2}>
      <Button onClick={back} sx={{ alignSelf: 'start' }}>
        Back to projects
      </Button>
      {query.error && (
        <Alert severity="error" action={<Button onClick={query.reload}>Retry</Button>}>
          {query.error}
        </Alert>
      )}
      {!workspace && !query.error && (
        <CircularProgress size={24} aria-label="Loading project workspace" />
      )}
      {workspace && workspace.project.journeyContextId !== contextId && (
        <Alert severity="error">This project belongs to another journey.</Alert>
      )}
      {workspace && workspace.project.journeyContextId === contextId && (
        <>
          <Typography variant="h5">{workspace.detail.title}</Typography>
          <Typography>{workspace.detail.instructions}</Typography>
          <Typography>Project progress {workspace.progress.progressPercent}%</Typography>
          <LinearProgress variant="determinate" value={workspace.progress.progressPercent} />
          {workspace.progress.finalScore != null && (
            <Typography>Final score {workspace.progress.finalScore}</Typography>
          )}
          {mutation.error && <Alert severity="error">{mutation.error}</Alert>}
          {workspace.detail.milestones.map((milestone) => (
            <Paper key={milestone.id} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6">{milestone.title}</Typography>
              <Typography>{milestone.description}</Typography>
              {milestone.assignments.map((item) => (
                <Stack key={item.id} spacing={1} sx={{ mt: 2 }}>
                  <Typography>{item.prompt}</Typography>
                  <Typography>{item.maximumAttempts} maximum attempts</Typography>
                  {workspace.history
                    .filter((entry) => entry.submission.assignmentId === item.id)
                    .map(({ submission, evaluation }) => (
                      <Stack key={submission.id} direction="row" spacing={1} flexWrap="wrap">
                        <Typography>Attempt {submission.attemptNumber}</Typography>
                        {evaluation ? (
                          <Typography>
                            Score {evaluation.score} · {evaluation.feedback}
                          </Typography>
                        ) : (
                          <>
                            <Button
                              disabled={mutation.pending}
                              onClick={() =>
                                void mutation.run(
                                  submission.id,
                                  () => evaluateProject(projectId, submission.id, false),
                                  updated,
                                  updated,
                                )
                              }
                            >
                              Evaluate
                            </Button>
                            {ai && (
                              <Button
                                disabled={mutation.pending}
                                onClick={() =>
                                  void mutation.run(
                                    `${submission.id}/ai`,
                                    () => evaluateProject(projectId, submission.id, true),
                                    updated,
                                    updated,
                                  )
                                }
                              >
                                Evaluate with AI
                              </Button>
                            )}
                          </>
                        )}
                      </Stack>
                    ))}
                  {assignment === item.id ? (
                    <>
                      <TextField
                        label="Submission"
                        multiline
                        minRows={3}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                      />
                      <Button
                        variant="contained"
                        disabled={!draft.trim()}
                        loading={mutation.pending}
                        onClick={() =>
                          void mutation.run(
                            `${item.id}/${draft}`,
                            (key) =>
                              submitProject(
                                projectId,
                                item.id,
                                draft,
                                workspace.progress.revision,
                                key,
                              ),
                            () => {
                              setDraft('');
                              setAssignment(undefined);
                              updated();
                            },
                            updated,
                          )
                        }
                      >
                        Submit work
                      </Button>
                    </>
                  ) : (
                    <Button
                      disabled={mutation.pending}
                      onClick={() => {
                        setAssignment(item.id);
                        setDraft('');
                      }}
                    >
                      Write submission
                    </Button>
                  )}
                </Stack>
              ))}
            </Paper>
          ))}
        </>
      )}
    </Stack>
  );
}
