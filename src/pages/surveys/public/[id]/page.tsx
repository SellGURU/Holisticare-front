/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PublicSurveyForm } from '../../../../Components/survey/public-survey-form';
import Application from '../../../../api/app';

export default function PublicSurveyPage() {
  const { 'member-id': memberId, 'q-id': qId } = useParams<{
    'member-id': string;
    'q-id': string;
  }>();
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Application.QuestionaryAction({
      member_id: memberId,
      q_unique_id: qId,
      action: 'fill',
    })
      .then((res) => {
        setSurvey(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
      });
    // async function fetchSurvey() {
    //   try {
    //     // Use the external API URL
    //     const apiUrl = `https://vercel-landing-kappa.vercel.app/landing_2/api/surveys/public/${qId}`;
    //     console.log(`Fetching survey data from ${apiUrl}`);

    //     const response = await fetch(apiUrl);
    //     const data = await response.json();

    //     console.log('API Response:', data);

    //     if (!response.ok || data.detail === 'Survey not found') {
    //       throw new Error(data.detail || 'Failed to fetch survey');
    //     }

    //     // Extract the survey data from the "survey" key
    //     const surveyData = data.survey || data;
    //     console.log('Extracted survey data:', surveyData);

    //     setSurvey(surveyData);
    //   } catch (err) {
    //     console.error('Error fetching survey:', err);
    //     setError(
    //       err instanceof Error ? err.message : 'An unknown error occurred',
    //     );
    //   } finally {
    //     setLoading(false);
    //   }
    // }

    // fetchSurvey();
  }, [qId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Survey Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <PublicSurveyForm survey={survey} />
    </div>
  );
}
