export interface RegistrationChallengeState {
  challengeId: string;
  maskedPhoneNumber: string;
  expiresAtUtc: string;
}

const STORAGE_KEY = 'careerPortal.registrationChallenge';

const isChallengeState = (value: unknown): value is RegistrationChallengeState => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<RegistrationChallengeState>;
  return (
    typeof candidate.challengeId === 'string' &&
    candidate.challengeId.length > 0 &&
    typeof candidate.maskedPhoneNumber === 'string' &&
    candidate.maskedPhoneNumber.length > 0 &&
    typeof candidate.expiresAtUtc === 'string' &&
    candidate.expiresAtUtc.length > 0
  );
};

export const registrationChallengeStore = {
  get(): RegistrationChallengeState | null {
    const serialized = sessionStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    try {
      const parsed: unknown = JSON.parse(serialized);
      if (isChallengeState(parsed)) return parsed;
    } catch {
      // Invalid or stale state is discarded below.
    }
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  },
  set(state: RegistrationChallengeState): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  },
};
