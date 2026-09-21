import { useEffect, useState } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';
import type { ApiResponse } from '@/types';
import { sessionPath, type Audience } from '../api/careerGuidanceApi';
import { useActOnCareerSessionMutation, useConfigureCareerMeetingMutation, useGetCareerSessionQuery, useProvisionCareerSessionMutation } from '../api/sessionsApi';
import { CareerSessionStatus, type CareerSessionJoinResponse } from '../types';
import { dateTime, localTimeZone, safeMeetingUrl, utcInstant } from '../utils/presentation';
import { guidanceError } from '../utils/errors';
import { useGuidanceAction } from '../hooks/useGuidanceAction';
import { GuidanceError, GuidanceLoading, GuidanceNavigation, GuidancePage, StatusChip } from '../components/GuidanceUI';
import { GuidanceForm, optionalText, textValue } from '../components/GuidanceForm';

export default function SessionPage({ audience = 'candidate' }: { audience?: Audience }) {
  const { id = '' } = useParams();
  const query = useGetCareerSessionQuery({ audience, id }, { refetchOnMountOrArgChange: true, pollingInterval: 30000, skipPollingIfUnfocused: true });
  const [provision] = useProvisionCareerSessionMutation();
  const [act] = useActOnCareerSessionMutation();
  const [configure, configuration] = useConfigureCareerMeetingMutation();
  const action = useGuidanceAction();
  const [join, setJoin] = useState<{ url: string; expires: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); const clear = () => setJoin(null); window.addEventListener('blur', clear); return () => { window.clearInterval(timer); window.removeEventListener('blur', clear); }; }, []);
  const session = query.data;
  const terminal = session && [CareerSessionStatus.Completed, CareerSessionStatus.CandidateNoShow, CareerSessionStatus.ConsultantNoShow, CareerSessionStatus.Cancelled].includes(session.status);
  const transition = async (operation: 'start' | 'complete' | 'candidate-no-show' | 'consultant-no-show-report' | 'consultant-no-show' | 'reconcile') => {
    setJoin(null);
    await action.execute(async () => { const fresh = await query.refetch().unwrap(); if (fresh.revision !== session?.revision) throw { status: 409 }; return act({ audience, id, action: operation, request: { revision: fresh.revision } }).unwrap(); }, 'Session updated.');
  };
  return <GuidancePage title="Guidance session" description={`Times shown in ${localTimeZone()}. Eligibility and meeting access are checked by the server.`}>
    <GuidanceNavigation owner={audience === 'consultant'} admin={audience === 'admin'} />
    {action.error && <Alert severity="error">{action.error}</Alert>}
    {notice && <Alert severity="info">{notice}</Alert>}
    {query.isLoading ? <GuidanceLoading /> : query.isError ? guidanceError(query.error).status === 404 && audience === 'candidate' ? <Paper sx={{ p: 3 }}><Stack spacing={2}><Typography>The session has not been prepared yet. A confirmed, captured payment is required.</Typography><Button disabled={action.busy} onClick={() => { void action.execute(() => provision({ audience, bookingId: id }).unwrap(), 'Session prepared.'); }}>Prepare session</Button></Stack></Paper> : <GuidanceError error={query.error} retry={query.refetch} /> : session && <Paper sx={{ p: 3 }}><Stack spacing={2}>
      <StatusChip values={CareerSessionStatus} value={session.status} />
      <Typography>{dateTime(session.scheduledStartUtc)} – {dateTime(session.scheduledEndUtc)}</Typography>
      <Typography>Meeting provider: {session.meetingProvider}</Typography>
      {!terminal && now < Date.parse(utcInstant(session.scheduledStartUtc)) && <Typography>Starts in {Math.ceil((Date.parse(utcInstant(session.scheduledStartUtc)) - now) / 60000)} minutes</Typography>}
      {!session.meetingConfigured && !terminal && <Alert severity="info">The meeting link is not configured yet. Refresh later or contact support.</Alert>}
      {terminal && <Alert severity="info">This session is {CareerSessionStatus[session.status].replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()}. Meeting access is closed.</Alert>}
      {audience !== 'admin' && !terminal && <Button disabled={action.busy || query.isFetching} variant="contained" onClick={() => { setJoin(null); void action.execute(async () => {
        const result = await apiClient.get<ApiResponse<CareerSessionJoinResponse>>(`${sessionPath(audience, id)}/join`);
        const data = result.data.data; const url = data.joinUrl && safeMeetingUrl(data.joinUrl);
        if (url) { setJoin({ url, expires: Date.now() + 15000 }); setNotice(null); }
        else setNotice('Meeting access is not available yet or this session is no longer eligible. Refresh the session to see its current state.');
        await query.refetch();
      }); }}>Check meeting access</Button>}
      {join && join.expires > now && !terminal && <Button component="a" href={join.url} target="_blank" rel="noopener noreferrer" variant="contained" onClick={() => window.setTimeout(() => setJoin(null), 0)}>Join meeting</Button>}
      <Button disabled={query.isFetching || action.busy} onClick={() => { setJoin(null); void query.refetch(); }}>Refresh session</Button>
      {!terminal && audience === 'consultant' && <Stack direction="row" flexWrap="wrap" gap={1}>
        {session.status === CareerSessionStatus.Ready && <Button disabled={action.busy} onClick={() => { void transition('start'); }}>Start session</Button>}
        {session.status === CareerSessionStatus.InProgress && now >= Date.parse(utcInstant(session.scheduledEndUtc)) && <Button disabled={action.busy} onClick={() => { void transition('complete'); }}>Complete session</Button>}
        {!session.candidateJoinedAtUtc && now >= Date.parse(utcInstant(session.scheduledStartUtc)) && <Button disabled={action.busy} onClick={() => { void transition('candidate-no-show'); }}>Report candidate no-show</Button>}
      </Stack>}
      {!terminal && audience === 'candidate' && !session.consultantJoinedAtUtc && !session.consultantNoShowReportedAtUtc && now >= Date.parse(utcInstant(session.scheduledStartUtc)) && <><Typography variant="body2">The server checks the no-show grace period. Reporting does not automatically cancel the session or issue a refund.</Typography><Button disabled={action.busy} onClick={() => { void transition('consultant-no-show-report'); }}>Report consultant no-show</Button></>}
      {audience === 'admin' && <><Button disabled={action.busy} onClick={() => { void transition('reconcile'); }}>Reconcile session</Button>{!terminal && !session.consultantJoinedAtUtc && <Button disabled={action.busy} onClick={() => { void transition('consultant-no-show'); }}>Confirm consultant no-show</Button>}
        {session.meetingProvider === 'Manual' && [CareerSessionStatus.Scheduled, CareerSessionStatus.Ready].includes(session.status) && <GuidanceForm key={session.revision} busy={action.busy} submitLabel="Configure meeting" fields={[{ name: 'participantUrl', label: 'Participant meeting URL', required: true, maxLength: 2048 }, { name: 'hostUrl', label: 'Host meeting URL (optional)', maxLength: 2048 }]} validate={(values) => !safeMeetingUrl(textValue(values, 'participantUrl')) || (textValue(values, 'hostUrl') && !safeMeetingUrl(textValue(values, 'hostUrl'))) ? 'Use an HTTPS meeting URL without embedded credentials. The server enforces its provider allowlist.' : null} onSubmit={async (values) => { try { await action.execute(() => configure({ id, request: { revision: session.revision, participantUrl: textValue(values, 'participantUrl'), hostUrl: optionalText(values, 'hostUrl') } }).unwrap(), 'Meeting configured.'); } finally { configuration.reset(); } }} />}
      </>}
    </Stack></Paper>}
  </GuidancePage>;
}
