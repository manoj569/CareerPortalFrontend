const root = '/career-guidance';
const id = encodeURIComponent;
export const guidanceRoutes = {
  marketplace: root,
  profile: (consultantId: string) => `${root}/consultants/${id(consultantId)}`,
  book: (consultantId: string, serviceId: string) => `${root}/consultants/${id(consultantId)}/book/${id(serviceId)}`,
  bookings: `${root}/my-bookings`,
  booking: (bookingId: string) => `${root}/bookings/${id(bookingId)}`,
  // Candidate session access is keyed by booking ID in the backend.
  session: (bookingId: string) => `${root}/sessions/${id(bookingId)}`,
  owner: (section = '') => `${root}/consultant${section ? `/${section}` : ''}`,
  admin: (section = 'consultants') => `/admin/career-guidance/${section}`,
};
