import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PatientRegistrationApi from '../../api/patientRegistration';
import { fetchBrandInfo } from '../../utils/brandInfoCache';
import Circleloader from '../../Components/CircleLoader';
import EnabledSwitch from '../../Components/EnabledSwitch';
import MainModal from '../../Components/MainModal';
import { copyText } from '../../utils/clipboard';
import {
  PATIENT_GENDERS,
  STANDARD_PATIENT_FIELDS,
} from './patientRegistrationForm';
import RegistrationBrandFrame, {
  brandButtonStyle,
  brandFromSources,
  emptyRegistrationBrand,
  type RegistrationBrand,
} from './RegistrationBrandFrame';

type Section = 'form' | 'access' | 'api' | 'records';
type FormTab = 'form' | 'preview';

type Settings = {
  enabled: boolean;
  publicSlug: string;
  publicUrl: string;
  schemaVersion: number;
  sendWelcomeEmail: boolean;
  consentText: string;
  additionalQuestions: QuestionaryType[];
  disabledStandardFields: string[];
};

const emptySettings = (): Settings => ({
  enabled: true,
  publicSlug: '',
  publicUrl: '',
  schemaVersion: 1,
  sendWelcomeEmail: true,
  consentText: '',
  additionalQuestions: [],
  disabledStandardFields: [],
});

const plainQuestion = (
  question: Partial<QuestionaryType> | undefined,
  index: number,
): QuestionaryType => {
  const kind = String(question?.type || '').toLowerCase();
  return {
    id: String(question?.id || `field-${index + 1}`),
    question: String(question?.question || ''),
    type: kind.includes('yes') ? 'Yes/No' : 'Paragraph',
    required: Boolean(question?.required),
    order: index + 1,
    hide: false,
    response: '',
    options: [],
    conditions: [],
    is_biomarker: false,
    map_to_biomarker: '',
    use_in_insight: false,
    use_in_insights: false,
    use_function_calculation: false,
    is_goal: false,
    is_medication: false,
    is_condition: false,
    is_allergy: false,
    skip_validation: false,
    unit: '',
  } as QuestionaryType;
};

const registrationPublicUrl = (slug: string) => {
  const cleaned = slug.trim();
  if (!cleaned) return '';
  return `${window.location.origin}/patient-registration/${encodeURIComponent(cleaned)}`;
};

const readSettings = (
  data: Record<string, unknown>,
  brandSlug = '',
): Settings => {
  const slug = String(
    data.publicSlug || data.public_slug || brandSlug || '',
  ).trim();
  const questions = data.additionalQuestions || data.additional_questions;
  return {
    enabled: data.enabled !== false,
    publicSlug: slug,
    publicUrl: registrationPublicUrl(slug),
    schemaVersion: Number(data.schemaVersion || data.schema_version || 1) || 1,
    sendWelcomeEmail:
      data.sendWelcomeEmail !== false && data.send_welcome_email !== false,
    consentText: String(data.consentText || data.consent_text || ''),
    additionalQuestions: Array.isArray(questions) ? questions : [],
    disabledStandardFields: Array.isArray(data.disabledStandardFields)
      ? data.disabledStandardFields.map((item) => String(item))
      : Array.isArray(data.disabled_standard_fields)
        ? data.disabled_standard_fields.map((item) => String(item))
        : [],
  };
};

const snapshot = (value: Settings) =>
  JSON.stringify({
    enabled: value.enabled,
    sendWelcomeEmail: value.sendWelcomeEmail,
    consentText: value.consentText,
    publicSlug: value.publicSlug,
    additionalQuestions: value.additionalQuestions,
    disabledStandardFields: value.disabledStandardFields,
  });

const errorText = (err: unknown, fallback: string) => {
  const body = err as {
    response?: { data?: { detail?: unknown } };
    detail?: unknown;
    message?: string;
  };
  const detail = body.response?.data?.detail ?? body.detail;
  if (typeof detail === 'string' && detail) return detail;
  if (detail && typeof detail === 'object' && 'message' in detail) {
    return String((detail as { message: unknown }).message);
  }
  if (typeof body.message === 'string' && body.message) return body.message;
  return fallback;
};

const cardClass =
  'rounded-2xl border border-[#E6EEF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]';

const ClinicPatientRegistration = () => {
  const { t } = useTranslation('settings');
  const [section, setSection] = useState<Section>('form');
  const [formTab, setFormTab] = useState<FormTab>('form');
  const [loading, setLoading] = useState(true);
  const [linkError, setLinkError] = useState('');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>(emptySettings());
  const [fieldDraft, setFieldDraft] = useState<{
    id: string;
    question: string;
    required: boolean;
    type: 'Paragraph' | 'Yes/No';
    isNew: boolean;
  } | null>(null);
  const [fieldError, setFieldError] = useState('');
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot(emptySettings()));
  const [secret, setSecret] = useState('');
  const [keys, setKeys] = useState<Array<Record<string, string | null>>>([]);
  const [emails, setEmails] = useState('');
  const [invites, setInvites] = useState<
    Array<Record<string, string | number | null>>
  >([]);
  const [submissions, setSubmissions] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [brand, setBrand] = useState<RegistrationBrand>(
    emptyRegistrationBrand(),
  );

  const text = (key: string) => t(`registration.${key}`);
  const questions = settings.additionalQuestions.filter(
    (item) => item && !('__scoring__' in item),
  );
  const dirty = useMemo(
    () => snapshot(settings) !== savedSnapshot,
    [settings, savedSnapshot],
  );

  const applySettings = (data: Record<string, unknown>, brandSlug = '') => {
    const next = readSettings(data, brandSlug);
    setSettings(next);
    setSavedSnapshot(snapshot(next));
    return next;
  };

  useEffect(() => {
    setLoading(true);
    const brandSlug = fetchBrandInfo()
      .then((res) => {
        const elements = (res.brand_elements || {}) as Record<string, unknown>;
        setBrand(brandFromSources(elements));
        return String(elements.slug || '').trim();
      })
      .catch(() => '');
    Promise.all([PatientRegistrationApi.getSettings(), brandSlug])
      .then(([res, slug]) => {
        const body = (res.data || {}) as Record<string, unknown>;
        const serverSlug = String(
          body.publicSlug || body.public_slug || '',
        ).trim();
        const next = applySettings(body, slug);
        setLinkError('');
        if (!serverSlug && next.publicSlug) {
          PatientRegistrationApi.updateSettings({
            enabled: next.enabled,
            sendWelcomeEmail: next.sendWelcomeEmail,
            consentText: next.consentText,
            publicSlug: next.publicSlug,
            additionalQuestions: next.additionalQuestions,
            disabledStandardFields: next.disabledStandardFields,
          })
            .then((saved) =>
              applySettings(
                (saved.data || {}) as Record<string, unknown>,
                slug,
              ),
            )
            .catch((err) =>
              setLinkError(errorText(err, 'Could not publish the form')),
            );
        }
      })
      .catch((err) => {
        const message = errorText(err, 'Could not load registration settings');
        setLinkError(message);
        toast.error(message);
        brandSlug.then((slug) => {
          if (slug) applySettings({}, slug);
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (section === 'api') {
      PatientRegistrationApi.listApiKeys()
        .then((res) => setKeys(res.data?.keys || []))
        .catch((err) => toast.error(errorText(err, 'Could not load API keys')));
    }
    if (section === 'access') {
      PatientRegistrationApi.listInvites()
        .then((res) => setInvites(res.data?.invites || []))
        .catch((err) =>
          toast.error(errorText(err, 'Could not load invitations')),
        );
    }
    if (section === 'records') {
      PatientRegistrationApi.listSubmissions()
        .then((res) => setSubmissions(res.data?.submissions || []))
        .catch((err) =>
          toast.error(errorText(err, 'Could not load registrations')),
        );
    }
  }, [section]);

  const publish = (next = settings) => {
    setSaving(true);
    return PatientRegistrationApi.updateSettings({
      enabled: next.enabled,
      sendWelcomeEmail: next.sendWelcomeEmail,
      consentText: next.consentText,
      publicSlug: next.publicSlug,
      additionalQuestions: next.additionalQuestions
        .filter(
          (item) =>
            item &&
            !('__scoring__' in item) &&
            String(item.question || '').trim(),
        )
        .map((item, index) => plainQuestion(item, index)),
      disabledStandardFields: next.disabledStandardFields,
    })
      .then((res) => {
        applySettings({ ...next, ...(res.data || {}) });
        toast.success(text('saved'));
      })
      .catch((err) => {
        toast.error(errorText(err, 'Could not publish the form'));
        throw err;
      })
      .finally(() => setSaving(false));
  };

  const sections: Array<{ id: Section; label: string; hint: string }> = [
    { id: 'form', label: text('groupForm'), hint: text('groupFormHelp') },
    { id: 'access', label: text('groupAccess'), hint: text('groupAccessHelp') },
    { id: 'api', label: text('groupApi'), hint: text('groupApiHelp') },
    {
      id: 'records',
      label: text('groupRecords'),
      hint: text('groupRecordsHelp'),
    },
  ];

  const formTabs: Array<{ id: FormTab; label: string }> = [
    { id: 'form', label: text('groupForm') },
    { id: 'preview', label: text('previewTitle') },
  ];
  const showPublish = section === 'form' || section === 'access';

  return (
    <div className="min-h-full bg-[#F7F8FA] px-3 py-4 text-Text-Primary md:px-6">
      <div className="sticky top-0 z-20 -mx-3 border-b border-[#E6EEF2] bg-[#F7F8FA] px-3 pb-3 md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-medium">{text('title')}</h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-[#667085]">
              {text('intro')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span
              className={`rounded-full px-3 py-1 ${
                settings.enabled
                  ? 'bg-[#E7F6EE] text-[#0F7A45]'
                  : 'bg-[#F2F4F7] text-[#667085]'
              }`}
            >
              {settings.enabled ? text('enabled') : text('closed')}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[#667085]">
              {t('registration.version', { version: settings.schemaVersion })}
              {dirty && showPublish ? ` · ${text('unpublished')}` : ''}
            </span>
            {showPublish && (
              <button
                type="button"
                disabled={saving || loading}
                onClick={() => publish()}
                className="rounded-full bg-Primary-DeepTeal px-4 py-2 text-xs text-white disabled:opacity-60"
              >
                {text('publish')}
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[320px] items-center justify-center">
          <Circleloader />
        </div>
      ) : (
        <div className="mt-5 grid items-start gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {sections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`min-w-[180px] rounded-2xl border px-4 py-3 text-start lg:min-w-0 ${
                  section === item.id
                    ? 'border-Primary-DeepTeal bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
                    : 'border-transparent bg-transparent'
                }`}
              >
                <div
                  className={`text-sm font-medium ${
                    section === item.id
                      ? 'text-Primary-DeepTeal'
                      : 'text-Text-Primary'
                  }`}
                >
                  {item.label}
                </div>
                <div className="mt-1 text-[11px] leading-4 text-[#667085]">
                  {item.hint}
                </div>
              </button>
            ))}
          </nav>

          <div className="space-y-4">
            {section === 'form' && (
              <div className="overflow-hidden rounded-2xl border border-[#E6EEF2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <div className="flex border-b border-[#E6EEF2]" role="tablist">
                  {formTabs.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={formTab === item.id}
                      onClick={() => setFormTab(item.id)}
                      className={`-mb-px border-b-2 px-5 py-3 text-sm ${
                        formTab === item.id
                          ? 'border-Primary-DeepTeal font-medium text-Primary-DeepTeal'
                          : 'border-transparent text-[#667085]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-8 p-5" role="tabpanel">
                  {formTab === 'form' && (
                    <>
                      <section>
                        <div className="text-sm font-medium">
                          {text('groupForm')}
                        </div>
                        <div className="mt-4 space-y-3">
                          <ToggleRow
                            checked={settings.enabled}
                            label={text('enabled')}
                            onChange={(enabled) =>
                              setSettings((current) => ({
                                ...current,
                                enabled,
                              }))
                            }
                          />
                          <ToggleRow
                            checked={settings.sendWelcomeEmail}
                            label={text('welcome')}
                            onChange={(sendWelcomeEmail) =>
                              setSettings((current) => ({
                                ...current,
                                sendWelcomeEmail,
                              }))
                            }
                          />
                        </div>
                      </section>
                      <section>
                        <div className="text-sm font-medium">
                          {text('locked')}
                        </div>
                        <p className="mt-1 text-xs text-[#667085]">
                          {text('lockedHelp')}
                        </p>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {STANDARD_PATIENT_FIELDS.map((field) => {
                            const enabled =
                              !settings.disabledStandardFields.includes(
                                field.key,
                              );
                            return (
                              <div
                                key={field.key}
                                className={`flex items-center justify-between gap-3 rounded-xl bg-[#F7F8FA] px-3 py-2.5 ${
                                  enabled ? '' : 'opacity-60'
                                }`}
                              >
                                <span className="text-xs">{field.label}</span>
                                {field.locked ? (
                                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#667085]">
                                    {text('required')}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2">
                                    <span className="text-[10px] text-[#667085]">
                                      {text('optional')}
                                    </span>
                                    <EnabledSwitch
                                      enabled={enabled}
                                      title={field.label}
                                      onChange={(next) =>
                                        setSettings((current) => ({
                                          ...current,
                                          disabledStandardFields: next
                                            ? current.disabledStandardFields.filter(
                                                (key) => key !== field.key,
                                              )
                                            : [
                                                ...current.disabledStandardFields,
                                                field.key,
                                              ],
                                        }))
                                      }
                                    />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                      <section>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium">
                              {text('additional')}
                            </div>
                            <p className="mt-1 max-w-xl text-xs leading-5 text-[#667085]">
                              {text('questionnaireHelp')}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFieldError('');
                              setFieldDraft({
                                id: `field-${Date.now()}`,
                                question: '',
                                required: false,
                                type: 'Paragraph',
                                isNew: true,
                              });
                            }}
                            className="rounded-full bg-Primary-DeepTeal px-4 py-2 text-xs text-white"
                          >
                            {text('addQuestion')}
                          </button>
                        </div>
                        <div className="mt-4 space-y-2">
                          {questions.length === 0 && (
                            <div className="rounded-xl border border-dashed border-[#D0D5DD] px-4 py-6 text-center text-xs text-[#667085]">
                              {text('noQuestions')}
                            </div>
                          )}
                          {questions.map((question, index) => (
                            <div
                              key={question.id || index}
                              className="flex items-start gap-3 rounded-xl border border-[#EEF2F4] px-3 py-3"
                            >
                              <button
                                type="button"
                                className="flex min-w-0 flex-1 items-start gap-3 text-start"
                                onClick={() => {
                                  setFieldError('');
                                  setFieldDraft({
                                    id: String(
                                      question.id || `field-${index + 1}`,
                                    ),
                                    question: question.question || '',
                                    required: Boolean(question.required),
                                    type: String(question.type || '')
                                      .toLowerCase()
                                      .includes('yes')
                                      ? 'Yes/No'
                                      : 'Paragraph',
                                    isNew: false,
                                  });
                                }}
                              >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6EEF5] text-[11px] font-medium text-Primary-DeepTeal">
                                  {index + 1}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm">
                                    {question.question}
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[#667085]">
                                    <span className="rounded-full bg-[#F4F7F8] px-2 py-0.5">
                                      {String(question.type || '')
                                        .toLowerCase()
                                        .includes('yes')
                                        ? text('fieldYesNo')
                                        : text('fieldText')}
                                    </span>
                                    {question.required && (
                                      <span>{text('required')}</span>
                                    )}
                                  </div>
                                </div>
                              </button>
                              <button
                                type="button"
                                className="text-xs text-[#B42318]"
                                onClick={() =>
                                  setSettings((current) => ({
                                    ...current,
                                    additionalQuestions:
                                      current.additionalQuestions.filter(
                                        (item) => item.id !== question.id,
                                      ),
                                  }))
                                }
                              >
                                {text('removeField')}
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    </>
                  )}
                  {formTab === 'preview' && (
                    <FormPreview
                      title={text('previewTitle')}
                      help={text('previewHelp')}
                      formTitle={text('title')}
                      consentText={settings.consentText}
                      consentLabel={text('consent')}
                      registerLabel={text('register')}
                      questions={questions}
                      brand={brand}
                      hiddenFields={settings.disabledStandardFields}
                      plain
                    />
                  )}
                </div>
              </div>
            )}

            {section === 'access' && (
              <>
                <section className={cardClass}>
                  <div className="text-sm font-medium">
                    {text('publicLink')}
                  </div>
                  <label className="mt-4 block text-xs">
                    {text('slug')}
                    <input
                      className="mt-1 w-full rounded-xl border border-[#E6EEF2] px-3 py-2"
                      value={settings.publicSlug}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          publicSlug: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="mt-3 min-h-16 select-all break-all rounded-xl bg-[#F7F8FA] px-3 py-3 text-sm leading-6">
                    {registrationPublicUrl(settings.publicSlug) ||
                      linkError ||
                      '—'}
                  </div>
                  <div className="mt-3 flex gap-3 text-xs">
                    <button
                      type="button"
                      className="text-Primary-DeepTeal"
                      onClick={() =>
                        copyText(
                          registrationPublicUrl(settings.publicSlug),
                        ).then((ok) => {
                          if (ok) toast.success(text('copied'));
                        })
                      }
                    >
                      {text('copy')}
                    </button>
                    {registrationPublicUrl(settings.publicSlug) ? (
                      <a
                        className="text-Primary-DeepTeal"
                        href={registrationPublicUrl(settings.publicSlug)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {text('preview')}
                      </a>
                    ) : null}
                  </div>
                </section>

                <section className={cardClass}>
                  <div className="text-sm font-medium">{text('emails')}</div>
                  <p className="mt-1 text-xs text-[#667085]">
                    {text('emailsHelp')}
                  </p>
                  <textarea
                    className="mt-4 w-full rounded-xl border border-[#E6EEF2] px-3 py-2 text-xs"
                    rows={3}
                    placeholder="one@clinic.com, two@clinic.com"
                    value={emails}
                    onChange={(event) => setEmails(event.target.value)}
                  />
                  <button
                    type="button"
                    className="mt-3 rounded-full bg-Primary-DeepTeal px-4 py-2 text-xs text-white"
                    onClick={() => {
                      const list = emails
                        .split(/[\s,;]+/)
                        .map((item) => item.trim())
                        .filter(Boolean);
                      PatientRegistrationApi.createInvites(list)
                        .then(() => PatientRegistrationApi.listInvites())
                        .then((res) => {
                          setInvites(res.data?.invites || []);
                          setEmails('');
                          toast.success(text('send'));
                        })
                        .catch((err) =>
                          toast.error(
                            errorText(err, 'Could not send invitations'),
                          ),
                        );
                    }}
                  >
                    {text('send')}
                  </button>
                  <div className="mt-4 divide-y divide-[#EEF2F4]">
                    {invites.map((invite) => (
                      <div
                        key={String(invite.id)}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"
                      >
                        <div>
                          <div>{invite.email}</div>
                          <div className="mt-1 text-[#667085]">
                            {invite.status} · {invite.expiresAt}
                          </div>
                        </div>
                        <div className="flex gap-3 text-Primary-DeepTeal">
                          <button
                            type="button"
                            onClick={() =>
                              PatientRegistrationApi.resendInvite(
                                String(invite.id),
                              ).then((res) => {
                                if (res.data?.invite?.link) {
                                  copyText(res.data.invite.link);
                                  toast.success(text('copied'));
                                }
                              })
                            }
                          >
                            {text('resend')}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              PatientRegistrationApi.revokeInvite(
                                String(invite.id),
                              )
                                .then(() =>
                                  PatientRegistrationApi.listInvites(),
                                )
                                .then((res) =>
                                  setInvites(res.data?.invites || []),
                                )
                            }
                          >
                            {text('revoke')}
                          </button>
                        </div>
                      </div>
                    ))}
                    {invites.length === 0 && (
                      <div className="py-4 text-xs text-[#667085]">
                        {text('empty')}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {section === 'api' && (
              <section className={cardClass}>
                <div className="text-sm font-medium">{text('keys')}</div>
                <p className="mt-1 text-xs text-[#667085]">
                  {text('groupApiHelp')}
                </p>
                {keys[0] ? (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F7F8FA] px-3 py-3 text-xs">
                    <div>
                      <div className="font-medium">{keys[0].name}</div>
                      <div className="mt-1 text-[#667085]">
                        {keys[0].prefix}…
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-Primary-DeepTeal px-4 py-2 text-xs text-white"
                      onClick={() =>
                        PatientRegistrationApi.rotateApiKey(String(keys[0].id))
                          .then((res) => {
                            setSecret(res.data?.key?.secret || '');
                            return PatientRegistrationApi.listApiKeys();
                          })
                          .then((list) => setKeys(list.data?.keys || []))
                          .catch((err) =>
                            toast.error(
                              errorText(
                                err,
                                'Could not regenerate the API key',
                              ),
                            ),
                          )
                      }
                    >
                      {text('rotate')}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="mt-4 rounded-full bg-Primary-DeepTeal px-4 py-2 text-xs text-white"
                    onClick={() =>
                      PatientRegistrationApi.createApiKey('Clinic key')
                        .then((res) => {
                          setSecret(res.data?.key?.secret || '');
                          return PatientRegistrationApi.listApiKeys();
                        })
                        .then((res) => setKeys(res.data?.keys || []))
                        .catch((err) =>
                          toast.error(
                            errorText(err, 'Could not create an API key'),
                          ),
                        )
                    }
                  >
                    {text('createKey')}
                  </button>
                )}
                {secret && (
                  <div className="mt-4 rounded-xl border border-Primary-DeepTeal bg-[#F4FBFA] p-4 text-xs">
                    <div>{text('secretOnce')}</div>
                    <code className="mt-2 block break-all">{secret}</code>
                    <button
                      type="button"
                      className="mt-2 text-Primary-DeepTeal"
                      onClick={() =>
                        copyText(secret).then(() =>
                          toast.success(text('copied')),
                        )
                      }
                    >
                      {text('copyKey')}
                    </button>
                  </div>
                )}
              </section>
            )}

            {section === 'records' && (
              <RecordsSection
                title={text('submissions')}
                help={text('groupRecordsHelp')}
                emptyLabel={text('empty')}
                sourceLabel={text('source')}
                reviewLabel={text('review')}
                approveLabel={text('approve')}
                declineLabel={text('decline')}
                formLabel={text('submittedForm')}
                statusLabel={(status) => text(status || 'pending')}
                submissions={submissions}
                questions={settings.additionalQuestions}
                selectedId={selectedSubmissionId}
                busy={reviewing}
                onSelect={setSelectedSubmissionId}
                onApprove={(id) => {
                  setReviewing(true);
                  PatientRegistrationApi.approveSubmission(id)
                    .then(() => PatientRegistrationApi.listSubmissions())
                    .then((res) => {
                      setSubmissions(res.data?.submissions || []);
                      toast.success(text('accepted'));
                    })
                    .catch((err) =>
                      toast.error(
                        errorText(err, 'Could not approve this registration'),
                      ),
                    )
                    .finally(() => setReviewing(false));
                }}
                onDecline={(id) => {
                  setReviewing(true);
                  PatientRegistrationApi.declineSubmission(id)
                    .then(() => PatientRegistrationApi.listSubmissions())
                    .then((res) => {
                      setSubmissions(res.data?.submissions || []);
                      toast.success(text('declined'));
                    })
                    .catch((err) =>
                      toast.error(
                        errorText(err, 'Could not decline this registration'),
                      ),
                    )
                    .finally(() => setReviewing(false));
                }}
              />
            )}
          </div>
        </div>
      )}

      {fieldDraft && (
        <MainModal
          isOpen
          onClose={() => {
            setFieldDraft(null);
            setFieldError('');
          }}
        >
          <div className="w-[min(92vw,420px)] rounded-2xl bg-white p-5">
            <div className="text-sm font-medium">
              {fieldDraft.isNew ? text('addQuestion') : text('editQuestion')}
            </div>
            <label className="mt-4 block text-xs">
              {text('fieldPrompt')}
              <input
                className="mt-1 w-full rounded-xl border border-[#E6EEF2] px-3 py-2 text-sm"
                value={fieldDraft.question}
                autoFocus
                onChange={(event) =>
                  setFieldDraft((current) =>
                    current
                      ? { ...current, question: event.target.value }
                      : current,
                  )
                }
              />
            </label>
            <div className="mt-4 flex items-center justify-between gap-3 text-xs">
              <span>{text('required')}</span>
              <EnabledSwitch
                enabled={fieldDraft.required}
                title={text('required')}
                onChange={(next) =>
                  setFieldDraft((current) =>
                    current ? { ...current, required: next } : current,
                  )
                }
              />
            </div>
            <label className="mt-4 block text-xs">
              {text('fieldType')}
              <select
                className="mt-1 w-full rounded-xl border border-[#E6EEF2] bg-white px-3 py-2 text-sm"
                value={fieldDraft.type}
                onChange={(event) =>
                  setFieldDraft((current) =>
                    current
                      ? {
                          ...current,
                          type:
                            event.target.value === 'Yes/No'
                              ? 'Yes/No'
                              : 'Paragraph',
                        }
                      : current,
                  )
                }
              >
                <option value="Paragraph">{text('fieldText')}</option>
                <option value="Yes/No">{text('fieldYesNo')}</option>
              </select>
            </label>
            {fieldError && (
              <div className="mt-3 text-xs text-[#B42318]">{fieldError}</div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-[#D0D5DD] px-4 py-2 text-xs"
                onClick={() => {
                  setFieldDraft(null);
                  setFieldError('');
                }}
              >
                {text('cancel')}
              </button>
              <button
                type="button"
                className="rounded-full bg-Primary-DeepTeal px-4 py-2 text-xs text-white"
                onClick={() => {
                  const question = fieldDraft.question.trim();
                  if (!question) {
                    setFieldError(text('fieldRequired'));
                    return;
                  }
                  setSettings((current) => {
                    const next = plainQuestion(
                      { ...fieldDraft, question },
                      current.additionalQuestions.length,
                    );
                    return {
                      ...current,
                      additionalQuestions: fieldDraft.isNew
                        ? [...current.additionalQuestions, next]
                        : current.additionalQuestions.map((item) =>
                            item.id === fieldDraft.id
                              ? { ...item, ...next, id: item.id }
                              : item,
                          ),
                    };
                  });
                  setFieldDraft(null);
                  setFieldError('');
                }}
              >
                {fieldDraft.isNew ? text('addQuestion') : text('saveField')}
              </button>
            </div>
          </div>
        </MainModal>
      )}
    </div>
  );
};

const RecordsSection = ({
  title,
  help,
  emptyLabel,
  sourceLabel,
  reviewLabel,
  approveLabel,
  declineLabel,
  formLabel,
  statusLabel,
  submissions,
  questions,
  selectedId,
  busy,
  onSelect,
  onApprove,
  onDecline,
}: {
  title: string;
  help: string;
  emptyLabel: string;
  sourceLabel: string;
  reviewLabel: string;
  approveLabel: string;
  declineLabel: string;
  formLabel: string;
  statusLabel: (status: string) => string;
  submissions: Array<Record<string, unknown>>;
  questions: QuestionaryType[];
  selectedId: string;
  busy: boolean;
  onSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
}) => {
  return (
    <section className={cardClass}>
      <div className="text-sm font-medium">{title}</div>
      <p className="mt-1 text-xs text-[#667085]">{help}</p>
      <div className="mt-4 space-y-2">
        {submissions.map((item) => {
          const id = String(item.id);
          const open = id === selectedId;
          const itemStatus = String(item.status || 'accepted');
          const application = (item.application || {}) as Record<
            string,
            unknown
          >;
          const answers = (item.answers || {}) as Record<string, unknown>;
          const fields = [
            ['First name', application.firstName || item.firstName],
            ['Last name', application.lastName || item.lastName],
            ['Email', application.email || item.email],
            ['Date of birth', application.dateOfBirth],
            ['Gender', application.gender],
            ['Phone', application.phoneNumber],
            ['Timezone', application.timezone],
          ].filter(([, value]) => String(value || '').trim());
          return (
            <div
              key={id}
              className={`rounded-xl border ${
                open ? 'border-Primary-DeepTeal' : 'border-[#EEF2F4]'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(open ? '' : id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start"
              >
                <span>
                  <span className="block text-sm font-medium">
                    {String(item.firstName || '')} {String(item.lastName || '')}
                  </span>
                  <span className="mt-1 block text-xs text-[#667085]">
                    {String(item.email || '')} · {sourceLabel}{' '}
                    {String(item.source || '')}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-[#F4F7F8] px-2 py-1 text-[11px] text-[#667085]">
                  {statusLabel(itemStatus)}
                </span>
              </button>
              {open && (
                <div className="border-t border-[#E6EEF2] px-4 py-3">
                  <div className="text-sm font-medium">{formLabel}</div>
                  <div className="mt-3 space-y-2">
                    {fields.map(([label, value]) => (
                      <div key={String(label)} className="text-xs">
                        <span className="text-[#667085]">{String(label)}: </span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                    {Object.entries(answers).map(([answerId, value]) => {
                      const question = questions.find(
                        (entry) => entry.id === answerId,
                      );
                      const shown = Array.isArray(value)
                        ? value.join(', ')
                        : String(value ?? '');
                      return (
                        <div key={answerId} className="text-xs">
                          <span className="text-[#667085]">
                            {question?.question || reviewLabel}:{' '}
                          </span>
                          <span>{shown}</span>
                        </div>
                      );
                    })}
                  </div>
                  {itemStatus === 'pending' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onApprove(id)}
                        className="rounded-full bg-Primary-DeepTeal px-4 py-2 text-xs text-white disabled:opacity-60"
                      >
                        {approveLabel}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onDecline(id)}
                        className="rounded-full border border-[#D0D5DD] px-4 py-2 text-xs disabled:opacity-60"
                      >
                        {declineLabel}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {submissions.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-xs text-[#667085]">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
};

const ToggleRow = ({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F7F8FA] px-3 py-3 text-xs">
    <span>{label}</span>
    <EnabledSwitch enabled={checked} title={label} onChange={onChange} />
  </div>
);

const fieldInput = (key: string) => {
  if (key === 'gender') {
    return (
      <div className="mt-2 flex flex-wrap gap-4">
        {PATIENT_GENDERS.map((option) => (
          <span
            key={option.value}
            className="flex items-center gap-2 text-[11px] text-[#667085]"
          >
            <span className="h-3.5 w-3.5 rounded-full border border-[#D0D5DD] bg-white" />
            {option.label}
          </span>
        ))}
      </div>
    );
  }
  if (key === 'dateOfBirth') {
    return (
      <div className="mt-1 flex h-9 items-center justify-between rounded-xl border border-[#E6EEF2] bg-[#F7F8FA] px-3 text-[11px] text-[#98A2B3]">
        Select date of birth
        <span className="h-3.5 w-3.5 rounded-sm border border-[#D0D5DD]" />
      </div>
    );
  }
  if (key === 'timezone' || key === 'phoneNumber') {
    return (
      <div className="mt-1 flex h-9 items-center rounded-xl border border-[#E6EEF2] bg-[#F7F8FA] px-3 text-[11px] text-[#98A2B3]">
        {key === 'timezone' ? 'Select timezone' : 'Select country and number'}
      </div>
    );
  }
  return (
    <div className="mt-1 h-9 rounded-xl border border-[#E6EEF2] bg-[#F7F8FA]" />
  );
};

const QuestionPreview = ({ question }: { question: QuestionaryType }) => {
  const type = String(question.type || '').toLowerCase();
  const options = question.options || [];
  if (type.includes('yes')) {
    return (
      <div className="mt-2 flex gap-2">
        {['Yes', 'No'].map((option) => (
          <span
            key={option}
            className="rounded-full border border-[#E6EEF2] bg-[#F7F8FA] px-3 py-1 text-[11px] text-[#667085]"
          >
            {option}
          </span>
        ))}
      </div>
    );
  }
  if (options.length > 0) {
    return (
      <div className="mt-2 space-y-1.5">
        {options.map((option) => (
          <div
            key={option}
            className="flex items-center gap-2 text-[11px] text-[#667085]"
          >
            <span className="h-3.5 w-3.5 rounded border border-[#D0D5DD] bg-white" />
            {option}
          </div>
        ))}
      </div>
    );
  }
  if (type.includes('paragraph') || type.includes('long')) {
    return (
      <div className="mt-2 h-16 rounded-xl border border-[#E6EEF2] bg-[#F7F8FA]" />
    );
  }
  return (
    <div className="mt-2 h-9 rounded-xl border border-[#E6EEF2] bg-[#F7F8FA]" />
  );
};

const FormPreview = ({
  title,
  help,
  formTitle,
  consentText,
  consentLabel,
  registerLabel,
  questions,
  brand,
  hiddenFields = [],
  plain = false,
}: {
  title: string;
  help: string;
  formTitle: string;
  consentText: string;
  consentLabel: string;
  registerLabel: string;
  questions: QuestionaryType[];
  brand: RegistrationBrand;
  hiddenFields?: string[];
  plain?: boolean;
}) => (
  <section className={plain ? '' : cardClass}>
    <div className="text-sm font-medium">{title}</div>
    <p className="mt-1 text-xs text-[#667085]">{help}</p>
    <div className="pointer-events-none mt-4 rounded-2xl bg-[#F4F4F4] p-4">
      <RegistrationBrandFrame brand={brand} title={formTitle}>
        <div className="space-y-3">
          {STANDARD_PATIENT_FIELDS.filter(
            (field) => !hiddenFields.includes(field.key),
          ).map((field) => (
            <div key={field.key}>
              <div className="text-xs text-[#344054]">{field.label}</div>
              {fieldInput(field.key)}
            </div>
          ))}
          {questions.map((question, index) => (
            <div key={question.id || index}>
              <div className="text-xs text-[#344054]">
                {question.question}
                {question.required ? ' *' : ''}
              </div>
              <QuestionPreview question={question} />
            </div>
          ))}
          {consentText ? (
            <p className="text-xs leading-5 text-[#667085]">{consentText}</p>
          ) : null}
          <div className="flex items-center gap-2 text-xs text-[#344054]">
            <span className="h-3.5 w-3.5 rounded border border-[#D0D5DD]" />
            {consentLabel}
          </div>
          <div
            className="inline-flex rounded-full px-4 py-2 text-xs"
            style={brandButtonStyle(brand.primaryColor)}
          >
            {registerLabel}
          </div>
        </div>
      </RegistrationBrandFrame>
    </div>
  </section>
);

export default ClinicPatientRegistration;
