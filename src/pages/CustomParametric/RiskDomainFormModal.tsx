import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import BiomarkersApi from '../../api/Biomarkers';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import FormulaCodeEditor from './FormulaCodeEditor';
import { formulaHasUnknownBiomarkers } from './formulaBiomarker';
import IntelligenceModal, { apiErrorMessage } from './IntelligenceModal';
import {
  v2FieldClass,
  v2LabelClass,
  v2OutlineBtnClass,
  v2PrimaryBtnClass,
  v2TextareaClass,
} from './intelligenceUi';
import {
  HEALTH_RISK_DEFAULT_ICON,
  HEALTH_RISK_ICON_KEYS,
  HEALTH_RISK_ICONS,
} from './healthRiskIcons';
import type { ClinicBiomarkerOption, RiskDomainViewModel, RiskResultCategory } from './types';

interface FormState {
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon: string;
  iconColor: string;
  timeHorizon: string;
  assignedGroups: string[];
  formulaCode: string;
  resultCategories: RiskResultCategory[];
  isEnabled: boolean;
  outputType: string;
  domainType: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  displayName: '',
  description: '',
  category: '',
  icon: 'Activity',
  iconColor: '#10B981',
  timeHorizon: '',
  assignedGroups: [],
  formulaCode: '',
  resultCategories: [
    { min: 0, max: 33, label: 'Low', color: 'green' },
    { min: 33, max: 67, label: 'Moderate', color: 'amber' },
    { min: 67, max: 100, label: 'High', color: 'red' },
  ],
  isEnabled: true,
  outputType: 'NUMERIC',
  domainType: 'RISK',
};

const EMPTY_SCORE_FORM: FormState = {
  ...EMPTY_FORM,
  domainType: 'SCORING',
  formulaCode:
    'round((1 - status_weight(Biomarker.Hb_A1c, 5.2, 6.5)) * 100, 2)',
  resultCategories: [
    { min: 0, max: 20, label: 'Poor', color: 'red' },
    { min: 20, max: 50, label: 'Low', color: 'amber' },
    { min: 50, max: 80, label: 'Good', color: 'green' },
    { min: 80, max: 100, label: 'Optimal', color: 'green' },
  ],
};

const EMPTY_AGE_FORM: FormState = {
  ...EMPTY_FORM,
  domainType: 'AGING',
  icon: 'Clock',
  iconColor: '#6366F1',
  formulaCode:
    'round(phenoage(Biomarker.Albumin * 0.0665, Biomarker.Creatinine, Biomarker.Glucose / 18, max(Biomarker.C_Reactive_Protein_high_sensitivity / 10, 0.001), Biomarker.Lymphocytes, Biomarker.Mean_Corpuscular_Volume, Biomarker.Red_Cell_Distribution_Width, Biomarker.Alkaline_Phosphatase, Biomarker.White_Blood_Cells / 1000, Profile.age), 2)',
  resultCategories: [
    { min: 0, max: 40, label: 'Younger', color: 'green' },
    { min: 40, max: 55, label: 'Aligned', color: 'amber' },
    { min: 55, max: 70, label: 'Older', color: 'red' },
    { min: 70, max: 120, label: 'Accelerated', color: 'red' },
  ],
};

function emptyFormForKind(kind: 'RISK' | 'SCORING' | 'AGING'): FormState {
  if (kind === 'SCORING') return EMPTY_SCORE_FORM;
  if (kind === 'AGING') return EMPTY_AGE_FORM;
  return EMPTY_FORM;
}

function domainToForm(domain: RiskDomainViewModel): FormState {
  return {
    name: domain.name,
    displayName: domain.displayName,
    description: domain.description,
    category: domain.category ?? '',
    icon: HEALTH_RISK_ICONS[domain.iconKey]
      ? domain.iconKey
      : 'Activity',
    iconColor: domain.iconColor,
    timeHorizon: domain.timeHorizon ?? '',
    assignedGroups: domain.assignedGroups,
    formulaCode: domain.formulaCode,
    resultCategories: domain.resultCategories,
    isEnabled: domain.isEnabled,
    outputType: domain.outputType,
    domainType: domain.domainType,
  };
}

export type RiskDomainFormMode = 'create' | 'edit' | 'duplicate';

interface RiskDomainFormModalProps {
  open: boolean;
  mode: RiskDomainFormMode;
  domain?: RiskDomainViewModel | null;
  modelKind?: 'RISK' | 'SCORING' | 'AGING';
  onClose: () => void;
  onSaved: () => void;
}

export default function RiskDomainFormModal({
  open,
  mode,
  domain,
  modelKind = 'RISK',
  onClose,
  onSaved,
}: RiskDomainFormModalProps) {
  const isScore = modelKind === 'SCORING';
  const isAge = modelKind === 'AGING';
  const kindLabel = isAge ? 'age clock' : isScore ? 'score' : 'risk';
  const isEdit = mode === 'edit';
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [groupInput, setGroupInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<{
    syntax_valid?: boolean;
    error_message?: string;
    biomarker_dependencies?: string[];
    biomarkers_not_in_clinic?: string[];
  } | null>(null);
  const [catalog, setCatalog] = useState<ClinicBiomarkerOption[]>([]);

  useEffect(() => {
    if (!open) return;
    setValidation(null);
    setGroupInput('');
    if (domain && mode === 'edit') {
      setForm({ ...domainToForm(domain), domainType: modelKind });
    } else if (domain && mode === 'duplicate') {
      setForm({
        ...domainToForm(domain),
        name: `Copy of ${domain.name}`,
        displayName: `Copy of ${domain.displayName}`,
        domainType: modelKind,
      });
    } else {
      setForm(emptyFormForKind(modelKind));
    }
    BiomarkersApi.getBiomarkersList({ include_all: true })
      .then((res) => {
        const rows = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.chart_bounds)
            ? res.data.chart_bounds
            : [];
        const mapped = rows
          .map((item: { biomarker_uid?: string; Biomarker?: string; name?: string; unit?: string; ['Benchmark areas']?: string; benchmark_area?: string }) => {
            const name = String(item?.Biomarker || item?.name || '').trim();
            if (!name) return null;
            return {
              name,
              unit: item?.unit || '',
              benchmark_area: item?.['Benchmark areas'] || item?.benchmark_area || '',
            } as ClinicBiomarkerOption;
          })
          .filter(Boolean) as ClinicBiomarkerOption[];
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setCatalog(mapped);
      })
      .catch(() => setCatalog([]));
  }, [open, domain, mode, modelKind]);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addGroup() {
    const value = groupInput.trim();
    if (!value || form.assignedGroups.includes(value)) {
      setGroupInput('');
      return;
    }
    patch('assignedGroups', [...form.assignedGroups, value]);
    setGroupInput('');
  }

  function addResultCategory() {
    patch('resultCategories', [
      ...form.resultCategories,
      { min: 0, max: 100, label: '', color: 'green' },
    ]);
  }

  function updateResultCategory(
    index: number,
    patchValue: Partial<RiskResultCategory>,
  ) {
    patch(
      'resultCategories',
      form.resultCategories.map((rc, i) =>
        i === index ? { ...rc, ...patchValue } : rc,
      ),
    );
  }

  function handleValidate() {
    if (!form.formulaCode.trim()) return;
    setValidating(true);
    setValidation(null);
    HealthRiskArchitectureApi.validateFormula(form.formulaCode, {
      domain_type: form.domainType,
    })
      .then((res) => setValidation(res.data || null))
      .catch((err) =>
        setValidation({
          syntax_valid: false,
          error_message: apiErrorMessage(err, 'Validation failed'),
        }),
      )
      .finally(() => setValidating(false));
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.formulaCode.trim()) return;
    if (
      !form.resultCategories.some(
        (band) =>
          band.label?.trim() &&
          Number.isFinite(Number(band.min)) &&
          Number.isFinite(Number(band.max)),
      )
    ) {
      toast.error('Add at least one severity band with a label.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      display_name: form.displayName.trim() || undefined,
      category: form.category.trim() || undefined,
      icon: form.icon,
      icon_color: form.iconColor,
      description: form.description.trim() || undefined,
      domain_type: form.domainType,
      output_type: form.outputType,
      formula_code: form.formulaCode,
      result_categories: form.resultCategories.length
        ? form.resultCategories
        : undefined,
      is_enabled: form.isEnabled,
      time_horizon: form.timeHorizon.trim() || null,
      assigned_groups: form.assignedGroups,
    };
    const request =
      isEdit && domain?.id
        ? HealthRiskArchitectureApi.updateDomain(domain.id, payload)
        : HealthRiskArchitectureApi.createDomain(payload);

    request
      .then(() => {
        toast.success(isEdit ? 'Domain saved' : 'Domain created');
        onSaved();
        onClose();
      })
      .catch((err) => toast.error(apiErrorMessage(err, 'Save failed')))
      .finally(() => setSaving(false));
  }

  const title = isEdit
    ? `Edit ${kindLabel} domain`
    : mode === 'duplicate'
      ? `Duplicate ${kindLabel} domain`
      : `Create ${kindLabel} domain`;
  const PreviewIcon = HEALTH_RISK_ICONS[form.icon] ?? HEALTH_RISK_DEFAULT_ICON;
  const nameLocked = isEdit && Boolean(domain?.isSystemDefault);
  const bandsInvalid = !form.resultCategories.some(
    (band) =>
      band.label?.trim() &&
      Number.isFinite(Number(band.min)) &&
      Number.isFinite(Number(band.max)),
  );
  const formulaInvalid = formulaHasUnknownBiomarkers(
    form.formulaCode,
    catalog.map((item) => item.name),
  );

  return (
    <IntelligenceModal
      isOpen={open}
      onClose={onClose}
      title={title}
      description="Formulas can reference Biomarker.<Name>.value, Profile.<field>, and Context.<field>."
      widthClass="w-[min(1080px,calc(100vw-2rem))]"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-gray-500">
            Saved to this clinic's{' '}
            {isAge
              ? 'Age Clocks'
              : isScore
                ? 'Health Scores'
                : 'Risk Assessments'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className={v2OutlineBtnClass}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className={v2PrimaryBtnClass}
              onClick={handleSubmit}
              disabled={
                !form.name.trim() ||
                !form.formulaCode.trim() ||
                saving ||
                formulaInvalid ||
                bandsInvalid
              }
            >
              {saving ? (
                'Saving…'
              ) : isEdit ? (
                <>
                  <Pencil className="size-3.5" />
                  Save changes
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  Create domain
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="grid items-start gap-x-5 gap-y-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={v2LabelClass}>
              Internal name *
            </span>
            <input
              value={form.name}
              onChange={(e) => patch('name', e.target.value)}
              placeholder={
                isAge
                  ? 'PhenoAge'
                  : isScore
                    ? 'Liver Health Score'
                    : 'Cardiovascular Risk'
              }
              disabled={nameLocked}
              className={v2FieldClass}
            />
          </label>
          <label className="space-y-1.5">
            <span className={v2LabelClass}>
              Display name
            </span>
            <input
              value={form.displayName}
              onChange={(e) => patch('displayName', e.target.value)}
              placeholder="Heart & Artery Health"
              className={v2FieldClass}
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className={v2LabelClass}>
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(e) => patch('description', e.target.value)}
              rows={2}
              className={`${v2TextareaClass} min-h-[56px] resize-none`}
            />
          </label>
          <label className="space-y-1.5">
            <span className={v2LabelClass}>
              Category
            </span>
            <input
              value={form.category}
              onChange={(e) => patch('category', e.target.value)}
              placeholder="Cardiovascular"
              className={v2FieldClass}
            />
          </label>
          <label className="space-y-1.5">
            <span className={v2LabelClass}>
              Time horizon
            </span>
            <input
              value={form.timeHorizon}
              onChange={(e) => patch('timeHorizon', e.target.value)}
              placeholder="5 years"
              className={v2FieldClass}
            />
          </label>
          <label className="space-y-1.5">
            <span className={v2LabelClass}>
              Icon
            </span>
            <select
              value={form.icon}
              onChange={(e) => patch('icon', e.target.value)}
              className={`${v2FieldClass} bg-white`}
            >
              {HEALTH_RISK_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-1.5">
            <span className={v2LabelClass}>
              Color
            </span>
            <div className="flex items-center gap-2">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200"
                style={{ backgroundColor: `${form.iconColor}15` }}
              >
                <PreviewIcon
                  className="size-4"
                  style={{ color: form.iconColor }}
                  aria-hidden
                />
              </div>
              <input
                type="color"
                value={form.iconColor}
                onChange={(e) => patch('iconColor', e.target.value)}
                className="h-9 w-9 cursor-pointer rounded-lg border border-gray-200 bg-white p-0.5"
                aria-label="Icon color"
              />
              <input
                type="text"
                value={form.iconColor}
                onChange={(e) => patch('iconColor', e.target.value)}
                className={`${v2FieldClass} min-w-0 flex-1`}
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <span className={v2LabelClass}>
              Assigned groups
            </span>
            <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1.5">
              {form.assignedGroups.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() =>
                      patch(
                        'assignedGroups',
                        form.assignedGroups.filter((item) => item !== g),
                      )
                    }
                    aria-label={`Remove ${g}`}
                  >
                    <XCircle className="size-3" />
                  </button>
                </span>
              ))}
              <input
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addGroup();
                  }
                }}
                onBlur={addGroup}
                placeholder="Longevity, Diet…"
                className="min-w-[120px] flex-1 border-none bg-transparent text-[12px] outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 sm:col-span-2">
            <span className={v2LabelClass}>
              Active
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={form.isEnabled}
              onClick={() => patch('isEnabled', !form.isEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full shadow-xs transition-colors ${
                form.isEnabled ? 'bg-[#10B981]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block size-4 rounded-full bg-white transition-transform ${
                  form.isEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className={v2LabelClass}>
                Formula code *
              </span>
              <button
                type="button"
                className={`${v2OutlineBtnClass} !h-7 !text-[10px]`}
                onClick={handleValidate}
                disabled={!form.formulaCode.trim() || validating}
              >
                {validating ? 'Validating…' : 'Validate Formula'}
              </button>
            </div>
            <FormulaCodeEditor
              value={form.formulaCode}
              onChange={(next) => {
                patch('formulaCode', next);
                setValidation(null);
              }}
              catalog={catalog}
              rows={5}
              textareaClassName="min-h-[140px] max-h-[220px] resize-y"
              placeholder={
                isAge
                  ? 'round(phenoage(Biomarker.Albumin * 0.0665, Biomarker.Creatinine, Biomarker.Glucose / 18, max(Biomarker.C_Reactive_Protein_high_sensitivity / 10, 0.001), Biomarker.Lymphocytes, Biomarker.Mean_Corpuscular_Volume, Biomarker.Red_Cell_Distribution_Width, Biomarker.Alkaline_Phosphatase, Biomarker.White_Blood_Cells / 1000, Profile.age), 2)'
                  : isScore
                    ? 'round((1 - status_weight(Biomarker.Hb_A1c, 5.2, 6.5)) * 100, 2)'
                    : 'round(status_weight(Biomarker.LDL_Cholesterol, 100, 130) * 0.30 + status_weight(Biomarker.Triglycerides, 150, 200) * 0.20, 2)'
              }
            />
            {validation ? (
              <div
                className={`rounded-lg border p-2 text-[11px] leading-snug ${
                  validation.syntax_valid
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  {validation.syntax_valid ? (
                    <CheckCircle2 className="size-3.5 shrink-0" />
                  ) : (
                    <XCircle className="size-3.5 shrink-0" />
                  )}
                  {validation.syntax_valid ? 'Syntax valid' : 'Syntax error'}
                </div>
                {validation.error_message ? (
                  <p className="mt-1">{validation.error_message}</p>
                ) : null}
                {validation.biomarker_dependencies?.length ? (
                  <p className="mt-1">
                    Biomarkers:{' '}
                    {validation.biomarker_dependencies.join(', ')}
                  </p>
                ) : null}
                {validation.biomarkers_not_in_clinic?.length ? (
                  <p className="mt-1 text-amber-700">
                    Not configured in this clinic's biomarker panel:{' '}
                    {validation.biomarkers_not_in_clinic.join(', ')}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className={v2LabelClass}>
                Result categories
              </span>
              <button
                type="button"
                className={`${v2OutlineBtnClass} !h-7 !text-[10px]`}
                onClick={addResultCategory}
              >
                <Plus className="size-3" />
                Add band
              </button>
            </div>
            {form.resultCategories.length === 0 ? (
              <p className="text-[10px] text-red-600">
                At least one severity band is required.
              </p>
            ) : (
              <div className="max-h-[120px] space-y-1.5 overflow-y-auto pr-0.5">
                {form.resultCategories.map((rc, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto] items-center gap-1.5"
                  >
                    <input
                      type="number"
                      placeholder="min"
                      value={rc.min ?? ''}
                      onChange={(e) =>
                        updateResultCategory(index, {
                          min: Number(e.target.value),
                        })
                      }
                      className={`${v2FieldClass} !h-8`}
                    />
                    <input
                      type="number"
                      placeholder="max"
                      value={rc.max ?? ''}
                      onChange={(e) =>
                        updateResultCategory(index, {
                          max: Number(e.target.value),
                        })
                      }
                      className={`${v2FieldClass} !h-8`}
                    />
                    <input
                      placeholder="Label"
                      value={rc.label ?? ''}
                      onChange={(e) =>
                        updateResultCategory(index, {
                          label: e.target.value,
                        })
                      }
                      className={`${v2FieldClass} !h-8`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patch(
                          'resultCategories',
                          form.resultCategories.filter((_, i) => i !== index),
                        )
                      }
                      className="flex size-8 items-center justify-center rounded-md hover:bg-red-50"
                      aria-label="Remove result band"
                    >
                      <Trash2 className="size-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </IntelligenceModal>
  );
}
