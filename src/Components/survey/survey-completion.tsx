'use client';

import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface SurveyCompletionProps {
  title: string;
  submitting: boolean;
}

export function SurveyCompletion({ title, submitting }: SurveyCompletionProps) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>

      <p className="text-xl text-gray-600 mb-10">
        Your responses to the <span className="font-semibold">{title}</span>{' '}
        have been successfully submitted.
      </p>

      <div className="space-y-6">
        <div className="bg-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-700 mb-2">
            What happens next?
          </h3>
          <p className="text-gray-600">
            Your health coach will review your responses and integrate them into
            your personalized health plan.
          </p>
        </div>

        <div className="bg-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-pink-700 mb-2">
            Have questions?
          </h3>
          <p className="text-gray-600">
            Reach out to your health coach if you have any questions about this
            survey or your health program.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Button
          className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all"
          disabled={submitting}
          onClick={() => {
            if (!submitting) window.location.href = '/';
          }}
        >
          {submitting ? 'Submitting...' : 'Return to Dashboard'}
        </Button>
      </div>
    </div>
  );
}
