/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';

const summaryCards = [
  { key: 'num_of_new_clients', label: 'New Clients' },
  { key: 'num_of_questionnaires_assigned', label: 'Questionnaires Assigned' },
  { key: 'num_of_questionnaires_filled', label: 'Questionnaires Filled' },
  { key: 'num_of_files_uploaded', label: 'Files Uploaded' },
  { key: 'num_of_holistic_plans_saved', label: 'Holistic Plans Saved' },
  { key: 'num_of_action_plans_saved', label: 'Action Plans Saved' },
  { key: 'num_of_library_entries_created', label: 'Library Created' },
  { key: 'num_of_library_entries_updated', label: 'Library Updated' },
];

const MarketingDashboard = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinicEmail, setSelectedClinicEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [configText, setConfigText] = useState('{}');
  const [configError, setConfigError] = useState('');

  const selectedClinic = useMemo(
    () => clinics.find((clinic) => clinic.clinic_email === selectedClinicEmail),
    [clinics, selectedClinicEmail],
  );

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  useEffect(() => {
    const loadPage = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
        const [clinicsRes, configRes] = await Promise.all([
          AdminApi.getClinics(),
          AdminApi.getConfig(),
        ]);

        const clinicsData = Array.isArray(clinicsRes.data) ? clinicsRes.data : [];
        setClinics(clinicsData);
        setConfigText(JSON.stringify(configRes.data || {}, null, 2));
      } catch {
        handleAuthFailure();
      } finally {
        setLoadingPage(false);
      }
    };

    loadPage();
  }, []);

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await AdminApi.getAnalytics({
        clinic_email: selectedClinicEmail || null,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      setAnalytics(res.data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
        return;
      }
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const formatConfig = () => {
    try {
      const parsed = JSON.parse(configText);
      setConfigText(JSON.stringify(parsed, null, 2));
      setConfigError('');
    } catch (error: any) {
      setConfigError(error?.message || 'Invalid JSON');
    }
  };

  const saveConfig = async () => {
    try {
      const parsed = JSON.parse(configText);
      setConfigError('');
      setSavingConfig(true);
      await AdminApi.updateConfig(parsed);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setConfigError(err.message);
      } else if (err?.response?.status === 401) {
        handleAuthFailure();
        return;
      } else {
        setConfigError(err?.response?.data?.detail || 'Failed to save config.');
      }
    } finally {
      setSavingConfig(false);
    }
  };

  const logout = async () => {
    try {
      await AdminApi.logout();
    } catch {
      // ignore logout errors and clear locally
    } finally {
      removeAdminToken();
      navigate('/admin/login');
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
      title="Admin Marketing Workspace"
      subtitle="Separate admin area for marketing analytics and config publishing."
      actions={
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
        >
          Log out
        </button>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-4">
        <div className="space-y-4">
            <div className="bg-white border border-Gray-50 shadow-100 rounded-[16px] p-4">
              <div className="TextStyle-Headline-5 text-Text-Primary">
                Analytics Filters
              </div>

              <label className="block text-[11px] text-Text-Secondary mt-4 mb-1">
                Clinic
              </label>
              <select
                value={selectedClinicEmail}
                onChange={(e) => setSelectedClinicEmail(e.target.value)}
                className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none"
              >
                <option value="">All allowed clinics</option>
                {clinics.map((clinic) => (
                  <option key={clinic.clinic_email} value={clinic.clinic_email}>
                    {clinic.clinic_name} ({clinic.clinic_email})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block text-[11px] text-Text-Secondary mb-1">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-Text-Secondary mb-1">
                    End date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none"
                  />
                </div>
              </div>

              {selectedClinic && (
                <div className="mt-4 rounded-xl bg-[#F8FAFB] border border-Gray-50 p-3">
                  <div className="text-[12px] text-Text-Primary font-medium">
                    {selectedClinic.clinic_name}
                  </div>
                  <div className="text-[10px] text-Text-Secondary mt-0.5">
                    {selectedClinic.clinic_email}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={loadAnalytics}
                disabled={loadingAnalytics}
                className="mt-4 rounded-full bg-Primary-DeepTeal text-white px-4 py-2 text-[12px] disabled:opacity-50"
              >
                {loadingAnalytics ? 'Loading analytics...' : 'Load analytics'}
              </button>
            </div>

            <div className="bg-white border border-Gray-50 shadow-100 rounded-[16px] p-4">
              <div className="TextStyle-Headline-5 text-Text-Primary mb-3">
                Allowed Clinics
              </div>
              <div className="max-h-[420px] overflow-y-auto space-y-2">
                {clinics.map((clinic) => (
                  <div
                    key={clinic.clinic_email}
                    className="rounded-xl border border-Gray-50 px-3 py-2"
                  >
                    <div className="text-[12px] font-medium text-Text-Primary">
                      {clinic.clinic_name}
                    </div>
                    <div className="text-[10px] text-Text-Secondary mt-0.5">
                      {clinic.clinic_email}
                    </div>
                  </div>
                ))}
                {clinics.length === 0 && (
                  <div className="text-[11px] text-Text-Secondary">
                    No clinics available.
                  </div>
                )}
              </div>
            </div>
          </div>

        <div className="space-y-4 min-w-0">
            <div className="bg-white border border-Gray-50 shadow-100 rounded-[16px] p-4">
              <div className="TextStyle-Headline-5 text-Text-Primary mb-3">
                Analytics Result
              </div>
              {analytics ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {summaryCards.map((card) => (
                      <div
                        key={card.key}
                        className="rounded-xl border border-Gray-50 bg-[#F8FAFB] p-3"
                      >
                        <div className="text-[11px] text-Text-Secondary">
                          {card.label}
                        </div>
                        <div className="text-xl font-medium text-Text-Primary mt-1">
                          {analytics?.[card.key] ?? 0}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="text-[12px] font-medium text-Text-Primary mb-2">
                      Recent Sessions
                    </div>
                    <div className="max-h-[min(60vh,32rem)] overflow-y-auto overscroll-contain space-y-2 pr-1 Custom-scrollbar">
                      {(analytics.sessions || []).map((session: any, index: number) => (
                        <div
                          key={`${session.created_date}-${index}`}
                          className="rounded-xl border border-Gray-50 p-3"
                        >
                          <div className="text-[11px] text-Text-Secondary mb-2">
                            {session.created_date || 'Unknown date'}
                          </div>
                          <pre className="text-[11px] leading-relaxed text-Text-Primary whitespace-pre-wrap break-words font-mono">
                            {JSON.stringify(session.data, null, 2)}
                          </pre>
                        </div>
                      ))}
                      {(!analytics.sessions || analytics.sessions.length === 0) && (
                        <div className="text-[11px] text-Text-Secondary">
                          No sessions found for the selected filters.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-[11px] text-Text-Secondary">
                  Load analytics to see the current numbers and recent sessions.
                </div>
              )}
            </div>

            <div className="bg-white border border-Gray-50 shadow-100 rounded-[16px] p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                <div>
                  <div className="TextStyle-Headline-5 text-Text-Primary">
                    Config JSON
                  </div>
                  <div className="text-[11px] text-Text-Secondary mt-1">
                    Edit the merged marketing config directly in the main backend.
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={formatConfig}
                    className="rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px]"
                  >
                    Format
                  </button>
                  <button
                    type="button"
                    onClick={saveConfig}
                    disabled={savingConfig}
                    className="rounded-full bg-Primary-DeepTeal text-white px-3 py-1.5 text-[11px] disabled:opacity-50"
                  >
                    {savingConfig ? 'Saving...' : 'Save config'}
                  </button>
                </div>
              </div>

              <textarea
                value={configText}
                onChange={(e) => setConfigText(e.target.value)}
                spellCheck={false}
                className="w-full min-h-[420px] rounded-[16px] border border-Gray-50 bg-[#0F172A] text-[#E2E8F0] p-4 text-[12px] font-mono outline-none resize-y"
              />

              <div className="mt-2 text-[11px]">
                {configError ? (
                  <span className="text-red-500">{configError}</span>
                ) : (
                  <span className="text-Text-Secondary">
                    Config is ready to save.
                  </span>
                )}
              </div>
            </div>
        </div>
      </div>
    </AdminShellLayout>
  );
};

export default MarketingDashboard;
