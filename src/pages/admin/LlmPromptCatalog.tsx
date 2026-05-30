/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Eye,
  Filter,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Wand2,
  XCircle,
} from 'lucide-react';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';

interface PromptRow {
  id: number;
  key: string;
  display_name: string;
  description: string;
  category: string;
  owner_service: string;
  is_active: boolean;
  system_prompt: string;
  developer_prompt: string | null;
  user_prompt_template: string | null;
  model_tier: 'nano' | 'mini' | 'full' | string;
  model_override: string | null;
  temperature: number | null;
  top_p: number | null;
  max_tokens: number | null;
  reasoning_effort: string | null;
  response_format: 'text' | 'json' | string;
  tools_json: any | null;
  extra_settings_json: any | null;
  updated_by: string | null;
  updated_at: string | null;
  has_db_override?: boolean;
  effective_source?: 'db' | 'runtime' | 'catalog' | string;
  runtime_system_prompt?: string;
}

const hasStoredPromptContent = (row: PromptRow | null): boolean => {
  if (!row) return false;
  if (typeof row.has_db_override === 'boolean') return row.has_db_override;
  return Boolean(
    (row.system_prompt || '').trim() ||
      (row.developer_prompt || '').trim() ||
      (row.user_prompt_template || '').trim() ||
      row.tools_json != null ||
      row.extra_settings_json != null,
  );
};

const TIER_OPTIONS = ['', 'nano', 'mini', 'full'];
const RESPONSE_OPTIONS = ['text', 'json'];
const REASONING_OPTIONS = ['', 'minimal', 'low', 'medium', 'high'];
const OWNER_OPTIONS = ['', 'main', 'microservice'];

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

const getPrimaryPromptRole = (
  row: PromptRow | null,
): 'system' | 'developer' | 'user_template' | 'none' => {
  if (!row) return 'none';
  if ((row.system_prompt || '').trim()) return 'system';
  if ((row.developer_prompt || '').trim()) return 'developer';
  if ((row.user_prompt_template || '').trim()) return 'user_template';
  return 'none';
};

const LlmPromptCatalog = () => {
  const navigate = useNavigate();

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [rows, setRows] = useState<PromptRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editor, setEditor] = useState<PromptRow | null>(null);
  const [toolsText, setToolsText] = useState('null');
  const [toolsError, setToolsError] = useState('');
  const [extraText, setExtraText] = useState('null');
  const [extraError, setExtraError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);
  const [dirty, setDirty] = useState(false);

  const [showTest, setShowTest] = useState(false);
  const [testUserInput, setTestUserInput] = useState('');
  const [testOutput, setTestOutput] = useState<any | null>(null);
  const [testing, setTesting] = useState(false);

  const [reseedBusy, setReseedBusy] = useState(false);
  const [cacheBusy, setCacheBusy] = useState(false);

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const loadList = async () => {
    setLoadingList(true);
    try {
      const params: any = { include_inactive: includeInactive };
      if (categoryFilter) params.category = categoryFilter;
      if (ownerFilter) params.owner_service = ownerFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const res = await AdminApi.listLlmPrompts(params);
      setRows(res.data?.items || []);
      setCategories(res.data?.categories || []);
    } catch (err: any) {
      if (err?.response?.status === 401) handleAuthFailure();
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
        await loadList();
      } catch {
        handleAuthFailure();
      } finally {
        setLoadingPage(false);
      }
    };
    init().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loadingPage) {
      loadList().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, ownerFilter, includeInactive]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const q = searchTerm.trim().toLowerCase();
    return rows.filter(
      (r) =>
        r.key.toLowerCase().includes(q) ||
        (r.display_name || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q),
    );
  }, [rows, searchTerm]);

  useEffect(() => {
    if (loadingPage || loadingList || filteredRows.length === 0) {
      return;
    }

    const currentExists = selectedKey
      ? filteredRows.some((row) => row.key === selectedKey)
      : false;

    if (!currentExists) {
      selectPrompt(filteredRows[0].key).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingPage, loadingList, filteredRows, selectedKey]);

  const selectPrompt = async (key: string) => {
    setSelectedKey(key);
    setSaveMessage(null);
    setTestOutput(null);
    setShowTest(false);
    setDirty(false);
    try {
      const res = await AdminApi.getLlmPrompt(key);
      const data: PromptRow = res.data;
      setEditor({ ...data });
      setToolsText(
        data.tools_json == null ? 'null' : JSON.stringify(data.tools_json, null, 2),
      );
      setToolsError('');
      setExtraText(
        data.extra_settings_json == null
          ? 'null'
          : JSON.stringify(data.extra_settings_json, null, 2),
      );
      setExtraError('');
    } catch (err: any) {
      if (err?.response?.status === 401) handleAuthFailure();
    }
  };

  const patchEditor = (patch: Partial<PromptRow>) => {
    if (!editor) return;
    setEditor({ ...editor, ...patch });
    setDirty(true);
  };

  const parseJsonMaybe = (
    text: string,
    allowNull = true,
  ): { value: any; error: string } => {
    const trimmed = text.trim();
    if (!trimmed) return { value: null, error: '' };
    if (allowNull && (trimmed === 'null' || trimmed === 'undefined')) {
      return { value: null, error: '' };
    }
    try {
      return { value: JSON.parse(trimmed), error: '' };
    } catch (e: any) {
      return { value: null, error: e?.message || 'Invalid JSON' };
    }
  };

  const handleSave = async () => {
    if (!editor) return;

    const toolsParsed = parseJsonMaybe(toolsText, true);
    if (toolsParsed.error) {
      setToolsError(toolsParsed.error);
      return;
    }
    setToolsError('');

    const extraParsed = parseJsonMaybe(extraText, true);
    if (extraParsed.error) {
      setExtraError(extraParsed.error);
      return;
    }
    setExtraError('');

    setSaving(true);
    setSaveMessage(null);
    try {
      const payload: any = {
        system_prompt: editor.system_prompt ?? '',
        developer_prompt: editor.developer_prompt ?? null,
        user_prompt_template: editor.user_prompt_template ?? null,
        model_tier: editor.model_tier || null,
        model_override: editor.model_override?.trim() || null,
        temperature: editor.temperature,
        top_p: editor.top_p,
        max_tokens: editor.max_tokens,
        reasoning_effort: editor.reasoning_effort || null,
        response_format: editor.response_format || 'text',
        tools_json: toolsParsed.value,
        extra_settings_json: extraParsed.value,
      };

      const res = await AdminApi.updateLlmPrompt(editor.key, payload);
      const updated: PromptRow = res.data;
      setEditor({ ...updated });
      setToolsText(
        updated.tools_json == null ? 'null' : JSON.stringify(updated.tools_json, null, 2),
      );
      setExtraText(
        updated.extra_settings_json == null
          ? 'null'
          : JSON.stringify(updated.extra_settings_json, null, 2),
      );
      setDirty(false);
      setSaveMessage({ kind: 'success', text: 'Saved. Cache invalidated.' });
      await loadList();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
        return;
      }
      setSaveMessage({
        kind: 'error',
        text: err?.response?.data?.detail || err?.message || 'Failed to save',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!editor) return;
    setToggling(true);
    try {
      const res = await AdminApi.toggleLlmPrompt(editor.key, !editor.is_active);
      setEditor({ ...editor, is_active: res.data?.is_active ?? !editor.is_active });
      await loadList();
    } catch (err: any) {
      if (err?.response?.status === 401) handleAuthFailure();
    } finally {
      setToggling(false);
    }
  };

  const handleTest = async () => {
    if (!editor) return;
    setTesting(true);
    setTestOutput(null);
    try {
      const res = await AdminApi.testLlmPrompt(editor.key, {
        user_input: testUserInput || null,
      });
      setTestOutput(res.data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
        return;
      }
      setTestOutput({
        error: err?.response?.data?.detail || err?.message || 'Test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleReseed = async () => {
    setReseedBusy(true);
    try {
      await AdminApi.reseedLlmPrompts();
      await loadList();
      if (selectedKey) selectPrompt(selectedKey).catch(() => {});
    } catch (err: any) {
      if (err?.response?.status === 401) handleAuthFailure();
    } finally {
      setReseedBusy(false);
    }
  };

  const handleInvalidate = async () => {
    setCacheBusy(true);
    try {
      await AdminApi.invalidateLlmPromptCache();
    } catch (err: any) {
      if (err?.response?.status === 401) handleAuthFailure();
    } finally {
      setCacheBusy(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="h-screen overflow-y-auto w-full flex justify-center items-center min-h-[550px] px-6 py-[80px]">
        <Circleloader />
      </div>
    );
  }

  const editorHasContent = hasStoredPromptContent(editor);
  const primaryPromptRole = getPrimaryPromptRole(editor);

  return (
    <AdminShellLayout
      title="LLM Prompt Catalog"
      subtitle="Manage prompts, model tiers, temperature, tools JSON and response format used by every LLM call across the platform."
      showGlobalFilters={false}
      actions={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleInvalidate}
            disabled={cacheBusy}
            className="rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px] text-Text-Primary disabled:opacity-50"
          >
            {cacheBusy ? 'Invalidating…' : 'Invalidate cache'}
          </button>
          <button
            type="button"
            onClick={handleReseed}
            disabled={reseedBusy}
            className="rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px] text-Text-Primary disabled:opacity-50"
          >
            {reseedBusy ? 'Re-seeding…' : 'Re-seed defaults'}
          </button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(320px,380px)_1fr]">
        {/* ================================================================
            Left: Filters + List
           ================================================================ */}
        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          <div className="flex items-center gap-2 text-Text-Primary">
            <Filter className="h-4 w-4" />
            <div className="TextStyle-Headline-6">Filters</div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-Text-Secondary" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by key, name, description…"
                className="w-full rounded-full border border-Gray-50 bg-white py-1.5 pl-8 pr-3 text-[12px] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-full border border-Gray-50 bg-white px-2 py-1.5 text-[11px]"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="rounded-full border border-Gray-50 bg-white px-2 py-1.5 text-[11px]"
              >
                {OWNER_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o ? `Owner: ${o}` : 'All owners'}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-Text-Secondary">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
              Include inactive
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[11px] text-Text-Secondary">
              {loadingList ? 'Loading…' : `${filteredRows.length} prompts`}
            </div>
            <button
              type="button"
              onClick={loadList}
              className="flex items-center gap-1 rounded-full border border-Gray-50 bg-white px-2 py-1 text-[11px] text-Text-Primary"
            >
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>

          <div className="mt-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredRows.map((r) => {
              const active = r.key === selectedKey;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => selectPrompt(r.key)}
                  className={`mb-2 w-full rounded-[14px] border px-3 py-2 text-left transition ${
                    active
                      ? 'border-Primary-DeepTeal bg-[#EFF7F7]'
                      : 'border-Gray-50 bg-white hover:border-Primary-DeepTeal/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="TextStyle-Body-2 text-Text-Primary truncate">
                      {r.display_name || r.key}
                    </div>
                    {r.is_active ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    )}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[10px] text-Text-Secondary">
                    {r.key}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                    <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-Text-Secondary">
                      {r.category}
                    </span>
                    <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-Text-Secondary">
                      {r.owner_service}
                    </span>
                    <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-Text-Secondary">
                      {r.model_tier}
                    </span>
                    <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-Text-Secondary">
                      {r.response_format}
                    </span>
                  </div>
                </button>
              );
            })}
            {!loadingList && filteredRows.length === 0 && (
              <div className="py-8 text-center text-[12px] text-Text-Secondary">
                No prompts match the current filters.
              </div>
            )}
          </div>
        </div>

        {/* ================================================================
            Right: Editor
           ================================================================ */}
        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          {!editor ? (
            <div className="flex h-full min-h-[500px] items-center justify-center text-[12px] text-Text-Secondary">
              Pick a prompt on the left to edit its system prompt, model and tools.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="TextStyle-Headline-5 text-Text-Primary">
                    {editor.display_name || editor.key}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-Text-Secondary">
                    {editor.key}
                  </div>
                  {editor.description && (
                    <div className="mt-1 text-[11px] text-Text-Secondary">
                      {editor.description}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                    <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5">
                      {editor.category}
                    </span>
                    <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5">
                      {editor.owner_service}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        editor.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {editor.is_active ? 'active' : 'inactive'}
                    </span>
                    <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5">
                      Updated: {formatDate(editor.updated_at)}
                    </span>
                    {editor.updated_by && (
                      <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5">
                        by {editor.updated_by}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleToggle}
                    disabled={toggling}
                    className="flex items-center gap-1 rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px] text-Text-Primary disabled:opacity-50"
                  >
                    {editor.is_active ? (
                      <>
                        <Trash2 className="h-3 w-3" /> Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Activate
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTest((s) => !s)}
                    className="flex items-center gap-1 rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px] text-Text-Primary"
                  >
                    <Eye className="h-3 w-3" /> Test console
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !dirty}
                    className="flex items-center gap-1 rounded-full bg-Primary-DeepTeal px-3 py-1.5 text-[11px] text-white disabled:opacity-50"
                  >
                    <Save className="h-3 w-3" /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>

              {saveMessage && (
                <div
                  className={`flex items-center gap-2 rounded-[12px] border px-3 py-2 text-[11px] ${
                    saveMessage.kind === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-red-200 bg-red-50 text-red-600'
                  }`}
                >
                  {saveMessage.kind === 'success' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  {saveMessage.text}
                </div>
              )}

              {!editorHasContent && (
                <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-3 text-[11px] text-amber-800">
                  This key does not have a DB override yet. The fields below are showing the
                  currently active prompt text resolved from code, and saving here will convert it
                  into the new admin-managed source of truth for this key.
                </div>
              )}

              {editor && primaryPromptRole !== 'none' && (
                <div className="rounded-[14px] border border-sky-200 bg-sky-50 px-3 py-3 text-[11px] text-sky-800">
                  {primaryPromptRole === 'system' &&
                    'This key is currently driven primarily by the system prompt field.'}
                  {primaryPromptRole === 'developer' &&
                    'This key is currently driven primarily by the developer prompt field. A blank system prompt is expected for this agent.'}
                  {primaryPromptRole === 'user_template' &&
                    'This key is currently driven primarily by the user prompt template field.'}
                </div>
              )}

              {/* Model / tuning */}
              <div className="rounded-[16px] border border-Gray-50 bg-white p-3">
                <div className="flex items-center gap-2 text-Text-Primary">
                  <Database className="h-4 w-4" />
                  <div className="TextStyle-Headline-6">Model & tuning</div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label className="text-[11px] text-Text-Secondary">Model tier</label>
                    <select
                      value={editor.model_tier || ''}
                      onChange={(e) => patchEditor({ model_tier: e.target.value })}
                      className="mt-1 w-full rounded-[10px] border border-Gray-50 bg-white px-2 py-1.5 text-[12px]"
                    >
                      {TIER_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t || '(inherit)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-Text-Secondary">
                      Model override
                    </label>
                    <input
                      value={editor.model_override ?? ''}
                      onChange={(e) =>
                        patchEditor({ model_override: e.target.value || null })
                      }
                      placeholder="e.g. gpt-5-nano (optional)"
                      className="mt-1 w-full rounded-[10px] border border-Gray-50 bg-white px-2 py-1.5 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-Text-Secondary">
                      Response format
                    </label>
                    <select
                      value={editor.response_format || 'text'}
                      onChange={(e) =>
                        patchEditor({ response_format: e.target.value })
                      }
                      className="mt-1 w-full rounded-[10px] border border-Gray-50 bg-white px-2 py-1.5 text-[12px]"
                    >
                      {RESPONSE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-Text-Secondary">Temperature</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="2"
                      value={editor.temperature ?? ''}
                      onChange={(e) =>
                        patchEditor({
                          temperature:
                            e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      placeholder="auto"
                      className="mt-1 w-full rounded-[10px] border border-Gray-50 bg-white px-2 py-1.5 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-Text-Secondary">top_p</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={editor.top_p ?? ''}
                      onChange={(e) =>
                        patchEditor({
                          top_p: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      placeholder="auto"
                      className="mt-1 w-full rounded-[10px] border border-Gray-50 bg-white px-2 py-1.5 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-Text-Secondary">max_tokens</label>
                    <input
                      type="number"
                      min="0"
                      value={editor.max_tokens ?? ''}
                      onChange={(e) =>
                        patchEditor({
                          max_tokens:
                            e.target.value === ''
                              ? null
                              : parseInt(e.target.value, 10),
                        })
                      }
                      placeholder="auto"
                      className="mt-1 w-full rounded-[10px] border border-Gray-50 bg-white px-2 py-1.5 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-Text-Secondary">
                      Reasoning effort
                    </label>
                    <select
                      value={editor.reasoning_effort || ''}
                      onChange={(e) =>
                        patchEditor({ reasoning_effort: e.target.value || null })
                      }
                      className="mt-1 w-full rounded-[10px] border border-Gray-50 bg-white px-2 py-1.5 text-[12px]"
                    >
                      {REASONING_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r || '(inherit)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Prompts */}
              <div className="rounded-[16px] border border-Gray-50 bg-white p-3">
                <div className="TextStyle-Headline-6 text-Text-Primary">
                  Prompt roles
                </div>
                <div className="mt-1 text-[11px] text-Text-Secondary">
                  {editorHasContent
                    ? 'This prompt is currently managed by the database and any save will update the live active version.'
                    : 'This prompt is currently being resolved from code. Editing and saving it here will create the first DB-managed override.'}
                </div>
                <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      primaryPromptRole === 'system'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#F1F5F9] text-Text-Secondary'
                    }`}
                  >
                    system
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      primaryPromptRole === 'developer'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#F1F5F9] text-Text-Secondary'
                    }`}
                  >
                    developer
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      primaryPromptRole === 'user_template'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#F1F5F9] text-Text-Secondary'
                    }`}
                  >
                    user template
                  </span>
                </div>
                <div className="mt-3">
                  <label className="text-[11px] text-Text-Secondary">System prompt</label>
                </div>
                <textarea
                  value={editor.system_prompt || ''}
                  onChange={(e) => patchEditor({ system_prompt: e.target.value })}
                  spellCheck={false}
                  className="mt-2 min-h-[240px] w-full resize-y rounded-[12px] border border-Gray-50 bg-[#0F172A] p-3 font-mono text-[12px] text-[#E2E8F0] outline-none"
                  placeholder="Edit the live system prompt text for this key…"
                />
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-[11px] text-Text-Secondary">
                      Developer prompt (optional)
                    </label>
                    <textarea
                      value={editor.developer_prompt || ''}
                      onChange={(e) =>
                        patchEditor({
                          developer_prompt: e.target.value || null,
                        })
                      }
                      spellCheck={false}
                      className="mt-1 min-h-[120px] w-full resize-y rounded-[12px] border border-Gray-50 bg-white p-3 font-mono text-[12px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-Text-Secondary">
                      User prompt template (optional)
                    </label>
                    <textarea
                      value={editor.user_prompt_template || ''}
                      onChange={(e) =>
                        patchEditor({
                          user_prompt_template: e.target.value || null,
                        })
                      }
                      spellCheck={false}
                      className="mt-1 min-h-[120px] w-full resize-y rounded-[12px] border border-Gray-50 bg-white p-3 font-mono text-[12px] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Tools + extra */}
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-[16px] border border-Gray-50 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="TextStyle-Headline-6 text-Text-Primary">
                      tools_json
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseJsonMaybe(toolsText, true);
                        if (parsed.error) {
                          setToolsError(parsed.error);
                        } else {
                          setToolsError('');
                          setToolsText(
                            parsed.value == null
                              ? 'null'
                              : JSON.stringify(parsed.value, null, 2),
                          );
                        }
                      }}
                      className="rounded-full border border-Gray-50 bg-white px-2 py-1 text-[11px] text-Text-Primary"
                    >
                      Format & validate
                    </button>
                  </div>
                  <textarea
                    value={toolsText}
                    onChange={(e) => {
                      setToolsText(e.target.value);
                      setDirty(true);
                    }}
                    spellCheck={false}
                    className="mt-2 min-h-[200px] w-full resize-y rounded-[12px] border border-Gray-50 bg-[#0F172A] p-3 font-mono text-[12px] text-[#E2E8F0] outline-none"
                    placeholder="null  // or an OpenAI-style tools array"
                  />
                  <div className="mt-1 text-[11px]">
                    {toolsError ? (
                      <span className="text-red-500">{toolsError}</span>
                    ) : (
                      <span className="text-Text-Secondary">
                        Accepts <code>null</code> or a JSON array of OpenAI tool definitions.
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-[16px] border border-Gray-50 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="TextStyle-Headline-6 text-Text-Primary">
                      extra_settings_json
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseJsonMaybe(extraText, true);
                        if (parsed.error) {
                          setExtraError(parsed.error);
                        } else {
                          setExtraError('');
                          setExtraText(
                            parsed.value == null
                              ? 'null'
                              : JSON.stringify(parsed.value, null, 2),
                          );
                        }
                      }}
                      className="rounded-full border border-Gray-50 bg-white px-2 py-1 text-[11px] text-Text-Primary"
                    >
                      Format & validate
                    </button>
                  </div>
                  <textarea
                    value={extraText}
                    onChange={(e) => {
                      setExtraText(e.target.value);
                      setDirty(true);
                    }}
                    spellCheck={false}
                    className="mt-2 min-h-[200px] w-full resize-y rounded-[12px] border border-Gray-50 bg-[#0F172A] p-3 font-mono text-[12px] text-[#E2E8F0] outline-none"
                    placeholder="null  // or a JSON object"
                  />
                  <div className="mt-1 text-[11px]">
                    {extraError ? (
                      <span className="text-red-500">{extraError}</span>
                    ) : (
                      <span className="text-Text-Secondary">
                        Free-form JSON. Accessible via <code>PromptConfig.extra</code>.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Test console */}
              {showTest && (
                <div className="rounded-[16px] border border-Gray-50 bg-white p-3">
                  <div className="flex items-center gap-2 text-Text-Primary">
                    <Wand2 className="h-4 w-4" />
                    <div className="TextStyle-Headline-6">Test console</div>
                  </div>
                  <div className="mt-1 text-[11px] text-Text-Secondary">
                    Dry-run preview. Returns the resolved messages, model settings and tool payload the backend
                    would send — no LLM call is made, so test safely.
                  </div>
                  <textarea
                    value={testUserInput}
                    onChange={(e) => setTestUserInput(e.target.value)}
                    placeholder="Optional user-role message for the preview…"
                    className="mt-2 min-h-[80px] w-full resize-y rounded-[12px] border border-Gray-50 bg-white p-2 font-mono text-[12px] outline-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleTest}
                      disabled={testing}
                      className="rounded-full bg-Primary-DeepTeal px-3 py-1.5 text-[11px] text-white disabled:opacity-50"
                    >
                      {testing ? 'Running…' : 'Run dry-run'}
                    </button>
                  </div>
                  {testOutput && (
                    <pre className="mt-3 max-h-[420px] overflow-auto rounded-[12px] border border-Gray-50 bg-[#0F172A] p-3 font-mono text-[11px] text-[#E2E8F0]">
                      {JSON.stringify(testOutput, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminShellLayout>
  );
};

export default LlmPromptCatalog;
