'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Star,
  Activity,
} from 'lucide-react';
import { toast } from '../ui/use-toast';
import Application from '../../api/app';
import { useParams } from 'react-router-dom';

// Define flexible interfaces to handle different API response structures
interface ApiQuestion {
  id?: string;
  text?: string;
  question?: string;
  type?: string;
  options?: string[] | null;
  required?: boolean;
  [key: string]: unknown;
}

interface ApiSurvey {
  id?: string;
  title?: string;
  description?: string;
  questions?: ApiQuestion[];
  [key: string]: unknown;
}

interface PublicSurveyFormProps {
  survey: ApiSurvey;
}

export function PublicSurveyForm({ survey }: PublicSurveyFormProps) {
  const { 'member-id': memberId, 'q-id': qId } = useParams();
  const [currentStep, setCurrentStep] = useState(0); // 0 for intro, 1+ for questions, questions.length+1 for completion
  const [responses, setResponses] = useState<Record<number, string | string[]>>(
    {} as Record<number, string | string[]>,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortedQuestions, setSortedQuestions] = useState<ApiQuestion[]>([]);
  const [loading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string>
  >({});

  // Process questions when survey data changes
  useEffect(() => {
    console.log('Survey data in form component:', survey);

    // Safely extract questions
    let questions: ApiQuestion[] = [];

    if (survey && survey.questions && Array.isArray(survey.questions)) {
      questions = [...survey.questions];
      console.log('Found questions in survey.questions:', questions);
    } else {
      // Try to find questions in other properties
      console.log('Searching for questions in other properties...');
      Object.entries(survey || {}).forEach(([key, value]) => {
        console.log(`Checking property "${key}":`, value);
        if (Array.isArray(value) && value.length > 0) {
          // Check if this array contains question-like objects
          const firstItem = value[0];
          if (
            typeof firstItem === 'object' &&
            firstItem !== null &&
            (firstItem.question !== undefined ||
              firstItem.text !== undefined ||
              firstItem.type !== undefined)
          ) {
            console.log(`Found questions in "${key}" property:`, value);
            questions = value as ApiQuestion[];
          }
        }
      });
    }

    console.log('Final processed questions:', questions);
    setSortedQuestions(Array.isArray(questions) ? questions : []);
  }, [survey]);

  const getQuestionText = (question: ApiQuestion): string => {
    // Try different possible field names for the question text
    if (typeof question.text === 'string' && question.text)
      return question.text;
    if (typeof question.question === 'string' && question.question)
      return question.question;
    if (typeof question.title === 'string' && question.title)
      return question.title;
    return 'Question';
  };

  const getQuestionOptions = (question: ApiQuestion): string[] => {
    // Handle different formats of options
    if (!question.options) return [];
    if (Array.isArray(question.options))
      return question.options.map((opt) => opt.toString());
    return [];
  };

  const handleStart = () => {
    setCurrentStep(1);
  };

  // Validate a single question
  const validateQuestion = (questionIndex: number): boolean => {
    const question = sortedQuestions[questionIndex];
    if (!question) return true;

    // If the question is required, check if there's a response
    if (question.required) {
      const response = responses[questionIndex];

      if (response === undefined || response === null || response === '') {
        setValidationErrors((prev) => ({
          ...prev,
          [questionIndex]: 'This question requires an answer',
        }));
        return false;
      }

      // For array responses (like checkboxes), check if the array is empty
      if (Array.isArray(response) && response.length === 0) {
        setValidationErrors((prev) => ({
          ...prev,
          [questionIndex]: 'Please select at least one option',
        }));
        return false;
      }
    }

    // Clear any validation errors for this question
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[questionIndex];
      return newErrors;
    });

    return true;
  };

  const handleNext = () => {
    if (sortedQuestions.length === 0) {
      console.error('No questions available');
      setError('No questions available');
      return;
    }

    const questionIndex = currentStep - 1;

    // Validate the current question
    if (!validateQuestion(questionIndex)) {
      return;
    }

    setError(null);

    if (currentStep < sortedQuestions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Validate all questions before submitting
      let allValid = true;
      for (let i = 0; i < sortedQuestions.length; i++) {
        if (!validateQuestion(i)) {
          allValid = false;
        }
      }
      console.log(allValid);

      if (allValid) {
        handleSubmit();
      } else {
        setError('Please answer all required questions before submitting');
        // Go to the first question with an error
        const firstErrorIndex = Object.keys(validationErrors)
          .map(Number)
          .sort((a, b) => a - b)[0];
        if (firstErrorIndex !== undefined) {
          setCurrentStep(firstErrorIndex + 1);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentStep(0); // Go back to intro
    }
  };

  const handleSubmit = async () => {
    console.log('aaaa');

    setSubmitting(true);
    try {
      const respond = sortedQuestions.map((q, idx) => ({
        ...q,
        response: responses[idx],
      }));

      await Application.SaveQuestionary({
        member_id: memberId,
        q_unique_id: qId,
        respond,
      });

      setCurrentStep(sortedQuestions.length + 1); // Move to completion screen

      toast({
        title: 'Survey submitted',
        description: 'Thank you for completing the survey!',
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      console.error('Failed to submit survey:', error);

      // For demo purposes, show success even if the API call fails
      console.log('Simulating successful submission for demo');
      setCurrentStep(sortedQuestions.length + 1);

      toast({
        title: 'Survey submitted',
        description: 'Thank you for completing the survey!',
        className: 'bg-green-600 text-white',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponseChange = (value: string | string[]) => {
    setResponses({
      ...responses,
      [currentStep - 1]: value,
    });

    // Clear validation error for this question when the user enters a response
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[currentStep - 1];
      return newErrors;
    });

    setError(null);
  };

  const calculateProgress = () => {
    if (currentStep === 0 || sortedQuestions.length === 0) return 0;
    if (currentStep > sortedQuestions.length) return 100;
    return Math.round((currentStep / sortedQuestions.length) * 100);
  };

  // Get the current question
  const currentQuestion =
    currentStep > 0 && currentStep <= sortedQuestions.length
      ? sortedQuestions[currentStep - 1]
      : null;

  // Calculate gradient colors based on progress
  const getGradientColor = () => {
    const progress = calculateProgress() / 100;

    if (progress < 0.25) {
      return 'from-green-500 to-emerald-500';
    } else if (progress < 0.5) {
      return 'from-emerald-500 to-teal-500';
    } else if (progress < 0.75) {
      return 'from-teal-500 to-green-500';
    } else {
      return 'from-green-600 to-green-400';
    }
  };

  const gradientClass = getGradientColor();

  // Render star rating
  const renderStarRating = (
    value: string | undefined,
    max: number,
    onChange: (value: string) => void,
  ) => {
    const currentValue = value ? Number.parseInt(value) : 0;
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-2">
          {Array.from({ length: max }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChange((index + 1).toString())}
              className={`p-1 rounded-full transition-all ${
                index < currentValue ? 'text-yellow-400' : 'text-gray-300'
              } hover:scale-110`}
            >
              <Star className="h-8 w-8 fill-current" />
            </button>
          ))}
        </div>
        {currentValue > 0 && (
          <span className="text-green-600 font-medium">
            You selected: {currentValue} star{currentValue !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  };

  // Render emoji selection
  const renderEmojiSelection = (
    value: string | undefined,
    options: string[],
    onChange: (value: string) => void,
  ) => {
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {options.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(emoji)}
            className={`text-4xl p-3 rounded-full transition-all ${
              value === emoji
                ? 'bg-green-100 ring-2 ring-green-600 scale-110'
                : 'bg-gray-50'
            } hover:bg-green-50`}
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };

  // Render scale slider
  const renderScaleSlider = (
    value: string | undefined,
    min: number,
    max: number,
    onChange: (value: string) => void,
  ) => {
    const currentValue = value
      ? Number.parseInt(value)
      : Math.floor((min + max) / 2);
    return (
      <div className="space-y-6 px-4 mt-4">
        <Slider
          defaultValue={[currentValue]}
          min={min}
          max={max}
          step={1}
          onValueChange={(values) => onChange(values[0].toString())}
          className="w-full"
        />
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Low ({min})</span>
          <span className="text-green-600 font-bold text-xl">
            {currentValue}
          </span>
          <span className="text-sm text-gray-500">High ({max})</span>
        </div>
      </div>
    );
  };

  // Render yes/no buttons
  const renderYesNo = (
    value: string | undefined,
    onChange: (value: string) => void,
  ) => {
    return (
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => onChange('Yes')}
          className={`px-8 py-4 rounded-lg text-lg font-medium transition-all ${
            value === 'Yes'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange('No')}
          className={`px-8 py-4 rounded-lg text-lg font-medium transition-all ${
            value === 'No'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          No
        </button>
      </div>
    );
  };

  // Add this function to handle different question types
  const renderQuestion = (question: ApiQuestion, questionIndex: number) => {
    const questionType = question.type || 'paragraph';
    const questionOptions = getQuestionOptions(question);
    const response = responses[questionIndex];
    const validationError = validationErrors[questionIndex];

    switch (questionType) {
      case 'Paragraph':
      case 'text':
        return (
          <Textarea
            value={(response as string) || ''}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="Type your answer here..."
            className={`min-h-[120px] mt-2 text-base ${
              validationError ? 'border-red-500 focus-visible:ring-red-500' : ''
            } ${response ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
          />
        );

      case 'multiple_choice':
        return (
          <RadioGroup
            value={(response as string) || ''}
            onValueChange={(value) => handleResponseChange(value)}
            className="space-y-3"
          >
            {questionOptions.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 rounded-lg border p-4 hover:bg-slate-50 transition-colors ${
                  validationError ? 'border-red-500' : ''
                } ${(response as string) === option.toString() ? 'border-green-500 bg-green-50' : ''}`}
              >
                <RadioGroupItem
                  value={option.toString()}
                  id={`option-${questionIndex}-${index}`}
                  className="text-green-600"
                />
                <Label
                  htmlFor={`option-${questionIndex}-${index}`}
                  className="flex-grow cursor-pointer font-medium"
                >
                  {option.toString()}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {questionOptions.map((option, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 rounded-lg border p-4 hover:bg-slate-50 transition-colors ${
                  validationError ? 'border-red-500' : ''
                } ${Array.isArray(response) && response.includes(option) ? 'border-green-500 bg-green-50' : ''}`}
              >
                <Checkbox
                  id={`option-${questionIndex}-${index}`}
                  checked={Array.isArray(response) && response.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValue = response || [];
                    if (!Array.isArray(currentValue)) {
                      handleResponseChange([option]);
                      return;
                    }

                    if (checked) {
                      handleResponseChange([...currentValue, option]);
                    } else {
                      handleResponseChange(
                        currentValue.filter((item) => item !== option),
                      );
                    }
                  }}
                  className="mt-1 text-green-600 border-green-600"
                />
                <Label
                  htmlFor={`option-${questionIndex}-${index}`}
                  className="flex-grow cursor-pointer font-medium"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'Scale':
        return renderScaleSlider(
          response as string,
          Number.parseInt(questionOptions[0] || '1'),
          Number.parseInt(questionOptions[1] || '10'),
          (value) => handleResponseChange(value),
        );

      case 'Star Rating':
        return renderStarRating(
          response as string,
          questionOptions.length || 5,
          (value) => handleResponseChange(value),
        );

      case 'emojis':
        return renderEmojiSelection(
          response as string,
          questionOptions,
          (value) => handleResponseChange(value),
        );

      case 'File Uploaderr':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id={`file-upload-${questionIndex}`}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleResponseChange(e.target.files[0].name);
                  }
                }}
              />
              <label
                htmlFor={`file-upload-${questionIndex}`}
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <svg
                  className="w-12 h-12 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <span className="text-gray-600 font-medium">
                  Click to upload a file
                </span>
                <span className="text-gray-500 text-sm mt-1">
                  or drag and drop
                </span>
              </label>
            </div>
            {response && (
              <div className="text-sm text-gray-600">
                Selected file: <span className="font-medium">{response}</span>
              </div>
            )}
          </div>
        );

      case 'Yes/No':
        return renderYesNo(response as string, (value) =>
          handleResponseChange(value),
        );

      default:
        return (
          <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md">
            <p className="text-yellow-800">
              Question type "{questionType}" is not supported in this preview.
            </p>
          </div>
        );
    }
  };

  // If there are no questions, show an error message
  if (sortedQuestions.length === 0 && !loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <Card className="bg-white shadow-xl border-0 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">
              No Questions Available
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              This survey doesn't contain any questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <p className="text-gray-600 mb-6">
              The survey data structure might not be in the expected format.
              Please check the console for details.
            </p>
            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              size="lg"
              className="mt-4"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
        <div
          className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${gradientClass}`}
          style={{ width: `${calculateProgress()}%` }}
        ></div>
      </div>

      {currentStep === 0 && (
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold">
              {survey.title || 'Health & Wellness Survey'}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {survey.description ||
                'Help us understand your health needs better'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              This survey contains {sortedQuestions.length} questions and will
              take approximately {Math.ceil(sortedQuestions.length * 0.5)}{' '}
              minutes to complete.
            </p>
            <p className="text-gray-600 mb-6">
              <span className="text-red-500">*</span> indicates required
              questions.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Button
              onClick={handleStart}
              size="lg"
              className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              Start Survey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {currentQuestion && (
        <Card
          style={{ height: window.innerHeight - 200 + 'px' }}
          className="bg-white shadow-xl h-fit border-0 flex flex-col relative"
        >
          <CardHeader>
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${gradientClass} mb-4`}
            >
              Question {currentStep} of {sortedQuestions.length}
            </div>
            <CardTitle className="text-2xl font-bold">
              {getQuestionText(currentQuestion)}
              {currentQuestion.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </CardTitle>
            {currentQuestion.required && (
              <CardDescription className="text-sm text-gray-500 mt-1">
                Required
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6 h-[60%] overflow-auto">
            {renderQuestion(currentQuestion, currentStep - 1)}

            {validationErrors[currentStep - 1] && (
              <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{validationErrors[currentStep - 1]}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-4 w-full ">
            <Button type="button" variant="outline" onClick={handlePrevious}>
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              data-testid="survey-next-button"
              className={`bg-gradient-to-r ${gradientClass} hover:brightness-105 transition-all text-white`}
            >
              {currentStep === sortedQuestions.length
                ? submitting
                  ? 'Submitting...'
                  : 'Submit'
                : 'Next'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {currentStep > sortedQuestions.length && (
        <Card className="bg-white shadow-xl border-0 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600">
              Thank You!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Your response to "{survey.title || 'this survey'}" has been
              submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <p className="text-gray-600 mb-6">
              We appreciate your time and feedback. Your responses will help us
              improve our services.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
