import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, RefreshCw, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { formatApiErrorMessage } from '../../utils/jsonErrorDetails';
import { removeAdminToken } from '../../store/adminToken';
import ParametricDomainsPanel from '../CustomParametric/ParametricDomainsPanel';
import RiskDomainsPanel from '../CustomParametric/RiskDomainsPanel';
import {
  adminIntelligenceApi,
  adminDefaultIntelligenceApi,
} from '../CustomParametric/intelligenceApi';
import {
  MODEL_CATEGORIES,
  resolveModelCategory,
  type ModelCategoryKey,
} from '../CustomParametric/modelCategories';
import AdminShellLayout from './AdminShellLayout';
import {
  canManageClinicIntelligence,
  intelligenceSyncSummaryMessage,
  type IntelligenceSyncSummary,
} from './adminIntelligenceUtils';
import ClinicSearchSelect from './questionnaires/ClinicSearchSelect';
import {
  normalizeAdminClinicOption,
  type AdminClinicOption,
} from './questionnaires/types';

type Scope = 'default' | 'clinic';

const AdminIntelligenceModels = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [clinics, setClinics] = useState<AdminClinicOption[]>([]);
  const [clinicId, setClinicId] = useState<number | ''>('');
  const [selected, setSelected] = useState<ModelCategoryKey>('risk');
  const [scope, setScope] = useState<Scope>('default');
  const [syncing, setSyncing] = useState(false);

  const handleAuthFailure = useCallback(() => {
    removeAdminToken();
    navigate('/admin/login');
  }, [navigate]);

  const loadClinics = useCallback(async () => {
    const res = await AdminApi.listClinics();
    setClinics(
      (res.data?.clinics || []).map((clinic: Record<string, unknown>) =>
        normalizeAdminClinicOption(clinic),
      ),
    );
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
        await loadClinics();
      } catch {
        handleAuthFailure();
      } finally {
        setLoadingPage(false);
      }
    };
    init().catch(() => {});
  }, [handleAuthFailure, loadClinics]);

  const selectedClinic = clinics.find((clinic) => clinic.clinic_id === clinicId);
  const editingDefaults = scope === 'default';

  const intelligenceApi = useMemo(() => {
    if (editingDefaults) return adminDefaultIntelligenceApi();
    if (!canManageClinicIntelligence(clinicId)) return null;
    return adminIntelligenceApi(clinicId);
  }, [clinicId, editingDefaults]);

  const handleClinicChange = (next: number | '') => {
    setClinicId(next);
    setSelected('risk');
  };

  const handleScopeChange = (next: Scope) => {
    setScope(next);
    setSelected('risk');
  };

  const handleSyncDefaults = async () => {
    if (syncing) return;
    const confirmed = window.confirm(
      'Sync every default Intelligence formula to all clinics?\n\nClinics that already have the same formula are updated. A formula is skipped when a clinic is missing a biomarker or questionnaire it needs.',
    );
    if (!confirmed) return;
    setSyncing(true);
    try {
      const res = await AdminApi.syncIntelligenceDefaults();
      const summary = res.data as IntelligenceSyncSummary;
      const message = intelligenceSyncSummaryMessage(summary);
      if (!summary.formula_count || !summary.clinics_targeted) {
        toast.info(message);
      } else if (summary.created === 0 && summary.updated === 0 && summary.skipped > 0) {
        toast.error(message);
      } else {
        toast.success(message);
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        handleAuthFailure();
        return;
      }
      toast.error(formatApiErrorMessage(err) || 'Failed to sync default formulas.');
    } finally {
      setSyncing(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <Circleloader />
      </div>
    );
  }

  return (
    <AdminShellLayout
      title="Intelligence Models"
      subtitle="Set the default Intelligence formulas for every clinic, or customize one clinic."
      showGlobalFilters={false}
      actions={
        <button
          type="button"
          onClick={() => {
            loadClinics().catch(() => {});
          }}
          className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      }
    >
      <div className="space-y-4">
        <div className="mb-4 inline-flex rounded-full border border-Gray-50 bg-white p-1 text-[12px]">
          <button
            type="button"
            onClick={() => handleScopeChange('default')}
            className={`rounded-full px-4 py-2 ${
              editingDefaults ? 'bg-[#005F73] text-white' : 'text-Text-Primary'
            }`}
          >
            Default
          </button>
          <button
            type="button"
            onClick={() => handleScopeChange('clinic')}
            className={`rounded-full px-4 py-2 ${
              editingDefaults ? 'text-Text-Primary' : 'bg-[#005F73] text-white'
            }`}
          >
            Clinic
          </button>
        </div>

        {editingDefaults ? (
          <div className="flex flex-col gap-3 rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100 md:flex-row md:items-center md:justify-between">
            <p className="text-[12px] text-Text-Secondary">
              Save formulas here as the default. A new clinic receives them when
              it is created. After you change a default, press Sync to apply it
              to every existing clinic. Deleting a default leaves copies already
              saved on clinics.
            </p>
            <button
              type="button"
              onClick={() => {
                handleSyncDefaults().catch(() => {});
              }}
              disabled={syncing}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-Primary-DeepTeal px-4 text-[12px] text-white disabled:opacity-60"
            >
              <Repeat size={14} />
              {syncing ? 'Syncing…' : 'Sync to all clinics'}
            </button>
          </div>
        ) : (
          <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
            <div className="w-full md:max-w-[520px]">
              <label className="mb-1 block text-[12px] text-Text-Secondary">
                Clinic
              </label>
              <ClinicSearchSelect
                clinics={clinics}
                value={clinicId}
                onChange={handleClinicChange}
                placeholder="Search clinic name or email"
              />
            </div>
            {selectedClinic ? (
              <p className="mt-3 text-[12px] text-Text-Secondary">
                Editing {selectedClinic.name || `Clinic #${selectedClinic.clinic_id}`}
                {selectedClinic.primary_email
                  ? ` · ${selectedClinic.primary_email}`
                  : ''}{' '}
                · ID {selectedClinic.clinic_id}
              </p>
            ) : (
              <p className="mt-3 text-[12px] text-Text-Secondary">
                Select a clinic to view and customize its Intelligence models.
              </p>
            )}
          </div>
        )}

        {!intelligenceApi ? (
          <div className="rounded-[20px] border border-Gray-50 bg-white p-8 text-center text-[13px] text-Text-Secondary shadow-100">
            Choose a clinic first. Create, edit, toggle, and library import stay
            disabled until a clinic is selected.
          </div>
        ) : (
          <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MODEL_CATEGORIES.map((cat) => {
                const isSelected = selected === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelected(resolveModelCategory(cat.tab))}
                    aria-pressed={isSelected}
                    aria-label={cat.name}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-Primary-DeepTeal shadow-lg shadow-Primary-DeepTeal/15'
                        : 'border border-gray-200/80 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                      <img
                        src={cat.imageSrc}
                        alt={cat.name}
                        className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${
                          isSelected
                            ? 'brightness-100'
                            : 'brightness-[0.92] group-hover:brightness-100'
                        }`}
                      />
                      <div
                        className={`absolute inset-0 transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-t from-Primary-DeepTeal/70 via-Primary-DeepTeal/15 to-transparent'
                            : 'bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70'
                        }`}
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                        <p className="text-[15px] font-bold text-white">
                          {cat.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-white/70">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-Primary-DeepTeal shadow-sm">
                        <Check
                          className="size-3.5 text-white"
                          strokeWidth={3}
                        />
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-6" key={`${editingDefaults ? 'default' : clinicId}-${selected}`}>
              {selected === 'risk' ? (
                <RiskDomainsPanel modelKind="RISK" api={intelligenceApi} />
              ) : selected === 'health' ? (
                <RiskDomainsPanel modelKind="SCORING" api={intelligenceApi} />
              ) : selected === 'parametric' ? (
                <ParametricDomainsPanel api={intelligenceApi} />
              ) : (
                <RiskDomainsPanel modelKind="AGING" api={intelligenceApi} />
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShellLayout>
  );
};

export default AdminIntelligenceModels;
