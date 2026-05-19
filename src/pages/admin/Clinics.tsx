/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from 'react-toastify';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';

interface ClinicRow {
  clinic_id: number;
  name: string;
  primary_email: string;
  created_date: string | null;
  plan_type: 'demo' | 'paying';
  is_disabled: boolean;
  plan_updated_at: string | null;
  plan_updated_by: string;
  user_count: number;
  patient_count: number;
}

const formatDate = (value: string | null) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const Clinics = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [clinics, setClinics] = useState<ClinicRow[]>([]);
  const [search, setSearch] = useState('');

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const loadClinics = async () => {
    setLoadingList(true);
    try {
      const res = await AdminApi.listClinics();
      setClinics(res.data?.clinics || []);
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

  const updateClinic = async (
    clinic: ClinicRow,
    changes: { plan_type?: 'demo' | 'paying'; is_disabled?: boolean },
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
      subtitle="Manage clinic access, plan type, and account status from one admin table."
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
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-Gray-50">
              {filteredClinics.map((clinic) => {
                const busy = updatingId === clinic.clinic_id;
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
    </AdminShellLayout>
  );
};

export default Clinics;
