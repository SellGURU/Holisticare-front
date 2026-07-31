/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Application from '../../api/app';
import Circleloader from '../../Components/CircleLoader';
import SearchBox from '../../Components/SearchBox';
import ConfirmModal from '../../Components/confitmModal';
import { showError } from '../../Components/GlobalToast';
import useIsDemo from '../../hooks/useIsDemo';

type SuppressedItem = {
  id?: number;
  system_biomarker?: string | null;
  extracted_name?: string;
  biomarker_type?: string;
  reason?: string;
  excluded_at?: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  blood: 'Blood',
  urine: 'Urine',
  dna: 'DNA',
  gut: 'Gut',
  saliva: 'Saliva',
  stool: 'Stool',
  other: 'Other',
};

const formatType = (value?: string) =>
  TYPE_LABELS[String(value || '').toLowerCase()] ||
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) ||
  '—';

const formatExcludedAt = (iso?: string | null) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SuppressedBiomarkersSection = () => {
  const isDemo = useIsDemo();
  const [items, setItems] = useState<SuppressedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<SuppressedItem | null>(
    null,
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Application.listSuppressedBiomarkers();
      const list = Array.isArray(res?.data?.suppressed)
        ? res.data.suppressed
        : [];
      setItems(list);
    } catch (err) {
      console.error('Failed to load excluded biomarkers:', err);
      showError(
        'Could not load excluded biomarkers',
        'Please refresh and try again.',
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = [
        item.extracted_name,
        item.system_biomarker,
        item.biomarker_type,
        item.reason,
      ]
        .map((v) => String(v || '').toLowerCase())
        .join(' ');
      return haystack.includes(q);
    });
  }, [items, search]);

  const itemKey = (item: SuppressedItem) =>
    String(
      item.id ??
        `${item.extracted_name || ''}|${item.biomarker_type || 'blood'}`,
    );

  const handleRestore = async (item: SuppressedItem) => {
    if (isDemo) return;
    const key = itemKey(item);
    setRestoringId(key);
    try {
      await Application.unsuppressBiomarker({
        id: item.id,
        extracted_name: String(item.extracted_name || ''),
        biomarker_type: item.biomarker_type || 'blood',
      });
      setItems((prev) => prev.filter((row) => itemKey(row) !== key));
    } catch (err) {
      console.error('Failed to restore excluded biomarker:', err);
      showError(
        'Could not restore biomarker',
        'Please try again or contact support.',
      );
    } finally {
      setRestoringId(null);
      setPendingRestore(null);
    }
  };

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-Gray-50 bg-white shadow-100">
      <div className="flex flex-col gap-3 border-b border-Gray-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[14px] font-semibold text-Text-Primary">
            Excluded Biomarkers
            <span className="ml-2 text-[10px] font-normal text-Text-Secondary">
              ({items.length} clinic-wide)
            </span>
          </div>
          <div className="mt-0.5 text-[10px] text-Text-Secondary">
            Labels excluded from lab review are hidden for every patient on
            future uploads. Restore a row here to show it again.
          </div>
        </div>
        <SearchBox
          value={search}
          ClassName="!h-9 !rounded-xl !border !border-Gray-50 !bg-white !py-0 !px-3 !shadow-[unset] md:!min-w-[280px]"
          placeHolder="Search excluded name..."
          onSearch={setSearch}
          showClose
          isHaveBorder
        />
      </div>

      <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-[10px] text-Text-Secondary">
        Excluding a biomarker in Edit Mode adds it to this clinic-wide list. It
        is not limited to a single lab file.
      </div>

      {loading ? (
        <div className="flex min-h-[160px] items-center justify-center">
          <Circleloader />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[780px] grid-cols-[1.4fr_1fr_90px_1.1fr_100px] gap-2 border-b border-Gray-50 bg-gray-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-Text-Secondary">
            <span>Extracted name</span>
            <span>System biomarker</span>
            <span>Type</span>
            <span>Excluded</span>
            <span className="text-right">Actions</span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex min-h-[140px] min-w-[780px] flex-col items-center justify-center gap-1 px-4 py-8 text-center">
              <div className="text-sm font-medium text-Text-Primary">
                {items.length === 0
                  ? 'No clinic-wide exclusions'
                  : 'No matching exclusions'}
              </div>
              <div className="text-[10px] text-Text-Secondary">
                {items.length === 0
                  ? 'When you exclude a label in lab review, it will appear here.'
                  : 'Try a different search term.'}
              </div>
            </div>
          ) : (
            filtered.map((item) => {
              const key = itemKey(item);
              const busy = restoringId === key;
              return (
                <div
                  key={key}
                  className="grid min-w-[780px] grid-cols-[1.4fr_1fr_90px_1.1fr_100px] gap-2 border-b border-Gray-50 px-4 py-2.5 text-[11px] text-Text-Primary last:border-b-0"
                >
                  <span
                    className="truncate font-medium"
                    title={item.extracted_name}
                  >
                    {item.extracted_name || '—'}
                  </span>
                  <span
                    className="truncate text-Text-Secondary"
                    title={item.system_biomarker || undefined}
                  >
                    {item.system_biomarker || '—'}
                  </span>
                  <span>{formatType(item.biomarker_type)}</span>
                  <span className="text-Text-Secondary">
                    {formatExcludedAt(item.excluded_at)}
                  </span>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isDemo || busy}
                      title={
                        isDemo
                          ? 'Demo plan - upgrade to enable'
                          : 'Restore this label for future uploads'
                      }
                      onClick={() => setPendingRestore(item)}
                      className="rounded-lg border border-Primary-DeepTeal/30 px-2.5 py-1 text-[10px] font-medium text-Primary-DeepTeal hover:bg-Primary-DeepTeal/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy ? 'Restoring...' : 'Restore'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingRestore)}
        onClose={() => setPendingRestore(null)}
        onConfirm={() => {
          if (pendingRestore) {
            void handleRestore(pendingRestore);
          }
        }}
        heading="Restore excluded biomarker"
        message={`Restore "${pendingRestore?.extracted_name || 'this biomarker'}" for this clinic? It will appear again in future lab report reviews.`}
        confirmText={
          restoringId &&
          pendingRestore &&
          restoringId === itemKey(pendingRestore)
            ? 'Restoring...'
            : 'Restore'
        }
        cancelText="Cancel"
      />
    </div>
  );
};

export default SuppressedBiomarkersSection;
