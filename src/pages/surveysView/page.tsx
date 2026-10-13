import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SurveyResponsesView } from './survey-responses-view';
import Application from '../../api/app';
import {
  downloadBlob,
  filenameFromContentDisposition,
  responseBlob,
} from '../../utils/fileDownload';

interface Question {
  type: string;
  order: number;
  question: string;
  required: boolean;
  skip_validation?: boolean;
  options?: string[];
  response?: string | string[];
  hide?: boolean;
}

interface SurveyAPIResponse {
  filled_by?: string;
  title?: string;
  status?: 'completed' | 'draft' | 'not_started';
  questions: Question[];
  [key: string]: unknown;
}

export default function SurveyResponsesPage() {
  const {
    'member-id': memberId,
    'q-id': qId,
    'f-id': fId,
  } = useParams<{
    'member-id': string;
    'q-id': string;
    'f-id': string;
  }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filledBy, setFilledBy] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('Questionnaire');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId || !qId || !fId) return;
    setLoading(true);
    setError(null);
    Application.PreviewQuestionary({
      member_id: memberId,
      q_unique_id: qId,
      f_unique_id: fId,
    })
      .then((res: { data: SurveyAPIResponse }) => {
        const visibleQuestions = (res.data.questions || []).filter(
          (q) => !q.hide && !q.skip_validation,
        );
        setQuestions(visibleQuestions);
        setFilledBy(res.data.filled_by);
        setTitle(res.data.title || 'Questionnaire');
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError((err as Error)?.message || 'Failed to load survey response');
        setLoading(false);
      });
  }, [memberId, qId, fId]);

  const handleDownload = async () => {
    if (!memberId || !qId || !fId || downloading) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const response = await Application.downloadQuestionaryPdf({
        member_id: memberId,
        q_unique_id: qId,
        f_unique_id: fId,
      });
      const blob = await responseBlob(
        response.data,
        response.headers?.['content-type'],
      );
      const fileName = filenameFromContentDisposition(
        response.headers?.['content-disposition'],
        `${title}.pdf`,
      );
      downloadBlob(blob, fileName);
    } catch (downloadError) {
      setDownloadError(
        (downloadError as Error)?.message || 'Failed to download questionnaire',
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  return (
    <div className="space-y-6 h-screen overflow-auto">
      <div className="sticky top-0 z-10 flex items-center justify-end gap-3 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
        {downloadError && (
          <span className="text-xs text-red-500">{downloadError}</span>
        )}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-lg bg-Primary-DeepTeal px-4 py-2 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60"
        >
          {downloading ? 'Downloading…' : 'Download PDF'}
        </button>
      </div>
      <SurveyResponsesView questions={questions} filled_by={filledBy} />
    </div>
  );
}
