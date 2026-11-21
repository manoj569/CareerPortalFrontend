import { useState } from 'react';
import { Alert, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';

import {
  answerInterview,
  completeInterview,
  evaluateInterview,
  generateInterviewQuestion,
  getInterview,
  interviewReport,
  interviewVersion,
  nextInterviewQuestion,
} from '../api/journeyWorkApi';
import { useJourneyMutation, useJourneyRead } from '../hooks/useJourneyWork';

export function InterviewWorkspace({
  sessionId,
  showReport,
  contextId,
  back,
  refresh,
  ai,
}: {
  sessionId: string;
  showReport: boolean;
  contextId: string;
  back: () => void;
  refresh: () => void;
  ai: boolean;
}) {
  const [reportMode, setReportMode] = useState(showReport);
  const query = useJourneyRead(async () => {
    const session = await getInterview(sessionId);
    if (session.journeyContextId !== contextId) return null;
    const answerId = session.questions.find(
      (question) => question.answered && !question.evaluated && question.answerId,
    )?.answerId;
    return {
      session,
      answerId,
      next:
        reportMode || session.status === 5 || answerId
          ? null
          : await nextInterviewQuestion(sessionId),
      report: reportMode || session.status === 5 ? await interviewReport(sessionId) : null,
    };
  }, `${sessionId}/${reportMode}`);
  const versionId = query.value?.session.versionId;
  const version = useJourneyRead(
    () => (versionId ? interviewVersion(versionId) : Promise.resolve(null)),
    versionId ?? '',
  );
  const mutation = useJourneyMutation();
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState<string>();
  const updated = () => {
    query.reload();
    refresh();
  };
  const content = query.value;
  const answerId = content?.answerId;
  return (
    <Stack spacing={2}>
      <Button onClick={back} sx={{ alignSelf: 'start' }}>
        Back to interviews
      </Button>
      {query.error && (
        <Alert severity="error" action={<Button onClick={query.reload}>Retry</Button>}>
          {query.error}
        </Alert>
      )}
      {content === undefined && !query.error && (
        <CircularProgress size={24} aria-label="Loading interview" />
      )}
      {content === null && (
        <Alert severity="info">This interview is unavailable in the selected journey.</Alert>
      )}
      {mutation.error && <Alert severity="error">{mutation.error}</Alert>}
      {content?.report && (
        <>
          <Typography variant="h5">Interview report</Typography>
          <Typography>Overall score {content.report.overallScore}</Typography>
          {[
            ['Strengths', content.report.strengths],
            ['Areas to improve', content.report.improvementAreas],
            ['Next actions', content.report.nextActions],
          ].map(([label, values]) => (
            <Stack key={String(label)}>
              <Typography variant="h6">{label}</Typography>
              {Array.isArray(values) &&
                values.map((value, index) => <Typography key={index}>{value}</Typography>)}
            </Stack>
          ))}
        </>
      )}
      {content && !content.report && (
        <>
          <Typography variant="h5">Mock interview</Typography>
          {feedback && <Typography>{feedback}</Typography>}
          {answerId && (
            <Stack direction="row" spacing={1}>
              <Button
                disabled={mutation.pending}
                onClick={() =>
                  void mutation.run(
                    answerId,
                    () => evaluateInterview(sessionId, answerId, false),
                    (result) => {
                      setFeedback(`Score ${result.score} · ${result.feedback}`);
                      updated();
                    },
                    updated,
                  )
                }
              >
                Evaluate answer
              </Button>
              {ai && (
                <Button
                  disabled={mutation.pending}
                  onClick={() =>
                    void mutation.run(
                      `${answerId}/ai`,
                      () => evaluateInterview(sessionId, answerId, true),
                      (result) => {
                        setFeedback(`Score ${result.score} · ${result.feedback}`);
                        updated();
                      },
                      updated,
                    )
                  }
                >
                  Evaluate with AI
                </Button>
              )}
            </Stack>
          )}
          {content.next && !answerId && (
            <>
              <Typography>{content.next.prompt}</Typography>
              <TextField
                label="Your answer"
                multiline
                minRows={3}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button
                loading={mutation.pending}
                disabled={!draft.trim()}
                onClick={() => {
                  const question = content.next;
                  if (!question) return;
                  void mutation.run(
                    `${question.id}/${draft}`,
                    (key) =>
                      answerInterview(sessionId, question.id, draft, content.session.revision, key),
                    () => {
                      setDraft('');
                      updated();
                    },
                    updated,
                  );
                }}
              >
                Submit answer
              </Button>
            </>
          )}
          {!answerId &&
            ai &&
            version.value?.sections
              .filter((section) => section.aiQuestionAvailable)
              .map((section) => (
                <Button
                  key={section.id}
                  disabled={mutation.pending}
                  onClick={() =>
                    void mutation.run(
                      section.id,
                      (key) =>
                        generateInterviewQuestion(
                          sessionId,
                          section.id,
                          content.session.revision,
                          key,
                        ),
                      updated,
                      updated,
                    )
                  }
                >
                  Generate AI question for {section.title}
                </Button>
              ))}
          {!content.next && !answerId && (
            <Button
              loading={mutation.pending}
              variant="contained"
              onClick={() =>
                void mutation.run(
                  'complete',
                  () => completeInterview(sessionId, content.session.revision),
                  () => {
                    setReportMode(true);
                    updated();
                  },
                  updated,
                )
              }
            >
              Complete interview
            </Button>
          )}
        </>
      )}
    </Stack>
  );
}
