import { useCallback, useEffect, useMemo, useState } from 'react';
import { CopyPlus, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminApi from '../../../api/admin';
import { MainModal } from '../../../Components';
import { formatApiErrorMessage } from '../../../utils/jsonErrorDetails';
import CheckInPreview from '../../NewForms/CheckIn/CheckInPreview';
import QuestionaryControllerModal from '../../NewForms/CheckIn/QuestionaryControllerModal';
import TableForm from '../../NewForms/CheckIn/TableForm';
import ClinicSearchSelect from './ClinicSearchSelect';
import CopyQuestionnaireModal from './CopyQuestionnaireModal';
import type {
  AdminClinicOption,
  ClinicQuestionnaireRow,
  CopySource,
  QuestionnaireTemplateRow,
} from './types';

interface ClinicQuestionnairesTabProps {
  clinics: AdminClinicOption[];
  templates: QuestionnaireTemplateRow[];
  onAuthFailure: () => void;
}

const ClinicQuestionnairesTab = ({
  clinics,
  templates,
  onAuthFailure,
}: ClinicQuestionnairesTabProps) => {
  const [clinicId, setClinicId] = useState<number | ''>('');
  const [rows, setRows] = useState<ClinicQuestionnaireRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editId, setEditId] = useState('');
  const [previewId, setPreviewId] = useState('');
  const [copySource, setCopySource] = useState<CopySource | null>(null);
  const [showCopyFrom, setShowCopyFrom] = useState(false);
  const [error, setError] = useState('');
  const [textError, setTextError] = useState('');

  const loadForms = async (id: number) => {
    setLoading(true);
    try {
      const res = await AdminApi.listClinicQuestionnaires(id);
      setRows(res.data?.questionnaires || []);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        onAuthFailure();
        return;
      }
      toast.error(formatApiErrorMessage(err) || 'Failed to load questionnaires.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clinicId) {
      setRows([]);
      return;
    }
    loadForms(clinicId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => row.title.toLowerCase().includes(term));
  }, [rows, search]);

  const fetchForm = (id: string) => {
    if (!clinicId) {
      return Promise.reject(new Error('No clinic selected'));
    }
    return AdminApi.getClinicQuestionnaire(clinicId, id);
  };

  const fetchCatalog = useCallback(() => {
    if (!clinicId) {
      return Promise.reject(new Error('No clinic selected'));
    }
    return AdminApi.loadClinicJsonConfigs({
      clinic_id: clinicId,
      use_default_template: false,
    });
  }, [clinicId]);

  const handleSave = async (values: any) => {
    if (!clinicId) return;
    setTextError('');
    setError('');
    try {
      if (editId) {
        await AdminApi.updateClinicQuestionnaire(clinicId, editId, values);
      } else {
        await AdminApi.createClinicQuestionnaire(clinicId, values);
      }
      setShowEditor(false);
      setEditId('');
      await loadForms(clinicId);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        onAuthFailure();
        return;
      }
      const message = formatApiErrorMessage(err) || 'Failed to save questionnaire.';
      if (message === 'A form with the same title already exists.') {
        setError(message);
      } else {
        setTextError(message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!clinicId) return;
    try {
      await AdminApi.deleteClinicQuestionnaire(clinicId, id);
      await loadForms(clinicId);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        onAuthFailure();
        return;
      }
      toast.error(formatApiErrorMessage(err) || 'Failed to delete questionnaire.');
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!clinicId) return;
    try {
      await AdminApi.duplicateClinicQuestionnaire(clinicId, id);
      await loadForms(clinicId);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        onAuthFailure();
        return;
      }
      toast.error(formatApiErrorMessage(err) || 'Failed to duplicate questionnaire.');
    }
  };

  return (
    <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-end">
          <div className="w-full md:w-[320px]">
            <label className="mb-1 block text-[12px] text-Text-Secondary">Clinic</label>
            <ClinicSearchSelect
              clinics={clinics}
              value={clinicId}
              onChange={setClinicId}
            />
          </div>
          <div className="relative w-full md:w-[240px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-Text-Secondary"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search questionnaires"
              className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] py-2 pl-9 pr-3 text-[12px] outline-none"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!clinicId}
            onClick={() => setShowCopyFrom(true)}
            className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary disabled:opacity-50"
          >
            <CopyPlus size={14} />
            Copy from
          </button>
          <button
            type="button"
            disabled={!clinicId}
            onClick={() => {
              setEditId('');
              setError('');
              setTextError('');
              setShowEditor(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#005F73] px-4 py-2 text-[12px] text-white disabled:opacity-50"
          >
            <Plus size={14} />
            Add questionnaire
          </button>
        </div>
      </div>

      {!clinicId ? (
        <div className="py-10 text-center text-[13px] text-Text-Secondary">
          Select a clinic to manage its questionnaires.
        </div>
      ) : loading ? (
        <div className="py-10 text-center text-[13px] text-Text-Secondary">
          Loading questionnaires…
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-Text-Secondary">
          No questionnaires for this clinic yet.
        </div>
      ) : (
        <TableForm
          classData={filtered}
          onDelete={(id) => {
            handleDelete(id).catch(() => {});
          }}
          onEdit={(id) => {
            setEditId(id);
            setError('');
            setTextError('');
            setShowEditor(true);
          }}
          onPreview={(id) => setPreviewId(id)}
          onDuplicate={(id) => {
            handleDuplicate(id).catch(() => {});
          }}
          onCopy={(id) => {
            const row = rows.find((item) => item.id === id);
            if (!clinicId || !row) return;
            setCopySource({
              kind: 'clinic',
              clinicId,
              uniqueId: id,
              title: row.title,
            });
          }}
        />
      )}

      <MainModal
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditId('');
          setError('');
          setTextError('');
        }}
      >
        <QuestionaryControllerModal
          editId={editId}
          mode={editId ? 'Edit' : 'Add'}
          onClose={() => {
            setShowEditor(false);
            setEditId('');
            setError('');
            setTextError('');
          }}
          onSave={(values) => {
            handleSave(values).catch(() => {});
          }}
          fetchForm={fetchForm}
          fetchCatalog={fetchCatalog}
          error={error}
          isQuestionary
          textErrorMessage={textError}
        />
      </MainModal>

      <MainModal isOpen={Boolean(previewId)} onClose={() => setPreviewId('')}>
        <CheckInPreview
          id={previewId}
          isQuestionary
          fetchForm={fetchForm}
          onClose={() => setPreviewId('')}
        />
      </MainModal>

      <MainModal isOpen={Boolean(copySource)} onClose={() => setCopySource(null)}>
        {copySource ? (
          <CopyQuestionnaireModal
            clinics={clinics}
            templates={templates}
            source={copySource}
            onClose={() => setCopySource(null)}
            onCopied={() => {
              if (clinicId) loadForms(clinicId).catch(() => {});
            }}
            onAuthFailure={onAuthFailure}
          />
        ) : null}
      </MainModal>

      <MainModal isOpen={showCopyFrom} onClose={() => setShowCopyFrom(false)}>
        {clinicId ? (
          <CopyQuestionnaireModal
            clinics={clinics}
            templates={templates}
            defaultTargetClinicId={clinicId}
            onClose={() => setShowCopyFrom(false)}
            onCopied={() => {
              loadForms(clinicId).catch(() => {});
            }}
            onAuthFailure={onAuthFailure}
          />
        ) : null}
      </MainModal>
    </div>
  );
};

export default ClinicQuestionnairesTab;
