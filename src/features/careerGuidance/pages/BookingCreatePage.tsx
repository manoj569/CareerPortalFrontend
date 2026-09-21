import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useGetConsultantQuery } from '../api/profilesApi';
import { useCreateCareerBookingMutation, useGetSlotsQuery } from '../api/schedulingApi';
import { GuidanceError, GuidanceLoading, GuidancePage, TrustNotice } from '../components/GuidanceUI';
import { GuidanceForm, numberValue, optionalText, textValue } from '../components/GuidanceForm';
import { useGuidanceAction } from '../hooks/useGuidanceAction';
import { addDays, dateInZone, dateTime, localTimeZone, money, utcInstant } from '../utils/presentation';
import { guidanceRoutes } from '../utils/routes';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';

export const BookingCreatePage = () => {
  const { consultantId = '', serviceId = '' } = useParams();
  const valid = isGuid(consultantId) && isGuid(serviceId);
  const navigate = useNavigate();
  const [from, setFrom] = useState(addDays(new Date().toISOString().slice(0, 10), 1));
  const [selected, setSelected] = useState('');
  const [create] = useCreateCareerBookingMutation();
  const action = useGuidanceAction();
  const profile = useGetConsultantQuery(consultantId, { skip: !valid });
  const slots = useGetSlotsQuery({ consultantId, serviceId, from, to: addDays(from, 6) }, { skip: !valid, refetchOnMountOrArgChange: true });
  const service = profile.data?.services.find((item) => item.id === serviceId && item.isActive);
  if (profile.isLoading) return <GuidanceLoading />;
  if (!service || profile.isError) return <GuidanceError error={profile.error} retry={() => { if (valid) void profile.refetch(); }} />;
  const available = slots.currentData?.slots ?? [];
  const selectedSlot = available.find((slot) => slot.startUtc === selected);
  return <GuidancePage title={`Book ${service.title}`} description={`With ${profile.data?.displayName}`}>
    <TrustNotice /><Paper sx={{ p: 3 }}><Typography>{service.description}</Typography><Typography>{service.durationMinutes} minutes · {money(service.price, service.currency)}</Typography></Paper>
    <Paper sx={{ p: 3 }}><Stack spacing={2}><Typography component="h2" variant="h3">Choose an available time</Typography><Typography>Times below: {localTimeZone()}. Consultant schedule: {slots.currentData?.timeZoneId || 'Loading timezone'}.</Typography>
      <TextField label="Week starting (consultant calendar)" type="date" value={from} slotProps={{ inputLabel: { shrink: true } }} onChange={(event) => { if (/^\d{4}-\d{2}-\d{2}$/.test(event.target.value)) { setFrom(event.target.value); setSelected(''); } }} />
      {slots.isFetching ? <GuidanceLoading /> : slots.isError ? <GuidanceError error={slots.error} retry={slots.refetch} /> : <>
        <Stack direction="row" flexWrap="wrap" gap={1} aria-label="Availability days">{Array.from({ length: 7 }, (_, index) => addDays(from, index)).map((date) => <Button key={date} disabled={!available.some((slot) => dateInZone(slot.startUtc, slots.currentData?.timeZoneId || 'UTC') === date)} onClick={() => { const slot = available.find((item) => dateInZone(item.startUtc, slots.currentData?.timeZoneId || 'UTC') === date); if (slot) setSelected(slot.startUtc); }}>{date}</Button>)}</Stack>
        {!available.length && <Alert severity="info">No available slots in this week. Choose another date.</Alert>}
        <Stack direction="row" flexWrap="wrap" gap={1} role="group" aria-label="Available session times">{available.map((slot) => <Button key={slot.startUtc} aria-pressed={selected === slot.startUtc} variant={selected === slot.startUtc ? 'contained' : 'outlined'} onClick={() => setSelected(slot.startUtc)}>{dateTime(slot.startUtc)}</Button>)}</Stack>
      </>}
    </Stack></Paper>
    <Paper sx={{ p: 3 }}><Stack spacing={2}><Typography component="h2" variant="h3">Prepare for your session</Typography><Typography>{selectedSlot ? `${dateTime(selectedSlot.startUtc)} — ${dateTime(selectedSlot.endUtc)} (${localTimeZone()}) · ${service.durationMinutes} minutes · ${money(service.price, service.currency)}` : 'Select a time above to continue.'}</Typography>
      <GuidanceForm fields={[
        { name: 'targetCompany', label: 'Target company', maxLength: 200 }, { name: 'targetRole', label: 'Target role', maxLength: 200 },
        { name: 'yearsOfExperience', label: 'Years of experience', kind: 'number', min: 0, max: 70, step: 0.1 }, { name: 'currentRoleOrStatus', label: 'Current role or status', maxLength: 200 },
        { name: 'sessionGoal', label: 'Session goal', kind: 'textarea', required: true, maxLength: 2000 }, { name: 'questions', label: 'Questions', kind: 'textarea', maxLength: 4000 }, { name: 'notes', label: 'Additional notes', kind: 'textarea', maxLength: 2000 },
      ]} disabled={!selectedSlot || slots.isFetching || !profile.data?.isAcceptingBookings} busy={action.busy} error={action.error} submitLabel="Create booking & continue to payment" onSubmit={async (values) => {
        const booking = await action.execute(async () => {
          const fresh = await slots.refetch().unwrap();
          if (!fresh.slots.some((slot) => utcInstant(slot.startUtc) === utcInstant(selected))) { setSelected(''); throw { status: 409 }; }
          return create({ consultantId, serviceId, startUtc: utcInstant(selected), questionnaire: {
            targetCompany: optionalText(values, 'targetCompany'), targetRole: optionalText(values, 'targetRole'), yearsOfExperience: textValue(values, 'yearsOfExperience') ? numberValue(values, 'yearsOfExperience') : null,
            currentRoleOrStatus: optionalText(values, 'currentRoleOrStatus'), sessionGoal: textValue(values, 'sessionGoal'), questions: optionalText(values, 'questions'), notes: optionalText(values, 'notes'),
          } }).unwrap();
        });
        if (booking) navigate(guidanceRoutes.booking(booking.id), { replace: true });
      }} />
    </Stack></Paper>
  </GuidancePage>;
};
