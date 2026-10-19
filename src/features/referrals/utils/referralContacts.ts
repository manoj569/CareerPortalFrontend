import type { ContactErrors, ContactForm } from '../components/ReferralContactFields';
import type { JobReferralSubmission, UpdateReferralContactRequest } from '../types/referralModels';

// Matches ReferralContactValues.Validate in the backend, including its URL restrictions.
export function validateContacts(contacts: ContactForm): ContactErrors {
  const errors: ContactErrors = {};
  if (contacts.linkedin.selected) {
    const value = contacts.linkedin.value.trim();
    try {
      const url = new URL(value);
      if (
        !value ||
        value.length > 2048 ||
        !/^https:\/\//i.test(value) ||
        /\s/.test(value) ||
        url.protocol !== 'https:' ||
        !['linkedin.com', 'www.linkedin.com'].includes(url.hostname) ||
        url.port ||
        url.username ||
        url.password ||
        value.includes('?') ||
        value.includes('#') ||
        !/^\/in\/[A-Za-z0-9_%\-]+\/?$/.test(url.pathname)
      )
        throw new Error();
    } catch {
      errors.linkedin = 'Enter a valid HTTPS LinkedIn profile URL.';
    }
  }
  if (contacts.email.selected) {
    const value = contacts.email.value.trim();
    if (!value || value.length > 254 || /\s/.test(value) || !/^[^@]+@[^@]+$/.test(value))
      errors.email = 'Enter a valid contact email address.';
  }
  if (contacts.phone.selected) {
    const value = contacts.phone.value.trim();
    const digits = value.replace(/[^0-9]/g, '').length;
    if (
      !value ||
      value.length > 40 ||
      !/^\+?[0-9][0-9 ()\-.]*[0-9]$/.test(value) ||
      digits < 7 ||
      digits > 15
    )
      errors.phone = 'Enter a valid international contact phone number (7 to 15 digits).';
  }
  return errors;
}

export const hasContactMethod = (contacts: ContactForm) =>
  Object.values(contacts).some((field) => field.selected);

export function contactPayload(contacts: ContactForm): UpdateReferralContactRequest {
  return {
    showLinkedIn: contacts.linkedin.selected,
    showEmail: contacts.email.selected,
    showPhone: contacts.phone.selected,
    linkedInUrl: contacts.linkedin.selected ? contacts.linkedin.value.trim() : null,
    contactEmail: contacts.email.selected ? contacts.email.value.trim() : null,
    contactPhone: contacts.phone.selected ? contacts.phone.value.trim() : null,
  };
}

export function restoreContacts(
  job: Pick<
    JobReferralSubmission,
    'showLinkedIn' | 'showEmail' | 'showPhone' | 'linkedInUrl' | 'contactEmail' | 'contactPhone'
  >,
): ContactForm {
  return {
    linkedin: { selected: job.showLinkedIn, value: job.linkedInUrl ?? '' },
    email: { selected: job.showEmail, value: job.contactEmail ?? '' },
    phone: { selected: job.showPhone, value: job.contactPhone ?? '' },
  };
}
