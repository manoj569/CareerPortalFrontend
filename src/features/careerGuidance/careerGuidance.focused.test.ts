import { describe, expect, it } from 'vitest';
import { addDays, dateInZone, money, safeMeetingUrl, utcInstant } from './utils/presentation';
import { guidanceErrorMessage } from './utils/errors';
import { guidanceRoutes } from './utils/routes';

describe('Career Guidance contract and privacy boundaries', () => {
  it('normalizes UTC timestamps without browser-local shifting', () => { expect(utcInstant('2026-01-01T12:00:00')).toBe('2026-01-01T12:00:00.000Z'); });
  it('renders a date in an explicit timezone and handles date arithmetic', () => { expect(dateInZone('2026-03-08T07:00:00Z', 'America/New_York')).toBe('2026-03-08'); expect(addDays('2026-03-08', 1)).toBe('2026-03-09'); });
  it('rejects unsafe meeting URLs', () => { expect(safeMeetingUrl('https://meet.example/session')).toContain('https://'); expect(safeMeetingUrl('http://meet.example')).toBeNull(); expect(safeMeetingUrl('https://user:pass@meet.example')).toBeNull(); });
  it('keeps money display currency-specific', () => { expect(money(1200, 'INR')).toContain('INR'); });
  it('preserves safe return destinations through guidance route helpers', () => { expect(guidanceRoutes.book('a/b', 's')).toBe('/career-guidance/consultants/a%2Fb/book/s'); expect(guidanceRoutes.booking('b')).toBe('/career-guidance/bookings/b'); });
  it('maps stale revisions without automatic retry', () => { expect(guidanceErrorMessage({ status: 409 })).toContain('changed'); });
  it('maps rate limits to a safe retry message', () => { expect(guidanceErrorMessage({ status: 429 })).toContain('wait'); });
  it('does not expose provider or server internals in generic errors', () => { expect(guidanceErrorMessage({ status: 500, data: 'SQL secret' })).not.toContain('SQL'); });
  it('keeps candidate session route keyed by booking id', () => { expect(guidanceRoutes.session('booking-1')).toBe('/career-guidance/sessions/booking-1'); });
});
