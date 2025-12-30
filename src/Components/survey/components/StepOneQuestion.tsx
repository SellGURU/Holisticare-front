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
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Activity className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-xl md:text-3xl font-bold">
          {survey.title || 'Health & Wellness Survey'}
        </CardTitle>
        <CardDescription className="text-sm md:text-lg mt-2">
          {survey.description || 'Help us understand your health needs better'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          This survey contains {visibleQuestions.length} questions and will take
          approximately {Math.ceil(visibleQuestions.length * 0.5)} minutes to
          complete.
        </p>
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          <span className="text-red-500">*</span> indicates required questions.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center pb-8">
        <Button
          onClick={handleStart}
          size="sm"
          className="px-8 py-6 text-sm md:text-lg rounded-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
        >
          Start Survey
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StepOneQuestion;
