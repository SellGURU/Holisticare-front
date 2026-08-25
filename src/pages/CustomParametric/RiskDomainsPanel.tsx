/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { BookOpen, Loader2, Network, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import DeleteDomainModal from './DeleteDomainModal';
import FormulaLibraryModal from './FormulaLibraryModal';
import RiskDomainCard from './RiskDomainCard';
import RiskDomainFormModal, {
  type RiskDomainFormMode,
} from './RiskDomainFormModal';
import ViewDomainModal from './ViewDomainModal';
import { apiErrorMessage } from './IntelligenceModal';
import { v2PrimaryBtnClass } from './intelligenceUi';
import { mapHealthRiskDomain, type RiskDomainViewModel } from './types';

type ModelKind = 'RISK' | 'SCORING' | 'AGING';

const KIND_COPY: Record<
  ModelKind,
  { noun: string; nounTitle: string; empty: string }
> = {
  RISK: {
    noun: 'risk',
    nounTitle: 'Risk',
    empty: 'Create a formula-based risk domain for this clinic.',
  },
  SCORING: {
    noun: 'score',
    nounTitle: 'Score',
    empty: 'Create a formula-based health score for one or more catalog biomarkers.',
  },
  AGING: {
    noun: 'age clock',
    nounTitle: 'Age Clock',
    empty: 'Create a formula that estimates biological age in years.',
  },
};

export default function RiskDomainsPanel({
  modelKind = 'RISK',
}: {
  modelKind?: ModelKind;
}) {
  const copy = KIND_COPY[modelKind];
  const noun = copy.noun;
  const nounTitle = copy.nounTitle;

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
  const [libraryOpen, setLibraryOpen] = useState(false);

  const domains = useMemo(
    () => rawDomains.map(mapHealthRiskDomain),
    [rawDomains],
  );

  const fetchDomains = () => {
    setLoading(true);
    setLoadError(false);
    HealthRiskArchitectureApi.getDomains(modelKind)
      .then((res) => setRawDomains(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        setRawDomains([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDomains();
  }, [modelKind]);

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
      domain_type: modelKind,
    })
      .then(() => fetchDomains())
      .catch((err) => toast.error(apiErrorMessage(err, 'Update failed')))
      .finally(() => setTogglingId(null));
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h2 className="text-[16px] font-bold text-gray-900">
            {nounTitle} Domains
          </h2>
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
            Create {nounTitle} Domain
          </ButtonPrimary>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200/80 bg-white py-16 text-[12px] text-gray-500">
          <Loader2 className="size-4 animate-spin" />
          Loading {noun} domains…
        </div>
      ) : loadError ? (
        <EmptyPanel
          title={`Could not load ${noun} domains`}
          description="Check your connection and try again."
        />
      ) : domains.length === 0 ? (
        <EmptyPanel
          title={`No ${noun} domains yet`}
          description={copy.empty}
          action={
            <ButtonPrimary size="small" onClick={openCreate}>
              <Plus className="size-3.5" />
              Create {nounTitle} Domain
            </ButtonPrimary>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyPanel
          title={`No matching ${noun} domains`}
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
              Showing {filtered.length} of {domains.length} {noun} domains
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
      </div>

      <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-64">
        <div className="rounded-xl border border-gray-200/80 bg-white p-4">
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-Gray-25">
            <BookOpen className="size-5 text-Primary-DeepTeal" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">
            Formula Library
          </h3>
          <p className="mt-1 text-[12px] leading-snug text-gray-500">
            Import a ready-made {noun} formula into this clinic.
          </p>
          <button
            type="button"
            className={`${v2PrimaryBtnClass} mt-3 w-full`}
            onClick={() => setLibraryOpen(true)}
          >
            <BookOpen className="size-3.5" />
            Open library
          </button>
        </div>
      </aside>

      <RiskDomainFormModal
        open={formOpen}
        mode={formMode}
        domain={activeDomain}
        modelKind={modelKind}
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
      <FormulaLibraryModal
        open={libraryOpen}
        initialKind={modelKind}
        onClose={() => setLibraryOpen(false)}
        onImported={fetchDomains}
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
