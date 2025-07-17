"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";

interface Question {
  type: string;
  order: number;
  question: string;
  required: boolean;
  options?: string[];
  response?: string | string[];
}

interface SurveyResponsesViewProps {
  questions: Question[];
  filled_by?: string;
}

export function SurveyResponsesView({ questions, filled_by }: SurveyResponsesViewProps) {
  const getResponseDisplay = (question: Question) => {
    if (question.response === undefined || question.response === null) {
      return <span className="text-gray-400 italic">No response</span>;
    }
    if (question.type.toLowerCase() === "checkbox" && Array.isArray(question.response)) {
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
    // For file uploader, just show the filename
    if (question.type.toLowerCase() === "file uploader") {
      return <span>{question.response}</span>;
    }
    // For all others, show as text
    return <span>{question.response}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex justify-center items-start py-12 px-2">
      <div className="w-full max-w-2xl space-y-8">
        {filled_by && (
          <div className="mb-4 text-sm text-Text-Secondary text-center">Filled by: <span className="font-medium text-Text-Primary">{filled_by}</span></div>
        )}
        <h2 className="text-2xl font-bold text-center text-Text-Primary mb-6 drop-shadow-sm">Survey Responses</h2>
        <div className="space-y-8">
          {questions.map((question, index) => (
            <Card key={index} className="shadow-lg border border-gray-200 rounded-xl bg-white/90 hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-Text-Primary ">
                  <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-mono">{question.order}</span>
                  <span>{question.question}</span>
                  {question.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2 mt-1 text-Text-Secondary">
                  <span className="capitalize text-xs bg-gray-100 px-2 py-0.5 rounded">{question.type}</span>
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
