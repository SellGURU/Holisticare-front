'use client';

import { useState, useEffect } from 'react';
import { SurveyLanding } from './survey-landing';
import { SurveyQuestion } from './survey-question';
import { SurveyCompletion } from './survey-completion';
import {
  updateSurveyAssignmentStatus,
  submitSurveyResponse,
} from '../../utils/survey-actions';
import { toast } from '../../Components/ui/use-toast';

interface SurveyExperienceProps {
  survey: {
    id: string;
    title: string;
    description: string;
    questions: {
      order: number;
      question: string;
      type: 'paragraph' | 'multiple_choice' | 'checkbox';
      options?: string[];
      required: boolean;
    }[];
  };
  assignment: {
    id: string;
    clientId: string;
    surveyId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    assignedDate: string;
    dueDate?: string;
    completedDate?: string;
  };
  uniqueCode: string;
}

export function SurveyExperience({
  survey,
  assignment,
}: SurveyExperienceProps) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 for landing, questions are 0-based, length for completion
  const [responses, setResponses] = useState<Record<number, string | string[]>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Sort questions once and memoize the result
  const sortedQuestions = [...survey.questions].sort(
    (a, b) => a.order - b.order,
  );

  // Initialize responses only once
  useEffect(() => {
    if (!initialized) {
      const initialResponses: Record<number, string | string[]> = {};
      sortedQuestions.forEach((question, index) => {
        initialResponses[index] = question.type === 'checkbox' ? [] : '';
      });
      setResponses(initialResponses);
      setInitialized(true);
    }
  }, [sortedQuestions, initialized]);

  const updateStatus = async (
    status: 'not_started' | 'in_progress' | 'completed',
  ) => {
    try {
      await updateSurveyAssignmentStatus(assignment.id, status);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleStart = async () => {
    if (assignment.status === 'not_started') {
      await updateStatus('in_progress');
    }
    setCurrentStep(0);
  };

  const handleNext = async (response: string | string[]) => {
    // Update responses for the current step
    setResponses((prev) => ({
      ...prev,
      [currentStep]: response,
    }));

    // If this is the first question being answered, update status to in_progress
    if (assignment.status === 'not_started' && currentStep === 0) {
      await updateStatus('in_progress');
    }

    if (currentStep < sortedQuestions.length - 1) {
      // Move to next question
      setCurrentStep(currentStep + 1);
    } else {
      // Move to completion screen
      setCurrentStep(sortedQuestions.length);

      // Create a copy of responses with the current response included
      const finalResponses = {
        ...responses,
        [currentStep]: response,
      };

      // Submit the survey
      handleSubmit(finalResponses);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentStep(-1); // Go back to landing
    }
  };

  const handleSubmit = async (
    finalResponses: Record<number, string | string[]>,
  ) => {
    setSubmitting(true);
    try {
      await submitSurveyResponse(assignment.id, finalResponses);
      await updateStatus('completed');

      toast({
        title: 'Survey completed',
        description: 'Thank you for completing the survey!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to submit survey:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit survey. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateProgress = () => {
    if (currentStep === -1) return 0;
    if (currentStep === sortedQuestions.length) return 100;
    return Math.round(((currentStep + 1) / sortedQuestions.length) * 100);
  };

  const progressClasses = `absolute left-0 h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-400`;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white pb-20">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={progressClasses}
          style={{ width: `${calculateProgress()}%` }}
        ></div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-10">
        {currentStep === -1 && (
          <div className="flex flex-col items-center">
            <div className="mb-8 animate-float">
              <div className="w-20 h-20 text-center flex items-center justify-center">
                <svg
                  className="w-16 h-16"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M24 4C18.4772 4 14 8.47715 14 14V34C14 39.5228 18.4772 44 24 44C29.5228 44 34 39.5228 34 34V14C34 8.47715 29.5228 4 24 4Z"
                    fill="#FFE0FB"
                    stroke="#9333EA"
                    strokeWidth="2"
                  />
                  <path d="M14 18H34" stroke="#9333EA" strokeWidth="2" />
                  <path d="M14 30H34" stroke="#9333EA" strokeWidth="2" />
                  <path
                    d="M20 8V40"
                    stroke="#9333EA"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                  <path
                    d="M28 8V40"
                    stroke="#9333EA"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>
            </div>
            <SurveyLanding
              title={survey.title}
              description={survey.description}
              onStart={handleStart}
              status={assignment.status}
            />
          </div>
        )}

        {currentStep >= 0 && currentStep < sortedQuestions.length && (
          <div className="animate-fade-in">
            <SurveyQuestion
              questionNumber={currentStep + 1}
              totalQuestions={sortedQuestions.length}
              question={sortedQuestions[currentStep].question}
              type={sortedQuestions[currentStep].type}
              options={sortedQuestions[currentStep].options || []}
              required={sortedQuestions[currentStep].required}
              initialValue={responses[currentStep]}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
        )}

        {currentStep === sortedQuestions.length && (
          <div className="animate-fade-in">
            <SurveyCompletion title={survey.title} submitting={submitting} />
          </div>
        )}
      </div>
    </div>
  );
}
