/* eslint-disable @typescript-eslint/no-explicit-any */

import { Activity, ArrowRight } from 'lucide-react';
import {
  CardHeader,
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../ui/card';
import { Button } from '../../ui/button';

interface StepOneQuestionProps {
  survey: any;
  visibleQuestions: any[];
  handleStart: () => void;
}

const StepOneQuestion: React.FC<StepOneQuestionProps> = ({
  survey,
  visibleQuestions,
  handleStart,
}) => {
  return (
    <Card className="bg-white dark:bg-slate-900 shadow-xl border-0">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
          <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>

        <CardTitle className="text-xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">
          {survey.title || 'Health & Wellness Survey'}
        </CardTitle>

        <CardDescription className="text-sm md:text-lg mt-2 text-gray-600 dark:text-slate-400">
          {survey.description || 'Help us understand your health needs better'}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center">
        <p className="text-gray-600 dark:text-slate-400 mb-6 text-sm md:text-base">
          This survey contains {visibleQuestions.length} questions and will take
          approximately {Math.ceil(visibleQuestions.length * 0.5)} minutes to
          complete.
        </p>

        <p className="text-gray-600 dark:text-slate-400 mb-6 text-sm md:text-base">
          <span className="text-red-500 dark:text-red-400">*</span> indicates
          required questions.
        </p>
      </CardContent>

      <CardFooter className="flex justify-center pb-8">
        <Button
          onClick={handleStart}
          size="sm"
          className="
            px-8 py-6 text-sm md:text-lg rounded-full
            bg-gradient-to-r from-green-600 to-emerald-500
            hover:from-green-700 hover:to-emerald-600
            dark:from-green-500 dark:to-emerald-400
            dark:hover:from-green-400 dark:hover:to-emerald-300
            text-white
            transition-all shadow-lg hover:shadow-xl
          "
        >
          Start Survey
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StepOneQuestion;
