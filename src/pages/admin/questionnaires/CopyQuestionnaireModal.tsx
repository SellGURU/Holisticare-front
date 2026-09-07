import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminApi from '../../../api/admin';
import { formatApiErrorMessage } from '../../../utils/jsonErrorDetails';
import ClinicSearchSelect from './ClinicSearchSelect';
import type {
  AdminClinicOption,
  ClinicQuestionnaireRow,
  CopySource,
  QuestionnaireTemplateRow,
} from './types';

interface CopyQuestionnaireModalProps {
  clinics: AdminClinicOption[];
  templates?: QuestionnaireTemplateRow[];
  source?: CopySource;
  defaultTargetClinicId?: number;
  onClose: () => void;
  onCopied: () => void;
  onAuthFailure: () => void;
}

const CopyQuestionnaireModal = ({
  clinics,
  templates = [],
  source,
  defaultTargetClinicId,
  onClose,
  onCopied,
  onAuthFailure,
}: CopyQuestionnaireModalProps) => {
  const [sourceKind, setSourceKind] = useState<'template' | 'clinic'>(
    source?.kind === 'clinic' ? 'clinic' : 'template',
  );
  const [templateId, setTemplateId] = useState(
    source?.kind === 'template' ? String(source.templateId) : '',
  );
  const [sourceClinicId, setSourceClinicId] = useState(
    source?.kind === 'clinic' ? String(source.clinicId) : '',
  );
  const [sourceUniqueId, setSourceUniqueId] = useState(
    source?.kind === 'clinic' ? source.uniqueId : '',
  );
  const [targetClinicId, setTargetClinicId] = useState(
    defaultTargetClinicId ? String(defaultTargetClinicId) : '',
  );
  const [sourceForms, setSourceForms] = useState<ClinicQuestionnaireRow[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [formsError, setFormsError] = useState('');
  const [formMenuOpen, setFormMenuOpen] = useState(false);
  const [formQuery, setFormQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const formMenuRef = useRef<HTMLDivElement>(null);
  const lockedSource = Boolean(source);

  const targetClinics = useMemo(() => {
    if (source?.kind === 'clinic') {
      return clinics.filter((clinic) => clinic.clinic_id !== source.clinicId);
    }
    return clinics;
  }, [clinics, source]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!formMenuRef.current?.contains(event.target as Node)) {
        setFormMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (lockedSource || sourceKind !== 'clinic' || !sourceClinicId) {
      setSourceForms([]);
      setFormsError('');
      if (!lockedSource) {
        setSourceUniqueId('');
      }
      setFormMenuOpen(false);
      return;
    }
    const clinicId = Number(sourceClinicId);
    if (!clinicId) return;
    let cancelled = false;
    setLoadingForms(true);
    setFormsError('');
    setSourceUniqueId('');
    AdminApi.listClinicQuestionnaires(clinicId)
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res.data?.questionnaires)
          ? res.data.questionnaires
          : Array.isArray(res.data)
            ? res.data
            : [];
        setSourceForms(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          onAuthFailure();
          return;
        }
        setSourceForms([]);
        setFormsError(
          formatApiErrorMessage(err) || 'Failed to load questionnaires.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingForms(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lockedSource, sourceKind, sourceClinicId]);

  const selectedForm = sourceForms.find((form) => form.id === sourceUniqueId);
  const filteredForms = useMemo(() => {
    const term = formQuery.trim().toLowerCase();
    if (!term) return sourceForms;
    return sourceForms.filter((form) =>
      form.title.toLowerCase().includes(term),
    );
  }, [sourceForms, formQuery]);

  const handleCopy = async () => {
    const targetId = Number(targetClinicId);
    if (!targetId) {
      toast.error('Select a target clinic.');
      return;
    }

    let payload: {
      template_id?: number;
      source_clinic_id?: number;
      unique_id?: string;
    };
    if (source?.kind === 'template' || (!lockedSource && sourceKind === 'template')) {
      const resolvedTemplateId =
        source?.kind === 'template' ? source.templateId : Number(templateId);
      if (!resolvedTemplateId) {
        toast.error('Select a template.');
        return;
      }
      payload = { template_id: resolvedTemplateId };
    } else {
      const clinicId =
        source?.kind === 'clinic' ? source.clinicId : Number(sourceClinicId);
      const uniqueId = source?.kind === 'clinic' ? source.uniqueId : sourceUniqueId;
      if (!clinicId || !uniqueId) {
        toast.error('Select a source questionnaire.');
        return;
      }
      if (clinicId === targetId) {
        toast.error('Choose a different target clinic.');
        return;
      }
      payload = { source_clinic_id: clinicId, unique_id: uniqueId };
    }

    setSaving(true);
    try {
      await AdminApi.copyQuestionnaireToClinic(targetId, payload);
      toast.success('Questionnaire copied.');
      onCopied();
      onClose();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        onAuthFailure();
        return;
      }
      toast.error(formatApiErrorMessage(err) || 'Failed to copy questionnaire.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-[90vw] max-w-[480px] rounded-[20px] bg-white p-4">
      <div className="text-sm font-medium text-Text-Primary">Copy questionnaire</div>
      <div className="mt-1 text-[12px] text-Text-Secondary">
        {source
          ? `Copy “${source.title}” into another clinic.`
          : 'Copy a template or clinic form into the selected clinic.'}
      </div>

      {!lockedSource ? (
        <>
          <label className="mt-4 block text-[12px] text-Text-Secondary">Source</label>
          <select
            value={sourceKind}
            onChange={(event) => setSourceKind(event.target.value as 'template' | 'clinic')}
            className="mt-1 w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
          >
            <option value="template">Default template</option>
            <option value="clinic">Clinic questionnaire</option>
          </select>

          {sourceKind === 'template' ? (
            <select
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
            >
              <option value="">Select template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
          ) : (
            <>
              <div className="mt-2">
                <ClinicSearchSelect
                  clinics={clinics}
                  value={sourceClinicId ? Number(sourceClinicId) : ''}
                  onChange={(id) => setSourceClinicId(id ? String(id) : '')}
                  placeholder="Search source clinic"
                />
              </div>
              <div ref={formMenuRef} className="relative mt-2">
                <label className="mb-1 block text-[11px] text-Text-Secondary">
                  Questionnaire to copy
                </label>
                <button
                  type="button"
                  disabled={loadingForms || !sourceClinicId}
                  onClick={() => setFormMenuOpen((open) => !open)}
                  className="flex min-h-[36px] w-full items-center justify-between rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-left text-[12px] text-Text-Primary outline-none disabled:opacity-50"
                >
                  <span className={selectedForm ? '' : 'text-Text-Secondary'}>
                    {loadingForms
                      ? 'Loading questionnaires…'
                      : selectedForm?.title || 'Select questionnaire'}
                  </span>
                  <ChevronDown size={14} className="text-Text-Secondary" />
                </button>
                {formMenuOpen && !loadingForms ? (
                  <div className="absolute z-40 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-Gray-50 bg-white p-1 shadow-100">
                    <div className="flex items-center rounded-xl bg-[#F8FAFB] px-2">
                      <Search size={13} className="text-Text-Secondary" />
                      <input
                        value={formQuery}
                        onChange={(event) => setFormQuery(event.target.value)}
                        placeholder="Search by title"
                        className="w-full bg-transparent px-2 py-1.5 text-[12px] outline-none"
                      />
                    </div>
                    {formsError ? (
                      <div className="px-3 py-2 text-[12px] text-red-600">{formsError}</div>
                    ) : filteredForms.length === 0 ? (
                      <div className="px-3 py-2 text-[12px] text-Text-Secondary">
                        {sourceForms.length === 0
                          ? 'This clinic has no questionnaires to copy.'
                          : `No questionnaires match “${formQuery}”.`}
                      </div>
                    ) : (
                      filteredForms.map((form) => (
                        <button
                          key={form.id}
                          type="button"
                          onClick={() => {
                            setSourceUniqueId(form.id);
                            setFormMenuOpen(false);
                            setFormQuery('');
                          }}
                          className={`mt-1 flex w-full flex-col items-start rounded-xl px-3 py-2 text-left ${
                            form.id === sourceUniqueId
                              ? 'bg-[#E8F4F6]'
                              : 'hover:bg-[#F8FAFB]'
                          }`}
                        >
                          <span className="text-[12px] font-medium text-Text-Primary">
                            {form.title}
                          </span>
                          <span className="text-[11px] text-Text-Secondary">
                            {form.questions} questions
                            {form.created_on ? ` · ${form.created_on}` : ''}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </>
      ) : null}

      <label className="mt-4 block text-[12px] text-Text-Secondary">Target clinic</label>
      <div className="mt-1">
        <ClinicSearchSelect
          clinics={targetClinics}
          value={targetClinicId ? Number(targetClinicId) : ''}
          onChange={(id) => setTargetClinicId(id ? String(id) : '')}
          placeholder="Search target clinic"
        />
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            handleCopy().catch(() => {});
          }}
          className="rounded-full bg-[#005F73] px-4 py-2 text-[12px] text-white disabled:opacity-60"
        >
          {saving ? 'Copying…' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

export default CopyQuestionnaireModal;
