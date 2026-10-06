import { ROUTES } from '@/constants/routes';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { store } from '@/store/store';
const prefix = 'careerHarbor.aiResume.';
export const validResumeId = (id: string | null): id is string =>
  Boolean(
    id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) &&
    id !== '00000000-0000-0000-0000-000000000000',
  );
const key = (name: string) =>
  `${prefix}${selectCurrentUser(store.getState())?.id ?? 'anonymous'}.${name}`;
export const resumeWorkflowStorage = {
  get(name: string): string | null {
    return sessionStorage.getItem(key(name));
  },
  set(name: string, value: string) {
    sessionStorage.setItem(key(name), value);
  },
  remove(name: string) {
    sessionStorage.removeItem(key(name));
  },
};
export const resumeMakerPath = (sessionId: string) =>
  `${ROUTES.RESUME_MAKER}?${new URLSearchParams({ sessionId }).toString()}`;
