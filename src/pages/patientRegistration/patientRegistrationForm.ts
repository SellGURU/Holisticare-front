export const STANDARD_PATIENT_FIELDS = [
  { key: 'firstName', label: 'First name', locked: true, required: true },
  { key: 'lastName', label: 'Last name', locked: true, required: true },
  { key: 'email', label: 'Email', locked: true, required: true },
  { key: 'dateOfBirth', label: 'Date of birth', locked: true, required: true },
  { key: 'gender', label: 'Gender', locked: true, required: true },
  { key: 'phoneNumber', label: 'Phone', locked: false, required: false },
  { key: 'timezone', label: 'Timezone', locked: false, required: false },
] as const;

export type StandardFieldKey = (typeof STANDARD_PATIENT_FIELDS)[number]['key'];

export function standardFieldEnabled(
  fields: Array<{ key?: string; enabled?: boolean }> | undefined,
  key: string,
): boolean {
  if (!fields || fields.length === 0) return true;
  const match = fields.find((field) => field.key === key);
  if (!match) return true;
  return match.enabled !== false;
}

export type StandardPatientInput = {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  timezone: string;
  address: string;
  consent: boolean;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^\+[1-9]\d{7,14}$/;
const NAME_RE =
  /^[A-Za-z\u0600-\u06FF]+(?:-[A-Za-z\u0600-\u06FF]+)*(?:\s[A-Za-z\u0600-\u06FF]+(?:-[A-Za-z\u0600-\u06FF]+)*)*$/;
const MIN_AGE = 18;
const MAX_AGE = 60;

export const PATIENT_GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
] as const;

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function isValidIanaTimezone(value: string): boolean {
  const zone = value.trim();
  if (!zone) return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

function ageInYears(value: string): number | null {
  const date = parseIsoDate(value);
  if (!date) return null;
  const today = new Date();
  let years = today.getFullYear() - date.getFullYear();
  const beforeBirthday =
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
  if (beforeBirthday) years -= 1;
  return years;
}

function enteredPhone(value: string): string {
  const compact = value.replace(/[\s()-]/g, '');
  const digits = compact.replace(/\D/g, '');
  return digits.length > 3 ? compact : '';
}

function isPastOrToday(value: string): boolean {
  const date = parseIsoDate(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() <= today.getTime();
}

export function emptyStandardPatient(timezone = 'Europe/London'): StandardPatientInput {
  return {
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    timezone,
    address: '',
    consent: false,
  };
}

export function validateStandardPatient(
  input: StandardPatientInput,
  requireConsent = true,
  visible: { phoneNumber?: boolean; timezone?: boolean } = {},
): string | null {
  if (!input.firstName.trim() || !input.lastName.trim()) {
    return 'First name and last name are required';
  }
  if (!NAME_RE.test(input.firstName.trim()) || !NAME_RE.test(input.lastName.trim())) {
    return 'First and last name must only contain letters';
  }
  if (!EMAIL_RE.test(input.email.trim())) {
    return 'A valid email is required';
  }
  if (!parseIsoDate(input.dateOfBirth) || !isPastOrToday(input.dateOfBirth)) {
    return 'Choose a valid date of birth that is not in the future';
  }
  const years = ageInYears(input.dateOfBirth);
  if (years == null || years < MIN_AGE || years > MAX_AGE) {
    return 'Age must be between 18 and 60';
  }
  if (input.gender !== 'male' && input.gender !== 'female') {
    return 'Gender must be male or female';
  }
  const phone = enteredPhone(input.phoneNumber);
  if (visible.phoneNumber !== false && phone && !PHONE_RE.test(phone)) {
    return 'Enter a valid phone number with country code';
  }
  if (visible.timezone !== false && !isValidIanaTimezone(input.timezone)) {
    return 'Choose a valid timezone';
  }
  if (requireConsent && !input.consent) {
    return 'Consent is required';
  }
  return null;
}

export function answersFromSurveyRespond(
  respond: Array<{ id?: string; response?: unknown }>,
): Record<string, unknown> {
  const answers: Record<string, unknown> = {};
  for (const item of respond || []) {
    const id = String(item?.id || '').trim();
    if (!id) continue;
    const value = item.response;
    if (value == null || value === '') continue;
    answers[id] = value;
  }
  return answers;
}

export function questionsSignature(questions: unknown): string {
  return JSON.stringify(questions ?? []);
}

export function registrationPayload(
  input: StandardPatientInput,
  answers: Record<string, unknown>,
) {
  return {
    email: input.email.trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    gender: input.gender,
    dateOfBirth: input.dateOfBirth,
    phoneNumber: enteredPhone(input.phoneNumber),
    timezone: input.timezone.trim(),
    address: input.address.trim(),
    answers,
    consent: input.consent,
  };
}
