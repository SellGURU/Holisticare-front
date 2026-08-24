/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Network, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import DeleteDomainModal from './DeleteDomainModal';
import ParametricEditorModal from './ParametricEditorModal';
import RiskDomainCard from './RiskDomainCard';
import ViewDomainModal from './ViewDomainModal';
import { mapHealthRiskDomain, type RiskDomainViewModel } from './types';

export default function ParametricDomainsPanel() {
  const [rawDomains, setRawDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [activeDomain, setActiveDomain] = useState<RiskDomainViewModel | null>(
    null,
  );
  const [viewDomain, setViewDomain] = useState<RiskDomainViewModel | null>(
    null,
  );
  const [deleteDomain, setDeleteDomain] = useState<RiskDomainViewModel | null>(
    null,
  );

  const domains = useMemo(
    () => rawDomains.map(mapHealthRiskDomain),
    [rawDomains],
  );

  const fetchDomains = () => {
    setLoading(true);
    HealthRiskArchitectureApi.getDomains('PARAMETRIC_BIOMARKER')
      .then((res) => setRawDomains(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRawDomains([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return domains;
    return domains.filter(
      (domain) =>
        domain.displayName.toLowerCase().includes(q) ||
        domain.name.toLowerCase().includes(q) ||
        (domain.catalogName || '').toLowerCase().includes(q),
    );
  }, [domains, search]);

  const openCreate = () => {
    setActiveDomain(null);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">
            Parametric Biomarkers
          </h2>
          <p className="text-[12px] text-Text-Quadruple">
            Attach a calculation to a biomarker that already exists in Custom
            Biomarkers.
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attached biomarkers…"
              className="h-9 w-full rounded-xl border border-Gray-50 bg-white pl-8 pr-3 text-[12px] text-Text-Primary sm:w-[220px]"
            />
          </div>
          <ButtonPrimary size="small" onClick={openCreate}>
            <Plus className="size-3.5" />
            Attach formula
          </ButtonPrimary>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200/80 bg-white py-16 text-[12px] text-gray-500">
          <Loader2 className="size-4 animate-spin" />
          Loading parametric formulas…
        </div>
      ) : domains.length === 0 ? (
        <div className="rounded-xl border border-gray-200/80 bg-white p-6">
          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-Gray-25">
              <Network className="size-6 text-Primary-DeepTeal" />
            </div>
            <h3 className="text-sm font-medium text-Text-Primary">
              No parametric formulas yet
            </h3>
            <p className="mt-1 max-w-md text-xs text-Text-Quadruple">
              Attach a calculation to a biomarker that already exists in Custom
              Biomarkers.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <ButtonPrimary size="small" onClick={openCreate}>
                <Plus className="size-3.5" />
                Attach formula
              </ButtonPrimary>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((domain) => (
            <div key={domain.id} className="space-y-1">
              {domain.catalogStatus === 'missing' ? (
                <p className="px-1 text-[11px] font-medium text-amber-700">
                  {domain.catalogStatusLabel}
                </p>
              ) : null}
              <RiskDomainCard
                domain={domain}
                hideDuplicate
                onToggleActive={(item, next) => {
                  setTogglingId(item.id);
                  HealthRiskArchitectureApi.updateDomain(item.id, {
                    is_enabled: next,
                    catalog_biomarker_uid:
                      item.catalogBiomarkerUid || undefined,
                    domain_type: 'PARAMETRIC_BIOMARKER',
                  })
                    .then(() => fetchDomains())
                    .catch((err) =>
                      toast.error(
                        err?.response?.data?.detail || 'Update failed',
                      ),
                    )
                    .finally(() => setTogglingId(null));
                }}
                onView={setViewDomain}
                onEdit={(item) => {
                  setActiveDomain(item);
                  setFormOpen(true);
                }}
                onDelete={setDeleteDomain}
                toggleDisabled={togglingId === domain.id}
              />
            </div>
          ))}
        </div>
      )}

      <ParametricEditorModal
        open={formOpen}
        domain={activeDomain}
        attachedUids={domains
          .map((item) => item.catalogBiomarkerUid)
          .filter((item): item is string => Boolean(item))}
        onClose={() => {
          setFormOpen(false);
          setActiveDomain(null);
        }}
        onSaved={fetchDomains}
      />
      <ViewDomainModal
        domain={viewDomain}
        onClose={() => setViewDomain(null)}
      />
      <DeleteDomainModal
        domain={deleteDomain}
        onClose={() => setDeleteDomain(null)}
        onDeleted={fetchDomains}
      />
    </div>
  );
}
