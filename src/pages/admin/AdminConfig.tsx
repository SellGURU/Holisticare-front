/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';

const AdminConfig = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configText, setConfigText] = useState('{}');
  const [configError, setConfigError] = useState('');

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  useEffect(() => {
    const loadPage = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
        const configRes = await AdminApi.getConfig();
        setConfigText(JSON.stringify(configRes.data || {}, null, 2));
      } catch {
        handleAuthFailure();
      } finally {
        setLoadingPage(false);
      }
    };

    loadPage().catch(() => {});
  }, []);

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
      // ignore
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
      title="Config Publishing"
      subtitle="Edit the merged marketing configuration in a dedicated admin screen without mixing it with session analytics."
      showGlobalFilters={false}
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
      <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="TextStyle-Headline-5 text-Text-Primary">Config JSON</div>
            <div className="mt-1 text-[11px] text-Text-Secondary">
              Keep publishing controls separate from support analytics to reduce risk and confusion.
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
          onChange={(event) => setConfigText(event.target.value)}
          spellCheck={false}
          className="mt-4 min-h-[620px] w-full resize-y rounded-[16px] border border-Gray-50 bg-[#0F172A] p-4 font-mono text-[12px] text-[#E2E8F0] outline-none"
        />

        <div className="mt-2 text-[11px]">
          {configError ? (
            <span className="text-red-500">{configError}</span>
          ) : (
            <span className="text-Text-Secondary">
              Config is valid JSON and ready to save.
            </span>
          )}
        </div>
      </div>
    </AdminShellLayout>
  );
};

export default AdminConfig;
