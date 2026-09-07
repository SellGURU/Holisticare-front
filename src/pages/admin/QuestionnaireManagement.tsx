import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';
import ClinicQuestionnairesTab from './questionnaires/ClinicQuestionnairesTab';
import DefaultTemplatesTab from './questionnaires/DefaultTemplatesTab';
import type { AdminClinicOption, QuestionnaireTemplateRow } from './questionnaires/types';

type TabId = 'templates' | 'clinics';

const QuestionnaireManagement = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [tab, setTab] = useState<TabId>('templates');
  const [clinics, setClinics] = useState<AdminClinicOption[]>([]);
  const [templates, setTemplates] = useState<QuestionnaireTemplateRow[]>([]);

  const handleAuthFailure = useCallback(() => {
    removeAdminToken();
    navigate('/admin/login');
  }, [navigate]);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await AdminApi.listQuestionnaireTemplates();
      setTemplates(res.data?.templates || []);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
      }
      throw err;
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadClinics = async () => {
    const res = await AdminApi.listClinics();
    setClinics(res.data?.clinics || []);
  };

  useEffect(() => {
    const init = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
        await Promise.all([loadClinics(), loadTemplates()]);
      } catch {
        handleAuthFailure();
      } finally {
        setLoadingPage(false);
      }
    };
    init().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <Circleloader />
      </div>
    );
  }

  return (
    <AdminShellLayout
      title="Questionnaires"
      subtitle="Manage default templates and clinic-specific questionnaires."
      showGlobalFilters={false}
      actions={
        <button
          type="button"
          onClick={() => {
            loadTemplates().catch(() => {});
            loadClinics().catch(() => {});
          }}
          className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
        >
          <RefreshCw size={14} className={loadingTemplates ? 'animate-spin' : ''} />
          Refresh
        </button>
      }
    >
      <div className="mb-4 inline-flex rounded-full border border-Gray-50 bg-white p-1 text-[12px]">
        <button
          type="button"
          onClick={() => setTab('templates')}
          className={`rounded-full px-4 py-2 ${
            tab === 'templates' ? 'bg-[#005F73] text-white' : 'text-Text-Primary'
          }`}
        >
          Default Templates
        </button>
        <button
          type="button"
          onClick={() => setTab('clinics')}
          className={`rounded-full px-4 py-2 ${
            tab === 'clinics' ? 'bg-[#005F73] text-white' : 'text-Text-Primary'
          }`}
        >
          Clinic Questionnaires
        </button>
      </div>

      {tab === 'templates' ? (
        <DefaultTemplatesTab
          templates={templates}
          clinics={clinics}
          loading={loadingTemplates}
          onReload={loadTemplates}
          onAuthFailure={handleAuthFailure}
        />
      ) : (
        <ClinicQuestionnairesTab
          clinics={clinics}
          templates={templates}
          onAuthFailure={handleAuthFailure}
        />
      )}
    </AdminShellLayout>
  );
};

export default QuestionnaireManagement;
