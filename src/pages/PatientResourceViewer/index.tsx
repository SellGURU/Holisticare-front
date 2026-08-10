import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PublicReport from '../../api/publicReport';

const PatientResourceViewer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUrl = useMemo(
    () => searchParams.get('url')?.trim() || '',
    [searchParams],
  );
  const [html, setHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetUrl) {
      setError('Missing resource link.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    PublicReport.getPatientResourceHtml(targetUrl)
      .then((res) => {
        if (cancelled) return;
        setHtml(typeof res.data === 'string' ? res.data : '');
      })
      .catch(() => {
        if (cancelled) return;
        setError('This content is not available right now.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetUrl]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col bg-slate-50">
        <header className="flex h-12 items-center border-b border-slate-200 bg-white px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-teal-800"
          >
            Back
          </button>
        </header>
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-center text-sm text-slate-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <span className="text-sm font-semibold text-slate-800">
          Health information
        </span>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-teal-800"
        >
          Close
        </button>
      </header>
      <iframe
        title="Health information"
        srcDoc={html}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        className="h-full w-full flex-1 border-0"
      />
    </div>
  );
};

export default PatientResourceViewer;
