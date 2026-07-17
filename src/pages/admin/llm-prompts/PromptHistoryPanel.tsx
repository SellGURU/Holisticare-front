import { useEffect, useState } from 'react';
import { History, RotateCcw } from 'lucide-react';
import AdminApi from '../../../api/admin';
import type { PromptHistoryEntry, PromptRow } from '../../../types/llmAdmin';

interface PromptHistoryPanelProps {
  editor: PromptRow;
  onRestored: (row: PromptRow) => void;
  onAuthFailure: () => void;
}

const previewText = (entry: PromptHistoryEntry): string => {
  const snap = entry.snapshot_json || {};
  const system = String(snap.system_prompt || '').trim();
  if (system) return system.slice(0, 120);
  const dev = String(snap.developer_prompt || '').trim();
  if (dev) return dev.slice(0, 120);
  const user = String(snap.user_prompt_template || '').trim();
  if (user) return user.slice(0, 120);
  return '(empty snapshot)';
};

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const PromptHistoryPanel = ({
  editor,
  onRestored,
  onAuthFailure,
}: PromptHistoryPanelProps) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PromptHistoryEntry[]>([]);
  const [error, setError] = useState('');
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await AdminApi.getLlmPromptHistory(editor.key);
      setItems(res.data?.items || []);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        onAuthFailure();
        return;
      }
      if (err?.response?.status === 404) {
        setError('History is disabled (ENABLE_PROMPT_HISTORY=0).');
        setItems([]);
        return;
      }
      setError(
        err?.response?.data?.detail || err?.message || 'Failed to load history',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.key]);

  const handleRestore = async (historyId: number) => {
    const ok = window.confirm(
      'Restore creates a new save and records the current version in history. Continue?',
    );
    if (!ok) return;

    setRestoringId(historyId);
    try {
      const res = await AdminApi.restoreLlmPrompt(editor.key, historyId);
      onRestored(res.data);
      await loadHistory();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        onAuthFailure();
        return;
      }
      setError(err?.response?.data?.detail || err?.message || 'Restore failed');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="rounded-[16px] border border-Gray-50 bg-white p-3">
      <div className="flex items-center gap-2 text-Text-Primary">
        <History className="h-4 w-4" />
        <div className="TextStyle-Headline-6">History</div>
      </div>
      <p className="mt-2 text-[11px] text-Text-Secondary">
        History reflects stored config and may not match the exact text executed
        at runtime. Use prompt hash in LLM Calls for runtime observability.
      </p>

      {loading ? (
        <div className="py-6 text-center text-[12px] text-Text-Secondary">
          Loading history...
        </div>
      ) : error ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="py-6 text-center text-[12px] text-Text-Secondary">
          No history entries yet.
        </div>
      ) : (
        <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto">
          {items.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-medium text-Text-Primary">
                    {formatDate(entry.updated_at)}
                  </div>
                  <div className="text-[10px] text-Text-Secondary">
                    by {entry.updated_by || 'unknown'}
                    {entry.prompt_hash ? ` · hash ${entry.prompt_hash}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={restoringId === entry.id}
                  onClick={() => handleRestore(entry.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-Gray-50 bg-white px-2 py-1 text-[10px] text-Text-Primary disabled:opacity-50"
                >
                  <RotateCcw className="h-3 w-3" />
                  {restoringId === entry.id ? 'Restoring…' : 'Restore'}
                </button>
              </div>
              <pre className="mt-2 whitespace-pre-wrap text-[10px] text-Text-Secondary">
                {previewText(entry)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptHistoryPanel;
