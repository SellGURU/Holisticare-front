/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';

type DemoStatus = 'fresh' | 'stale' | 'missing' | 'source_template' | 'source_clinic';

interface DemoClinicRow {
  clinic_id: number;
  clinic_name: string;
  status: DemoStatus;
  patients_id: number | null;
  member_id: number | null;
  email: string | null;
  is_demo: boolean;
  plans: number;
  html: number;
  age: number | null;
  can_replace: boolean;
}

interface DemoJob {
  job_id: string;
  status: string;
  copied: number;
  skipped: number;
  failed: number;
  total: number;
  current_clinic_id: number | null;
  last_error: string | null;
}

interface DemoTemplate {
  found: boolean;
  member_id?: number;
  patients_id?: number;
  clinics_id?: number;
  name?: string;
  age?: number | null;
  email?: string | null;
  plans?: number;
  html?: number;
  rook?: number;
  intervention_titles?: string[];
  looking_forwards_has_key_areas?: boolean;
  preview_path?: string;
  is_demo?: boolean;
  is_archived?: boolean;
}

interface DemoStatusPayload {
  template: DemoTemplate;
  clinics: DemoClinicRow[];
  totals: {
    clinics: number;
    fresh?: number;
    stale?: number;
    missing?: number;
    source_template?: number;
    source_clinic?: number;
  };
  active_job: DemoJob | null;
}

const STATUS_LABEL: Record<DemoStatus, string> = {
  fresh: 'Fresh',
  stale: 'Stale',
  missing: 'Missing',
  source_template: 'Template',
  source_clinic: 'Source clinic',
};

const STATUS_CLASS: Record<DemoStatus, string> = {
  fresh: 'bg-emerald-50 text-emerald-700',
  stale: 'bg-amber-50 text-amber-700',
  missing: 'bg-slate-100 text-slate-600',
  source_template: 'bg-teal-50 text-teal-700',
  source_clinic: 'bg-slate-100 text-slate-600',
};

const jobIsActive = (job?: DemoJob | null) =>
  Boolean(job && (job.status === 'pending' || job.status === 'running'));

const AdminDemoPatient = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [replacingId, setReplacingId] = useState<number | null>(null);
  const [startingJob, setStartingJob] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [refreshConfirm, setRefreshConfirm] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DemoStatus>('all');
  const [payload, setPayload] = useState<DemoStatusPayload | null>(null);
  const [job, setJob] = useState<DemoJob | null>(null);

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const applyStatus = (data: DemoStatusPayload) => {
    setPayload(data);
    if (data.active_job) {
      setJob(data.active_job);
    }
  };

  const loadStatus = async () => {
    setLoadingList(true);
    try {
      const res = await AdminApi.getDemoStatus();
      applyStatus(res.data as DemoStatusPayload);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
      } else {
        toast.error(err?.response?.data?.detail || 'Failed to load demo status.');
      }
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
        await loadStatus();
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
    if (!jobIsActive(job) || !job?.job_id) return undefined;
    const timer = window.setInterval(async () => {
      try {
        const res = await AdminApi.getDemoJob(job.job_id);
        const next = res.data as DemoJob;
        setJob(next);
        if (!jobIsActive(next)) {
          await loadStatus();
          if (next.status === 'succeeded') {
            toast.success('Replace-all job finished.');
          } else if (next.status === 'failed') {
            toast.error(next.last_error || 'Replace-all job failed.');
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 401) {
          handleAuthFailure();
        }
      }
    }, 3000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.job_id, job?.status]);

  const clinics = payload?.clinics || [];
  const totals = payload?.totals;
  const template = payload?.template;

  const filteredClinics = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clinics.filter((clinic) => {
      if (statusFilter !== 'all' && clinic.status !== statusFilter) {
        return false;
      }
      if (!term) return true;
      return [
        clinic.clinic_name,
        String(clinic.clinic_id),
        clinic.email || '',
        clinic.member_id ? String(clinic.member_id) : '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [clinics, search, statusFilter]);

  const resetClinic = async (clinic: DemoClinicRow) => {
    if (!clinic.can_replace) return;
    if (
      !window.confirm(
        `Replace the demo patient in ${clinic.clinic_name || `clinic #${clinic.clinic_id}`} with a fresh copy from the template? The previous demo copy will be archived after the new one is created.`,
      )
    ) {
      return;
    }
    setReplacingId(clinic.clinic_id);
    try {
      const res = await AdminApi.replaceClinicDemo(clinic.clinic_id);
      const action = res.data?.action;
      if (action === 'skip') {
        toast.info(res.data?.reason || 'Clinic already has a fresh snapshot.');
      } else {
        toast.success(
          `Copied demo ${res.data?.new_member_id || ''} into clinic ${clinic.clinic_id}.`,
        );
      }
      await loadStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to reset this clinic.');
    } finally {
      setReplacingId(null);
    }
  };

  const startReplaceAll = async () => {
    if (jobIsActive(job)) {
      toast.info('A replace-all job is already running.');
      return;
    }
    if (
      !window.confirm(
        'Replace the demo patient in every stale or missing clinic? Fresh snapshots are skipped. This can take a long time and will run in the background.',
      )
    ) {
      return;
    }
    setStartingJob(true);
    try {
      const res = await AdminApi.replaceAllDemos(true);
      setJob(res.data as DemoJob);
      toast.success('Replace-all job started.');
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.info(err?.response?.data?.detail || 'A replace-all job is already running.');
        await loadStatus();
      } else {
        toast.error(err?.response?.data?.detail || 'Failed to start replace-all.');
      }
    } finally {
      setStartingJob(false);
    }
  };

  const confirmRefreshTemplate = async () => {
    if (refreshConfirm.trim() !== 'REFRESH') {
      toast.error('Type REFRESH to confirm.');
      return;
    }
    setRefreshing(true);
    try {
      await AdminApi.refreshDemoTemplate();
      toast.success('Template refreshed from the live source.');
      setShowRefreshModal(false);
      setRefreshConfirm('');
      await loadStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to refresh the template.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="h-screen overflow-y-auto w-full flex justify-center items-center min-h-[550px] px-6 py-[80px]">
        <Circleloader />
      </div>
    );
  }

  const previewPath = template?.preview_path || '/html-previewer/999000000001';

  return (
    <AdminShellLayout
      title="Demo Patient"
      subtitle="Frozen template health and per-clinic editable copies. Clinics never see these reset controls."
      showGlobalFilters={false}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadStatus()}
            disabled={loadingList}
            className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
          >
            <RefreshCw size={14} className={loadingList ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            onClick={startReplaceAll}
            disabled={startingJob || jobIsActive(job)}
            className="rounded-full bg-Primary-DeepTeal px-4 py-2 text-[12px] text-white disabled:opacity-50"
          >
            {startingJob || jobIsActive(job)
              ? 'Replace-all running'
              : 'Replace all stale clinics'}
          </button>
          <button
            type="button"
            onClick={() => {
              setRefreshConfirm('');
              setShowRefreshModal(true);
            }}
            className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[12px] text-amber-800"
          >
            Refresh template from source
          </button>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-lg font-semibold text-Text-Primary">
                Frozen template
              </div>
              <div className="mt-1 text-[12px] text-Text-Secondary">
                Clinic 205 · member {template?.member_id || '999000000001'} ·
                unique editable copies are made from this snapshot.
              </div>
            </div>
            <Link
              to={previewPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] text-Text-Primary"
            >
              <ExternalLink size={14} />
              Preview report
            </Link>
          </div>
          {template?.found ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-[#F8FAFB] p-3">
                <div className="text-[11px] text-Text-Secondary">Identity</div>
                <div className="mt-1 text-[13px] font-medium text-Text-Primary">
                  {template.name || 'Alexander Galant'}
                </div>
                <div className="mt-1 text-[11px] text-Text-Secondary">
                  Age {template.age ?? '-'} · patient {template.patients_id}
                </div>
                <div className="mt-1 break-all text-[11px] text-Text-Secondary">
                  {template.email || 'No email'}
                </div>
              </div>
              <div className="rounded-2xl bg-[#F8FAFB] p-3">
                <div className="text-[11px] text-Text-Secondary">Graph counts</div>
                <div className="mt-1 text-[13px] font-medium text-Text-Primary">
                  Plans {template.plans ?? 0} · HTML {template.html ?? 0} · Rook{' '}
                  {template.rook ?? 0}
                </div>
                <div className="mt-1 text-[11px] text-Text-Secondary">
                  {template.is_demo ? 'is_demo' : 'not flagged demo'}
                  {template.is_archived ? ' · archived' : ''}
                </div>
              </div>
              <div className="rounded-2xl bg-[#F8FAFB] p-3 sm:col-span-2">
                <div className="text-[11px] text-Text-Secondary">
                  Active-plan interventions
                </div>
                <div className="mt-1 text-[12px] text-Text-Primary">
                  {(template.intervention_titles || []).length
                    ? (template.intervention_titles || []).slice(0, 6).join(' · ')
                    : 'No intervention titles on the active plan'}
                </div>
                <div className="mt-2 text-[11px] text-Text-Secondary">
                  looking_forwards Key areas to address:{' '}
                  {template.looking_forwards_has_key_areas ? 'present' : 'missing'}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-[12px] text-amber-800">
              Template member was not found. Refresh the template from source to recreate it.
            </div>
          )}
        </div>

        {job && (
          <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
            <div className="text-lg font-semibold text-Text-Primary">Jobs</div>
            <div className="mt-1 text-[12px] text-Text-Secondary">
              {job.status} · copied {job.copied} · skipped {job.skipped} · failed{' '}
              {job.failed}
              {job.total ? ` · total ${job.total}` : ''}
              {job.current_clinic_id
                ? ` · current clinic ${job.current_clinic_id}`
                : ''}
            </div>
            {job.last_error && (
              <div className="mt-2 text-[12px] text-red-600">{job.last_error}</div>
            )}
          </div>
        )}

        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-lg font-semibold text-Text-Primary">Fleet</div>
              <div className="text-[12px] text-Text-Secondary">
                Fresh {totals?.fresh ?? 0} · Stale {totals?.stale ?? 0} · Missing{' '}
                {totals?.missing ?? 0} · {filteredClinics.length} shown
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ['all', 'All'],
                    ['fresh', 'Fresh'],
                    ['stale', 'Stale'],
                    ['missing', 'Missing'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`rounded-full px-3 py-1.5 text-[11px] ${
                      statusFilter === value
                        ? 'bg-Primary-DeepTeal text-white'
                        : 'border border-Gray-50 bg-[#F8FAFB] text-Text-Primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-[280px]">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-Text-Secondary"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search clinic, email, or member id"
                  className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] py-2 pl-9 pr-3 text-[12px] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-Gray-50 text-left text-[12px]">
              <thead className="bg-[#F8FAFB] text-Text-Secondary">
                <tr>
                  <th className="px-3 py-3 font-medium">Clinic</th>
                  <th className="px-3 py-3 font-medium">Demo</th>
                  <th className="px-3 py-3 font-medium">Member / email</th>
                  <th className="px-3 py-3 font-medium">Plans</th>
                  <th className="px-3 py-3 font-medium">HTML</th>
                  <th className="px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-Gray-50">
                {filteredClinics.map((clinic) => {
                  const busy = replacingId === clinic.clinic_id;
                  return (
                    <tr key={clinic.clinic_id}>
                      <td className="px-3 py-3">
                        <div className="font-medium text-Text-Primary">
                          {clinic.clinic_name || `Clinic #${clinic.clinic_id}`}
                        </div>
                        <div className="mt-1 text-[11px] text-Text-Secondary">
                          ID {clinic.clinic_id}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] ${STATUS_CLASS[clinic.status]}`}
                        >
                          {STATUS_LABEL[clinic.status]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-Text-Secondary">
                        <div className="text-Text-Primary">
                          {clinic.member_id || '—'}
                        </div>
                        <div className="mt-1 break-all text-[11px]">
                          {clinic.email || 'No demo email'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-Text-Primary">{clinic.plans}</td>
                      <td className="px-3 py-3 text-Text-Primary">{clinic.html}</td>
                      <td className="px-3 py-3">
                        {clinic.can_replace ? (
                          <button
                            type="button"
                            disabled={busy || jobIsActive(job)}
                            onClick={() => resetClinic(clinic)}
                            className="rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] text-Text-Primary disabled:opacity-50"
                          >
                            {busy ? 'Resetting…' : 'Reset this clinic'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-Text-Secondary">
                            Holds the template
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showRefreshModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-[20px] bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[16px] font-semibold text-Text-Primary">
                  Refresh template from source
                </div>
                <div className="mt-1 text-[12px] text-Text-Secondary">
                  This wipes only the frozen template subgraph, then recopies
                  the live clinical source and overlays the demo identity. Live
                  source patients are not changed. Per-clinic copies stay until
                  you replace them.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRefreshModal(false)}
                className="rounded-full p-1 text-Text-Secondary"
              >
                <X size={16} />
              </button>
            </div>
            <label className="mt-2 block text-[12px] text-Text-Secondary">
              Type REFRESH to confirm
              <input
                value={refreshConfirm}
                onChange={(event) => setRefreshConfirm(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                placeholder="REFRESH"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRefreshModal(false)}
                className="rounded-full border border-Gray-50 px-4 py-2 text-[12px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={refreshing || refreshConfirm.trim() !== 'REFRESH'}
                onClick={confirmRefreshTemplate}
                className="rounded-full bg-amber-600 px-4 py-2 text-[12px] text-white disabled:opacity-50"
              >
                {refreshing ? 'Refreshing…' : 'Refresh template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShellLayout>
  );
};

export default AdminDemoPatient;
