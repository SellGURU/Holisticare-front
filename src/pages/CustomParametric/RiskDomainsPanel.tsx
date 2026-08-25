/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Loader2, Network, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import DeleteDomainModal from './DeleteDomainModal';
import RiskDomainCard from './RiskDomainCard';
import RiskDomainFormModal, {
  type RiskDomainFormMode,
} from './RiskDomainFormModal';
import ViewDomainModal from './ViewDomainModal';
import { apiErrorMessage } from './IntelligenceModal';
import { mapHealthRiskDomain, type RiskDomainViewModel } from './types';

export default function RiskDomainsPanel() {
  const [rawDomains, setRawDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<RiskDomainFormMode>('create');
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
    setLoadError(false);
    HealthRiskArchitectureApi.getDomains('RISK')
      .then((res) => setRawDomains(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        setRawDomains([]);
        setLoadError(true);
      })
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
        domain.biomarkers.some((b) => b.toLowerCase().includes(q)),
    );
  }, [domains, search]);

  const activeCount = domains.filter((d) => d.isEnabled).length;

  const openCreate = () => {
    setActiveDomain(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const openEdit = (domain: RiskDomainViewModel) => {
    setActiveDomain(domain);
    setFormMode('edit');
    setFormOpen(true);
  };

  const openDuplicate = (domain: RiskDomainViewModel) => {
    setActiveDomain(domain);
    setFormMode('duplicate');
    setFormOpen(true);
  };

  const handleToggleActive = (domain: RiskDomainViewModel, next: boolean) => {
    setTogglingId(domain.id);
    HealthRiskArchitectureApi.updateDomain(domain.id, {
      is_enabled: next,
      domain_type: 'RISK',
    })
      .then(() => fetchDomains())
      .catch((err) => toast.error(apiErrorMessage(err, 'Update failed')))
      .finally(() => setTogglingId(null));
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h2 className="text-[16px] font-bold text-gray-900">Risk Domains</h2>
          {domains.length > 0 ? (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-400">
              {activeCount} active of {domains.length}
            </span>
          ) : null}
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search domains or biomarkers…"
              className="h-9 w-full rounded-xl border border-Gray-50 bg-white pl-8 pr-3 text-[12px] text-Text-Primary sm:w-[220px]"
            />
          </div>
          <ButtonPrimary size="small" onClick={openCreate}>
            <Plus className="size-3.5" />
            Create Risk Domain
          </ButtonPrimary>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200/80 bg-white py-16 text-[12px] text-gray-500">
          <Loader2 className="size-4 animate-spin" />
          Loading risk domains…
        </div>
      ) : loadError ? (
        <EmptyPanel
          title="Could not load risk domains"
          description="Check your connection and try again."
        />
      ) : domains.length === 0 ? (
        <EmptyPanel
          title="No risk domains yet"
          description="Create a formula-based risk domain for this clinic."
          action={
            <ButtonPrimary size="small" onClick={openCreate}>
              <Plus className="size-3.5" />
              Create Risk Domain
            </ButtonPrimary>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyPanel
          title="No matching risk domains"
          description="Try a different search term."
        />
      ) : (
        <>
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((domain) => (
              <RiskDomainCard
                key={domain.id}
                domain={domain}
                onToggleActive={handleToggleActive}
                onView={setViewDomain}
                onEdit={openEdit}
                onDuplicate={openDuplicate}
                onDelete={setDeleteDomain}
                toggleDisabled={togglingId === domain.id}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-gray-400">
              Showing {filtered.length} of {domains.length} risk domains
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-Primary-DeepTeal" />{' '}
                Active: {activeCount}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-gray-300" /> Inactive:{' '}
                {domains.length - activeCount}
              </span>
              <span className="h-3 w-px bg-gray-200" />
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-gray-400" /> Pre-defined:{' '}
                {domains.filter((d) => d.isSystemDefault).length}
              </span>
            </div>
          </div>
        </>
      )}

      <RiskDomainFormModal
        open={formOpen}
        mode={formMode}
        domain={activeDomain}
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

function EmptyPanel({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-6">
      <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-Gray-25">
          <Network className="size-6 text-Primary-DeepTeal" />
        </div>
        <h3 className="text-sm font-medium text-Text-Primary">{title}</h3>
        <p className="mt-1 max-w-md text-xs text-Text-Quadruple">
          {description}
        </p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
