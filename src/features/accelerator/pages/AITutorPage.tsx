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
  archiveTutor,
  getSkillGaps,
  sendTutorMessage,
  startTutor,
  tutorConversation,
  tutorHistory,
  tutorMessages,
} from '../api/journeyWorkApi';
import { useJourneyMutation, useJourneyRead } from '../hooks/useJourneyWork';
import type { AcceleratorJourneyResponse } from '../types/journey';

export function JourneyTutor({ journey }: { journey: AcceleratorJourneyResponse }) {
  const contextId = journey.journeyContextId;
  const list = useJourneyRead(async () => {
    if (!contextId) return { conversations: [], skills: [] };
    const [conversations, skills] = await Promise.all([
      tutorHistory(contextId),
      getSkillGaps(journey),
    ]);
    return { conversations, skills };
  }, contextId ?? '');
  const [competencyId, setCompetencyId] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const [draft, setDraft] = useState('');
  const mutation = useJourneyMutation();
  const conversation = useJourneyRead(async () => {
    if (!conversationId) return null;
    const item = await tutorConversation(conversationId);
    return item.journeyContextId === contextId
      ? { item, messages: await tutorMessages(conversationId) }
      : null;
  }, conversationId ?? '');
  const update = () => {
    conversation.reload();
    list.reload();
  };
  const skill = list.value?.skills.find((item) => item.competencyId === competencyId);
  const active = journey.entitlement.status === 'Active';
  return (
    <Stack spacing={2}>
      <Typography variant="h5">AI tutor</Typography>
      {!active && <Alert severity="info">Activate Accelerator access to send messages.</Alert>}
      {list.error && (
        <Alert severity="error" action={<Button onClick={list.reload}>Retry</Button>}>
          {list.error}
        </Alert>
      )}
      {!list.value && !list.error && <CircularProgress size={24} aria-label="Loading tutor" />}
      {list.value?.skills.length === 0 && (
        <Typography>No tutor topics are available for this journey.</Typography>
      )}
      {mutation.error && <Alert severity="error">{mutation.error}</Alert>}
      {!!list.value?.skills.length && (
        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Skill"
            value={competencyId}
            onChange={(event) => setCompetencyId(event.target.value)}
            fullWidth
          >
            {list.value.skills.map((item) => (
              <MenuItem key={item.competencyId} value={item.competencyId}>
                {item.skillName}
              </MenuItem>
            ))}
          </TextField>
          <Button
            disabled={!skill || !active || mutation.pending}
            onClick={() => {
              if (!skill) return;
              void mutation.run(
                competencyId,
                (requestKey) =>
                  startTutor(journey, {
                    requestKey,
                    competencyId,
                    topic: skill.skillName,
                    title: skill.skillName,
                  }),
                (item) => {
                  setConversationId(item.id);
                  setDraft('');
                  update();
                },
                update,
              );
            }}
          >
            New conversation
          </Button>
        </Stack>
      )}
      {list.value?.conversations.map((item) => (
        <Button
          key={item.id}
          onClick={() => {
            setConversationId(item.id);
            setDraft('');
          }}
        >
          {item.title}
        </Button>
      ))}
      {conversation.error && (
        <Alert severity="error" action={<Button onClick={conversation.reload}>Retry</Button>}>
          {conversation.error}
        </Alert>
      )}
      {conversationId && !conversation.error && conversation.value === undefined && (
        <CircularProgress size={24} aria-label="Loading messages" />
      )}
      {conversation.value && conversationId && (
        <Stack spacing={2}>
          <Typography variant="h6">{conversation.value.item.title}</Typography>
          {conversation.value.messages.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 2, whiteSpace: 'pre-wrap' }}>
              <Typography variant="subtitle2">
                {item.role === 2 ? 'You' : item.role === 3 ? 'Tutor' : 'System'}
              </Typography>
              {item.status === 1
                ? 'Message pending'
                : item.status !== 2
                  ? 'Delivery failed or could not be confirmed.'
                  : item.content}
            </Paper>
          ))}
          <Button onClick={conversation.reload}>Refresh messages</Button>
          {conversation.value.item.status === 1 && (
            <>
              <TextField
                label="Message"
                value={draft}
                multiline
                disabled={mutation.pending || !active}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button
                loading={mutation.pending}
                disabled={!draft.trim() || !active}
                onClick={() =>
                  void mutation.run(
                    `${conversationId}/${draft}`,
                    (key) => sendTutorMessage(conversationId, draft, key),
                    () => {
                      setDraft('');
                      update();
                    },
                    update,
                  )
                }
              >
                Send
              </Button>
              <Button
                disabled={mutation.pending}
                onClick={() => {
                  const revision = conversation.value?.item.revision;
                  if (revision)
                    void mutation.run(
                      'archive',
                      () => archiveTutor(conversationId, revision),
                      update,
                      update,
                    );
                }}
              >
                Archive conversation
              </Button>
            </>
          )}
        </Stack>
      )}
    </Stack>
  );
}
