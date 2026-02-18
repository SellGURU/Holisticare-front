/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import Circleloader from '../../Components/CircleLoader';
import { MainModal } from '../../Components';
import RiskDomainCard from './RiskDomainCard.tsx';
import RiskDomainEditorModal from './RiskDomainEditorModal.tsx';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';

const HealthRiskArchitecture = () => {
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
    HealthRiskArchitectureApi.getDomains()
      .then((res) => setDomains(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDomains([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchClinicOptions();
    fetchDomains();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setInitialData(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    const domain = domains.find((d) => d.id === id);
    setEditingId(id);
    setInitialData(domain ? { ...domain } : null);
    setModalOpen(true);
  };

  const openPreview = () => {
    toast.info('Preview coming soon');
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
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this risk domain?')) return;
    HealthRiskArchitectureApi.deleteDomain(id)
      .then(() => {
        toast.success('Risk domain deleted');
        fetchDomains();
      })
      .catch((err) =>
        toast.error(err?.response?.data?.detail || 'Delete failed'),
      );
  };

  const onSaved = () => {
    fetchDomains();
  };

  const totalActive = domains.filter((d) => d.is_enabled !== false).length;
  const totalBiomarkersMapped = domains.reduce(
    (sum, d) => sum + (d.biomarker_count || 0),
    0,
  );

  return (
    <div className="md:px-6 pt-8 h-screen md:h-auto pb-[100px] md:pb-0 pr-1 md:pr-0 overflow-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-Text-Primary">
          Health Risk Architecture
        </h1>
        <p className="text-sm text-Gray-60 mt-1">
          Define risk domains and formulas. Categories and biomarkers come from
          your clinic configuration.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
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
              className="min-h-[140px] border-2 border-dashed border-Gray-50 rounded-lg flex items-center justify-center gap-2 text-Gray-60 hover:border-Primary-EmeraldGreen hover:text-Primary-EmeraldGreen transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Add Risk Domain</span>
            </button>
          </div>

          <footer className="mt-8 pt-4 border-t border-Gray-50 text-sm text-Gray-60">
            Total Active Domains: {totalActive} | Total Biomarkers Mapped:{' '}
            {totalBiomarkersMapped}
          </footer>
        </>
      )}

      <MainModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <RiskDomainEditorModal
          domainId={editingId}
          initialData={initialData}
          categories={clinicCategories}
          biomarkers={clinicBiomarkers}
          onClose={() => setModalOpen(false)}
          onSaved={onSaved}
        />
      </MainModal>
    </div>
  );
};

export default HealthRiskArchitecture;
