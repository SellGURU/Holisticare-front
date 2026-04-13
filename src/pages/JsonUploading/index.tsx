/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Circleloader from '../../Components/CircleLoader';
import BiomarkersApi from '../../api/Biomarkers';

type ConfigKey =
  | 'more_info'
  | 'categories'
  | 'unit_mapping'
  | 'biomarker_mapping';

interface ClinicOption {
  clinic_id: number;
  clinic_name: string;
  admin_email?: string;
}

interface ConfigBundle {
  more_info: any[];
  categories: any[];
  unit_mapping: Record<string, any>;
  biomarker_mapping: Record<string, any>;
}

interface LoadedSource {
  mode: 'clinic' | 'default_template';
  clinic_id: number | null;
  clinic_name: string;
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

const JsonUploading = () => {
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [canManageAllClinics, setCanManageAllClinics] = useState(false);
  const [sourceClinicId, setSourceClinicId] = useState<string>('');
  const [targetClinicIds, setTargetClinicIds] = useState<number[]>([]);
  const [loadedSource, setLoadedSource] = useState<LoadedSource | null>(null);
  const [loadedConfigs, setLoadedConfigs] = useState<ConfigBundle>(EMPTY_CONFIGS);
  const [draftConfigs, setDraftConfigs] = useState<ConfigBundle>(EMPTY_CONFIGS);
  const [activeConfig, setActiveConfig] = useState<ConfigKey>('more_info');
  const [editorValue, setEditorValue] = useState(
    JSON.stringify(EMPTY_CONFIGS.more_info, null, 2),
  );
  const [editorError, setEditorError] = useState('');
  const [clinicSearch, setClinicSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  const activeTab = CONFIG_TABS.find((tab) => tab.key === activeConfig)!;

  const applyEditorToDraft = (text: string, configKey: ConfigKey) => {
    setEditorValue(text);
    try {
      const parsed = JSON.parse(text);
      setDraftConfigs((prev) => ({
        ...prev,
        [configKey]: parsed,
      }));
      setEditorError('');
    } catch (error: any) {
      setEditorError(error?.message || 'Invalid JSON');
    }
  };

  const syncEditorWithDraft = (configKey: ConfigKey, configs: ConfigBundle) => {
    setActiveConfig(configKey);
    setEditorValue(JSON.stringify(configs[configKey], null, 2));
    setEditorError('');
  };

  useEffect(() => {
    const loadClinics = async () => {
      setLoadingPage(true);
      try {
        const res = await BiomarkersApi.getJsonManagerClinics();
        const nextClinics = Array.isArray(res?.data?.clinics) ? res.data.clinics : [];
        const nextCurrentClinicId = res?.data?.current_clinic_id ?? null;

        setClinics(nextClinics);
        setCanManageAllClinics(Boolean(res?.data?.can_manage_all_clinics));

        if (nextCurrentClinicId) {
          setSourceClinicId(String(nextCurrentClinicId));
          setTargetClinicIds([nextCurrentClinicId]);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || 'Failed to load clinics.');
      } finally {
        setLoadingPage(false);
      }
    };

    loadClinics();
  }, []);

  const filteredSourceClinics = useMemo(() => {
    const search = clinicSearch.trim().toLowerCase();
    if (!search) return clinics;
    return clinics.filter(
      (clinic) =>
        clinic.clinic_name.toLowerCase().includes(search) ||
        (clinic.admin_email || '').toLowerCase().includes(search),
    );
  }, [clinicSearch, clinics]);

  const filteredTargetClinics = useMemo(() => {
    const search = targetSearch.trim().toLowerCase();
    if (!search) return clinics;
    return clinics.filter(
      (clinic) =>
        clinic.clinic_name.toLowerCase().includes(search) ||
        (clinic.admin_email || '').toLowerCase().includes(search),
    );
  }, [targetSearch, clinics]);

  const handleLoad = async (useDefaultTemplate = false) => {
    if (!useDefaultTemplate && !sourceClinicId) {
      toast.error('Choose a clinic first.');
      return;
    }

    setLoadingConfig(true);
    try {
      const res = await BiomarkersApi.loadClinicJsonConfigs({
        clinic_id: useDefaultTemplate ? null : Number(sourceClinicId),
        use_default_template: useDefaultTemplate,
      });

      const nextConfigs: ConfigBundle = {
        more_info: res?.data?.configs?.more_info || [],
        categories: res?.data?.configs?.categories || [],
        unit_mapping: res?.data?.configs?.unit_mapping || {
          biomarker_specific: [],
          common_unit_aliases: {},
        },
        biomarker_mapping: res?.data?.configs?.biomarker_mapping || { mappings: [] },
      };

      setLoadedSource(res?.data?.source || null);
      setLoadedConfigs(nextConfigs);
      setDraftConfigs(nextConfigs);
      setEditorValue(JSON.stringify(nextConfigs[activeConfig], null, 2));
      setEditorError('');
      setSetAsDefault(false);

      if (!useDefaultTemplate && res?.data?.source?.clinic_id) {
        const sourceId = Number(res.data.source.clinic_id);
        setSourceClinicId(String(sourceId));
        setTargetClinicIds((prev) =>
          prev.length > 0 ? prev : [sourceId],
        );
      }

      toast.success(
        useDefaultTemplate
          ? 'Default templates loaded.'
          : 'Clinic JSON loaded successfully.',
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to load config.');
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleTabChange = (configKey: ConfigKey) => {
    syncEditorWithDraft(configKey, draftConfigs);
  };

  const handleToggleTarget = (clinicId: number) => {
    setTargetClinicIds((prev) =>
      prev.includes(clinicId)
        ? prev.filter((id) => id !== clinicId)
        : [...prev, clinicId],
    );
  };

  const handleSelectLoadedClinic = () => {
    if (!loadedSource?.clinic_id) return;
    setTargetClinicIds([loadedSource.clinic_id]);
  };

  const handleSelectVisibleTargets = () => {
    const visibleIds = filteredTargetClinics.map((clinic) => clinic.clinic_id);
    setTargetClinicIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const handleClearTargets = () => {
    setTargetClinicIds([]);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(editorValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setEditorValue(formatted);
      setDraftConfigs((prev) => ({
        ...prev,
        [activeConfig]: parsed,
      }));
      setEditorError('');
    } catch (error: any) {
      setEditorError(error?.message || 'Invalid JSON');
      toast.error('Fix the JSON syntax before formatting.');
    }
  };

  const handleResetCurrent = () => {
    const original = loadedConfigs[activeConfig];
    const formatted = JSON.stringify(original, null, 2);
    setDraftConfigs((prev) => ({
      ...prev,
      [activeConfig]: original,
    }));
    setEditorValue(formatted);
    setEditorError('');
    toast.info(`${activeTab.label} reset to the last loaded version.`);
  };

  const handleDownload = () => {
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editorValue);
      toast.success('JSON copied to clipboard.');
    } catch {
      toast.error('Copy failed.');
    }
  };

  const handlePublish = async () => {
    if (editorError) {
      toast.error('Fix the JSON syntax before updating clinics.');
      return;
    }

    if (targetClinicIds.length === 0 && !setAsDefault) {
      toast.error('Choose at least one target clinic or enable default template update.');
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(editorValue);
    } catch {
      toast.error('Fix the JSON syntax before updating clinics.');
      return;
    }

    setSaving(true);
    try {
      await BiomarkersApi.saveClinicJsonConfig({
        config_key: activeConfig,
        data: parsed,
        clinic_ids: targetClinicIds,
        set_as_default: setAsDefault,
      });

      setDraftConfigs((prev) => ({
        ...prev,
        [activeConfig]: parsed,
      }));
      setLoadedConfigs((prev) => ({
        ...prev,
        [activeConfig]: parsed,
      }));

      toast.success(
        `${activeTab.label} updated for ${targetClinicIds.length} clinic${targetClinicIds.length === 1 ? '' : 's'}${setAsDefault ? ' and saved as default' : ''}.`,
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update JSON.');
    } finally {
      setSaving(false);
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
    <>
      <div className="fixed w-full z-30 bg-bg-color px-2 md:px-6 pt-8 pb-2 md:pr-[200px]">
        <div className="w-full flex flex-col md:flex-row gap-4 justify-between md:items-center">
          <div>
            <div className="text-Text-Primary font-medium opacity-[87%] text-nowrap">
              JSON Configuration Manager
            </div>
            <div className="text-[11px] text-Text-Secondary mt-1">
              Load clinic JSON, edit full documents, download them, publish to one or many clinics,
              and optionally save defaults for future clinics.
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-Text-Secondary">
            <span className="rounded-full bg-white border border-Gray-50 px-3 py-1.5">
              {clinics.length} clinic{clinics.length === 1 ? '' : 's'} available
            </span>
            <span className="rounded-full bg-white border border-Gray-50 px-3 py-1.5">
              Active file: {activeTab.fileName}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full min-h-full px-2 md:px-6 py-[96px]">
        {!canManageAllClinics && (
          <div className="mb-4 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-Text-Primary">
            Your access is currently limited to your own clinic. Multi-clinic publishing and default
            template updates are only available for platform-level admins.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4">
          <div className="space-y-4">
            <div className="bg-white border border-Gray-50 shadow-100 rounded-[16px] p-4">
              <div className="TextStyle-Headline-5 text-Text-Primary">1. Load Source Data</div>
              <div className="text-[11px] text-Text-Secondary mt-1">
                Choose one clinic to load its current JSON, or load the default templates.
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
                      name="source-clinic"
                      checked={sourceClinicId === String(clinic.clinic_id)}
                      onChange={() => setSourceClinicId(String(clinic.clinic_id))}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <div className="text-[12px] text-Text-Primary font-medium">
                        {clinic.clinic_name}
                      </div>
                      {!!clinic.admin_email && (
                        <div className="text-[10px] text-Text-Secondary truncate">
                          {clinic.admin_email}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
                {filteredSourceClinics.length === 0 && (
                  <div className="px-3 py-4 text-[11px] text-Text-Secondary text-center">
                    No clinics found.
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleLoad(false)}
                  disabled={loadingConfig}
                  className="rounded-full bg-Primary-DeepTeal text-white text-[12px] px-4 py-2 disabled:opacity-50"
                >
                  {loadingConfig ? 'Loading...' : 'Load Clinic JSON'}
                </button>
                <button
                  type="button"
                  onClick={() => handleLoad(true)}
                  disabled={loadingConfig}
                  className="rounded-full border border-Gray-50 bg-white text-Text-Primary text-[12px] px-4 py-2 disabled:opacity-50"
                >
                  Load Default Templates
                </button>
              </div>

              {loadedSource && (
                <div className="mt-3 rounded-xl bg-[#F8FAFB] border border-Gray-50 px-3 py-2 text-[11px] text-Text-Secondary">
                  Loaded from:{' '}
                  <span className="font-medium text-Text-Primary">{loadedSource.clinic_name}</span>
                </div>
              )}
            </div>

            <div className="bg-white border border-Gray-50 shadow-100 rounded-[16px] p-4">
              <div className="TextStyle-Headline-5 text-Text-Primary">2. Publish Targets</div>
              <div className="text-[11px] text-Text-Secondary mt-1">
                Choose one or many clinics that should receive the active JSON file.
              </div>

              <input
                type="text"
                value={targetSearch}
                onChange={(e) => setTargetSearch(e.target.value)}
                placeholder="Search target clinics..."
                className="w-full mt-3 border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSelectVisibleTargets}
                  className="rounded-full border border-Gray-50 bg-white text-[11px] px-3 py-1.5"
                >
                  Select visible
                </button>
                <button
                  type="button"
                  onClick={handleClearTargets}
                  className="rounded-full border border-Gray-50 bg-white text-[11px] px-3 py-1.5"
                >
                  Clear
                </button>
                {!!loadedSource?.clinic_id && (
                  <button
                    type="button"
                    onClick={handleSelectLoadedClinic}
                    className="rounded-full border border-Gray-50 bg-white text-[11px] px-3 py-1.5"
                  >
                    Select loaded clinic
                  </button>
                )}
              </div>

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
                      onChange={() => handleToggleTarget(clinic.clinic_id)}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <div className="text-[12px] text-Text-Primary font-medium">
                        {clinic.clinic_name}
                      </div>
                      {!!clinic.admin_email && (
                        <div className="text-[10px] text-Text-Secondary truncate">
                          {clinic.admin_email}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
                {filteredTargetClinics.length === 0 && (
                  <div className="px-3 py-4 text-[11px] text-Text-Secondary text-center">
                    No clinics found.
                  </div>
                )}
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
                    disabled={!canManageAllClinics}
                  />
                  Set as default for new clinics
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white border border-Gray-50 shadow-100 rounded-[16px] p-4 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
              <div>
                <div className="TextStyle-Headline-5 text-Text-Primary">
                  3. Edit Full JSON
                </div>
                <div className="text-[11px] text-Text-Secondary mt-1">
                  Switch between JSON files, edit the full content, then publish the active file.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleFormatJson}
                  className="rounded-full border border-Gray-50 bg-white text-[11px] px-3 py-1.5"
                >
                  Format
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-full border border-Gray-50 bg-white text-[11px] px-3 py-1.5"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded-full border border-Gray-50 bg-white text-[11px] px-3 py-1.5"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={handleResetCurrent}
                  className="rounded-full border border-Gray-50 bg-white text-[11px] px-3 py-1.5"
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
                  onClick={() => handleTabChange(tab.key)}
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

            <div className="mt-4">
              <textarea
                value={editorValue}
                onChange={(e) => applyEditorToDraft(e.target.value, activeConfig)}
                spellCheck={false}
                className="w-full min-h-[520px] rounded-[16px] border border-Gray-50 bg-[#0F172A] text-[#E2E8F0] p-4 text-[12px] font-mono outline-none resize-y"
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
                  onClick={handlePublish}
                  disabled={saving || !!editorError}
                  className="rounded-full bg-Primary-DeepTeal text-white text-[12px] px-4 py-2 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : `Update ${activeTab.label}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JsonUploading;
