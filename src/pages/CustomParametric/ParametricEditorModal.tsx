/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import BiomarkersApi from '../../api/Biomarkers';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import { invalidate } from '../../utils/pageCache';
import CatalogBiomarkerPicker from './CatalogBiomarkerPicker';
import FormulaCodeEditor from './FormulaCodeEditor';
import { formulaHasUnknownBiomarkers } from './formulaBiomarker';
import IntelligenceModal, { apiErrorMessage } from './IntelligenceModal';
import {
  v2LabelClass,
  v2OutlineBtnClass,
  v2PrimaryBtnClass,
} from './intelligenceUi';
import type { ClinicBiomarkerOption, RiskDomainViewModel } from './types';

const DEFAULT_FORMULA =
  'round(Biomarker.Weight / ((Biomarker.Height / 100) ** 2), 2)';

interface ParametricEditorModalProps {
  open: boolean;
  domain: RiskDomainViewModel | null;
  attachedUids: string[];
  onClose: () => void;
  onSaved: () => void;
}

function mapCatalogItem(item: any): ClinicBiomarkerOption | null {
  const uid = String(item?.biomarker_uid || '').trim();
  const name = String(item?.Biomarker || item?.name || '').trim();
  if (!uid || !name) return null;
  return {
    biomarker_uid: uid,
    name,
    unit: item?.unit || '',
    benchmark_area: item?.['Benchmark areas'] || item?.benchmark_area || '',
  };
}

export default function ParametricEditorModal({
  open,
  domain,
  attachedUids,
  onClose,
  onSaved,
}: ParametricEditorModalProps) {
  const isEdit = Boolean(domain);
  const [catalog, setCatalog] = useState<ClinicBiomarkerOption[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [uid, setUid] = useState('');
  const [formulaCode, setFormulaCode] = useState(DEFAULT_FORMULA);
  const [isEnabled, setIsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<{
    syntax_valid?: boolean;
    error_message?: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setValidation(null);
    setUid(domain?.catalogBiomarkerUid ?? '');
    setFormulaCode(domain?.formulaCode || DEFAULT_FORMULA);
    setIsEnabled(domain?.isEnabled ?? true);
    setLoadingCatalog(true);
    BiomarkersApi.getBiomarkersList({ include_all: true })
      .then((res) => {
        const rows = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.chart_bounds)
            ? res.data.chart_bounds
            : [];
        const mapped = rows
          .map(mapCatalogItem)
          .filter(Boolean) as ClinicBiomarkerOption[];
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setCatalog(mapped);
      })
      .catch(() => setCatalog([]))
      .finally(() => setLoadingCatalog(false));
  }, [open, domain]);

  const attachedSet = useMemo(() => new Set(attachedUids), [attachedUids]);

  const pickerItems = useMemo(() => {
    return catalog.map((item) => {
      const itemUid = item.biomarker_uid || '';
      const alreadyAttached =
        attachedSet.has(itemUid) && itemUid !== (domain?.catalogBiomarkerUid || '');
      return {
        ...item,
        has_parametric: alreadyAttached,
        selectable: !alreadyAttached,
      };
    });
  }, [catalog, attachedSet, domain?.catalogBiomarkerUid]);

  const selected = pickerItems.find((item) => item.biomarker_uid === uid);
  const formulaInvalid = formulaHasUnknownBiomarkers(
    formulaCode,
    catalog.map((item) => item.name),
  );

  const handleValidate = () => {
    if (!formulaCode.trim()) return;
    setValidating(true);
    setValidation(null);
    HealthRiskArchitectureApi.validateFormula(formulaCode, {
      domain_type: 'PARAMETRIC_BIOMARKER',
      catalog_biomarker_uid: uid || undefined,
    })
      .then((res) => setValidation(res.data || null))
      .catch((err) =>
        setValidation({
          syntax_valid: false,
          error_message: apiErrorMessage(err, 'Validation failed'),
        }),
      )
      .finally(() => setValidating(false));
  };

  const handleSave = () => {
    if (!uid || !selected || formulaInvalid) return;
    setSaving(true);
    const body: any = {
      name: selected.name,
      display_name: selected.name,
      domain_type: 'PARAMETRIC_BIOMARKER',
      output_type: 'NUMERIC',
      formula_code: formulaCode,
      catalog_biomarker_uid: uid,
      is_enabled: isEnabled,
      category: selected.benchmark_area || undefined,
    };
    const request =
      isEdit && domain?.id
        ? HealthRiskArchitectureApi.updateDomain(domain.id, body)
        : HealthRiskArchitectureApi.createDomain(body);

    request
      .then(() => {
        invalidate('portal:healthplan:');
        toast.success(isEdit ? 'Formula saved' : 'Formula attached');
        onSaved();
        onClose();
      })
      .catch((err) => toast.error(apiErrorMessage(err, 'Save failed')))
      .finally(() => setSaving(false));
  };

  return (
    <IntelligenceModal
      isOpen={open}
      onClose={onClose}
      title={isEdit ? 'Edit parametric formula' : 'Attach parametric formula'}
      description="Select an existing clinic biomarker and attach its calculation. Define the biomarker in Custom Biomarkers first."
      widthClass="w-[min(920px,calc(100vw-2rem))]"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-gray-500">
            Saved to this clinic's Parametric Biomarkers
          </p>
          <div className="flex gap-2">
            <button type="button" className={v2OutlineBtnClass} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={v2PrimaryBtnClass}
              onClick={handleSave}
              disabled={!uid || saving || !formulaCode.trim() || formulaInvalid}
            >
              {saving
                ? 'Saving…'
                : isEdit
                  ? 'Save formula'
                  : 'Attach formula'}
            </button>
          </div>
        </div>
      }
    >
      <div className="grid items-start gap-x-5 gap-y-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className={v2LabelClass}>Catalog biomarker *</p>
            <CatalogBiomarkerPicker
              items={pickerItems}
              value={uid}
              onChange={setUid}
              disabled={isEdit}
              loading={loadingCatalog}
            />
          </div>

          {selected ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-[12px] text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Name:</span>{' '}
                {selected.name}
              </p>
              <p>
                <span className="font-medium text-gray-800">Unit:</span>{' '}
                {selected.unit || '—'}
              </p>
              <p>
                <span className="font-medium text-gray-800">Category:</span>{' '}
                {selected.benchmark_area || '—'}
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                Thresholds stay on Custom Biomarkers. This tab cannot change
                them.
              </p>
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className={v2LabelClass}>Enabled</span>
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              onClick={() => setIsEnabled((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full shadow-xs transition-colors ${
                isEnabled ? 'bg-[#10B981]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block size-4 rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className={v2LabelClass}>Formula code *</span>
            <button
              type="button"
              className={`${v2OutlineBtnClass} !h-7 !text-[10px]`}
              onClick={handleValidate}
              disabled={validating || !formulaCode.trim()}
            >
              {validating ? 'Validating…' : 'Validate Formula'}
            </button>
          </div>
            <FormulaCodeEditor
              value={formulaCode}
              onChange={(next) => {
                setFormulaCode(next);
                setValidation(null);
              }}
              catalog={catalog}
              placeholder={DEFAULT_FORMULA}
              rows={8}
              textareaClassName="min-h-[180px] resize-y"
            />
          {validation ? (
            validation.syntax_valid ? (
              <p className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[12px] text-emerald-800">
                <CheckCircle2 className="size-3.5" />
                Formula is valid.
              </p>
            ) : (
              <p className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2 text-[12px] text-red-700">
                <XCircle className="size-3.5" />
                {validation.error_message || 'Invalid formula'}
              </p>
            )
          ) : null}
        </div>
      </div>
    </IntelligenceModal>
  );
}
