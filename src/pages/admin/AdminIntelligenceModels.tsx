import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import ParametricDomainsPanel from '../CustomParametric/ParametricDomainsPanel';
import RiskDomainsPanel from '../CustomParametric/RiskDomainsPanel';
import { adminIntelligenceApi } from '../CustomParametric/intelligenceApi';
import {
  MODEL_CATEGORIES,
  resolveModelCategory,
  type ModelCategoryKey,
} from '../CustomParametric/modelCategories';
import AdminShellLayout from './AdminShellLayout';
import { canManageClinicIntelligence } from './adminIntelligenceUtils';
import ClinicSearchSelect from './questionnaires/ClinicSearchSelect';
import {
  normalizeAdminClinicOption,
  type AdminClinicOption,
} from './questionnaires/types';

const AdminIntelligenceModels = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [clinics, setClinics] = useState<AdminClinicOption[]>([]);
  const [clinicId, setClinicId] = useState<number | ''>('');
  const [selected, setSelected] = useState<ModelCategoryKey>('risk');

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

  const intelligenceApi = useMemo(
    () => (clinicId ? adminIntelligenceApi(clinicId) : null),
    [clinicId],
  );

  const handleClinicChange = (next: number | '') => {
    setClinicId(next);
    setSelected('risk');
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
      subtitle="Customize Risk, Age Clock, Health Score, and Parametric models for a selected clinic."
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

        {!canManageClinicIntelligence(clinicId) || !intelligenceApi ? (
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

            <div className="mt-6" key={`${clinicId}-${selected}`}>
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
