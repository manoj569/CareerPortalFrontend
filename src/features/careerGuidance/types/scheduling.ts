// Generated from inspected SchedulingContracts.cs positional DTOs; dates are ISO strings.
import type { CareerBookingStatus, DayOfWeek } from './enums';

export interface WeeklyWindow {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface SaveAvailabilityRequest {
  timeZoneId: string;
  isAcceptingBookings: boolean;
  windows: WeeklyWindow[];
  revision: string;
}

export interface AvailabilityResponse {
  timeZoneId: string | null;
  isAcceptingBookings: boolean;
  windows: WeeklyWindow[];
  revision: string;
}

export interface AvailabilityExceptionRequest {
  localDate: string;
  startTime: string | null;
  endTime: string | null;
  revision: string;
}

export interface AvailabilityExceptionResponse {
  id: string;
  localDate: string;
  startTime: string | null;
  endTime: string | null;
}

export interface ExceptionChangeResponse {
  exception: AvailabilityExceptionResponse | null;
  revision: string;
}

export interface SlotQuery {
  from: string;
  to: string;
}

export interface CareerSlot {
  startUtc: string;
  endUtc: string;
}

export interface SlotResponse {
  timeZoneId: string;
  slots: CareerSlot[];
}

export interface Questionnaire {
  targetCompany: string | null;
  targetRole: string | null;
  yearsOfExperience: number | null;
  currentRoleOrStatus: string | null;
  sessionGoal: string;
  questions: string | null;
  notes: string | null;
}

export interface CreateCareerBookingRequest {
  consultantId: string;
  serviceId: string;
  startUtc: string;
  questionnaire: Questionnaire;
}

export interface BookingActionRequest {
  revision: string;
  reason?: string | null;
}

export interface BookingStatusRequest {
  revision: string;
  status: CareerBookingStatus;
}

export interface BookingQuery {
  pageNumber?: number;
  pageSize?: number;
}

export interface CareerBookingResponse {
  id: string;
  consultantId: string;
  serviceId: string;
  startUtc: string;
  endUtc: string;
  consultantTimeZone: string;
  serviceTitle: string;
  serviceType: string;
  durationMinutes: number;
  price: number;
  currency: string;
  status: CareerBookingStatus;
  questionnaire: Questionnaire;
  cancellationReason: string | null;
  cancelledByUserId: string | null;
  cancelledAtUtc: string | null;
  completedAtUtc: string | null;
  revision: string;
  requiresPayment: boolean;
}
