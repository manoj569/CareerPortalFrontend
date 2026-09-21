// Numeric enum contracts verified against backend domain entities.
export enum CareerProfessionalType { CurrentEmployee = 1, FormerEmployee, Recruiter, HiringManager, CareerCoach }
export enum ConsultantVerificationStatus { Pending = 1, Verified, Rejected, Suspended }
export enum ConsultantTagKind { Language = 1, Expertise }
export enum CareerPaymentStatus { Created = 1, OrderCreated, Authorized, Captured, RefundPending, Refunded }
export enum CareerEarningStatus { Pending = 1, Payable, Settled, Reversed }
export enum CareerRefundStatus { Requested = 1, ProviderPending, Processed, Failed }
export enum CareerRefundReason { ConsultantCancellation = 1, ConsultantNoShow, PlatformFailure, AdminCorrection }
export enum CareerBookingStatus { Pending = 1, Confirmed, CancelledByCandidate, CancelledByConsultant, Completed, NoShowCandidate, NoShowConsultant }
export enum CareerSessionStatus { Scheduled = 1, Ready, InProgress, Completed, CandidateNoShow, ConsultantNoShow, Cancelled }
export enum CareerReminderStatus { Pending = 1, Delivered, Cancelled }
export enum CareerReviewStatus { Pending = 1, Approved, Rejected, Hidden }
export enum CareerDisputeCategory { ConsultantNoShow = 1, SessionQuality, Misrepresentation, InappropriateConduct, ConfidentialInformationRequest, TechnicalFailure, BillingIssue, Other }
export enum CareerDisputeStatus { Open = 1, UnderReview, AwaitingCandidate, AwaitingConsultant, Resolved, Rejected, Cancelled }
export enum CareerDisputeResolution { None = 1, NoAction, WarningIssued, RefundApproved, RefundDenied, ConsultantRestricted, ReviewHidden, Other }
export enum CareerEvidenceType { Text = 1, Response, AdminNote }
export enum ConsultantReviewAction { Approve = 1, Reject, Suspend, Reactivate }
export enum DayOfWeek { Sunday = 0, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday }