const TRIAL_START_KEY = 'fx_trial_start';
const TRIAL_DAYS = 3;
const PAYMENT_EMAIL_KEY = 'fx_payment_email';

export function getTrialStartDate(): number {
  const stored = localStorage.getItem(TRIAL_START_KEY);
  if (stored) return parseInt(stored, 10);
  const now = Date.now();
  localStorage.setItem(TRIAL_START_KEY, now.toString());
  return now;
}

export function daysRemaining(): number {
  const start = getTrialStartDate();
  const elapsedMs = Date.now() - start;
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  return Math.max(0, TRIAL_DAYS - elapsedDays);
}

export function isTrialExpired(): boolean {
  return daysRemaining() <= 0;
}

export function getSavedPaymentEmail(): string {
  return localStorage.getItem(PAYMENT_EMAIL_KEY) || '';
}

export function savePaymentEmail(email: string): void {
  localStorage.setItem(PAYMENT_EMAIL_KEY, email.trim().toLowerCase());
}

// Firestore doc IDs can't contain certain characters - sanitize the email
export function emailToDocId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}
