const root = '/career-guidance';
const id = encodeURIComponent;

const becomeConsultant = `${root}/become-consultant`;

export const guidanceRoutes = {
  marketplace: root,

  becomeConsultant,
  consultantOnboardingBasic: `${becomeConsultant}/basic`,
  consultantOnboardingProfessional: `${becomeConsultant}/professional`,
  consultantOnboardingExpertise: `${becomeConsultant}/expertise`,
  consultantOnboardingAvailability: `${becomeConsultant}/availability`,
  consultantOnboardingReview: `${becomeConsultant}/review`,

  profile: (consultantId: string) =>
    `${root}/consultants/${id(consultantId)}`,

  book: (consultantId: string, serviceId: string) =>
    `${root}/consultants/${id(consultantId)}/book/${id(serviceId)}`,

  bookings: `${root}/my-bookings`,
  booking: (bookingId: string) => `${root}/bookings/${id(bookingId)}`,

  // Candidate session access is keyed by booking ID in the backend.
  session: (bookingId: string) => `${root}/sessions/${id(bookingId)}`,

  owner: (section = '') =>
    `${root}/consultant${section ? `/${section}` : ''}`,

  admin: (section = 'consultants') =>
    `/admin/career-guidance/${section}`,
};