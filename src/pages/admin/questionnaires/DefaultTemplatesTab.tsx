import { useCallback, useMemo, useState } from 'react';
import { Copy, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminApi from '../../../api/admin';
import { MainModal } from '../../../Components';
import { formatApiErrorMessage } from '../../../utils/jsonErrorDetails';
import CheckInPreview from '../../NewForms/CheckIn/CheckInPreview';
import QuestionaryControllerModal from '../../NewForms/CheckIn/QuestionaryControllerModal';
import CopyQuestionnaireModal from './CopyQuestionnaireModal';
import type {
  AdminClinicOption,
  CopySource,
  QuestionnaireTemplateRow,
} from './types';

interface DefaultTemplatesTabProps {
  templates: QuestionnaireTemplateRow[];
  clinics: AdminClinicOption[];
  loading: boolean;
  onReload: () => Promise<void>;
  onAuthFailure: () => void;
}

const formatDate = (value: string | null) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const DefaultTemplatesTab = ({
  templates,
  clinics,
  loading,
  onReload,
  onAuthFailure,
}: DefaultTemplatesTabProps) => {
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editId, setEditId] = useState('');
  const [previewId, setPreviewId] = useState('');
  const [copySource, setCopySource] = useState<CopySource | null>(null);
  const [error, setError] = useState('');
  const [textError, setTextError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter((row) =>
      [row.title, row.description, String(row.id)].join(' ').toLowerCase().includes(term),
    );
  }, [templates, search]);

  const fetchForm = (id: string) => AdminApi.getQuestionnaireTemplate(Number(id));

  const fetchCatalog = useCallback(
    () =>
      AdminApi.loadClinicJsonConfigs({
        clinic_id: null,
        use_default_template: true,
      }),
    [],
  );

  const handleSave = async (values: any) => {
    setTextError('');
    setError('');
    const payload = {
      title: values.title,
      description: values.description || '',
      questions: values.questions || [],
    };
    try {
      if (editId) {
        await AdminApi.updateQuestionnaireTemplate(Number(editId), payload);
      } else {
        await AdminApi.createQuestionnaireTemplate(payload);
      }
      setShowEditor(false);
      setEditId('');
      await onReload();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        onAuthFailure();
        return;
      }
      const message = formatApiErrorMessage(err) || 'Failed to save template.';
      if (message === 'A form with the same title already exists.') {
        setError(message);
      } else {
        setTextError(message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this default template? Clinics already using a copy keep theirs.')) {
      return;
    }
    setBusyId(id);
    try {
      await AdminApi.deleteQuestionnaireTemplate(id);
      await onReload();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        onAuthFailure();
        return;
      }
      toast.error(formatApiErrorMessage(err) || 'Failed to delete template.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold text-Text-Primary">Default templates</div>
          <div className="text-[12px] text-Text-Secondary">
            Master library copied into new clinics. {filtered.length} of {templates.length} shown.
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <div className="relative w-full md:w-[280px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-Text-Secondary"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search templates"
              className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] py-2 pl-9 pr-3 text-[12px] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setEditId('');
              setError('');
              setTextError('');
              setShowEditor(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#005F73] px-4 py-2 text-[12px] text-white"
          >
            <Plus size={14} />
            Add template
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-Gray-50 text-left text-[12px]">
          <thead className="bg-[#F8FAFB] text-Text-Secondary">
            <tr>
              <th className="px-3 py-3 font-medium">Title</th>
              <th className="px-3 py-3 font-medium">Questions</th>
              <th className="px-3 py-3 font-medium">Created</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-Gray-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-Text-Secondary">
                  Loading templates…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-Text-Secondary">
                  No default templates yet.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-3">
                    <div className="font-medium text-Text-Primary">{row.title}</div>
                    {row.description ? (
                      <div className="mt-1 text-[11px] text-Text-Secondary">
                        {row.description}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-Text-Primary">{row.questions_count}</td>
                  <td className="px-3 py-3 text-Text-Secondary">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewId(String(row.id))}
                        className="inline-flex items-center gap-1 rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-1.5 text-[12px]"
                      >
                        <Eye size={13} />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(String(row.id));
                          setError('');
                          setTextError('');
                          setShowEditor(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-1.5 text-[12px]"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCopySource({
                            kind: 'template',
                            templateId: row.id,
                            title: row.title,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-1.5 text-[12px]"
                      >
                        <Copy size={13} />
                        Copy to clinic
                      </button>
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => {
                          handleDelete(row.id).catch(() => {});
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[12px] text-red-700"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
              onReload().catch(() => {});
            }}
            onAuthFailure={onAuthFailure}
          />
        ) : null}
      </MainModal>
    </div>
  );
};

export default DefaultTemplatesTab;
