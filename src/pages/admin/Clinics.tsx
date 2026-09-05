/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, KeyRound, Pencil, RefreshCw, Search, ShieldCheck, ShieldOff, Smartphone, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';
import ClinicMobileUsersPanel from './ClinicMobileUsersPanel';
import ClinicProfileModal from './ClinicProfileModal';
import type { ClinicProfileData } from './clinicProfileForm';
import {
  expiryMsFromRemaining,
  formatCountdown,
  remainingSecondsFromMs,
} from './tempPasswordCountdown';

interface ClinicRow {
  clinic_id: number;
  name: string;
  primary_email: string;
  created_date: string | null;
  plan_type: 'demo' | 'paying';
  is_disabled: boolean;
  simplified_report_labels: boolean;
  plan_updated_at: string | null;
  plan_updated_by: string;
  user_count: number;
  patient_count: number;
  temp_password_expires_at: string | null;
  temp_password_remaining_seconds?: number | null;
  tempExpiresAtMs?: number | null;
}

interface TempPasswordGrant {
  clinic_id: number;
  clinic_name: string;
  login_email: string;
  temporary_password: string;
  expires_at: string;
  expires_in_seconds: number;
  expiresAtMs: number;
  account_kind?: 'clinic' | 'mobile';
  display_name?: string;
}

const formatDate = (value: string | null) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const withLocalExpiry = (clinic: ClinicRow, nowMs = Date.now()): ClinicRow => ({
  ...clinic,
  tempExpiresAtMs: expiryMsFromRemaining(
    clinic.temp_password_remaining_seconds,
    nowMs,
  ),
});

const Clinics = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [clinics, setClinics] = useState<ClinicRow[]>([]);
  const [search, setSearch] = useState('');
  const [tempGrant, setTempGrant] = useState<TempPasswordGrant | null>(null);
  const [copied, setCopied] = useState(false);
  const [nowTick, setNowTick] = useState(0);
  const [mobileClinic, setMobileClinic] = useState<ClinicRow | null>(null);
  const [profileClinic, setProfileClinic] = useState<ClinicRow | null>(null);

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const loadClinics = async () => {
    setLoadingList(true);
    try {
      const res = await AdminApi.listClinics();
      const nowMs = Date.now();
      setClinics(
        (res.data?.clinics || []).map((clinic: ClinicRow) =>
          withLocalExpiry(clinic, nowMs),
        ),
      );
    } catch (err: any) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
      } else {
        toast.error(err?.response?.data?.detail || 'Failed to load clinics.');
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
        await loadClinics();
      } catch {
        handleAuthFailure();
      } finally {
        setLoadingPage(false);
      }
    };
    init().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasActiveTempPassword =
    Boolean(tempGrant) ||
    clinics.some((clinic) => remainingSecondsFromMs(clinic.tempExpiresAtMs) > 0);

  useEffect(() => {
    if (!hasActiveTempPassword) return undefined;
    const timer = window.setInterval(() => setNowTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [hasActiveTempPassword]);

  const filteredClinics = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clinics;
    return clinics.filter((clinic) =>
      [clinic.name, clinic.primary_email, String(clinic.clinic_id)]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [clinics, search]);

  const tempSecondsLeft = remainingSecondsFromMs(tempGrant?.expiresAtMs);
  void nowTick;

  const updateClinic = async (
    clinic: ClinicRow,
    changes: {
      plan_type?: 'demo' | 'paying';
      is_disabled?: boolean;
      simplified_report_labels?: boolean;
    },
  ) => {
    if (
      changes.is_disabled === true &&
      !window.confirm(
        'Disabling this clinic will block login and reject active sessions. Continue?',
      )
    ) {
      return;
    }

    setUpdatingId(clinic.clinic_id);
    try {
      await AdminApi.updateClinic(clinic.clinic_id, changes);
      setClinics((current) =>
        current.map((item) =>
          item.clinic_id === clinic.clinic_id
            ? {
                ...item,
                ...changes,
                plan_updated_at: new Date().toISOString(),
              }
            : item,
        ),
      );
      toast.success('Clinic updated.');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update clinic.');
    } finally {
      setUpdatingId(null);
    }
  };

  const grantTempPassword = async (clinic: ClinicRow) => {
    if (
      !window.confirm(
        `Set a 60-second temporary password for ${clinic.name || `clinic #${clinic.clinic_id}`}? The original password hash will be restored automatically.`,
      )
    ) {
      return;
    }

    setUpdatingId(clinic.clinic_id);
    try {
      const res = await AdminApi.grantTempClinicPassword(clinic.clinic_id);
      const grant = {
        ...(res.data as Omit<TempPasswordGrant, 'expiresAtMs'>),
        account_kind: 'clinic' as const,
        expiresAtMs: expiryMsFromRemaining(
          res.data?.expires_in_seconds || 60,
        ) as number,
      };
      setTempGrant(grant);
      setCopied(false);
      setClinics((current) =>
        current.map((item) =>
          item.clinic_id === clinic.clinic_id
            ? {
                ...item,
                temp_password_expires_at: grant.expires_at,
                temp_password_remaining_seconds: grant.expires_in_seconds,
                tempExpiresAtMs: grant.expiresAtMs,
              }
            : item,
        ),
      );
      toast.success('Temporary password is active for 60 seconds.');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || 'Failed to create a temporary password.',
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const copyTempPassword = async () => {
    if (!tempGrant?.temporary_password) return;
    try {
      await navigator.clipboard.writeText(tempGrant.temporary_password);
      setCopied(true);
      toast.success('Password copied.');
    } catch {
      toast.error('Could not copy password.');
    }
  };

  if (loadingPage) {
    return (
      <div className="h-screen overflow-y-auto w-full flex justify-center items-center min-h-[550px] px-6 py-[80px]">
        <Circleloader />
      </div>
    );
  }

  return (
    <AdminShellLayout
      title="Clinics"
      subtitle="Manage clinic access, plan type, report labels, profile, and account status from one admin table."
      showGlobalFilters={false}
      actions={
        <button
          type="button"
          onClick={() => loadClinics()}
          disabled={loadingList}
          className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
        >
          <RefreshCw size={14} className={loadingList ? 'animate-spin' : ''} />
          Refresh
        </button>
      }
    >
      <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold text-Text-Primary">
              Clinic directory
            </div>
            <div className="text-[12px] text-Text-Secondary">
              {filteredClinics.length} of {clinics.length} clinics shown
            </div>
          </div>
          <div className="relative w-full md:w-[320px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-Text-Secondary"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clinic, email, or ID"
              className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] py-2 pl-9 pr-3 text-[12px] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-Gray-50 text-left text-[12px]">
            <thead className="bg-[#F8FAFB] text-Text-Secondary">
              <tr>
                <th className="px-3 py-3 font-medium">Clinic</th>
                <th className="px-3 py-3 font-medium">Created</th>
                <th className="px-3 py-3 font-medium">Users</th>
                <th className="px-3 py-3 font-medium">Patients</th>
                <th className="px-3 py-3 font-medium">Plan</th>
                <th className="px-3 py-3 font-medium">Report labels</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Access</th>
                <th className="px-3 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-Gray-50">
              {filteredClinics.map((clinic) => {
                const busy = updatingId === clinic.clinic_id;
                const activeSeconds = remainingSecondsFromMs(
                  clinic.tempExpiresAtMs,
                );
                return (
                  <tr key={clinic.clinic_id} className="align-top">
                    <td className="px-3 py-3">
                      <div className="font-medium text-Text-Primary">
                        {clinic.name || `Clinic #${clinic.clinic_id}`}
                      </div>
                      <div className="mt-1 text-[11px] text-Text-Secondary">
                        {clinic.primary_email || 'No admin email'} · ID{' '}
                        {clinic.clinic_id}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-Text-Secondary">
                      {formatDate(clinic.created_date)}
                    </td>
                    <td className="px-3 py-3 text-Text-Primary">
                      {clinic.user_count}
                    </td>
                    <td className="px-3 py-3 text-Text-Primary">
                      {clinic.patient_count}
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={clinic.plan_type}
                        disabled={busy}
                        onChange={(event) =>
                          updateClinic(clinic, {
                            plan_type: event.target.value as 'demo' | 'paying',
                          })
                        }
                        className="rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                      >
                        <option value="demo">Demo</option>
                        <option value="paying">Paying</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={
                          clinic.simplified_report_labels
                            ? 'high_low'
                            : 'legacy'
                        }
                        disabled={busy}
                        aria-label={`Report label style for ${
                          clinic.name || `clinic ${clinic.clinic_id}`
                        }`}
                        onChange={(event) =>
                          updateClinic(clinic, {
                            simplified_report_labels:
                              event.target.value === 'high_low',
                          })
                        }
                        className="min-w-[112px] rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] text-Text-Primary outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="legacy">Legacy</option>
                        <option value="high_low">High / Low</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          updateClinic(clinic, {
                            is_disabled: !clinic.is_disabled,
                          })
                        }
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[12px] ${
                          clinic.is_disabled
                            ? 'bg-red-50 text-red-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {clinic.is_disabled ? (
                          <ShieldOff size={14} />
                        ) : (
                          <ShieldCheck size={14} />
                        )}
                        {clinic.is_disabled ? 'Disabled' : 'Active'}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-start gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setProfileClinic(clinic)}
                          className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] text-Text-Primary"
                        >
                          <Pencil size={14} />
                          Edit profile
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => grantTempPassword(clinic)}
                          className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] text-Text-Primary"
                        >
                          <KeyRound size={14} />
                          {activeSeconds > 0
                            ? `Portal ${formatCountdown(activeSeconds)}`
                            : 'Portal password'}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setMobileClinic(clinic)}
                          className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] text-Text-Primary"
                        >
                          <Smartphone size={14} />
                          Mobile users
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-Text-Secondary">
                      <div>{formatDate(clinic.plan_updated_at)}</div>
                      {clinic.plan_updated_by && (
                        <div className="mt-1 text-[11px]">
                          by {clinic.plan_updated_by}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {tempGrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-[20px] bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[16px] font-semibold text-Text-Primary">
                  {tempGrant.account_kind === 'mobile'
                    ? 'Temporary mobile login'
                    : 'Temporary clinic login'}
                </div>
                <div className="mt-1 text-[12px] text-Text-Secondary">
                  {tempGrant.account_kind === 'mobile'
                    ? tempGrant.display_name ||
                      tempGrant.login_email ||
                      `Clinic #${tempGrant.clinic_id}`
                    : tempGrant.clinic_name || `Clinic #${tempGrant.clinic_id}`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTempGrant(null)}
                className="rounded-full p-1 text-Text-Secondary"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rounded-2xl bg-[#F8FAFB] p-3 text-[12px]">
              <div className="text-Text-Secondary">Email</div>
              <div className="mt-1 font-medium text-Text-Primary">
                {tempGrant.login_email || 'No owner email'}
              </div>
              <div className="mt-3 text-Text-Secondary">Password</div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <code className="break-all font-medium text-Text-Primary">
                  {tempSecondsLeft > 0
                    ? tempGrant.temporary_password
                    : 'Expired and restored'}
                </code>
                {tempSecondsLeft > 0 && (
                  <button
                    type="button"
                    onClick={copyTempPassword}
                    className="inline-flex items-center gap-1 rounded-full border border-Gray-50 bg-white px-3 py-1 text-[11px]"
                  >
                    <Copy size={12} />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 text-[12px] text-Text-Secondary">
              {tempSecondsLeft > 0
                ? `Original password is restored in ${formatCountdown(tempSecondsLeft)}. Your current session stays logged in.`
                : 'The original password has been restored. This session stays valid; the temporary password no longer works for a new login.'}
            </div>
          </div>
        </div>
      )}
      {profileClinic && (
        <ClinicProfileModal
          clinicId={profileClinic.clinic_id}
          clinicName={profileClinic.name}
          fallbackEmail={profileClinic.primary_email}
          onClose={() => setProfileClinic(null)}
          onSaved={(saved: ClinicProfileData) => {
            setClinics((current) =>
              current.map((item) =>
                item.clinic_id === saved.clinic_id
                  ? {
                      ...item,
                      name: saved.name || item.name,
                      primary_email:
                        saved.public_email ||
                        saved.owner_login_email ||
                        item.primary_email,
                    }
                  : item,
              ),
            );
            setProfileClinic(null);
            loadClinics().catch(() => {});
          }}
        />
      )}
      {mobileClinic && (
        <ClinicMobileUsersPanel
          clinicId={mobileClinic.clinic_id}
          clinicName={mobileClinic.name}
          onClose={() => setMobileClinic(null)}
          onGrant={(payload) => {
            setCopied(false);
            setTempGrant({
              ...payload,
              expiresAtMs: expiryMsFromRemaining(
                payload.expires_in_seconds || 60,
              ) as number,
            });
          }}
        />
      )}
    </AdminShellLayout>
  );
};

export default Clinics;
