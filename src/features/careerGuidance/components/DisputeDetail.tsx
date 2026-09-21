import { useRef } from 'react';
import { Alert, Paper, Stack, Typography } from '@mui/material';
import type { Audience } from '../api/careerGuidanceApi';
import { useAddCareerEvidenceMutation, useResolveCareerDisputeMutation, useSetCareerDisputeStatusMutation } from '../api/trustApi';
import { CareerDisputeResolution, CareerDisputeStatus, CareerEvidenceType, type CareerDisputeResponse } from '../types';
import { dateTime, enumOptions } from '../utils/presentation';
import { useGuidanceAction } from '../hooks/useGuidanceAction';
import { GuidanceForm, numberValue, textValue } from './GuidanceForm';
import { StatusChip } from './GuidanceUI';

export function DisputeDetail({ dispute, audience, refreshing = false }: { dispute: CareerDisputeResponse; audience: Audience; refreshing?: boolean }) {
  const [evidence] = useAddCareerEvidenceMutation(); const [status] = useSetCareerDisputeStatusMutation(); const [resolve] = useResolveCareerDisputeMutation();
  const action = useGuidanceAction(); const retry = useRef<{ fingerprint: string; requestId: string } | null>(null);
  const terminal = [CareerDisputeStatus.Resolved, CareerDisputeStatus.Rejected, CareerDisputeStatus.Cancelled].includes(dispute.status);
  const admin = audience === 'admin';
  return <Stack spacing={2}>
    <StatusChip values={CareerDisputeStatus} value={dispute.status} /><Typography sx={{ whiteSpace: 'pre-wrap' }}>{dispute.description}</Typography>
    <Typography>Submitted {dateTime(dispute.submittedAtUtc)} · Refund requested: {dispute.requestedRefund ? 'Yes' : 'No'}</Typography>
    <Typography>Resolution: {CareerDisputeResolution[dispute.resolution].replace(/([a-z])([A-Z])/g, '$1 $2')}</Typography>
    <Alert severity="info">A complaint or refund-approved resolution does not move money. Refund processing is a separate finance step.</Alert>
    {admin && dispute.adminNotes && <Paper sx={{ p: 2 }}><Typography variant="subtitle2">Private admin notes</Typography><Typography sx={{ whiteSpace: 'pre-wrap' }}>{dispute.adminNotes}</Typography></Paper>}
    <Typography component="h3" variant="h4">Evidence and responses</Typography>
    {!dispute.evidence.filter((item) => admin || (!item.isPrivateToAdmin && item.evidenceType !== CareerEvidenceType.AdminNote)).length && <Typography>No visible evidence yet.</Typography>}
    {dispute.evidence.filter((item) => admin || (!item.isPrivateToAdmin && item.evidenceType !== CareerEvidenceType.AdminNote)).map((item) => <Paper variant="outlined" key={item.id} sx={{ p: 2 }}><Typography variant="caption">{dateTime(item.createdAtUtc)}{item.isPrivateToAdmin ? ' · Private to administrators' : ''}</Typography><Typography sx={{ whiteSpace: 'pre-wrap' }}>{item.description}</Typography></Paper>)}
    {action.error && <Alert severity="error">{action.error}</Alert>}
    {!terminal && dispute.evidence.length < 50 && <GuidanceForm key={`evidence-${dispute.revision}`} busy={action.busy || refreshing} submitLabel="Add evidence or response" fields={[{ name: 'evidenceType', label: 'Type', kind: 'select', required: true, options: enumOptions(CareerEvidenceType).filter((item) => admin || item.value !== CareerEvidenceType.AdminNote) }, { name: 'description', label: 'Evidence or response', required: true, maxLength: 4000, kind: 'textarea' }, ...(admin ? [{ name: 'private', label: 'Private to administrators', kind: 'checkbox' as const }] : [])]} initial={{ evidenceType: CareerEvidenceType.Response }} onSubmit={async (values) => {
      const description = textValue(values, 'description'); const evidenceType = numberValue(values, 'evidenceType'); const isPrivateToAdmin = admin && (Boolean(values.private) || evidenceType === CareerEvidenceType.AdminNote);
      const fingerprint = JSON.stringify({ id: dispute.id, description, evidenceType, isPrivateToAdmin });
      if (retry.current?.fingerprint !== fingerprint) retry.current = { fingerprint, requestId: crypto.randomUUID() };
      const result = await action.execute(() => evidence({ audience, id: dispute.id, request: { revision: dispute.revision, requestId: retry.current!.requestId, evidenceType, description, isPrivateToAdmin } }).unwrap(), 'Evidence added.');
      if (result) retry.current = null;
    }} />}
    {admin && !terminal && <>
      <GuidanceForm key={`status-${dispute.revision}`} busy={action.busy || refreshing} submitLabel="Update dispute status" fields={[{ name: 'status', label: 'Status', kind: 'select', required: true, options: enumOptions(CareerDisputeStatus).filter((item) => [CareerDisputeStatus.UnderReview, CareerDisputeStatus.AwaitingCandidate, CareerDisputeStatus.AwaitingConsultant].includes(item.value)) }, { name: 'adminNotes', label: 'Private admin notes', kind: 'textarea', required: true, maxLength: 4000 }]} onSubmit={(values) => action.execute(() => status({ id: dispute.id, request: { revision: dispute.revision, status: numberValue(values, 'status'), adminNotes: textValue(values, 'adminNotes') } }).unwrap(), 'Dispute status updated.')} />
      <GuidanceForm key={`resolve-${dispute.revision}`} busy={action.busy || refreshing} submitLabel="Resolve dispute" fields={[{ name: 'resolution', label: 'Resolution', kind: 'select', required: true, options: enumOptions(CareerDisputeResolution).filter((item) => item.value !== CareerDisputeResolution.None) }, { name: 'adminNotes', label: 'Resolution notes (admin only)', kind: 'textarea', required: true, maxLength: 4000 }]} onSubmit={(values) => action.execute(() => resolve({ id: dispute.id, request: { revision: dispute.revision, resolution: numberValue(values, 'resolution'), adminNotes: textValue(values, 'adminNotes') } }).unwrap(), 'Dispute resolved. No refund was executed by this action.')} />
    </>}
  </Stack>;
}
