/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import Circleloader from '../../Components/CircleLoader';
import { MainModal } from '../../Components';
import RiskDomainCard from '../HealthRiskArchitecture/RiskDomainCard';
import RiskDomainEditorModal from '../HealthRiskArchitecture/RiskDomainEditorModal';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';

// Spec 2.1: Tab 1 Risk Assessment, Tab 2 Biological Aging, Tab 3 Health Scoring, Tab 4 Parametric Biomarkers
const TABS = [
  { key: 'risk', label: 'Risk Assessment', domainType: 'RISK' },
  { key: 'aging', label: 'Biological Aging', domainType: 'AGING' },
  { key: 'scoring', label: 'Health Scoring', domainType: 'SCORING' },
  {
    key: 'biomarkers',
    label: 'Parametric Biomarkers',
    domainType: 'PARAMETRIC_BIOMARKER',
  },
] as const;

const CustomParametric = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const currentTab = TABS.find((t) => t.key === (tab || 'risk')) || TABS[0];
  const domainType = currentTab.domainType;

  const [domains, setDomains] = useState<any[]>([]);
  const [clinicCategories, setClinicCategories] = useState<
    { name: string; position?: string; description?: string }[]
  >([]);
  const [clinicBiomarkers, setClinicBiomarkers] = useState<
    { name: string; benchmark_area: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const fetchClinicOptions = () => {
    HealthRiskArchitectureApi.getClinicOptions()
      .then((res) => {
        setClinicCategories(
          Array.isArray(res.data?.categories) ? res.data.categories : [],
        );
        setClinicBiomarkers(
          Array.isArray(res.data?.biomarkers) ? res.data.biomarkers : [],
        );
      })
      .catch(() => {
        setClinicCategories([]);
        setClinicBiomarkers([]);
      });
  };

  const fetchDomains = () => {
    setIsLoading(true);
    HealthRiskArchitectureApi.getDomains(domainType)
      .then((res) => setDomains(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDomains([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchClinicOptions();
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [domainType]);

  const openAdd = () => {
    setEditingId(null);
    setInitialData({ domain_type: domainType });
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    const domain = domains.find((d) => d.id === id);
    setEditingId(id);
    setInitialData(domain ? { ...domain } : null);
    setModalOpen(true);
  };

  const openPreview = () => {
    toast.info('Preview in report');
  };

  const openDuplicate = (id: string) => {
    const domain = domains.find((d) => d.id === id);
    if (!domain) return;
    setEditingId(null);
    setInitialData({
      ...domain,
      id: undefined,
      name: (domain.name || '') + ' (Copy)',
      display_name: (domain.display_name || '') + ' (Copy)',
      domain_type: domain.domain_type || domainType,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this domain?')) return;
    HealthRiskArchitectureApi.deleteDomain(id)
      .then(() => {
        toast.success('Domain deleted');
        fetchDomains();
      })
      .catch((err) =>
        toast.error(err?.response?.data?.detail || 'Delete failed'),
      );
  };

  const onSaved = () => {
    fetchDomains();
  };

  const handleImportDefaults = () => {
    setImportError(null);
    setImporting(true);
    HealthRiskArchitectureApi.importDefaults()
      .then((res) => {
        const n = res.data?.imported ?? 0;
        if (n > 0) {
          toast.success(`Imported ${n} default domain(s)`);
          fetchDomains();
        } else {
          toast.info(res.data?.message || 'No defaults imported');
        }
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.detail || err?.message || 'Import failed';
        setImportError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        toast.error(msg, { autoClose: 8000 });
      })
      .finally(() => setImporting(false));
  };

  const totalActive = domains.filter((d) => d.is_enabled !== false).length;
  const totalBiomarkersMapped = domains.reduce(
    (sum, d) => sum + (d.biomarker_count || 0),
    0,
  );

  const addLabel =
    currentTab.key === 'biomarkers'
      ? 'Biomarker'
      : currentTab.key === 'risk'
        ? 'Risk Domain'
        : currentTab.key === 'aging'
          ? 'Aging Domain'
          : 'Score Domain';

  return (
    <>
      <div
        className="px-3 md:px-4 2xl:px-6 pt-4 pb-8 overflow-auto h-fit"
        style={{
          minHeight:
            window.innerWidth < 720 ? window.innerHeight - 87 + 'px' : '',
        }}
      >
        {/* Page header – Staff pattern: title left, actions right (applies to all 4 tabs) */}
        <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-base font-medium text-Text-Primary">
              Custom Parametric
            </h1>
            <p className="text-[10px] md:text-xs text-Text-Quadruple mt-1">
              Define risk, aging, scoring, and parametric biomarker domains. Use
              formulas with Biomarker, Profile, and Context.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <ButtonSecondary
              outline
              ClassName="rounded-[20px] text-xs"
              onClick={handleImportDefaults}
              disabled={importing}
            >
              <img src="/icons/download.svg" alt="" className="w-4 h-4" />
              {importing ? 'Importing…' : 'Import Defaults'}
            </ButtonSecondary>
          </div>
        </div>
        <div className="w-full border-t border-Gray-50 mt-4" />

        {/* Tab navigation – separate row, clear separation */}
        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => navigate(`/custom-parametric/${t.key}`)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab.key === t.key
                  ? 'bg-Primary-DeepTeal text-white border border-Primary-DeepTeal'
                  : 'bg-white text-Text-Quadruple hover:bg-Gray-50 border border-Gray-50 shadow-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Domain grid – Dashboard-style card (bg-white, shadow-200, rounded-2xl) */}
        <div className="mt-4 w-full overflow-hidden bg-white rounded-2xl shadow-200 p-4 md:p-6">
          <h2 className="text-sm font-medium text-Text-Primary mb-4">
            {currentTab.label}
          </h2>

          {importError && (
            <div
              className="mb-4 p-4 rounded-xl border border-Red bg-[#F9DEDC] text-Text-Primary text-xs flex items-start justify-between gap-3"
              role="alert"
            >
              <span>{importError}</span>
              <button
                type="button"
                onClick={() => setImportError(null)}
                className="text-Red hover:opacity-80 shrink-0"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[280px] py-12">
              <Circleloader />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {domains.map((domain) => (
                  <RiskDomainCard
                    key={domain.id}
                    domain={domain}
                    onEdit={() => openEdit(domain.id)}
                    onPreview={openPreview}
                    onDuplicate={() => openDuplicate(domain.id)}
                    onDelete={() => handleDelete(domain.id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={openAdd}
                  className="min-h-[140px] border-2 border-dashed border-Gray-50 rounded-xl flex items-center justify-center gap-2 text-Text-Quadruple bg-Gray-25 hover:border-Primary-EmeraldGreen hover:text-Primary-DeepTeal transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs font-medium">Add {addLabel}</span>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-Gray-50 text-xs text-Text-Quadruple">
                Total Active Domains: {totalActive} | Total Biomarkers Mapped:{' '}
                {totalBiomarkersMapped}
              </div>
            </>
          )}
        </div>
      </div>

      <MainModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <RiskDomainEditorModal
          domainId={editingId}
          initialData={initialData}
          domainType={domainType}
          categories={clinicCategories}
          biomarkers={clinicBiomarkers}
          onClose={() => setModalOpen(false)}
          onSaved={onSaved}
        />
      </MainModal>
    </>
  );
};

export default CustomParametric;
