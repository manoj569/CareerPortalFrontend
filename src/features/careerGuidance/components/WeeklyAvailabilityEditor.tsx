import { useMemo, useState } from 'react';
import { Alert, Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import type { AvailabilityResponse, SaveAvailabilityRequest, WeeklyWindow } from '../types';
import { DayOfWeek } from '../types';

type AvailabilityDayState = { active: boolean; start: string; end: string };
type AvailabilityState = Map<DayOfWeek, AvailabilityDayState>;
const days: { value: DayOfWeek; label: string }[] = [
  { value: DayOfWeek.Sunday, label: 'Sunday' }, { value: DayOfWeek.Monday, label: 'Monday' }, { value: DayOfWeek.Tuesday, label: 'Tuesday' },
  { value: DayOfWeek.Wednesday, label: 'Wednesday' }, { value: DayOfWeek.Thursday, label: 'Thursday' }, { value: DayOfWeek.Friday, label: 'Friday' }, { value: DayOfWeek.Saturday, label: 'Saturday' },
];
const time = (value: string) => value.slice(0, 5);

export function WeeklyAvailabilityEditor({ availability, busy, onSave }: { availability: AvailabilityResponse; busy: boolean; onSave: (request: SaveAvailabilityRequest) => Promise<unknown> }) {
  const existing = useMemo(() => new Map(availability.windows.map(window => [window.dayOfWeek, window])), [availability.windows]);
  const [zone, setZone] = useState(availability.timeZoneId ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [accepting, setAccepting] = useState(availability.isAcceptingBookings);
  const [windows, setWindows] = useState<AvailabilityState>(() => new Map(days.map(day => {
    const window = existing.get(day.value);
    return [day.value, { active: Boolean(window?.isActive), start: window ? time(window.startTime) : '', end: window ? time(window.endTime) : '' }];
  })));
  const [error, setError] = useState<string | null>(null);
  const getDayState = (day: DayOfWeek): AvailabilityDayState => {
    const state = windows.get(day);
    if (!state) throw new Error(`Missing availability state for day ${day}.`);
    return state;
  };
  const update = (day: DayOfWeek, key: keyof AvailabilityDayState, value: boolean | string) => {
    const current = getDayState(day);
    const next = new Map(windows);
    next.set(day, { ...current, [key]: value });
    setWindows(next);
  };
  const submit = async () => {
    const active: WeeklyWindow[] = days.filter(day => getDayState(day.value).active).map(day => {
      const state = getDayState(day.value);
      return { dayOfWeek: day.value, startTime: state.start, endTime: state.end, isActive: true };
    });
    if (active.some(window => !window.startTime || !window.endTime || window.endTime <= window.startTime)) { setError('Each enabled day needs a start time before its end time.'); return; }
    if (accepting && active.length === 0) { setError('Enable at least one weekly window before accepting bookings.'); return; }
    setError(null);
    await onSave({ timeZoneId: zone.trim(), isAcceptingBookings: accepting, windows: active, revision: availability.revision });
  };
  return <Paper sx={{ p: 3 }}><Stack spacing={2}><Typography component="h2" variant="h3">Weekly availability</Typography><Typography variant="body2">Times are interpreted in the selected IANA timezone; the backend handles UTC conversion and DST.</Typography>{error && <Alert severity="error">{error}</Alert>}<TextField label="Timezone" value={zone} onChange={event => setZone(event.target.value)} required helperText="IANA timezone, for example America/New_York" disabled={busy} /><FormControlLabel control={<Checkbox checked={accepting} onChange={(_, checked) => setAccepting(checked)} disabled={busy} />} label="Accept bookings" /><Stack sx={{ overflowX: 'auto' }}><Stack direction="row" spacing={2} sx={{ minWidth: 620, fontWeight: 'bold' }}><Typography sx={{ width: 120 }}>Day</Typography><Typography sx={{ width: 100 }}>Available</Typography><Typography sx={{ width: 150 }}>Start</Typography><Typography sx={{ width: 150 }}>End</Typography></Stack>{days.map(day => { const state = getDayState(day.value); return <Stack key={day.value} direction="row" spacing={2} alignItems="center" sx={{ minWidth: 620 }}><Typography sx={{ width: 120 }}>{day.label}</Typography><Checkbox slotProps={{ input: { 'aria-label': `${day.label} available` } }} checked={state.active} disabled={busy} onChange={(_, checked) => update(day.value, 'active', checked)} /><TextField name={`${day.label}-start`} aria-label={`${day.label} start`} type="time" value={state.start} disabled={busy || !state.active} onChange={event => update(day.value, 'start', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><TextField name={`${day.label}-end`} aria-label={`${day.label} end`} type="time" value={state.end} disabled={busy || !state.active} onChange={event => update(day.value, 'end', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Stack>; })}</Stack><Button variant="contained" disabled={busy} onClick={() => { void submit(); }}>Save availability</Button></Stack></Paper>;
}
