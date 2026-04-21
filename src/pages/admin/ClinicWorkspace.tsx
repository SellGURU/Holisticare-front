/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  AlertCircle,
  CheckCircle2,
  Pin,
  Plus,
  RefreshCw,
  Tags,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import { useAdminContext } from '../../store/adminContext';
import AdminShellLayout from './AdminShellLayout';
import { buildAnalyticsPayload, formatCompactNumber, formatPercentage, summaryCards } from './adminShared';
import {
  addClinicNote,
  addClinicTag,
  deleteClinicNote,
  getClinicWorkspaceRecord,
  setClinicFollowUpState,
  toggleClinicTagStatus,
  updateClinicNote,
} from '../../utils/adminWorkspaceStore';
import {
  AdminTagType,
  FollowUpState,
} from '../../types/admin';

const followUpOptions: Array<{ value: FollowUpState; label: string }> = [
  { value: 'no_action', label: 'No action needed' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'follow_up_this_week', label: 'Follow up this week' },
  { value: 'escalate', label: 'Escalate' },
  { value: 'resolved', label: 'Resolved' },
];

const tagTypeOptions: Array<{ value: AdminTagType; label: string; color: string }> = [
  { value: 'sentiment', label: 'At Risk', color: '#FC5474' },
  { value: 'product_issue', label: 'Product Bug', color: '#FF8B3D' },
  { value: 'business_issue', label: 'Staffing Issue', color: '#9E77ED' },
  { value: 'opportunity', label: 'Expansion Opportunity', color: '#6CC24A' },
  { value: 'workflow', label: 'Waiting on Clinic', color: '#005F73' },
  { value: 'custom', label: 'Custom', color: '#667085' },
];

const noteTemplates = [
  'Product issue observed',
  'Business issue observed',
  'Positive milestone',
  'Stakeholder follow-up needed',
  'Campaign or acquisition change',
  'Clinic staffing or operational change',
  'KPI anomaly explanation',
];

const ClinicWorkspace = () => {
  const navigate = useNavigate();
  const {
    clinics,
    loadingClinics,
    refreshClinics,
    selectedClinicEmail,
  } = useAdminContext();
  const activeClinicEmail = selectedClinicEmail || clinics[0]?.clinic_email || '';
  const activeClinic = clinics.find((clinic) => clinic.clinic_email === activeClinicEmail) || null;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [workspaceVersion, setWorkspaceVersion] = useState(0);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteTemplate, setNoteTemplate] = useState('');
  const [noteVisibility, setNoteVisibility] = useState<'internal' | 'leadership'>('internal');
  const [noteFollowUpRequired, setNoteFollowUpRequired] = useState(false);
  const [noteFollowUpDueDate, setNoteFollowUpDueDate] = useState('');
  const [noteTagInput, setNoteTagInput] = useState('');
  const [noteSearch, setNoteSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [newTagName, setNewTagName] = useState('');
  const [newTagType, setNewTagType] = useState<AdminTagType>('workflow');

  useEffect(() => {
    if (!clinics.length && !loadingClinics) {
      refreshClinics().catch(() => {});
    }
  }, [clinics.length, loadingClinics, refreshClinics]);

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const loadAnalytics = async (showRefreshState = false) => {
    if (!activeClinicEmail) {
      setLoading(false);
      return;
    }

    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      await AdminApi.checkAuth();
      const res = await AdminApi.getAnalytics(
        buildAnalyticsPayload(activeClinicEmail, '', ''),
      );
      setAnalytics(res.data || null);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        handleAuthFailure();
        return;
      }
      setAnalytics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics().catch(() => {});
  }, [activeClinicEmail]);

  const workspace = useMemo(
    () => (activeClinicEmail ? getClinicWorkspaceRecord(activeClinicEmail) : null),
    [activeClinicEmail, workspaceVersion],
  );

  const notes = workspace?.notes || [];
  const tags = workspace?.tags || [];

  const filteredNotes = useMemo(() => {
    const searchValue = noteSearch.trim().toLowerCase();
    return notes.filter((note) => {
      if (visibilityFilter !== 'all' && note.visibility !== visibilityFilter) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return `${note.title} ${note.body} ${note.tags.join(' ')}`
        .toLowerCase()
        .includes(searchValue);
    });
  }, [noteSearch, notes, visibilityFilter]);

  const completionRate = useMemo(() => {
    const assigned = analytics?.num_of_questionnaires_assigned || 0;
    const filled = analytics?.num_of_questionnaires_filled || 0;
    return assigned ? (filled / assigned) * 100 : 0;
  }, [analytics]);

  const healthTone = useMemo(() => {
    if ((workspace?.followUpState || 'monitor') === 'escalate') {
      return 'Needs escalation';
    }
    if (completionRate < 50 || tags.some((tag) => tag.status === 'active' && tag.tagType !== 'opportunity')) {
      return 'Needs support';
    }
    if ((analytics?.num_of_new_clients || 0) > 0 || tags.some((tag) => tag.tagType === 'opportunity')) {
      return 'Healthy momentum';
    }
    return 'Stable';
  }, [analytics?.num_of_new_clients, completionRate, tags, workspace?.followUpState]);

  const refreshWorkspace = () => setWorkspaceVersion((current) => current + 1);

  const addNote = () => {
    if (!activeClinicEmail || !noteTitle.trim() || !noteBody.trim()) {
      toast.error('Add both a note title and note body.');
      return;
    }

    addClinicNote(activeClinicEmail, {
      author: 'Admin Support',
      periodType: 'one_off',
      title: noteTitle.trim(),
      body: noteBody.trim(),
      tags: noteTagInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      visibility: noteVisibility,
      followUpRequired: noteFollowUpRequired,
      followUpDueDate: noteFollowUpDueDate,
      pinned: false,
      templateKey: noteTemplate || undefined,
    });

    setNoteTitle('');
    setNoteBody('');
    setNoteTemplate('');
    setNoteTagInput('');
    setNoteFollowUpRequired(false);
    setNoteFollowUpDueDate('');
    refreshWorkspace();
    toast.success('Clinic note saved.');
  };

  const addTag = () => {
    if (!activeClinicEmail || !newTagName.trim()) {
      toast.error('Add a tag name first.');
      return;
    }

    const option = tagTypeOptions.find((item) => item.value === newTagType);
    const created = addClinicTag(activeClinicEmail, {
      name: newTagName.trim(),
      tagType: newTagType,
      color: option?.color || '#667085',
      status: 'active',
    });

    if (!created) {
      toast.error('This tag already exists for the clinic.');
      return;
    }

    setNewTagName('');
    refreshWorkspace();
    toast.success('Tag added.');
  };

  const updateFollowUp = (value: FollowUpState) => {
    if (!activeClinicEmail) {
      return;
    }

    setClinicFollowUpState(activeClinicEmail, value);
    refreshWorkspace();
    toast.success('Follow-up state updated.');
  };

  const logout = async () => {
    try {
      await AdminApi.logout();
    } catch {
      // ignore
    } finally {
      removeAdminToken();
      navigate('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="h-screen overflow-y-auto w-full flex justify-center items-center min-h-[550px] px-6 py-[80px]">
        <Circleloader />
      </div>
    );
  }

  return (
    <AdminShellLayout
      title="Clinic Workspace"
      subtitle="Persistent operational context for support: clinic health, notes, tags, and follow-up actions in one place."
      actions={
        <>
          <button
            type="button"
            onClick={() => loadAnalytics(true)}
            className="rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
          >
            Log out
          </button>
        </>
      }
    >
      {!activeClinicEmail ? (
        <div className="rounded-[20px] border border-Gray-50 bg-white p-6 shadow-100 text-[12px] text-Text-Secondary">
          Select a clinic from the shared admin filters to start using the workspace.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[20px] border border-Gray-50 bg-white p-5 shadow-100">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-Text-Secondary">
                  Clinic intelligence
                </div>
                <div className="mt-1 text-2xl font-semibold text-Text-Primary">
                  {activeClinic?.clinic_name || activeClinicEmail}
                </div>
                <div className="mt-1 text-[12px] text-Text-Secondary">{activeClinicEmail}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.slice(0, 6).map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full px-3 py-1 text-[11px] font-medium text-white"
                        style={{
                          backgroundColor: tag.status === 'active' ? tag.color : '#98A2B3',
                        }}
                      >
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-[#F2F4F7] px-3 py-1 text-[11px] text-Text-Secondary">
                      No tags yet
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:min-w-[380px]">
                <div className="rounded-2xl bg-[#F8FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-wide text-Text-Secondary">
                    Clinic state
                  </div>
                  <div className="mt-1 text-lg font-semibold text-Text-Primary">{healthTone}</div>
                  <div className="mt-1 text-[11px] text-Text-Secondary">
                    Based on completion rate, active tags, and follow-up status.
                  </div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-wide text-Text-Secondary">
                    Follow-up
                  </div>
                  <select
                    value={workspace?.followUpState || 'monitor'}
                    onChange={(event) => updateFollowUp(event.target.value as FollowUpState)}
                    className="mt-2 w-full rounded-2xl border border-Gray-50 bg-white px-3 py-2 text-[12px] outline-none"
                  >
                    {followUpOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {summaryCards.slice(0, 4).map((card) => (
              <div key={card.key} className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
                <div className="text-[11px] uppercase tracking-wide text-Text-Secondary">
                  {card.label}
                </div>
                <div className="mt-3 text-2xl font-semibold text-Text-Primary">
                  {formatCompactNumber(analytics?.[card.key] ?? 0)}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_360px]">
            <div className="space-y-4">
              <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
                <div className="flex items-center gap-2 text-Text-Primary">
                  <Plus size={16} />
                  <div className="TextStyle-Headline-5">Add note</div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    value={noteTitle}
                    onChange={(event) => setNoteTitle(event.target.value)}
                    placeholder="Note title"
                    className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                  />
                  <select
                    value={noteTemplate}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNoteTemplate(value);
                      if (value && !noteTitle) {
                        setNoteTitle(value);
                      }
                    }}
                    className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                  >
                    <option value="">Template</option>
                    {noteTemplates.map((template) => (
                      <option key={template} value={template}>
                        {template}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={noteBody}
                  onChange={(event) => setNoteBody(event.target.value)}
                  placeholder="Explain what changed, why it matters, and what support should remember next time."
                  className="mt-3 min-h-[120px] w-full rounded-[16px] border border-Gray-50 bg-[#F8FAFB] px-3 py-3 text-[12px] outline-none"
                />
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <input
                    value={noteTagInput}
                    onChange={(event) => setNoteTagInput(event.target.value)}
                    placeholder="Tags, comma separated"
                    className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                  />
                  <select
                    value={noteVisibility}
                    onChange={(event) =>
                      setNoteVisibility(event.target.value as 'internal' | 'leadership')
                    }
                    className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                  >
                    <option value="internal">Internal support only</option>
                    <option value="leadership">Leadership visible</option>
                  </select>
                  <label className="flex items-center gap-2 rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] text-Text-Primary">
                    <input
                      type="checkbox"
                      checked={noteFollowUpRequired}
                      onChange={(event) => setNoteFollowUpRequired(event.target.checked)}
                    />
                    Follow-up required
                  </label>
                  <input
                    type="date"
                    value={noteFollowUpDueDate}
                    onChange={(event) => setNoteFollowUpDueDate(event.target.value)}
                    className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                  />
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={addNote}
                    className="rounded-full bg-Primary-DeepTeal px-4 py-2 text-[12px] text-white"
                  >
                    Save note
                  </button>
                </div>
              </div>

              <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="TextStyle-Headline-5 text-Text-Primary">Notes and timeline</div>
                    <div className="mt-1 text-[11px] text-Text-Secondary">
                      Operational memory for future support reviews and stakeholder updates.
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={noteSearch}
                      onChange={(event) => setNoteSearch(event.target.value)}
                      placeholder="Search notes..."
                      className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                    />
                    <select
                      value={visibilityFilter}
                      onChange={(event) => setVisibilityFilter(event.target.value)}
                      className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                    >
                      <option value="all">All visibility</option>
                      <option value="internal">Internal</option>
                      <option value="leadership">Leadership</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => (
                      <div key={note.id} className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-[12px] font-semibold text-Text-Primary">
                                {note.title}
                              </div>
                              {note.pinned && <Pin size={12} className="text-Primary-DeepTeal" />}
                            </div>
                            <div className="mt-1 text-[11px] text-Text-Secondary">
                              {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')} by {note.author}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                updateClinicNote(activeClinicEmail, note.id, (currentNote) => ({
                                  ...currentNote,
                                  pinned: !currentNote.pinned,
                                }));
                                refreshWorkspace();
                              }}
                              className="rounded-full border border-Gray-50 bg-white px-3 py-1 text-[11px] text-Text-Primary"
                            >
                              {note.pinned ? 'Unpin' : 'Pin'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteClinicNote(activeClinicEmail, note.id);
                                refreshWorkspace();
                              }}
                              className="rounded-full border border-Gray-50 bg-white px-3 py-1 text-[11px] text-red-600"
                            >
                              <span className="inline-flex items-center gap-1">
                                <Trash2 size={12} />
                                Delete
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 text-[12px] leading-6 text-Text-Primary">{note.body}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white px-3 py-1 text-[11px] text-Text-Primary"
                            >
                              {tag}
                            </span>
                          ))}
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] text-Text-Secondary">
                            {note.visibility === 'internal' ? 'Internal' : 'Leadership visible'}
                          </span>
                          {note.followUpRequired && (
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] text-Text-Primary">
                              Follow-up by {note.followUpDueDate || 'No due date'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-[#F8FAFB] px-4 py-8 text-center text-[11px] text-Text-Secondary">
                      No notes yet for this clinic.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
                <div className="flex items-center gap-2 text-Text-Primary">
                  <Tags size={16} />
                  <div className="TextStyle-Headline-5">Clinic tags</div>
                </div>
                <div className="mt-4 grid gap-3">
                  <input
                    value={newTagName}
                    onChange={(event) => setNewTagName(event.target.value)}
                    placeholder="Add a tag..."
                    className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                  />
                  <select
                    value={newTagType}
                    onChange={(event) => setNewTagType(event.target.value as AdminTagType)}
                    className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                  >
                    {tagTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addTag}
                    className="rounded-full bg-Primary-DeepTeal px-4 py-2 text-[12px] text-white"
                  >
                    Add tag
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <div key={tag.id} className="rounded-2xl bg-[#F8FAFB] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="text-[12px] font-medium text-Text-Primary">
                                {tag.name}
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] text-Text-Secondary">
                              {tag.tagType.replace('_', ' ')} | {tag.status}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              toggleClinicTagStatus(activeClinicEmail, tag.id);
                              refreshWorkspace();
                            }}
                            className="rounded-full border border-Gray-50 bg-white px-3 py-1 text-[11px] text-Text-Primary"
                          >
                            {tag.status === 'active' ? 'Resolve' : 'Re-open'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-[#F8FAFB] px-4 py-5 text-[11px] text-Text-Secondary">
                      No tags yet for this clinic.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
                <div className="TextStyle-Headline-5 text-Text-Primary">Support health summary</div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-[#F8FAFB] p-4">
                    <div className="flex items-center gap-2 text-Text-Primary">
                      <CheckCircle2 size={16} />
                      <div className="text-[12px] font-medium">Questionnaire completion</div>
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-Text-Primary">
                      {formatPercentage(completionRate)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFB] p-4">
                    <div className="flex items-center gap-2 text-Text-Primary">
                      <AlertCircle size={16} />
                      <div className="text-[12px] font-medium">Open follow-up signals</div>
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-Text-Primary">
                      {notes.filter((note) => note.followUpRequired).length + tags.filter((tag) => tag.status === 'active').length}
                    </div>
                    <div className="mt-1 text-[11px] text-Text-Secondary">
                      Counts follow-up notes and active tags that still need attention.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShellLayout>
  );
};

export default ClinicWorkspace;
