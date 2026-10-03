/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';

const DEFAULT_CONFIG = {
  android: {
    version: '1.0.31',
    minimumSupportedVersion: '',
    playStoreUrl:
      'https://play.google.com/store/apps/details?id=com.innovatifyltd',
  },
  ios: {
    version: '',
    minimumSupportedVersion: '',
    downloadUrl: '',
  },
};

const mergeConfig = (raw: any) => {
  const data = raw && typeof raw === 'object' ? raw : {};
  return {
    ...DEFAULT_CONFIG,
    ...data,
    android: { ...DEFAULT_CONFIG.android, ...(data.android || {}) },
    ios: { ...DEFAULT_CONFIG.ios, ...(data.ios || {}) },
  };
};

const AdminConfig = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configText, setConfigText] = useState(
    JSON.stringify(DEFAULT_CONFIG, null, 2),
  );
  const [configError, setConfigError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const parsedConfig = useMemo(() => {
    try {
      return mergeConfig(JSON.parse(configText));
    } catch {
      return mergeConfig({});
    }
  }, [configText]);

  const applyConfig = (next: any) => {
    const merged = mergeConfig(next);
    setConfigText(JSON.stringify(merged, null, 2));
    setConfigError('');
  };

  const updatePlatform = (
    platform: 'android' | 'ios',
    field: string,
    value: string,
  ) => {
    applyConfig({
      ...parsedConfig,
      [platform]: {
        ...parsedConfig[platform],
        [field]: value,
      },
    });
  };

  useEffect(() => {
    const loadPage = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
      } catch (error: any) {
        if (error?.response?.status === 401) {
          handleAuthFailure();
          return;
        }
        setConfigError(
          error?.response?.data?.detail ||
            'Could not verify admin session. You can still edit locally.',
        );
      }

      try {
        const configRes = await AdminApi.getConfig();
        applyConfig(configRes.data);
      } catch (error: any) {
        if (error?.response?.status === 401) {
          handleAuthFailure();
          return;
        }
        applyConfig(DEFAULT_CONFIG);
        setConfigError(
          error?.response?.data?.detail ||
            'Config could not be loaded. Showing the default version template.',
        );
      } finally {
        setLoadingPage(false);
      }
    };

    loadPage().catch(() => {});
  }, []);

  const formatConfig = () => {
    try {
      applyConfig(JSON.parse(configText));
    } catch (error: any) {
      setConfigError(error?.message || 'Invalid JSON');
    }
  };

  const saveConfig = async () => {
    try {
      const parsed = mergeConfig(JSON.parse(configText));
      setConfigError('');
      setSaveMessage('');
      setSavingConfig(true);
      await AdminApi.updateConfig(parsed);
      applyConfig(parsed);
      setSaveMessage(
        `Saved. Android latest version is now ${parsed.android.version || '—'}.`,
      );
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
      subtitle="Set the live Android and iOS app versions for the update modal. This stays open even if the raw config file was empty or failed to load."
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
      <div className="space-y-4">
        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="TextStyle-Headline-5 text-Text-Primary">
                App version
              </div>
              <div className="mt-1 text-[11px] text-Text-Secondary">
                Users below the latest version see the update modal. Fill
                minimum version only if the app must refuse older builds.
              </div>
            </div>
            <button
              type="button"
              onClick={saveConfig}
              disabled={savingConfig}
              className="rounded-full bg-Primary-DeepTeal text-white px-3 py-1.5 text-[11px] disabled:opacity-50"
            >
              {savingConfig ? 'Saving...' : 'Save version config'}
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Android latest version
              </span>
              <input
                value={parsedConfig.android.version || ''}
                onChange={(event) =>
                  updatePlatform('android', 'version', event.target.value)
                }
                placeholder="1.0.31"
                className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Android minimum supported
              </span>
              <input
                value={parsedConfig.android.minimumSupportedVersion || ''}
                onChange={(event) =>
                  updatePlatform(
                    'android',
                    'minimumSupportedVersion',
                    event.target.value,
                  )
                }
                placeholder="Optional"
                className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Play Store URL
              </span>
              <input
                value={parsedConfig.android.playStoreUrl || ''}
                onChange={(event) =>
                  updatePlatform('android', 'playStoreUrl', event.target.value)
                }
                className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                iOS latest version
              </span>
              <input
                value={parsedConfig.ios.version || ''}
                onChange={(event) =>
                  updatePlatform('ios', 'version', event.target.value)
                }
                className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                iOS minimum supported
              </span>
              <input
                value={parsedConfig.ios.minimumSupportedVersion || ''}
                onChange={(event) =>
                  updatePlatform(
                    'ios',
                    'minimumSupportedVersion',
                    event.target.value,
                  )
                }
                placeholder="Optional"
                className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              />
            </label>
          </div>
        </div>

        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="TextStyle-Headline-5 text-Text-Primary">
                Raw Config JSON
              </div>
              <div className="mt-1 text-[11px] text-Text-Secondary">
                Advanced editor. Version fields above stay in sync with this
                JSON.
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
            className="mt-4 min-h-[320px] w-full resize-y rounded-[16px] border border-Gray-50 bg-[#0F172A] p-4 font-mono text-[12px] text-[#E2E8F0] outline-none"
          />

          <div className="mt-2 text-[11px]">
            {configError ? (
              <span className="text-red-500">{configError}</span>
            ) : saveMessage ? (
              <span className="text-emerald-700">{saveMessage}</span>
            ) : (
              <span className="text-Text-Secondary">
                Config is valid JSON and ready to save.
              </span>
            )}
          </div>
        </div>
      </div>
    </AdminShellLayout>
  );
};

export default AdminConfig;
