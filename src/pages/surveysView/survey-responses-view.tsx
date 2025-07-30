'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../Components/ui/card';
import { Star } from 'lucide-react';

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

// Emoji data for display
const emojeysData = [
  { name: 'Angry', order: 0, icon: '/images/emoji/angery.gif' },
  { name: 'Sad', order: 1, icon: '/images/emoji/sad.gif' },
  { name: 'Neutral', order: 2, icon: '/images/emoji/poker.gif' },
  { name: 'Smile', order: 3, icon: '/images/emoji/smile.gif' },
  { name: 'Loved', order: 4, icon: '/images/emoji/love.gif' },
];

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

    // Handle "Star Rating" type
    if (question.type.toLowerCase() === 'star rating') {
      const rating = Number.parseInt(question.response.toString()) || 0;
      const maxStars = question.options?.length || 5;

      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            {Array.from({ length: maxStars }).map((_, index) => (
              <div
                key={index}
                className={`p-1 rounded-full ${
                  index < rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <Star className="h-8 w-8 fill-current" />
              </div>
            ))}
          </div>
          {rating > 0 && (
            <span className="text-green-600 font-medium">
              Selected: {rating} star{rating !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      );
    }

    // Handle "Scale" type
    if (question.type.toLowerCase() === 'scale') {
      const value = Number.parseInt(question.response.toString()) || 0;
      const min = Number.parseInt(question.options?.[0] || '1');
      const max = Number.parseInt(question.options?.[1] || '10');

      return (
        <div className="space-y-6 px-4 mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((value - min) / (max - min)) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Low ({min})</span>
            <span className="text-green-600 font-bold text-xl">{value}</span>
            <span className="text-sm text-gray-500">High ({max})</span>
          </div>
        </div>
      );
    }

    // Handle "Emojis" type
    if (question.type.toLowerCase() === 'emojis') {
      const selectedEmojiName = question.response.toString();
      const selectedEmoji = emojeysData.find(
        (el) => el.name === selectedEmojiName,
      );

      if (!selectedEmoji) {
        return <span className="text-gray-400 italic">No emoji selected</span>;
      }

      return (
        <div className="bg-[#FCFCFC] p-3 w-full rounded-[12px] border border-gray-50">
          <div className="bg-white mt-2 w-full rounded-[20px] py-3 px-2">
            <div className="flex w-full justify-center items-center">
              <div className="w-[60px] h-[60px] min-w-[60px] min-h-[60px] bg-[#FFD64F] flex justify-center items-center rounded-full">
                <img
                  className="w-[48px]"
                  src={selectedEmoji.icon}
                  alt={selectedEmoji.name}
                />
              </div>
            </div>
            <div className="w-full mt-4 flex justify-center">
              <div className="text-[14px] text-[#005F73]">
                {selectedEmoji.name}
              </div>
            </div>
          </div>
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
