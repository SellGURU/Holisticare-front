/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';

type ConfigKey =
  | 'more_info'
  | 'categories'
  | 'unit_mapping'
  | 'biomarker_mapping';

interface ClinicOption {
  clinic_id: number;
  clinic_name: string | null;
  admin_email?: string;
}

interface ConfigBundle {
  more_info: any[];
  categories: any[];
  unit_mapping: Record<string, any>;
  biomarker_mapping: Record<string, any>;
}

const CONFIG_TABS: Array<{
  key: ConfigKey;
  label: string;
  fileName: string;
  description: string;
}> = [
  {
    key: 'more_info',
    label: 'More Info',
    fileName: 'more_info_rules.json',
    description: 'Full biomarker rules, thresholds, units, and definitions.',
  },
  {
    key: 'categories',
    label: 'Categories',
    fileName: 'benchmark areas.json',
    description: 'Benchmark area list and category metadata.',
  },
  {
    key: 'unit_mapping',
    label: 'Unit Mapping',
    fileName: 'unit_mapping.json',
    description: 'Unit aliases and biomarker-specific conversion rules.',
  },
  {
    key: 'biomarker_mapping',
    label: 'Biomarker Mapping',
    fileName: 'biomarker_mapping.json',
    description: 'Name variations mapped to standard biomarker names.',
  },
];

const EMPTY_CONFIGS: ConfigBundle = {
  more_info: [],
  categories: [],
  unit_mapping: {
    biomarker_specific: [],
    common_unit_aliases: {},
  },
  biomarker_mapping: {
    mappings: [],
  },
};

const normalizeSearchableText = (value?: string | null) =>
  (value || '').toLowerCase();

const AdminJsonUploading = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [sourceClinicId, setSourceClinicId] = useState('');
  const [targetClinicIds, setTargetClinicIds] = useState<number[]>([]);
  const [activeConfig, setActiveConfig] = useState<ConfigKey>('more_info');
  const [loadedConfigs, setLoadedConfigs] = useState<ConfigBundle>(EMPTY_CONFIGS);
  const [editorValue, setEditorValue] = useState(
    JSON.stringify(EMPTY_CONFIGS.more_info, null, 2),
  );
  const [editorError, setEditorError] = useState('');
  const [loadedSourceName, setLoadedSourceName] = useState('');
  const [clinicSearch, setClinicSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  const activeTab = CONFIG_TABS.find((tab) => tab.key === activeConfig)!;

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
        const res = await AdminApi.getJsonManagerClinics();
        const nextClinics = Array.isArray(res?.data?.clinics) ? res.data.clinics : [];
        setClinics(nextClinics);
        if (res?.data?.current_clinic_id) {
          const currentId = Number(res.data.current_clinic_id);
          setSourceClinicId(String(currentId));
          setTargetClinicIds([currentId]);
        }
      } catch {
        handleAuthFailure();
      } finally {
        setLoadingPage(false);
      }
    };

    loadInitial();
  }, []);

  const filteredSourceClinics = useMemo(() => {
    const search = clinicSearch.trim().toLowerCase();
    if (!search) return clinics;
    return clinics.filter(
      (clinic) =>
        normalizeSearchableText(clinic.clinic_name).includes(search) ||
        normalizeSearchableText(clinic.admin_email).includes(search),
    );
  }, [clinicSearch, clinics]);

  const filteredTargetClinics = useMemo(() => {
    const search = targetSearch.trim().toLowerCase();
    if (!search) return clinics;
    return clinics.filter(
      (clinic) =>
        normalizeSearchableText(clinic.clinic_name).includes(search) ||
        normalizeSearchableText(clinic.admin_email).includes(search),
    );
  }, [targetSearch, clinics]);

  const syncEditor = (configKey: ConfigKey, configs: ConfigBundle) => {
    setActiveConfig(configKey);
    setEditorValue(JSON.stringify(configs[configKey], null, 2));
    setEditorError('');
  };

  const loadConfigs = async (useDefaultTemplate = false) => {
    if (!useDefaultTemplate && !sourceClinicId) {
      toast.error('Choose a clinic first.');
      return;
    }

    setLoadingConfig(true);
    try {
      const res = await AdminApi.loadClinicJsonConfigs({
        clinic_id: useDefaultTemplate ? null : Number(sourceClinicId),
        use_default_template: useDefaultTemplate,
      });

      const nextConfigs: ConfigBundle = {
        more_info: res?.data?.configs?.more_info || [],
        categories: res?.data?.configs?.categories || [],
        unit_mapping: res?.data?.configs?.unit_mapping || EMPTY_CONFIGS.unit_mapping,
        biomarker_mapping:
          res?.data?.configs?.biomarker_mapping || EMPTY_CONFIGS.biomarker_mapping,
      };

      setLoadedConfigs(nextConfigs);
      setLoadedSourceName(res?.data?.source?.clinic_name || '');
      setSetAsDefault(false);
      setEditorValue(JSON.stringify(nextConfigs[activeConfig], null, 2));
      setEditorError('');

      if (!useDefaultTemplate && res?.data?.source?.clinic_id) {
        const clinicId = Number(res.data.source.clinic_id);
        setTargetClinicIds((prev) => (prev.length > 0 ? prev : [clinicId]));
      }

      toast.success(
        useDefaultTemplate
          ? 'Default templates loaded.'
          : 'Clinic JSON loaded successfully.',
      );
    } catch (err: any) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
        return;
      }
      toast.error(err?.response?.data?.detail || 'Failed to load config.');
    } finally {
      setLoadingConfig(false);
    }
  };

  const updateEditor = (value: string) => {
    setEditorValue(value);
    try {
      JSON.parse(value);
      setEditorError('');
    } catch (error: any) {
      setEditorError(error?.message || 'Invalid JSON');
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(editorValue);
      setEditorValue(JSON.stringify(parsed, null, 2));
      setEditorError('');
    } catch (error: any) {
      setEditorError(error?.message || 'Invalid JSON');
      toast.error('Fix the JSON syntax before formatting.');
    }
  };

  const resetCurrent = () => {
    const formatted = JSON.stringify(loadedConfigs[activeConfig], null, 2);
    setEditorValue(formatted);
    setEditorError('');
  };

  const toggleTarget = (clinicId: number) => {
    setTargetClinicIds((prev) =>
      prev.includes(clinicId)
        ? prev.filter((id) => id !== clinicId)
        : [...prev, clinicId],
    );
  };

  const publish = async () => {
    if (editorError) {
      toast.error('Fix the JSON syntax before publishing.');
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(editorValue);
    } catch {
      toast.error('Fix the JSON syntax before publishing.');
      return;
    }

    if (targetClinicIds.length === 0 && !setAsDefault) {
      toast.error('Choose at least one clinic or enable default template update.');
      return;
    }

    setSaving(true);
    try {
      await AdminApi.saveClinicJsonConfig({
        config_key: activeConfig,
        data: parsed,
        clinic_ids: targetClinicIds,
        set_as_default: setAsDefault,
      });

      const nextConfigs = {
        ...loadedConfigs,
        [activeConfig]: parsed,
      };
      setLoadedConfigs(nextConfigs);
      toast.success(
        `${activeTab.label} updated for ${targetClinicIds.length} clinic${targetClinicIds.length === 1 ? '' : 's'}${setAsDefault ? ' and saved as default' : ''}.`,
      );
    } catch (err: any) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
        return;
      }
      toast.error(err?.response?.data?.detail || 'Failed to save config.');
    } finally {
      setSaving(false);
    }
  };

  const downloadCurrent = () => {
    try {
      const parsed = JSON.parse(editorValue);
      const blob = new Blob([JSON.stringify(parsed, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = activeTab.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Fix the JSON syntax before downloading.');
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
      <div className="w-full flex justify-center items-center min-h-[550px] px-6 py-[80px]">
        <Circleloader />
      </div>
    );
  }

  return (
    <AdminShellLayout
      title="Admin JSON Uploading"
      subtitle="Manage More Info, Categories, Unit Mapping, and Biomarker Mapping with the admin login."
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
      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4">
        <div className="space-y-4">
          <div className="bg-white border border-Gray-50 shadow-100 rounded-[16px] p-4">
            <div className="TextStyle-Headline-5 text-Text-Primary">
              1. Load Source Data
            </div>
            <input
              type="text"
              value={clinicSearch}
              onChange={(e) => setClinicSearch(e.target.value)}
              placeholder="Search clinics..."
              className="w-full mt-3 border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none"
            />

            <div className="mt-3 max-h-[240px] overflow-y-auto border border-Gray-50 rounded-[14px]">
              {filteredSourceClinics.map((clinic, index) => (
                <label
                  key={clinic.clinic_id}
                  className={`flex items-start gap-3 px-3 py-2 cursor-pointer ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                  }`}
                >
                  <input
                    type="radio"
                    name="admin-source-clinic"
                    checked={sourceClinicId === String(clinic.clinic_id)}
                    onChange={() => setSourceClinicId(String(clinic.clinic_id))}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium text-Text-Primary">
                      {clinic.clinic_name}
                    </div>
                    <div className="text-[10px] text-Text-Secondary truncate">
                      {clinic.admin_email}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadConfigs(false)}
                disabled={loadingConfig}
                className="rounded-full bg-Primary-DeepTeal text-white text-[12px] px-4 py-2 disabled:opacity-50"
              >
                {loadingConfig ? 'Loading...' : 'Load Clinic JSON'}
              </button>
              <button
                type="button"
                onClick={() => loadConfigs(true)}
                disabled={loadingConfig}
                className="rounded-full border border-Gray-50 bg-white text-Text-Primary text-[12px] px-4 py-2 disabled:opacity-50"
              >
                Load Default Templates
              </button>
            </div>

            {loadedSourceName && (
              <div className="mt-3 rounded-xl bg-[#F8FAFB] border border-Gray-50 px-3 py-2 text-[11px] text-Text-Secondary">
                Loaded from:{' '}
                <span className="font-medium text-Text-Primary">{loadedSourceName}</span>
              </div>
            )}
          </div>

          <div className="bg-white border border-Gray-50 shadow-100 rounded-[16px] p-4">
            <div className="TextStyle-Headline-5 text-Text-Primary">
              2. Publish Targets
            </div>
            <input
              type="text"
              value={targetSearch}
              onChange={(e) => setTargetSearch(e.target.value)}
              placeholder="Search target clinics..."
              className="w-full mt-3 border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none"
            />

            <div className="mt-3 max-h-[280px] overflow-y-auto border border-Gray-50 rounded-[14px]">
              {filteredTargetClinics.map((clinic, index) => (
                <label
                  key={clinic.clinic_id}
                  className={`flex items-start gap-3 px-3 py-2 cursor-pointer ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={targetClinicIds.includes(clinic.clinic_id)}
                    onChange={() => toggleTarget(clinic.clinic_id)}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium text-Text-Primary">
                      {clinic.clinic_name}
                    </div>
                    <div className="text-[10px] text-Text-Secondary truncate">
                      {clinic.admin_email}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-Text-Secondary">
                {targetClinicIds.length} clinic{targetClinicIds.length === 1 ? '' : 's'} selected
              </span>
              <label className="flex items-center gap-2 text-Text-Primary">
                <input
                  type="checkbox"
                  checked={setAsDefault}
                  onChange={(e) => setSetAsDefault(e.target.checked)}
                />
                Set as default
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white border border-Gray-50 shadow-100 rounded-[16px] p-4 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="TextStyle-Headline-5 text-Text-Primary">
                3. Edit Full JSON
              </div>
              <div className="text-[11px] text-Text-Secondary mt-1">
                Admin access to the same JSON manager with clinic-wide publishing.
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={formatJson}
                className="rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px]"
              >
                Format
              </button>
              <button
                type="button"
                onClick={downloadCurrent}
                className="rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px]"
              >
                Download
              </button>
              <button
                type="button"
                onClick={resetCurrent}
                className="rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px]"
              >
                Reset Current File
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {CONFIG_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => syncEditor(tab.key, loadedConfigs)}
                className={`rounded-full px-3 py-2 text-[12px] border ${
                  activeConfig === tab.key
                    ? 'bg-Primary-DeepTeal text-white border-Primary-DeepTeal'
                    : 'bg-white text-Text-Primary border-Gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-xl bg-[#F8FAFB] border border-Gray-50 px-3 py-2">
            <div className="text-[12px] font-medium text-Text-Primary">{activeTab.fileName}</div>
            <div className="text-[11px] text-Text-Secondary mt-1">
              {activeTab.description}
            </div>
          </div>

          <textarea
            value={editorValue}
            onChange={(e) => updateEditor(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[560px] mt-4 rounded-[16px] border border-Gray-50 bg-[#0F172A] text-[#E2E8F0] p-4 text-[12px] font-mono outline-none resize-y"
          />

          <div className="mt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="text-[11px] text-Text-Secondary">
              {editorError ? (
                <span className="text-red-500">JSON error: {editorError}</span>
              ) : (
                <span>Valid JSON. Ready to publish.</span>
              )}
            </div>
            <button
              type="button"
              onClick={publish}
              disabled={saving || !!editorError}
              className="rounded-full bg-Primary-DeepTeal text-white text-[12px] px-4 py-2 disabled:opacity-50"
            >
              {saving ? 'Updating...' : `Update ${activeTab.label}`}
            </button>
          </div>
        </div>
      </div>
    </AdminShellLayout>
  );
};

export default AdminJsonUploading;
