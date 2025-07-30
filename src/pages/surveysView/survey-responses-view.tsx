'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../Components/ui/card';

// --- NEW/UPDATED INTERFACES ---
interface MultiFileResponse {
  frontal?: string; // base64 data for frontal image
  back?: string; // base64 data for back image
  side?: string; // base64 data for side image
}

interface Question {
  type: string;
  order: number;
  question: string;
  required: boolean;
  options?: string[];
  // The response can be a string, array of strings, or the MultiFileResponse object
  response?: string | string[] | MultiFileResponse;
}
// --- END NEW/UPDATED INTERFACES ---

interface SurveyResponsesViewProps {
  questions: Question[];
  filled_by?: string;
  title?: string;
  time?: any;
  isCustom?: boolean;
}

export function SurveyResponsesView({
  questions,
  filled_by,
  isCustom,
  time,
  title,
}: SurveyResponsesViewProps) {
  const getResponseDisplay = (question: Question) => {
    if (question.response === undefined || question.response === null) {
      return <span className="text-gray-400 italic">No response</span>;
    }

    // Handle Checkbox type
    if (
      question.type.toLowerCase() === 'checkbox' &&
      Array.isArray(question.response)
    ) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {question.response.length === 0 ? (
            <li className="text-gray-400 italic">None selected</li>
          ) : (
            question.response.map((item, i) => <li key={i}>{item}</li>)
          )}
        </ul>
      );
    }

    // Handle "File Uploader" type
    if (question.type.toLowerCase() === 'file uploader') {
      const fileResponse = question.response as MultiFileResponse; // Cast to MultiFileResponse
      const hasFiles =
        fileResponse.frontal || fileResponse.back || fileResponse.side;

      if (!hasFiles) {
        return <span className="text-gray-400 italic">No files uploaded</span>;
      }

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {fileResponse.frontal && (
            <div className="flex flex-col items-center border border-gray-200 rounded-md p-2">
              <span className="text-sm font-medium text-gray-700 mb-1">
                Frontal View
              </span>
              <img
                src={fileResponse.frontal}
                alt="Frontal File Preview"
                className="max-w-full h-32 object-contain rounded-md shadow-sm"
              />
            </div>
          )}
          {fileResponse.back && (
            <div className="flex flex-col items-center border border-gray-200 rounded-md p-2">
              <span className="text-sm font-medium text-gray-700 mb-1">
                Back View
              </span>
              <img
                src={fileResponse.back}
                alt="Back File Preview"
                className="max-w-full h-32 object-contain rounded-md shadow-sm"
              />
            </div>
          )}
          {fileResponse.side && (
            <div className="flex flex-col items-center border border-gray-200 rounded-md p-2">
              <span className="text-sm font-medium text-gray-700 mb-1">
                Side View
              </span>
              <img
                src={fileResponse.side}
                alt="Side File Preview"
                className="max-w-full h-32 object-contain rounded-md shadow-sm"
              />
            </div>
          )}
        </div>
      );
    }

    // For all other types, show as text
    return <span>{question.response.toString()}</span>;
  };

  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 flex justify-center items-start ${isCustom ? 'py-8' : 'py-12'} px-2`}
    >
      <div className="w-full max-w-2xl space-y-8">
        {isCustom ? (
          <div className="flex w-full items-center justify-between">
            <div className="text-sm text-Text-Primary font-medium">{title}</div>
            <div className="text-Text-Quadruple text-xs flex items-center gap-1">
              <img src="/icons/timer-grey.svg" alt="" className="w-4 h-4" />
              {(() => {
                const ms = time;
                const minutes = Math.floor(ms / 60000);
                const seconds = Math.floor((ms % 60000) / 1000);
                return `${minutes} min, ${seconds} sec`;
              })() || '-'}
            </div>
          </div>
        ) : (
          <div>
            {filled_by && (
              <div className="mb-4 text-sm text-Text-Secondary text-center">
                Filled by:{' '}
                <span className="font-medium text-Text-Primary">
                  {filled_by}
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-center text-Text-Primary mb-6 drop-shadow-sm">
              Survey Responses
            </h2>
          </div>
        )}

        <div className="space-y-8">
          {questions.map((question, index) => (
            <Card
              key={index}
              className="shadow-lg border border-gray-200 rounded-xl bg-white/90 hover:shadow-xl transition-shadow duration-200"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-Text-Primary ">
                  <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-mono mr-2">
                    {question.order}
                  </span>
                  <span>{question.question}</span>
                  {question.required && (
                    <span className="text-red-500 ml-1" title="Required">
                      *
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2 mt-1 text-Text-Secondary">
                  <span className="capitalize text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {question.type}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                {getResponseDisplay(question)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
