/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import SvgIcon from '../../../utils/svgIcon';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { getQuestionText } from '../help';

interface MainQuestionBoxProps {
  currentStep: number;
  visibleQuestions: any[];
  currentQuestion: any;
  gradientClass: string;
  error: string | null;
  validationErrors: any;
  handlePrevious: () => void;
  handleNext: () => void;
  submitting: boolean;
  action: any;
  showSaveIndicator: 'idle' | 'saving' | 'saved';
  getOriginalIndexForVisibleIndex: (visibleIndex: number) => number;
  renderQuestion: (
    question: ApiQuestion,
    questionIndex: number,
  ) => React.ReactNode;
}

const MainQuestionBox: React.FC<MainQuestionBoxProps> = ({
  error,
  handlePrevious,
  handleNext,
  submitting,
  action,
  validationErrors,
  gradientClass,
  showSaveIndicator,
  currentStep,
  visibleQuestions,
  currentQuestion,
  renderQuestion,
  getOriginalIndexForVisibleIndex,
}) => {
  return (
    <>
      <Card
        style={{ height: window.innerHeight - 180 + 'px' }}
        className="bg-white dark:bg-slate-900 shadow-xl border-0 flex flex-col relative"
      >
        <CardHeader>
          <div
            className={`px-3 py-1 text-xs md:text-sm rounded-full items-center flex font-medium text-white bg-gradient-to-r ${gradientClass} mb-4`}
          >
            Question {currentStep} of {visibleQuestions.length}

            {showSaveIndicator === 'saving' && (
              <div className="ml-2 flex items-center gap-1">
                <SvgIcon
                  stroke="#FFFFFF"
                  width={window.innerWidth < 768 ? '12px' : '16px'}
                  height={window.innerWidth < 768 ? '12px' : '16px'}
                  src="/icons/refresh-2.svg"
                  color=""
                  className="animate-spin"
                />
                <div className="text-[8px] md:text-xs">
                  Saving response…
                </div>
              </div>
            )}

            {showSaveIndicator === 'saved' && (
              <div className="ml-2 flex items-center gap-1">
                <SvgIcon
                  stroke="#FFFFFF"
                  width={window.innerWidth < 768 ? '12px' : '16px'}
                  height={window.innerWidth < 768 ? '12px' : '16px'}
                  src="/icons/tick-circle2.svg"
                  color=""
                />
                <span className="text-[8px] md:text-xs">
                  Response saved
                </span>
              </div>
            )}
          </div>

          <CardTitle className="text-[14px] 2xl:text-base max-h-[120px] overflow-y-scroll font-bold break-words pr-4 max-w-full text-gray-900 dark:text-slate-100">
            {getQuestionText(currentQuestion)}
            {currentQuestion.required && (
              <span className="text-red-500 dark:text-red-400 ml-1">*</span>
            )}
          </CardTitle>

          {currentQuestion.required && (
            <CardDescription className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Required
            </CardDescription>
          )}
        </CardHeader>

        <CardContent
          className="space-y-6 pb-20 overflow-y-scroll text-gray-900 dark:text-slate-100"
          style={{ height: window.innerHeight - 400 + 'px' }}
        >
          {renderQuestion(
            currentQuestion,
            getOriginalIndexForVisibleIndex(currentStep - 1),
          )}

          {validationErrors[
            getOriginalIndexForVisibleIndex(currentStep - 1)
          ] && (
            <div className="flex items-center space-x-2 text-red-500 dark:text-red-400 text-sm mt-2">
              <AlertCircle className="h-4 w-4" />
              <span>
                {
                  validationErrors[
                    getOriginalIndexForVisibleIndex(currentStep - 1)
                  ]
                }
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-500 dark:text-red-400 text-sm mt-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-4 absolute bottom-0 w-full bg-white dark:bg-slate-900">
          <Button
            className={`${currentStep > 1 ? 'visible' : 'invisible'}`}
            type="button"
            variant="outline"
            onClick={handlePrevious}
          >
            Back
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            data-testid="survey-next-button"
            className={`bg-gradient-to-r ${gradientClass} hover:brightness-105 transition-all text-white`}
          >
            {currentStep === visibleQuestions.length
              ? submitting
                ? 'Submitting...'
                : action === 'edit'
                  ? 'Update'
                  : 'Submit'
              : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default MainQuestionBox;
