import { useState } from 'react';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';

import {
  finalizeAssessment,
  getAssessmentAttempt,
  getCurrentAssessment,
  startResolvedAssessment,
  saveAssessmentAnswer,
  startBaselineAssessment,
  type AssessmentAttempt,
} from '../api/journeyWorkApi';
import { useJourneyMutation, useJourneyRead } from '../hooks/useJourneyWork';
import { NextAction, type AcceleratorJourneyResponse } from '../types/journey';
import { journeyMessages } from '../journeyPresentation';

import { AssessmentQuestionInput, assessmentOptions } from './AssessmentQuestionsPage';
import { JourneyAssessmentResults } from './AssessmentResultsPage';

export function JourneyAssessment({
  journey,
  refresh,
}: {
  journey: AcceleratorJourneyResponse;
  refresh: () => void;
}) {
  const [updatedAttempt, setAttempt] = useState<AssessmentAttempt>();
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [text, setText] = useState('');
  const mutation = useJourneyMutation();
  const { enrollmentId, journeyContextId } = journey;
  const activeId =
    journey.summary?.activeAssessmentId ??
    (journey.assessment?.canResume ? journey.assessment.attemptId : null) ??
    (journey.nextAction === NextAction.ResumeAssessment ? journey.nextResourceId : null);
  const resuming = Boolean(activeId) || journey.nextAction === NextAction.ResumeAssessment;
  const matchesJourney = (result: AssessmentAttempt) =>
    result.journeyContextId === journeyContextId ||
    (result.journeyContextId == null &&
      Boolean(journey.goalId) &&
      result.goalId === journey.goalId);
  const recovery = useJourneyRead(
    async () => {
      const result = activeId
        ? await getAssessmentAttempt(activeId)
        : resuming && journeyContextId
          ? await getCurrentAssessment(journeyContextId)
          : null;
      return result && matchesJourney(result) ? result : null;
    },
    `${journeyContextId ?? ''}/${activeId ?? ''}/${resuming}`,
  );
  const attempt = updatedAttempt ?? recovery.value;
  const open = () => {
    if (journey.nextAction !== NextAction.StartAssessment || !journeyContextId) return;
    void mutation.run(
      'start',
      (requestKey) =>
        enrollmentId
          ? startBaselineAssessment(enrollmentId, requestKey)
          : startResolvedAssessment(journeyContextId, requestKey),
      (result) => {
        setAttempt(result);
        refresh();
      },
      refresh,
    );
  };
  if (attempt?.status === 6)
    return <JourneyAssessmentResults journey={journey} score={attempt.score} />;
  const questions = attempt?.questions.slice().sort((a, b) => a.sequence - b.sequence) ?? [];
  const question = questions[index];
  const options = question ? assessmentOptions(question) : null;
  const expired = attempt ? new Date(attempt.expiresAtUtc).getTime() <= Date.now() : false;
  const submitted = Boolean(question?.isAnswered && question.answerIsImmutable);
  let persistedAnswer: unknown;
  if (submitted && question?.submittedAnswerJson) {
    try {
      const payload: unknown = JSON.parse(question.submittedAnswerJson);
      if (typeof payload === 'object' && payload !== null && 'answer' in payload) {
        persistedAnswer = payload.answer;
      }
    } catch {
      // The server's answered flag still controls the question's read-only state.
    }
  }
  const persistedChoices = (options ?? []).flatMap((option, optionIndex) =>
    (Array.isArray(persistedAnswer) ? persistedAnswer.includes(option) : option === persistedAnswer)
      ? [optionIndex]
      : [],
  );
  const clearDraft = () => {
    setChoices([]);
    setText('');
  };
  const assessmentStatus = journey.assessmentStatus;
  const statuses = [
    '',
    'Draft',
    'Ready',
    'In progress',
    'Submitted',
    'Evaluating',
    'Completed',
    'Failed',
    'Retry available',
  ];
  const reload = () => {
    if (!attempt) return;
    void getAssessmentAttempt(attempt.id)
      .then((latest) => {
        if (matchesJourney(latest)) {
          clearDraft();
          setAttempt(latest);
          refresh();
        }
      })
      .catch(refresh);
  };
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Skill assessment</Typography>
      <Typography>{journey.title}</Typography>
      {mutation.error && <Alert severity="error">{mutation.error}</Alert>}
      {!attempt && (
        <>
          {assessmentStatus != null && statuses[assessmentStatus] && (
            <Typography>Status {statuses[assessmentStatus]}</Typography>
          )}
          {journeyMessages[journey.state] && (
            <Alert severity="info">{journeyMessages[journey.state]}</Alert>
          )}
          {journey.assessment && journey.assessment.questionCount > 0 && (
            <Typography>
              {journey.assessment.answeredQuestionCount} of {journey.assessment.questionCount}{' '}
              answered
            </Typography>
          )}
          {resuming && recovery.value === undefined && !recovery.error && (
            <CircularProgress aria-label="Loading assessment" size={24} />
          )}
          {recovery.error && (
            <Alert severity="error" action={<Button onClick={recovery.reload}>Retry</Button>}>
              {recovery.error}
            </Alert>
          )}
          {resuming && recovery.value === null && (
            <Alert severity="info">The active attempt is unavailable in this journey.</Alert>
          )}
          {journey.summary?.completedAssessments ? (
            <JourneyAssessmentResults journey={journey} />
          ) : null}
          {journeyContextId && !activeId && journey.nextAction === NextAction.StartAssessment && (
            <Button variant="contained" loading={mutation.pending} onClick={open}>
              Start assessment
            </Button>
          )}
        </>
      )}
      {attempt && (
        <Typography>Expires {new Date(attempt.expiresAtUtc).toLocaleString()}</Typography>
      )}
      {expired && <Alert severity="warning">This assessment has expired.</Alert>}
      {attempt && !question && (
        <Alert severity="info">No questions are available for this attempt.</Alert>
      )}
      {attempt && question && (
        <>
          <Typography>
            Question {index + 1} of {questions.length}
          </Typography>
          <Typography variant="h6">{question.prompt}</Typography>
          <AssessmentQuestionInput
            question={question}
            options={options}
            choices={submitted ? persistedChoices : choices}
            text={submitted ? (typeof persistedAnswer === 'string' ? persistedAnswer : '') : text}
            disabled={expired || attempt.canResume === false || submitted || mutation.pending}
            setChoices={setChoices}
            setText={setText}
          />
          {submitted ? (
            <Typography>Answer saved</Typography>
          ) : (
            <Button
              disabled={
                expired ||
                attempt.canResume === false ||
                options === null ||
                (!text.trim() && !choices.length)
              }
              loading={mutation.pending}
              onClick={() => {
                if (!options) return;
                const answer =
                  options.length === 0
                    ? text.trim()
                    : question.type === 2
                      ? [...choices]
                          .sort((first, second) => first - second)
                          .map((choice) => options[choice])
                      : options[choices[0] ?? -1];
                void mutation.run(
                  question.id,
                  () => saveAssessmentAnswer(attempt.id, question.id, JSON.stringify({ answer })),
                  (updated) => {
                    clearDraft();
                    setAttempt(updated);
                  },
                  reload,
                );
              }}
            >
              Submit answer
            </Button>
          )}
          <Stack direction="row" spacing={1}>
            <Button
              disabled={index === 0 || mutation.pending}
              onClick={() => {
                clearDraft();
                setIndex(index - 1);
              }}
            >
              Previous
            </Button>
            <Button
              disabled={index === questions.length - 1 || mutation.pending}
              onClick={() => {
                clearDraft();
                setIndex(index + 1);
              }}
            >
              Next
            </Button>
            <Button
              variant="contained"
              disabled={
                expired ||
                attempt.canResume === false ||
                !questions.every((item) => item.isAnswered)
              }
              loading={mutation.pending}
              onClick={() =>
                void mutation.run(
                  'finalize',
                  () => finalizeAssessment(attempt.id, attempt.revision),
                  (updated) => {
                    setAttempt(updated);
                    refresh();
                  },
                  reload,
                )
              }
            >
              Finish assessment
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}
