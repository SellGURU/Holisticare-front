import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import HealthRiskArchitectureApi from '../../api/HealthRiskArchitecture';
import IntelligenceModal, { apiErrorMessage } from './IntelligenceModal';
import {
  splitLibraryByDomainType,
  type FormulaLibraryTemplate,
  type LibraryDomainType,
} from './formulaLibrary';
import {
  HEALTH_RISK_DEFAULT_ICON,
  HEALTH_RISK_ICONS,
} from './healthRiskIcons';
import {
  v2FieldClass,
  v2OutlineBtnClass,
  v2PrimaryBtnClass,
} from './intelligenceUi';

type LibraryTab = LibraryDomainType;

export default function FormulaLibraryModal({
  open,
  onClose,
  initialKind,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  initialKind?: LibraryTab;
  onImported?: (domainType: LibraryDomainType) => void;
}) {
  const [tab, setTab] = useState<LibraryTab>(initialKind || 'RISK');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<FormulaLibraryTemplate[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTab(initialKind || 'RISK');
    setSearch('');
    setLoading(true);
    HealthRiskArchitectureApi.getFormulaLibrary()
      .then((res) => {
        const rows = res.data?.templates;
        setTemplates(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        setTemplates([]);
        toast.error(apiErrorMessage(err, 'Could not load formula library'));
      })
      .finally(() => setLoading(false));
  }, [open, initialKind]);

  const split = useMemo(() => splitLibraryByDomainType(templates), [templates]);
  const active =
    tab === 'SCORING' ? split.score : tab === 'AGING' ? split.age : split.risk;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return active;
    return active.filter((item) => {
      const hay = [
        item.display_name,
        item.name,
        item.description,
        item.category,
        ...(item.biomarker_dependencies || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [active, search]);

  const importTemplate = (item: FormulaLibraryTemplate) => {
    if (!item.catalog_ok || item.already_imported) return;
    setImportingId(item.id);
    HealthRiskArchitectureApi.importFormulaLibrary(item.id)
      .then((res) => {
        const imported = Number(res.data?.imported || 0);
        if (imported > 0) {
          toast.success(`${item.display_name} added`);
          onImported?.(
            item.domain_type === 'SCORING'
              ? 'SCORING'
              : item.domain_type === 'AGING'
                ? 'AGING'
                : 'RISK',
          );
        } else {
          toast.info(res.data?.message || 'Already imported');
        }
        setTemplates((prev) =>
          prev.map((row) =>
            row.id === item.id ? { ...row, already_imported: true } : row,
          ),
        );
      })
      .catch((err) => toast.error(apiErrorMessage(err, 'Import failed')))
      .finally(() => setImportingId(null));
  };

  return (
    <IntelligenceModal
      isOpen={open}
      onClose={onClose}
      title="Formula Library"
      description="Add a ready-made Risk, Health Score, or Age Clock formula to this clinic."
      widthClass="w-[min(920px,calc(100vw-2rem))]"
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <button
              type="button"
              className={`${tab === 'RISK' ? v2PrimaryBtnClass : v2OutlineBtnClass} h-7`}
              onClick={() => setTab('RISK')}
            >
              Risk
            </button>
            <button
              type="button"
              className={`${tab === 'SCORING' ? v2PrimaryBtnClass : v2OutlineBtnClass} h-7`}
              onClick={() => setTab('SCORING')}
            >
              Health Score
            </button>
            <button
              type="button"
              className={`${tab === 'AGING' ? v2PrimaryBtnClass : v2OutlineBtnClass} h-7`}
              onClick={() => setTab('AGING')}
            >
              Age Clock
            </button>
          </div>
          <div className="relative min-w-0 flex-1 sm:max-w-[260px]">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search formulas…"
              className={`${v2FieldClass} pl-8`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[12px] text-gray-500">
            <Loader2 className="size-4 animate-spin" />
            Loading formulas…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center text-[12px] text-gray-500">
            No formulas in this tab.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <LibraryRow
                key={item.id}
                item={item}
                importing={importingId === item.id}
                onAdd={() => importTemplate(item)}
              />
            ))}
          </div>
        )}
      </div>
    </IntelligenceModal>
  );
}

function LibraryRow({
  item,
  importing,
  onAdd,
}: {
  item: FormulaLibraryTemplate;
  importing: boolean;
  onAdd: () => void;
}) {
  const Icon = HEALTH_RISK_ICONS[item.icon || ''] || HEALTH_RISK_DEFAULT_ICON;
  const missing = item.missing_biomarkers || [];
  const disabled = importing || item.already_imported || !item.catalog_ok;
  let addLabel = 'Add';
  if (item.already_imported) addLabel = 'Added';
  else if (!item.catalog_ok) addLabel = 'Unavailable';

  return (
    <div className="rounded-lg border border-gray-200/80 bg-white p-3">
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${item.icon_color || '#10B981'}18` }}
        >
          <Icon
            className="size-4"
            style={{ color: item.icon_color || '#10B981' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900">
                {item.display_name}
              </p>
              {item.description ? (
                <p className="mt-0.5 text-[12px] text-gray-500">
                  {item.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={onAdd}
              className={v2PrimaryBtnClass}
            >
              {importing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : item.already_imported ? (
                <BookOpen className="size-3.5" />
              ) : (
                <Plus className="size-3.5" />
              )}
              {addLabel}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(item.biomarker_dependencies || []).map((token) => (
              <span
                key={token}
                className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600"
              >
                {token}
              </span>
            ))}
          </div>
          {!item.catalog_ok && missing.length > 0 ? (
            <p className="mt-1.5 text-[11px] text-amber-700">
              Missing from catalog: {missing.join(', ')}
            </p>
          ) : null}
          {!item.catalog_ok && missing.length === 0 && item.error_message ? (
            <p className="mt-1.5 text-[11px] text-amber-700">
              {item.error_message}
            </p>
          ) : null}
          <details className="mt-2">
            <summary className="cursor-pointer text-[11px] font-medium text-gray-500">
              Formula
            </summary>
            <pre className="mt-1 overflow-x-auto rounded-md bg-gray-50 p-2 font-mono text-[11px] leading-snug text-gray-700 whitespace-pre-wrap">
              {item.formula_code}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
