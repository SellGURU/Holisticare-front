import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import PatientRegistrationApi from '../../api/patientRegistration';
import Circleloader from '../../Components/CircleLoader';
import CustomTimezoneField from '../../Components/CustomTimezoneField/CustomTimezoneField';
import SimpleDatePicker from '../../Components/SimpleDatePicker';
import {
  PATIENT_GENDERS,
  emptyStandardPatient,
  formatIsoDate,
  isValidIanaTimezone,
  parseIsoDate,
  registrationPayload,
  standardFieldEnabled,
  validateStandardPatient,
  type StandardPatientInput,
} from './patientRegistrationForm';
import RegistrationBrandFrame, {
  brandButtonStyle,
  brandFromSources,
  emptyRegistrationBrand,
  type RegistrationBrand,
} from './RegistrationBrandFrame';

type PublicSchema = {
  clinicName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  headline?: string;
  coachPhoto?: string;
  coachName?: string;
  coachTitle?: string;
  coachPhone?: string;
  coachEmail?: string;
  coachWebsite?: string;
  coachSocial?: string;
  locale?: string;
  enabled?: boolean;
  consentText?: string;
  additionalQuestions?: Array<Record<string, unknown>>;
  standardFields?: Array<{ key?: string; enabled?: boolean }>;
  inviteEmail?: string | null;
};

const inputClass =
  'mt-1 w-full min-h-11 rounded-xl border border-Gray-50 px-3 py-2 text-base';

type ExtraQuestion = Record<string, unknown>;

const visibleExtraQuestions = (questions: ExtraQuestion[]) =>
  questions.filter((item) => {
    if (!item || item.hide || '__scoring__' in item) return false;
    return Boolean(String(item.question || item.text || '').trim());
  });

const questionOptions = (question: ExtraQuestion) => {
  const raw = question.options;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        return String(record.label || record.value || record.text || '').trim();
      }
      return String(item ?? '').trim();
    })
    .filter(Boolean);
};

const choiceKind = (type: string, options: string[]) => {
  if (type === 'checkbox' || type === 'check box' || type === 'checkboxes') {
    return 'checkbox';
  }
  if (type === 'multiple_choice' || type === 'multiple choice') {
    return 'multiple_choice';
  }
  if (
    options.length > 0 &&
    (type === 'paragraph' || type === 'text' || type === '')
  ) {
    return 'checkbox';
  }
  return '';
};

const REGISTRATION_EMOJIS = [
  { name: 'Angry', icon: '/images/emoji/angery.gif' },
  { name: 'Sad', icon: '/images/emoji/sad.gif' },
  { name: 'Neutral', icon: '/images/emoji/poker.gif' },
  { name: 'Smile', icon: '/images/emoji/smile.gif' },
  { name: 'Loved', icon: '/images/emoji/love.gif' },
];

const blankAnswer = (value: unknown) => {
  if (value == null || value === '') return true;
  return Array.isArray(value) && value.length === 0;
};
const thisYear = new Date().getFullYear();

const detectedTimezone = () => {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  return isValidIanaTimezone(zone) ? zone : 'Europe/London';
};

export default function PublicPatientRegistration() {
  const { clinicSlug = '', token = '' } = useParams();
  const { t, i18n } = useTranslation('settings');
  const [schema, setSchema] = useState<PublicSchema | null>(null);
  const [brand, setBrand] = useState<RegistrationBrand>(
    emptyRegistrationBrand(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [done, setDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState('');
  const [extraAnswers, setExtraAnswers] = useState<Record<string, unknown>>({});
  const [patient, setPatient] = useState<StandardPatientInput>(
    emptyStandardPatient(detectedTimezone()),
  );
  useEffect(() => {
    document.documentElement.classList.add('public-form-scroll');
    return () =>
      document.documentElement.classList.remove('public-form-scroll');
  }, []);

  useEffect(() => {
    const request = token
      ? PatientRegistrationApi.inviteForm(token)
      : PatientRegistrationApi.publicForm(clinicSlug);
    const brandRequest = clinicSlug
      ? PatientRegistrationApi.publicBrand(clinicSlug).catch(() => null)
      : Promise.resolve(null);
    Promise.all([
      request
        .then((res) => ({ ok: true as const, res }))
        .catch((err) => ({ ok: false as const, err })),
      brandRequest,
    ])
      .then(([formResult, brandResponse]) => {
        const elements = (brandResponse?.data?.brand_elements ||
          null) as Record<string, unknown> | null;
        if (!formResult.ok) {
          setBrand(brandFromSources(elements));
          const detail = formResult.err?.response?.data?.detail;
          setError(
            typeof detail === 'string'
              ? detail
              : 'This registration form is not available.',
          );
          return;
        }
        const data = formResult.res.data as PublicSchema;
        setSchema(data);
        setBrand(brandFromSources(data as Record<string, unknown>, elements));
        if (data.locale) {
          i18n.changeLanguage(String(data.locale).split('-')[0]);
        }
        if (data.inviteEmail) {
          setPatient((current) => ({
            ...current,
            email: data.inviteEmail || '',
          }));
        }
      })
      .finally(() => setLoading(false));
  }, [clinicSlug, token]);

  const submit = async (answers: Record<string, unknown>) => {
    const problem = validateStandardPatient(patient, true, {
      phoneNumber: standardFieldEnabled(schema?.standardFields, 'phoneNumber'),
      timezone: standardFieldEnabled(schema?.standardFields, 'timezone'),
    });
    if (problem) {
      const failure = new Error(problem) as Error & {
        registrationFailed?: boolean;
      };
      failure.registrationFailed = true;
      throw failure;
    }
    const payload = registrationPayload(patient, answers);
    const request = token
      ? PatientRegistrationApi.submitInvite(token, payload)
      : PatientRegistrationApi.submitPublic(clinicSlug, payload);
    try {
      const response = await request;
      const serverMessage = response?.data?.message;
      setDoneMessage(
        typeof serverMessage === 'string' && serverMessage
          ? serverMessage
          : 'Your registration was submitted. The clinic will review it before an account is created.',
      );
      setDone(true);
    } catch (err) {
      const body = err as {
        response?: { data?: { detail?: unknown } };
        detail?: unknown;
        message?: string;
      };
      const detail = body.response?.data?.detail ?? body.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : detail && typeof detail === 'object' && 'message' in detail
            ? String((detail as { message: unknown }).message)
            : body.message || 'Could not complete registration';
      const failure = new Error(message) as Error & {
        registrationFailed?: boolean;
      };
      failure.registrationFailed = true;
      throw failure;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f4f4f4] px-4 text-[#222]">
        <Circleloader />
      </div>
    );
  }

  const page = (body: ReactNode, title?: string) => (
    <div className="min-h-dvh w-full overflow-x-hidden bg-[#f4f4f4] px-3 py-4 text-[#222] sm:px-4 sm:py-8">
      <RegistrationBrandFrame brand={brand} title={title}>
        {body}
      </RegistrationBrandFrame>
    </div>
  );

  if (error || !schema) {
    return page(<div className="text-sm">{error}</div>);
  }

  if (!schema.enabled) {
    return page(
      <div className="text-sm">{t('registration.closed')}</div>,
      t('registration.title'),
    );
  }

  if (done) {
    return page(
      <div className="text-sm">
        {doneMessage ||
          'Your registration was submitted. The clinic will review it before an account is created.'}
      </div>,
      t('registration.title'),
    );
  }

  const questions = visibleExtraQuestions(schema.additionalQuestions || []);
  const buttonStyle = brandButtonStyle(
    brand.primaryColor || schema.primaryColor || '',
  );
  const showPhone = standardFieldEnabled(schema.standardFields, 'phoneNumber');
  const showTimezone = standardFieldEnabled(schema.standardFields, 'timezone');
  const visibleFields = { phoneNumber: showPhone, timezone: showTimezone };

  return page(
    <>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const problem = validateStandardPatient(patient, true, visibleFields);
          if (problem) {
            setFieldError(problem);
            return;
          }
          const missing = questions.find(
            (question) =>
              question.required &&
              blankAnswer(extraAnswers[String(question.id || '')]),
          );
          if (missing) {
            setFieldError('Please answer the required questions');
            return;
          }
          setFieldError('');
          submit(extraAnswers).catch((err: Error) =>
            setFieldError(err.message),
          );
        }}
      >
        <label className="block text-sm">
          First name
          <input
            className={inputClass}
            autoComplete="given-name"
            value={patient.firstName}
            onChange={(event) =>
              setPatient((current) => ({
                ...current,
                firstName: event.target.value,
              }))
            }
          />
        </label>
        <label className="block text-sm">
          Last name
          <input
            className={inputClass}
            autoComplete="family-name"
            value={patient.lastName}
            onChange={(event) =>
              setPatient((current) => ({
                ...current,
                lastName: event.target.value,
              }))
            }
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            disabled={Boolean(schema.inviteEmail)}
            value={patient.email}
            onChange={(event) =>
              setPatient((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
          />
        </label>
        <div className="text-sm">
          Date of birth
          <div className="mt-1">
            <SimpleDatePicker
              full
              isLarge
              date={parseIsoDate(patient.dateOfBirth)}
              placeholder="Select date of birth"
              selectorStartingYear={thisYear - 120}
              selectorEndingYear={thisYear}
              setDate={(date) => {
                if (!date || Number.isNaN(date.getTime())) return;
                const iso = formatIsoDate(date);
                if (!parseIsoDate(iso)) return;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date.getTime() > today.getTime()) {
                  setFieldError(
                    'Choose a valid date of birth that is not in the future',
                  );
                  return;
                }
                setFieldError('');
                setPatient((current) => ({ ...current, dateOfBirth: iso }));
              }}
            />
          </div>
        </div>
        <fieldset className="text-sm">
          <legend>Gender</legend>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
            {PATIENT_GENDERS.map((option) => (
              <label
                key={option.value}
                className="flex min-h-11 items-center gap-3"
              >
                <input
                  type="radio"
                  name="gender"
                  className="h-4 w-4"
                  value={option.value}
                  checked={patient.gender === option.value}
                  onChange={() =>
                    setPatient((current) => ({
                      ...current,
                      gender: option.value,
                    }))
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
        {showPhone && (
          <div className="min-w-0 text-sm">
            Phone
            <div className="mt-1 min-w-0">
              <PhoneInput
                country="us"
                value={patient.phoneNumber.replace(/^\+/, '')}
                onChange={(value) =>
                  setPatient((current) => ({
                    ...current,
                    phoneNumber: value ? `+${value}` : '',
                  }))
                }
                placeholder="234 567 890"
                containerClass="!w-full"
                inputClass="!w-full !h-11 !rounded-xl !text-base"
                buttonClass="!rounded-l-xl"
                inputProps={{ name: 'phone', autoComplete: 'tel' }}
              />
            </div>
          </div>
        )}
        {showTimezone && (
          <div className="min-w-0 text-sm">
            Timezone
            <div className="mt-1">
              <CustomTimezoneField
                value={{ label: patient.timezone, value: patient.timezone }}
                onChange={(zone) => {
                  const next =
                    typeof zone === 'string' ? zone : String(zone?.value || '');
                  if (!isValidIanaTimezone(next)) return;
                  setPatient((current) => ({ ...current, timezone: next }));
                }}
              />
            </div>
          </div>
        )}
        <ExtraQuestions
          questions={questions}
          answers={extraAnswers}
          onChange={(id, value) =>
            setExtraAnswers((current) => ({ ...current, [id]: value }))
          }
        />
        {schema.consentText ? (
          <p className="text-sm leading-6 text-[#666]">{schema.consentText}</p>
        ) : null}
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 shrink-0"
            checked={patient.consent}
            onChange={(event) =>
              setPatient((current) => ({
                ...current,
                consent: event.target.checked,
              }))
            }
          />
          {t('registration.consent')}
        </label>
        {fieldError && <div className="text-sm text-red-600">{fieldError}</div>}
        <button
          type="submit"
          className="min-h-11 w-full rounded-full px-4 py-3 text-base sm:w-auto"
          style={buttonStyle}
        >
          {t('registration.register')}
        </button>
      </form>
    </>,
    t('registration.title'),
  );
}

const ExtraQuestions = ({
  questions,
  answers,
  onChange,
}: {
  questions: ExtraQuestion[];
  answers: Record<string, unknown>;
  onChange: (id: string, value: unknown) => void;
}) => {
  const { t } = useTranslation('settings');
  if (questions.length === 0) return null;
  return (
    <div className="space-y-3 border-t border-[#E6EEF2] pt-4">
      {questions.map((question, index) => {
        const id = String(question.id || '');
        const label = String(question.question || question.text || '');
        const type = String(question.type || 'paragraph').toLowerCase();
        const options = questionOptions(question);
        const choices = choiceKind(type, options);
        const value = answers[id];
        return (
          <div
            key={id || label}
            className="rounded-2xl border border-[#E4E7EC] bg-[#F9FAFB] px-4 py-3 text-sm"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#E4E7EC] bg-white text-[11px] font-medium text-[#344054]">
                {index + 1}
              </span>
              <div className="font-medium leading-6 text-[#101828]">
                {label}
                {question.required ? ' *' : ''}
              </div>
            </div>
            {(type === 'paragraph' || type === 'text') && choices === '' && (
              <textarea
                className={`${inputClass} min-h-24`}
                value={typeof value === 'string' ? value : ''}
                onChange={(event) => onChange(id, event.target.value)}
              />
            )}
            {type === 'number' && (
              <input
                type="number"
                className={inputClass}
                value={
                  typeof value === 'string' || typeof value === 'number'
                    ? String(value)
                    : ''
                }
                onChange={(event) => onChange(id, event.target.value)}
              />
            )}
            {(type === 'yes/no' || type === 'yes_no') && (
              <div className="mt-2 flex flex-col gap-2">
                {['Yes', 'No'].map((option) => (
                  <label
                    key={option}
                    className="flex min-h-11 items-center gap-3"
                  >
                    <input
                      type="radio"
                      name={id}
                      className="h-4 w-4"
                      checked={value === option}
                      onChange={() => onChange(id, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
            {choices === 'multiple_choice' && (
              <div className="mt-2 flex flex-col gap-2">
                {options.map((option) => (
                  <label
                    key={option}
                    className="flex min-h-11 items-center gap-3"
                  >
                    <input
                      type="radio"
                      name={id}
                      className="h-4 w-4"
                      checked={value === option}
                      onChange={() => onChange(id, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
            {choices === 'checkbox' && (
              <div className="mt-2 flex flex-col gap-2">
                {options.map((option) => {
                  const selected = Array.isArray(value)
                    ? value.map(String)
                    : [];
                  return (
                    <label
                      key={option}
                      className="flex min-h-11 items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selected.includes(option)}
                        onChange={() =>
                          onChange(
                            id,
                            selected.includes(option)
                              ? selected.filter((item) => item !== option)
                              : [...selected, option],
                          )
                        }
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            )}
            {type === 'scale' && (
              <input
                type="range"
                min={1}
                max={10}
                className="mt-3 w-full"
                value={typeof value === 'number' ? value : 1}
                onChange={(event) => onChange(id, Number(event.target.value))}
              />
            )}
            {type === 'star rating' && (
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    className={`h-11 w-11 rounded-full border text-sm ${
                      value === score
                        ? 'border-Primary-DeepTeal bg-Primary-DeepTeal text-white'
                        : 'border-[#E6EEF2]'
                    }`}
                    onClick={() => onChange(id, score)}
                  >
                    {score}
                  </button>
                ))}
              </div>
            )}
            {type === 'emojis' && (
              <div className="mt-2 flex flex-wrap gap-2">
                {REGISTRATION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji.name}
                    type="button"
                    className={`rounded-xl border p-1 ${
                      value === emoji.name
                        ? 'border-Primary-DeepTeal'
                        : 'border-[#E6EEF2]'
                    }`}
                    onClick={() => onChange(id, emoji.name)}
                  >
                    <img
                      src={emoji.icon}
                      alt={emoji.name}
                      className="h-10 w-10"
                    />
                  </button>
                ))}
              </div>
            )}
            {type === 'file uploader' && (
              <p className="mt-2 text-xs text-[#667085]">
                {t('registration.fileUnsupported')}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
