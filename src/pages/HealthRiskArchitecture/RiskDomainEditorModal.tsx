/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Info,
  FileText,
  Calculator,
  ChevronDown,
  ChevronUp,
  Search,
  Copy,
} from 'lucide-react';

/** Per spec 7.1.3: show only necessary fields per domain type */
const NEEDS_RESULT_CATEGORIES = (domainType: string, outputType: string) =>
  (domainType === 'RISK' || domainType === 'SCORING') &&
  outputType === 'NUMERIC';
const NEEDS_CATEGORY = (domainType: string) =>
  domainType === 'RISK' || domainType === 'SCORING';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import { toast } from 'react-toastify';

interface ResultCategory {
  min: number;
  max: number;
  label: string;
  color: string;
}

interface CategoryOption {
  name: string;
  position?: string | null;
  description?: string | null;
}

interface BiomarkerOption {
  name: string;
  benchmark_area: string;
}

interface RiskDomainEditorModalProps {
  domainId: string | null;
  initialData: any | null;
  domainType?: string;
  categories: CategoryOption[];
  biomarkers: BiomarkerOption[];
  onClose: () => void;
  onSaved: () => void;
}

export default function RiskDomainEditorModal({
  domainId,
  initialData,
  domainType = 'RISK',
  categories = [],
  biomarkers = [],
  onClose,
  onSaved,
}: RiskDomainEditorModalProps) {
  const isEdit = !!domainId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationResult, setValidationResult] = useState<{
    syntax_valid?: boolean;
    error_message?: string;
    biomarker_dependencies?: string[];
    biomarkers_in_clinic?: string[];
    biomarkers_not_in_clinic?: string[];
  } | null>(null);

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('🫀');
  const [description, setDescription] = useState('');
  const [outputType, setOutputType] = useState('NUMERIC');
  const [formulaCode, setFormulaCode] = useState('');
  const [clinicalDescription, setClinicalDescription] = useState('');
  const [resultCategories, setResultCategories] = useState<ResultCategory[]>([
    { min: 0, max: 20, label: 'Low Risk', color: 'green' },
    { min: 20, max: 50, label: 'Moderate Risk', color: 'yellow' },
    { min: 50, max: 100, label: 'High Risk', color: 'red' },
  ]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [domainWeight, setDomainWeight] = useState(0.2);
  const [showInReportSections, setShowInReportSections] = useState<string[]>([
    'need_focus',
  ]);
  const [displayLabel, setDisplayLabel] = useState('');
  const [patientFacingLabel, setPatientFacingLabel] = useState('');
  const [colorScheme, setColorScheme] = useState<{
    low?: string;
    moderate?: string;
    high?: string;
  }>({
    low: 'green',
    moderate: 'yellow',
    high: 'red',
  });
  const [showBiomarkerRef, setShowBiomarkerRef] = useState(false);
  const [biomarkerSearch, setBiomarkerSearch] = useState('');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    result?: unknown;
    error?: string;
    category?: string;
    contributing_biomarkers?: Record<string, { value?: number; zone?: string }>;
  } | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [previewBiomarkerValues, setPreviewBiomarkerValues] = useState<
    Record<string, number>
  >({});
  const [previewProfileAge, setPreviewProfileAge] = useState(30);
  const formulaTextareaRef = useRef<HTMLTextAreaElement>(null);

  /** Realistic defaults for PhenoAge (30yo male). Units: Albumin/Creatinine µmol/L, Glucose mg/dL, CRP mg/L, Lymphocytes %, MCV fL, RDW %, ALP U/L, WBC cells/µL */
  const PHENOAGE_DEFAULTS: Record<string, number> = {
    Albumin: 42000,
    Creatinine: 88,
    Glucose: 90,
    CRP: 0.5,
    Lymphocytes: 30,
    MCV: 90,
    RDW: 13,
    ALP: 70,
    WBC: 6000,
  };

  const previewDependencies =
    validationResult?.biomarker_dependencies ||
    Object.keys(previewBiomarkerValues);
  const hasPreviewDeps = previewDependencies.length > 0;

  const biomarkersGrouped = useMemo(() => {
    const filtered = biomarkerSearch.trim()
      ? biomarkers.filter(
          (b) =>
            b.name.toLowerCase().includes(biomarkerSearch.toLowerCase()) ||
            (b.benchmark_area || '')
              .toLowerCase()
              .includes(biomarkerSearch.toLowerCase()),
        )
      : biomarkers;
    const byArea = new Map<string, typeof biomarkers>();
    for (const b of filtered) {
      const area = b.benchmark_area || 'Other';
      if (!byArea.has(area)) byArea.set(area, []);
      byArea.get(area)!.push(b);
    }
    return Array.from(byArea.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [biomarkers, biomarkerSearch]);

  const insertAtCursor = (text: string) => {
    const ta = formulaTextareaRef.current;
    if (!ta) {
      setFormulaCode((prev) => prev + text);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = formulaCode.slice(0, start);
    const after = formulaCode.slice(end);
    setFormulaCode(before + text + after);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const insertBiomarker = (b: BiomarkerOption) => {
    const namePart = b.name.replace(/\s/g, '_');
    const ta = formulaTextareaRef.current;
    const start = ta?.selectionStart ?? formulaCode.length;
    const beforeCursor = formulaCode.slice(0, start);
    const endsWithBiomarkerDot = /Biomarker\.\s*$/.test(beforeCursor);
    const text = endsWithBiomarkerDot ? namePart : 'Biomarker.' + namePart;
    insertAtCursor(text);
  };

  const insertStatusWeightTemplate = () => {
    const template = `status_weight(Biomarker., {'optimal': 0.0, 'healthy': 0.05, 'borderline': 0.15, 'disease': 0.30})`;
    insertAtCursor(template);
    toast.success(
      'Template inserted – click a biomarker to add it after "Biomarker."',
    );
  };

  const insertAgeModifierTemplate = () => {
    const template = `\n# Age/gender modifier (adjust score for older adults)\nif Profile.age > 45 and Profile.gender == 'male':\n    score *= 1.20\nelif Profile.age > 55 and Profile.gender == 'female':\n    score *= 1.20\n`;
    insertAtCursor(template);
    toast.success(
      'Age modifier block inserted – place after your status_weight lines',
    );
  };

  const insertStarterFormula = () => {
    if (formulaCode.trim()) {
      toast.info(
        'Formula area is not empty – use "Add biomarker" or "Add age modifier" to append',
      );
      return;
    }
    const template = `score = 0.0

# Add biomarkers below (click "Add biomarker" then choose from the list)
score += status_weight(Biomarker., {'optimal': 0.0, 'healthy': 0.05, 'borderline': 0.15, 'disease': 0.30})

# Optional: add age modifier with the button above

score * 100`;
    setFormulaCode(template);
    toast.success(
      'Starter formula added – click a biomarker to complete the status_weight line',
    );
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDisplayName(initialData.display_name || '');
      setCategory(initialData.category || '');
      setIcon(initialData.icon || '🫀');
      setDescription(initialData.description || '');
      setOutputType('NUMERIC'); // Only Numeric supported; Boolean/Categorical deferred to future phases
      setFormulaCode(initialData.formula_code || '');
      setClinicalDescription(initialData.clinical_description || '');
      setResultCategories(
        Array.isArray(initialData.result_categories) &&
          initialData.result_categories.length > 0
          ? initialData.result_categories
          : [
              { min: 0, max: 20, label: 'Low Risk', color: 'green' },
              { min: 20, max: 50, label: 'Moderate Risk', color: 'yellow' },
              { min: 50, max: 100, label: 'High Risk', color: 'red' },
            ],
      );
      setIsEnabled(initialData.is_enabled !== false);
      setDomainWeight(Number(initialData.domain_weight) ?? 0.2);
      setShowInReportSections(
        Array.isArray(initialData.show_in_report_sections)
          ? initialData.show_in_report_sections
          : ['need_focus'],
      );
      setDisplayLabel(initialData.display_label ?? '');
      setPatientFacingLabel(initialData.patient_facing_label ?? '');
      setColorScheme(
        typeof initialData.color_scheme === 'object' &&
          initialData.color_scheme != null
          ? {
              low: 'green',
              moderate: 'yellow',
              high: 'red',
              ...initialData.color_scheme,
            }
          : { low: 'green', moderate: 'yellow', high: 'red' },
      );
      if (initialData.domain_type && !initialData.formula_code) {
        if (initialData.domain_type === 'AGING') {
          setFormulaCode(
            'phenoage_algorithm(age=Profile.age, albumin=Biomarker.Albumin.value, creatinine=Biomarker.Creatinine.value, glucose=Biomarker.Glucose.value, crp=Biomarker.CRP.value, lymphocyte_pct=Biomarker.Lymphocytes.value, mcv=Biomarker.MCV.value, rdw=Biomarker.RDW.value, alp=Biomarker.ALP.value, wbc=Biomarker.WBC.value)',
          );
          setOutputType('NUMERIC');
        } else if (initialData.domain_type === 'PARAMETRIC_BIOMARKER') {
          setFormulaCode('Biomarker.Weight / (Biomarker.Height ** 2)');
        } else if (initialData.domain_type === 'SCORING') {
          setFormulaCode(
            "composite_score([normalize(Biomarker.LDL, 100, 160, 'lower_better'), normalize(Biomarker.HDL, 60, 35, 'higher_better')], weights=[0.5, 0.5])",
          );
        }
      }
    }
  }, [initialData]);

  // Auto-populate example values when validation returns biomarker dependencies (no client data)
  useEffect(() => {
    const deps = validationResult?.biomarker_dependencies;
    if (deps?.length) {
      setPreviewBiomarkerValues((prev) => {
        const next = { ...prev };
        deps.forEach((b: string) => {
          if (next[b] == null) {
            next[b] =
              domainType === 'AGING' && PHENOAGE_DEFAULTS[b] != null
                ? PHENOAGE_DEFAULTS[b]
                : 100;
          }
        });
        return next;
      });
    }
  }, [validationResult?.biomarker_dependencies, domainType]);

  const setPreviewValue = (name: string, value: number) => {
    setPreviewBiomarkerValues((prev) => ({ ...prev, [name]: value }));
  };

  const getDefaultForBiomarker = (b: string) =>
    domainType === 'AGING' && PHENOAGE_DEFAULTS[b] != null
      ? PHENOAGE_DEFAULTS[b]
      : 100;

  const handleTestSample = () => {
    setTestResult(null);
    setTestLoading(true);
    const biomarker_values: Record<string, number> = {
      ...previewBiomarkerValues,
    };
    (validationResult?.biomarker_dependencies || []).forEach((b: string) => {
      if (biomarker_values[b] == null)
        biomarker_values[b] = getDefaultForBiomarker(b);
    });
    if (
      Object.keys(biomarker_values).length === 0 &&
      validationResult?.biomarker_dependencies?.length
    ) {
      validationResult.biomarker_dependencies.forEach((b: string) => {
        biomarker_values[b] = getDefaultForBiomarker(b);
      });
    }
    HealthRiskArchitectureApi.testSample({
      formula_code: formulaCode,
      domain_type: domainType,
      biomarker_values: Object.keys(biomarker_values).length
        ? biomarker_values
        : undefined,
      profile: { age: previewProfileAge, gender: 'male' },
      result_categories:
        outputType === 'NUMERIC' ? resultCategories : undefined,
    })
      .then((res) =>
        setTestResult({
          success: res.data?.success ?? false,
          result: res.data?.result,
          error: res.data?.error,
          category: res.data?.category,
          contributing_biomarkers: res.data?.contributing_biomarkers,
        }),
      )
      .catch((err) =>
        setTestResult({
          success: false,
          error: err?.response?.data?.detail || 'Test failed',
        }),
      )
      .finally(() => setTestLoading(false));
  };

  const handleValidate = () => {
    setError('');
    setValidationResult(null);
    HealthRiskArchitectureApi.validateFormula(formulaCode)
      .then((res) => setValidationResult(res.data))
      .catch((err) =>
        setError(err?.response?.data?.detail || 'Validation request failed'),
      );
  };

  const addResultCategory = () => {
    setResultCategories((prev) => [
      ...prev,
      { min: 0, max: 100, label: '', color: 'gray' },
    ]);
  };

  const updateResultCategory = (
    index: number,
    field: keyof ResultCategory,
    value: string | number,
  ) => {
    setResultCategories((prev) => {
      const next = [...prev];
      (next[index] as any)[field] = value;
      return next;
    });
  };

  const removeResultCategory = (index: number) => {
    setResultCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = (asDraft: boolean) => {
    setError('');
    if (!name.trim()) {
      setError('Domain name is required');
      return;
    }
    if (!formulaCode.trim()) {
      setError('Formula code is required');
      return;
    }
    setLoading(true);
    const payload: any = {
      name: name.trim(),
      display_name: displayName.trim() || undefined,
      category: category || undefined,
      icon: icon || undefined,
      description: description.trim() || undefined,
      output_type: outputType,
      formula_code: formulaCode.trim(),
      clinical_description: clinicalDescription.trim() || undefined,
      result_categories:
        outputType === 'NUMERIC' ? resultCategories : undefined,
      is_enabled: asDraft ? false : isEnabled,
      domain_weight: domainWeight,
      show_in_report_sections: showInReportSections,
      display_label: displayLabel.trim() || undefined,
      patient_facing_label: patientFacingLabel.trim() || undefined,
      color_scheme: colorScheme,
    };
    if (!isEdit) payload.domain_type = domainType;
    if (isEdit && domainId) {
      HealthRiskArchitectureApi.updateDomain(domainId, payload)
        .then(() => {
          onSaved();
          onClose();
        })
        .catch((err) =>
          setError(err?.response?.data?.detail || 'Update failed'),
        )
        .finally(() => setLoading(false));
    } else {
      HealthRiskArchitectureApi.createDomain({
        ...payload,
        is_enabled: asDraft ? false : isEnabled,
      })
        .then(() => {
          onSaved();
          onClose();
        })
        .catch((err) =>
          setError(err?.response?.data?.detail || 'Create failed'),
        )
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="max-w-[720px] w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-Gray-50 shadow-lg">
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-xl font-semibold text-Text-Primary">
          {isEdit
            ? `Edit ${domainType === 'PARAMETRIC_BIOMARKER' ? 'Parametric Biomarker' : domainType === 'AGING' ? 'Aging Domain' : domainType === 'SCORING' ? 'Score Domain' : 'Risk Domain'}`
            : `Add ${domainType === 'PARAMETRIC_BIOMARKER' ? 'Parametric Biomarker' : domainType === 'AGING' ? 'Aging Domain' : domainType === 'SCORING' ? 'Score Domain' : 'Risk Domain'}`}
        </h2>
        <p className="text-sm text-Gray-60 mt-1">
          {domainType === 'PARAMETRIC_BIOMARKER'
            ? 'Define a calculated biomarker from existing measurements (e.g. BMI, ratios).'
            : domainType === 'AGING'
              ? 'Define biological aging estimation from biomarkers.'
              : domainType === 'SCORING'
                ? 'Define a composite health score (0–100) for tracking.'
                : 'Define a risk domain and its formula. Categories and biomarkers come from your clinic configuration.'}
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Card: Basic Information – only necessary fields per spec */}
        <div className="border border-Gray-50 rounded-md bg-[#FDFDFD] overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-5">
            <Info className="w-4 h-4 text-Primary-EmeraldGreen shrink-0" />
            <h3 className="text-sm font-semibold text-Text-Primary uppercase tracking-wide">
              Basic Information
            </h3>
          </div>
          <div className="border-t border-Gray-50 mt-3" />
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-Text-Primary">
                  Domain Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-Gray-50 rounded-md px-3 py-2 text-sm bg-white"
                  placeholder={
                    domainType === 'AGING'
                      ? 'e.g. PhenoAge'
                      : domainType === 'PARAMETRIC_BIOMARKER'
                        ? 'e.g. BMI'
                        : 'e.g. Cardiovascular Risk'
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-Text-Primary">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border border-Gray-50 rounded-md px-3 py-2 text-sm bg-white"
                  placeholder="Client-facing name"
                />
              </div>
            </div>
            {NEEDS_CATEGORY(domainType) && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-Text-Primary">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-Gray-50 rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="" disabled>
                      No clinic categories
                    </option>
                  )}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isEnabled"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="rounded border-Gray-50 text-Primary-EmeraldGreen focus:ring-Primary-EmeraldGreen"
              />
              <label
                htmlFor="isEnabled"
                className="text-xs font-medium text-Text-Primary"
              >
                Enabled
              </label>
            </div>
          </div>
        </div>

        {/* Card: Output Type – only Numeric supported; Boolean/Categorical planned for future phases */}
        <div className="border border-Gray-50 rounded-md bg-[#FDFDFD] overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-5">
            <FileText className="w-4 h-4 text-Primary-EmeraldGreen shrink-0" />
            <h3 className="text-sm font-semibold text-Text-Primary uppercase tracking-wide">
              Output Type
            </h3>
          </div>
          <div className="border-t border-Gray-50 mt-3" />
          <div className="p-5">
            <div className="flex items-center gap-3 p-3 rounded-md border border-Primary-EmeraldGreen bg-Primary-EmeraldGreen/5">
              <span className="text-sm font-medium text-Text-Primary">
                Numeric (0-100 score)
              </span>
            </div>
          </div>
        </div>

        {/* Card: Formula & Result */}
        <div className="border border-Gray-50 rounded-md bg-[#FDFDFD] overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-5">
            <Calculator className="w-4 h-4 text-Primary-EmeraldGreen shrink-0" />
            <h3 className="text-sm font-semibold text-Text-Primary uppercase tracking-wide">
              Formula & Result
            </h3>
          </div>
          <div className="border-t border-Gray-50 mt-3" />
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-Text-Primary">
                Formula Code *
              </label>
              <p className="text-xs text-Gray-60">
                Use the templates below. Each inserts a complete, valid block –
                no syntax errors.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={insertStarterFormula}
                  className="text-xs px-2 py-1.5 rounded border border-Primary-EmeraldGreen bg-Primary-EmeraldGreen/10 text-Primary-EmeraldGreen hover:bg-Primary-EmeraldGreen/20 transition-colors font-medium"
                >
                  Start from template
                </button>
                <button
                  type="button"
                  onClick={insertStatusWeightTemplate}
                  className="text-xs px-2 py-1.5 rounded border border-Primary-EmeraldGreen/50 bg-Primary-EmeraldGreen/5 text-Primary-EmeraldGreen hover:bg-Primary-EmeraldGreen/10 transition-colors font-medium"
                >
                  + Add biomarker (status_weight)
                </button>
                <button
                  type="button"
                  onClick={insertAgeModifierTemplate}
                  className="text-xs px-2 py-1.5 rounded border border-Primary-EmeraldGreen/50 bg-Primary-EmeraldGreen/5 text-Primary-EmeraldGreen hover:bg-Primary-EmeraldGreen/10 transition-colors font-medium"
                >
                  + Add age/gender modifier
                </button>
              </div>
              <textarea
                ref={formulaTextareaRef}
                value={formulaCode}
                onChange={(e) => setFormulaCode(e.target.value)}
                className="w-full border border-Gray-50 rounded-md px-3 py-2 text-sm font-mono min-h-[120px] resize-none bg-white"
                placeholder={
                  'score = 0.0\nscore += status_weight(Biomarker.LDL, {...})\nscore * 100'
                }
                spellCheck={false}
              />
              {biomarkers.length > 0 && (
                <div className="border border-Gray-50 rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowBiomarkerRef(!showBiomarkerRef)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-Text-Primary bg-[#FAFAFA] hover:bg-Gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <Copy className="w-3.5 h-3.5" />
                      Biomarker Reference ({biomarkers.length} biomarkers) –
                      click to insert
                    </span>
                    {showBiomarkerRef ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {showBiomarkerRef && (
                    <div className="max-h-[200px] overflow-hidden flex flex-col border-t border-Gray-50">
                      <div className="p-2 border-b border-Gray-50 shrink-0">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-Gray-60" />
                          <input
                            type="text"
                            value={biomarkerSearch}
                            onChange={(e) => setBiomarkerSearch(e.target.value)}
                            placeholder="Search biomarkers..."
                            className="w-full pl-8 pr-2 py-1.5 text-sm border border-Gray-50 rounded bg-white"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1 p-2">
                        {biomarkersGrouped.length === 0 ? (
                          <p className="text-xs text-Gray-60 py-2">
                            No biomarkers match your search.
                          </p>
                        ) : (
                          biomarkersGrouped.map(([area, list]) => (
                            <div key={area} className="mb-3">
                              <div className="text-xs font-medium text-Gray-60 mb-1">
                                {area}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {list.map((b) => {
                                  const token =
                                    'Biomarker.' + b.name.replace(/\s/g, '_');
                                  return (
                                    <button
                                      key={b.name}
                                      type="button"
                                      onClick={() => insertBiomarker(b)}
                                      className="text-xs px-2 py-1 rounded bg-white border border-Gray-50 hover:border-Primary-EmeraldGreen hover:text-Primary-EmeraldGreen font-mono truncate max-w-[200px]"
                                      title={`Click to insert ${token}`}
                                    >
                                      {b.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Preview panel: Validate & test with example values only (no client data) */}
              <div className="border border-Gray-50 rounded-md p-3 bg-[#FAFAFA] space-y-3">
                <div className="text-xs font-medium text-Text-Primary">
                  Preview panel
                </div>
                <p className="text-[10px] text-Gray-60">
                  Testing with 30-year-old male (example profile).{' '}
                  {hasPreviewDeps
                    ? 'Adjust example values below, then run Test.'
                    : 'Validate formula first to see biomarker inputs.'}
                </p>
                {domainType === 'AGING' && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-Text-Primary">
                      Age (Profile.age):
                    </label>
                    <input
                      type="number"
                      value={previewProfileAge}
                      onChange={(e) =>
                        setPreviewProfileAge(Number(e.target.value) || 30)
                      }
                      className="w-16 border border-Gray-50 rounded px-2 py-1 text-xs"
                      min={1}
                      max={120}
                    />
                  </div>
                )}
                {hasPreviewDeps && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-medium text-Gray-60">
                      Example values
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {previewDependencies.map((b: string) => (
                        <label
                          key={b}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <span className="text-Text-Primary truncate max-w-[100px]">
                            {b}:
                          </span>
                          <input
                            type="number"
                            value={previewBiomarkerValues[b] ?? 100}
                            onChange={(e) =>
                              setPreviewValue(b, Number(e.target.value) || 0)
                            }
                            className="w-16 border border-Gray-50 rounded px-1.5 py-1 text-xs"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  className="text-xs text-Primary-EmeraldGreen hover:underline font-medium"
                  onClick={handleValidate}
                >
                  Validate Formula
                </button>
                <button
                  type="button"
                  className="text-xs text-Primary-EmeraldGreen hover:underline font-medium disabled:opacity-50"
                  onClick={handleTestSample}
                  disabled={testLoading || !formulaCode.trim()}
                >
                  {testLoading ? 'Running…' : 'Test with Sample Data'}
                </button>
              </div>
              {testResult && (
                <div className="space-y-2">
                  <div
                    className={`text-xs p-2 rounded-md ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                  >
                    {testResult.success
                      ? `Result: ${JSON.stringify(testResult.result)}`
                      : `Error: ${testResult.error}`}
                  </div>
                  {testResult.success &&
                    testResult.contributing_biomarkers &&
                    Object.keys(testResult.contributing_biomarkers).length >
                      0 && (
                      <div className="text-xs p-3 rounded-md bg-Gray-50 border border-Gray-50 space-y-1.5">
                        <div className="font-medium text-Text-Primary">
                          Per-biomarker breakdown
                        </div>
                        <ul className="list-none space-y-0.5">
                          {Object.entries(
                            testResult.contributing_biomarkers,
                          ).map(([name, v]) => (
                            <li key={name} className="text-Gray-70">
                              {name}: {v?.value != null ? Number(v.value) : '—'}{' '}
                              ({v?.zone ?? '—'})
                            </li>
                          ))}
                        </ul>
                        {testResult.category != null && (
                          <div className="pt-1 font-medium text-Text-Primary">
                            Category: {testResult.category}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              )}
              {validationResult && (
                <>
                  <div
                    className={`text-xs p-2 rounded-md ${
                      validationResult.syntax_valid
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {validationResult.syntax_valid
                      ? 'Syntax valid.'
                      : validationResult.error_message || 'Invalid syntax'}
                    {validationResult.biomarker_dependencies?.length
                      ? ` Biomarkers: ${validationResult.biomarker_dependencies.join(', ')}`
                      : ''}
                  </div>
                  {validationResult.biomarkers_not_in_clinic &&
                    validationResult.biomarkers_not_in_clinic.length > 0 && (
                      <div className="text-xs p-2 rounded-md bg-amber-50 text-amber-800">
                        Not in clinic chart_bounds:{' '}
                        {validationResult.biomarkers_not_in_clinic.join(', ')}
                      </div>
                    )}
                </>
              )}
            </div>
            {NEEDS_RESULT_CATEGORIES(domainType, outputType) && (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-Text-Primary">
                  Result Categories
                </label>
                <div className="border border-Gray-50 rounded-md overflow-hidden bg-white">
                  <div className="grid grid-cols-[70px_70px_1fr_90px_64px] gap-2 px-3 py-2 text-xs font-medium text-Gray-60 border-b border-Gray-50 bg-[#FAFAFA]">
                    <span>Min</span>
                    <span>Max</span>
                    <span>Label</span>
                    <span>Color</span>
                    <span />
                  </div>
                  {resultCategories.map((cat, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[70px_70px_1fr_90px_64px] gap-2 px-3 py-2 items-center border-b border-Gray-50 last:border-b-0"
                    >
                      <input
                        type="number"
                        value={cat.min}
                        onChange={(e) =>
                          updateResultCategory(
                            index,
                            'min',
                            Number(e.target.value),
                          )
                        }
                        className="w-full border border-Gray-50 rounded px-2 py-1.5 text-sm"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={cat.max}
                        onChange={(e) =>
                          updateResultCategory(
                            index,
                            'max',
                            Number(e.target.value),
                          )
                        }
                        className="w-full border border-Gray-50 rounded px-2 py-1.5 text-sm"
                        placeholder="100"
                      />
                      <input
                        type="text"
                        value={cat.label}
                        onChange={(e) =>
                          updateResultCategory(index, 'label', e.target.value)
                        }
                        className="w-full border border-Gray-50 rounded px-2 py-1.5 text-sm"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={cat.color}
                        onChange={(e) =>
                          updateResultCategory(index, 'color', e.target.value)
                        }
                        className="w-full border border-Gray-50 rounded px-2 py-1.5 text-sm"
                        placeholder="green"
                      />
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline text-left"
                        onClick={() => removeResultCategory(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-xs text-Primary-EmeraldGreen hover:underline font-medium"
                  onClick={addResultCategory}
                >
                  + Add Category
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end gap-3 pt-4 border-t border-Gray-50">
          <ButtonSecondary onClick={onClose} ClassName="rounded-lg text-sm">
            Cancel
          </ButtonSecondary>
          <ButtonSecondary
            onClick={() => handleSave(true)}
            ClassName="rounded-lg text-sm"
            outline
          >
            Save as Draft
          </ButtonSecondary>
          <ButtonSecondary
            onClick={() => handleSave(false)}
            ClassName="rounded-lg text-sm"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save & Enable'}
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
}
