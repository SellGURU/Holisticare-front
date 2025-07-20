import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SurveyResponsesView } from './survey-responses-view';
import Application from '../../api/app';

interface Question {
  type: string;
  order: number;
  question: string;
  required: boolean;
  options?: string[];
  response?: string | string[];
}

interface SurveyAPIResponse {
  filled_by?: string;
  questions: Question[];
  [key: string]: unknown;
}

export default function SurveyResponsesPage() {
  const { 'member-id': memberId, 'q-id': qId } = useParams<{
    'member-id': string;
    'q-id': string;
  }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filledBy, setFilledBy] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId || !qId) return;
    setLoading(true);
    setError(null);
    Application.PreviewQuestionary({
      member_id: memberId,
      q_unique_id: qId,
    })
      .then((res: { data: SurveyAPIResponse }) => {
        setQuestions(res.data.questions || []);
        setFilledBy(res.data.filled_by);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError((err as Error)?.message || 'Failed to load survey response');
        setLoading(false);
      });
  }, [memberId, qId]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (!questions.length) {
    return null;
  }

  return (
    <div className="space-y-6 h-screen overflow-auto">
      {/* <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Survey Responses</h1>
      </div> */}
      <SurveyResponsesView questions={questions} filled_by={filledBy} />
    </div>
  );
}
