/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, UploadCloud, X } from 'lucide-react';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';

// Only the 3 categories confirmed against the real `public.rook` schema are
// wired up on the backend (see apps/portal/domains/wearables/rook_diagnostics.py
// CATEGORY_LABEL_TO_ROOK_FILTER). Extend both sides together.
const CATEGORY_OPTIONS = [
  { value: 'activity', label: 'Activity' },
  { value: 'weight', label: 'Weight' },
  { value: 'sleep', label: 'Sleep' },
];

type ComparisonStatus =
  | 'match'
  | 'missing_in_portal'
  | 'count_mismatch'
  | 'unmatched_upload_items';

interface ComparisonRow {
  date: string | null;
  status: ComparisonStatus;
  uploaded_count: number;
  stored_count: number;
  uploaded_items: any[];
  stored_items: any[];
  note: string | null;
}

const statusBadgeClass = (status: ComparisonStatus): string => {
  switch (status) {
    case 'match':
      return 'bg-emerald-50 text-emerald-700';
    case 'count_mismatch':
      return 'bg-amber-50 text-amber-700';
    case 'missing_in_portal':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const statusLabel = (status: ComparisonStatus): string => {
  switch (status) {
    case 'match':
      return 'Match';
    case 'count_mismatch':
      return 'Count mismatch';
    case 'missing_in_portal':
      return 'Missing in portal';
    default:
      return 'Unmatched upload items';
  }
};

const prettyJson = (value: any): string => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const RookCsvComparison = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loadingPage, setLoadingPage] = useState(true);
  const [memberId, setMemberId] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [results, setResults] = useState<ComparisonRow[] | null>(null);
  const [selectedRow, setSelectedRow] = useState<ComparisonRow | null>(null);

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  useEffect(() => {
    const init = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          handleAuthFailure();
        }
      } finally {
        setLoadingPage(false);
      }
    };
    init().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const picked = files[0];
    if (!picked.name.toLowerCase().endsWith('.csv')) {
      setFormError('Please upload a .csv file.');
      return;
    }
    setFormError('');
    setFile(picked);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelected(event.dataTransfer.files);
  };

  const resultRows = (results || []).filter((row) => row.date !== null);
  const unmatchedRow = (results || []).find(
    (row) => row.status === 'unmatched_upload_items',
  );

  const handleSubmit = async () => {
    setFormError('');

    if (!memberId.trim()) {
      setFormError('Member ID is required.');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('Start date and end date are required.');
      return;
    }
    if (!file) {
      setFormError('Please upload a ROOK CSV export file.');
      return;
    }

    const formData = new FormData();
    formData.append('member_id', memberId.trim());
    formData.append('category', category);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('file', file);

    setSubmitting(true);
    setResults(null);
    try {
      const res = await AdminApi.compareRookCsv(formData);
      setResults(res.data || []);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        handleAuthFailure();
        return;
      }
      setFormError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to compare ROOK CSV export.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Circleloader />
      </div>
    );
  }

  return (
    <AdminShellLayout
      title="ROOK CSV Comparison"
      subtitle="Diagnostic tool: compare an uploaded ROOK CSV export against public.rook for a patient/category/date range. Read-only, no outbound calls to ROOK."
      showGlobalFilters={false}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-Gray-50 bg-white p-4">
          <p className="mb-3 text-[12px] font-medium text-Text-Primary">
            Comparison inputs
          </p>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Member ID
              </span>
              <input
                type="number"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="e.g. 133841313859"
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Category
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Start date
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                End date
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>
          </div>

          <div className="mt-4">
            <span className="mb-1 block text-[11px] text-Text-Secondary">
              ROOK CSV export file
            </span>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                isDragging
                  ? 'border-Primary-DeepTeal bg-[#F8FAFB]'
                  : 'border-Gray-50'
              }`}
            >
              <UploadCloud size={20} className="text-Text-Secondary" />
              <span className="text-[12px] text-Text-Primary">
                {file
                  ? file.name
                  : 'Drag & drop a .csv file, or click to browse'}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => handleFileSelected(e.target.files)}
              />
            </div>
          </div>

          {formError ? (
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {formError}
            </div>
          ) : null}

          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                handleSubmit().catch(() => {});
              }}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-Primary-DeepTeal px-5 py-2 text-[12px] font-medium text-white disabled:opacity-60"
            >
              {submitting ? 'Comparing...' : 'Compare'}
            </button>
          </div>
        </div>

        {results !== null ? (
          <section className="rounded-2xl border border-Gray-50 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-[14px] font-semibold text-Text-Primary">
                Results
              </h2>
              <span className="text-[11px] text-Text-Secondary">
                {resultRows.length} date(s) with data to compare
              </span>
            </div>

            {unmatchedRow ? (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>
                  {unmatchedRow.uploaded_count} uploaded item(s) had no
                  recognizable date column and could not be matched to any date.{' '}
                  <button
                    type="button"
                    className="font-medium underline"
                    onClick={() => setSelectedRow(unmatchedRow)}
                  >
                    View them
                  </button>
                </span>
              </div>
            ) : null}

            {resultRows.length === 0 ? (
              <div className="py-6 text-center text-[12px] text-Text-Secondary">
                No overlapping data to compare for this range (nothing uploaded
                and nothing stored, or all dates matched with zero counts on
                both sides).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-Gray-50 text-Text-Secondary">
                      <th className="px-2 py-2">Date</th>
                      <th className="px-2 py-2">Status</th>
                      <th className="px-2 py-2">Uploaded count</th>
                      <th className="px-2 py-2">Stored count</th>
                      <th className="px-2 py-2">Note</th>
                      <th className="px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {resultRows.map((row) => (
                      <tr
                        key={row.date}
                        className="border-b border-Gray-50/70 hover:bg-[#F8FAFB]"
                      >
                        <td className="px-2 py-2 font-medium text-Text-Primary">
                          {row.date}
                        </td>
                        <td className="px-2 py-2">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusBadgeClass(row.status)}`}
                          >
                            {statusLabel(row.status)}
                          </span>
                        </td>
                        <td className="px-2 py-2">{row.uploaded_count}</td>
                        <td className="px-2 py-2">{row.stored_count}</td>
                        <td className="px-2 py-2 text-Text-Secondary">
                          {row.note || '—'}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedRow(row)}
                            className="inline-flex items-center gap-1 rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px] text-Text-Primary"
                          >
                            <Eye size={12} />
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </div>

      {selectedRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-Gray-50 px-4 py-3">
              <div>
                <h3 className="text-[14px] font-semibold text-Text-Primary">
                  {selectedRow.date
                    ? `Details for ${selectedRow.date}`
                    : 'Unmatched upload items'}
                </h3>
                <p className="text-[11px] text-Text-Secondary">
                  {statusLabel(selectedRow.status)}
                  {selectedRow.note ? ` · ${selectedRow.note}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="rounded-full p-2 text-Text-Secondary hover:bg-[#F8FAFB]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-[12px] font-semibold text-Text-Primary">
                  Uploaded items ({selectedRow.uploaded_items.length})
                </h4>
                <pre className="max-h-[60vh] overflow-auto rounded-xl bg-[#F8FAFB] p-3 text-[11px] leading-5 text-Text-Primary">
                  {prettyJson(selectedRow.uploaded_items)}
                </pre>
              </div>
              <div>
                <h4 className="mb-2 text-[12px] font-semibold text-Text-Primary">
                  Stored items ({selectedRow.stored_items.length})
                </h4>
                <pre className="max-h-[60vh] overflow-auto rounded-xl bg-[#F8FAFB] p-3 text-[11px] leading-5 text-Text-Primary">
                  {prettyJson(selectedRow.stored_items)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShellLayout>
  );
};

export default RookCsvComparison;
