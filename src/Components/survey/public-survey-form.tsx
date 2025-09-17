'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  UploadCloud,
  X,
  Check,
} from 'lucide-react';
import { toast } from '../ui/use-toast';
import Application from '../../api/app';
import { useNavigate, useParams } from 'react-router-dom';

// Define flexible interfaces to handle different API response structures

interface MultiFileResponse {
  frontal?: string; // base64 data for frontal
  back?: string; // base64 data for back
  side?: string; // base64 data for side
}

interface IndividualFileData {
  base64: string;
  type: string;
}

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
  isClient?: boolean;
  onSubmitClient?: (respond: ApiQuestion[]) => void;
}

// --- EMOJI SELECTOR COMPONENT ---
interface EmojiSelectorProps {
  currentResponse: string | undefined; // The selected emoji name from parent
  onChange: (value: string) => void; // Callback to update parent state
  questionIndex: number; // Added to interface
  currentQuestionText: string | null; // Added to interface
}

const emojeysData = [
  // Defined outside to prevent re-creation on re-renders
  { name: 'Angry', order: 0, icon: '/images/emoji/angery.gif' },
  { name: 'Sad', order: 1, icon: '/images/emoji/sad.gif' },
  { name: 'Neutral', order: 2, icon: '/images/emoji/poker.gif' },
  { name: 'Smile', order: 3, icon: '/images/emoji/smile.gif' },
  { name: 'Loved', order: 4, icon: '/images/emoji/love.gif' },
];

const EmojiSelector: React.FC<EmojiSelectorProps> = ({
  currentResponse,
  onChange,
  // questionIndex, // Not used in component's render logic, can remove from here if not needed
  // currentQuestionText, // Not used in component's render logic, can remove from here if not needed
}) => {
  const touchStartX = useRef(0);

  // Initialize active state based on currentResponse (prop).
  const [active, setActive] = useState(() => {
    return (
      emojeysData.find((el) => el.name === currentResponse) || emojeysData[2]
    );
  });

  // Keep internal active state in sync with external currentResponse
  useEffect(() => {
    const newActive =
      emojeysData.find((el) => el.name === currentResponse) || emojeysData[2];
    if (newActive.name !== active.name) {
      setActive(newActive);
    }
  }, [currentResponse, active.name]);

  // Handle emoji selection (both click and swipe)
  const handleEmojiSelect = useCallback(
    (emojiName: string) => {
      const selectedEmoji = emojeysData.find((el) => el.name === emojiName);
      if (selectedEmoji) {
        setActive(selectedEmoji); // Update local state
        onChange(selectedEmoji.name); // Notify parent immediately
      }
    },
    [onChange],
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touchMoveX = e.touches[0].clientX;
      const diff = touchStartX.current - touchMoveX;
      const swipeThreshold = 50;

      if (diff > swipeThreshold) {
        // Swipe Left
        if (active.order + 1 <= 4) {
          handleEmojiSelect(emojeysData[active.order + 1].name);
        }
        touchStartX.current = touchMoveX;
      } else if (diff < -swipeThreshold) {
        // Swipe Right
        if (active.order - 1 >= 0) {
          handleEmojiSelect(emojeysData[active.order - 1].name);
        }
        touchStartX.current = touchMoveX;
      }
    },
    [active, handleEmojiSelect],
  );

  return (
    <div className="bg-[#FCFCFC] p-3 w-full h-full rounded-[12px] border border-gray-50">
      <div className="bg-white mt-2 w-full rounded-[20px] py-3 px-2">
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className="flex w-full select-none justify-center items-center gap-4"
        >
          {Array.from({ length: 5 }).map((_em, ind) => {
            const itemIndex = active.order - 2 + ind;
            const emojiToDisplay = emojeysData[itemIndex];

            return (
              <div key={itemIndex}>
                {emojiToDisplay ? (
                  emojiToDisplay.order === active.order ? (
                    <div className="w-[60px] h-[60px] min-w-[40px] min-h-[40px] bg-[#FFD64F] flex justify-center items-center rounded-full">
                      <img
                        className="w-[48px]"
                        src={active.icon}
                        alt={active.name}
                      />
                    </div>
                  ) : (
                    <img
                      onClick={() => handleEmojiSelect(emojiToDisplay.name)}
                      className="w-[48px] cursor-pointer"
                      src={emojiToDisplay.icon}
                      alt={emojiToDisplay.name}
                    />
                  )
                ) : (
                  <div className="w-[48px] h-[48px]"></div>
                )}
              </div>
            );
          })}
        </div>
        <div className="w-full mt-4 flex justify-center">
          <div className="text-[14px] text-[#005F73]">{active.name}</div>
        </div>
      </div>
    </div>
  );
};
// --- END EMOJI SELECTOR COMPONENT ---

export function PublicSurveyForm({
  survey,
  isClient = false,
  onSubmitClient,
}: PublicSurveyFormProps) {
  console.log(survey);

  const navigate = useNavigate();
  const { 'member-id': memberId, 'q-id': qId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<
    Record<number, string | string[] | MultiFileResponse | null | number>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleQuestions, setVisibleQuestions] = useState<ApiQuestion[]>([]);

  const [sortedQuestions, setSortedQuestions] = useState<ApiQuestion[]>([]);
  const [loading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string>
  >({});
  const [visibleToOriginalIndex, setVisibleToOriginalIndex] = useState<number[]>([]);

  // States for 'File Uploader' specific logic
  const [tempFrontal, setTempFrontal] = useState<IndividualFileData | null>(
    null,
  );
  const [tempBack, setTempBack] = useState<IndividualFileData | null>(null);
  const [tempSide, setTempSide] = useState<IndividualFileData | null>(null);
  const [isMultiUploadMode, setIsMultiUploadMode] = useState(false);

  const currentQuestion =
    currentStep > 0 && currentStep <= visibleQuestions.length
      ? visibleQuestions[currentStep - 1]
      : null;
  // Reset temp files and upload mode when question changes (for File Uploader)
  useEffect(() => {
    if (currentQuestion && currentQuestion.type === 'File Uploader') {
      const currentResponse = responses[currentStep - 1] as MultiFileResponse;
      setTempFrontal(
        currentResponse?.frontal
          ? { base64: currentResponse.frontal, type: 'image/*' }
          : null,
      );
      setTempBack(
        currentResponse?.back
          ? { base64: currentResponse.back, type: 'image/*' }
          : null,
      );
      setTempSide(
        currentResponse?.side
          ? { base64: currentResponse.side, type: 'image/*' }
          : null,
      );
      setIsMultiUploadMode(false);
    }
  }, [currentStep, currentQuestion, responses]);

  // Process questions when survey data changes
  useEffect(() => {
    console.log('Survey data in form component:', survey);

    let questions: ApiQuestion[] = [];

    if (survey && survey.questions && Array.isArray(survey.questions)) {
      questions = [...survey.questions];
      console.log('Found questions in survey.questions:', questions);
    } else {
      console.log('Searching for questions in other properties...');
      Object.entries(survey || {}).forEach(([key, value]) => {
        console.log(`Checking property "${key}":`, value);
        if (Array.isArray(value) && value.length > 0) {
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
    const visible = questions.filter((q) => !q.hide);
    setVisibleQuestions(visible);
    // Build mapping from visible index to original index
    const mapping: number[] = visible.map((vq) => {
      let idx = questions.findIndex((q) => q === vq);
      if (idx !== -1) return idx;
      // Fallback: match by text + type + options signature
      const text = getQuestionText(vq) || 'Question';
      const type = (vq.type || '').toLowerCase();
      const opts = Array.isArray(vq.options) ? JSON.stringify(vq.options) : '';
      idx = questions.findIndex((q) => {
        const qText = getQuestionText(q) || 'Question';
        const qType = (q.type || '').toLowerCase();
        const qOpts = Array.isArray(q.options) ? JSON.stringify(q.options) : '';
        return qText === text && qType === type && qOpts === opts;
      });
      return idx;
    });
    setVisibleToOriginalIndex(mapping);
    // --- NEW: Initialize responses for all questions ---
    const initialResponses: Record<
      number,
      string | string[] | MultiFileResponse | null
    > = {};
    questions.forEach((q, index) => {
      // Set initial response based on type.
      // For text, paragraph, scale, star rating, yes/no, and emojis, default to empty string.
      // For checkbox, default to empty array.
      // For file uploader, default to empty object.
      switch (q.type?.toLowerCase()) {
        case 'checkbox': {
          // Added block scope
          initialResponses[index] = [];
          break;
        }
        case 'file uploader': {
          // Added block scope
          initialResponses[index] = {};
          break;
        }
        case 'scale': {
          // Added block scope
          // For scale, set to a default middle value if options are present
          const options = getQuestionOptions(q);
          const min = Number.parseInt(options[0] || '1'); // Safely access with default fallback
          const max = Number.parseInt(options[1] || '10'); // Safely access with default fallback
          initialResponses[index] = Math.floor((min + max) / 2).toString();
          break;
        }
        case 'star rating': {
          // Added block scope
          initialResponses[index] = '0'; // Default to 0 stars
          break;
        }
        case 'emojis': {
          // Added block scope
          initialResponses[index] = emojeysData[2].name; // Default to neutral emoji
          break;
        }
        default: {
          // Added block scope
          initialResponses[index] = '';
          break;
        }
      }
    });
    setResponses(initialResponses);
    // --- END NEW INITIALIZATION ---
  }, [survey]);

  const getQuestionText = (question: ApiQuestion): string | null => {
    if (question.hide == true) return null;
    if (typeof question.text === 'string' && question.text)
      return question.text;
    if (typeof question.question === 'string' && question.question)
      return question.question;
    if (typeof question.title === 'string' && question.title)
      return question.title;
    return 'Question';
  };

  const getQuestionOptions = (question: ApiQuestion): string[] => {
    if (!question.options) return [];
    if (Array.isArray(question.options))
      return question.options.map((opt) => opt.toString());
    return [];
  };

  // Map a visible question index (step-1) to its index in the full sortedQuestions array
  const getOriginalIndexForVisibleIndex = useCallback(
    (visibleIndex: number): number => {
      const visibleQuestion = visibleQuestions[visibleIndex];
      if (!visibleQuestion) return -1;
      // Use precomputed mapping if available and valid
      const mapped = visibleToOriginalIndex[visibleIndex];
      if (typeof mapped === 'number' && mapped >= 0 && mapped < sortedQuestions.length) {
        return mapped;
      }
      // Try by id first
      let idx = sortedQuestions.findIndex((q) => q.id === visibleQuestion.id);
      if (idx !== -1) return idx;
      // Fallback: use object reference (visibleQuestions items are filtered from sortedQuestions)
      idx = sortedQuestions.findIndex((q) => q === visibleQuestion);
      return idx;
    },
    [sortedQuestions, visibleQuestions, visibleToOriginalIndex],
  );

  const handleStart = () => {
    setCurrentStep(1);
  };

  const validateQuestion = (questionIndex: number): boolean => {
    const question = sortedQuestions[questionIndex];
    if (!question) return true;

    if (question.required) {
      const response = responses[questionIndex];

      if (
        response === undefined ||
        response === null ||
        (typeof response === 'string' && response.trim() === '') ||
        (Array.isArray(response) && response.length === 0)
      ) {
        setValidationErrors((prev) => ({
          ...prev,
          [questionIndex]: 'This question requires an answer',
        }));
        return false;
      }

      if (question.type === 'File Uploader') {
        const fileResponse = response as MultiFileResponse;
        if (!fileResponse.frontal && !fileResponse.back && !fileResponse.side) {
          setValidationErrors((prev) => ({
            ...prev,
            [questionIndex]: 'Please upload at least one file.',
          }));
          return false;
        }
      }
    }

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[questionIndex];
      return newErrors;
    });

    return true;
  };

  const handleNext = () => {
    if (visibleQuestions.length === 0) {
      // Changed to visibleQuestions
      console.error('No questions available');
      setError('No questions available');
      return;
    }

    // Get the current question and its index in the VISIBLE array
    const currentVisibleQuestion = visibleQuestions[currentStep - 1];
    // const currentVisibleIndex = currentStep - 1;

    // Find the original index for validation
    const originalQuestionIndex = getOriginalIndexForVisibleIndex(
      currentStep - 1,
    );

    if (currentVisibleQuestion?.type === 'File Uploader' && isMultiUploadMode) {
      handleMultiFileUploadSave();
    }

    // Use the original index for validation
    if (!validateQuestion(originalQuestionIndex)) {
      return;
    }

    setError(null);

    if (currentStep < visibleQuestions.length) {
      // Changed to visibleQuestions
      setCurrentStep(currentStep + 1);
    } else {
      // This loop needs to validate all visible questions, not all sorted questions.
      let allValid = true;
      for (let i = 0; i < visibleQuestions.length; i++) {
        const originalIndex = getOriginalIndexForVisibleIndex(i);
        if (!validateQuestion(originalIndex)) {
          allValid = false;
          setCurrentStep(i + 1); // Go back to the first invalid visible question
          break;
        }
      }

      if (allValid) {
        handleSubmit();
      } else {
        setError('Please answer all required questions before submitting');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentStep(0);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // --- MODIFIED: Ensure response is explicitly an empty string for null/undefined values ---
      const respond = sortedQuestions.map((q, idx) => {
        if (q.hide) {
          return {
            ...q,
            response: '', // always empty for hidden
          };
        }
        let responseValue = responses[idx];

        // Convert null/undefined to empty string for relevant types
        if (
          responseValue === undefined ||
          responseValue === null ||
          (typeof responseValue === 'string' && responseValue.trim() === '')
        ) {
          // Only set to empty string if it's not a checkbox or file uploader
          // Checkbox should be [] and File Uploader should be {}
          if (
            q.type?.toLowerCase() !== 'checkbox' &&
            q.type?.toLowerCase() !== 'file uploader' &&
            q.type?.toLowerCase() !== 'star rating' && // Star rating might default to '0'
            q.type?.toLowerCase() !== 'scale' && // Scale might have a default value
            q.type?.toLowerCase() !== 'emojis' // Emojis has a default value
          ) {
            responseValue = '';
          }
        }
        // Special handling for number-like responses to ensure they are strings
        if (
          (q.type?.toLowerCase() === 'scale' ||
            q.type?.toLowerCase() === 'star rating') &&
          typeof responseValue === 'number'
        ) {
          responseValue = responseValue.toString();
        }

        return {
          ...q,
          response: responseValue,
        };
      });
      // --- END MODIFICATION ---

      if (isClient) {
        onSubmitClient?.(respond);
      } else {
        await Application.SaveQuestionary({
          member_id: memberId,
          q_unique_id: qId,
          respond,
        }).finally(() => {
          setTimeout(() => {
            navigate('/report/' + memberId + '/' + 'N');
          }, 2000);
        });
      }

      setCurrentStep(sortedQuestions.length + 1);

      toast({
        title: 'Survey submitted',
        description: 'Thank you for completing the survey!',
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      console.error('Failed to submit survey:', error);

      // Simulating successful submission for demo even on error, remove in production
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

  const handleResponseChange = useCallback(
    (value: string | string[] | MultiFileResponse | null) => {
      // Map the current visible question to the original index without relying on id
      const visibleIndex = Math.max(0, currentStep - 1);
      const fullQuestionIndex = getOriginalIndexForVisibleIndex(visibleIndex);

      if (fullQuestionIndex !== -1) {
        setResponses((prevResponses) => ({
          ...prevResponses,
          [fullQuestionIndex]: value,
        }));

        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fullQuestionIndex];
          return newErrors;
        });
      }

      setError(null);
    },
    [currentStep, getOriginalIndexForVisibleIndex],
  );

  const calculateProgress = () => {
    if (currentStep === 0 || visibleQuestions.length === 0) return 0;
    if (currentStep > visibleQuestions.length) return 100;
    return Math.round((currentStep / visibleQuestions.length) * 100);
  };

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
          value={[currentValue]}
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

  // --- Helper function for individual file input handling ---
  const handleIndividualFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setTempFile: React.Dispatch<
      React.SetStateAction<IndividualFileData | null>
    >,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setTempFile({
          base64: reader.result as string,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setTempFile(null);
    }
  };

  // --- Function to save temporary files to responses state ---
  const handleMultiFileUploadSave = () => {
    const newFileResponse: MultiFileResponse = {
      frontal: tempFrontal?.base64,
      back: tempBack?.base64,
      side: tempSide?.base64,
    };
    handleResponseChange(newFileResponse);
    setIsMultiUploadMode(false);
  };

  // --- Function to clear temporary files and exit upload mode ---
  const handleMultiFileUploadCancel = () => {
    setTempFrontal(null);
    setTempBack(null);
    setTempSide(null);
    setIsMultiUploadMode(false);
    handleResponseChange({}); // Set to an empty object for file upload type
  };

  const renderQuestion = (question: ApiQuestion, questionIndex: number) => {
    if (question.hide) return null;
    const questionType = question.type || 'paragraph';
    const questionOptions = getQuestionOptions(question);
    const response = responses[questionIndex];
    const validationError = validationErrors[questionIndex];

    switch (questionType.toLowerCase()) {
      case 'paragraph':
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
                } ${
                  (response as string) === option.toString()
                    ? 'border-green-500 bg-green-50'
                    : ''
                }`}
                onClick={() => handleResponseChange(option.toString())} // Make the div clickable
              >
                <RadioGroupItem
                  value={option.toString()}
                  id={`option-${questionIndex}-${index}`}
                  className="text-green-600 pointer-events-none"
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
            {questionOptions.map((option, index) => {
              const isChecked =
                Array.isArray(response) && response.includes(option);

              return (
                <div
                  key={index}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  className={`cursor-pointer flex items-start space-x-3 rounded-lg border p-4 hover:bg-slate-50 transition-colors ${
                    validationError ? 'border-red-500' : ''
                  } ${isChecked ? 'border-green-500 bg-green-50' : ''}`}
                  onClick={() => {
                    const currentValue = Array.isArray(response)
                      ? response
                      : [];
                    if (isChecked) {
                      handleResponseChange(
                        currentValue.filter((item) => item !== option),
                      );
                    } else {
                      handleResponseChange([...currentValue, option]);
                    }
                  }}
                >
                  <Checkbox
                    id={`option-${questionIndex}-${index}`}
                    checked={isChecked}
                    onCheckedChange={() => {}}
                    className="mt-1 text-green-600 border-green-600 pointer-events-none"
                  />
                  <Label
                    htmlFor={`option-${questionIndex}-${index}`}
                    className="flex-grow font-medium"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case 'scale':
        return renderScaleSlider(
          response as string,
          Number.parseInt(questionOptions[0] || '1'),
          Number.parseInt(questionOptions[1] || '10'),
          (value) => handleResponseChange(value),
        );

      case 'star rating':
        return renderStarRating(
          response as string,
          questionOptions.length || 5,
          (value) => handleResponseChange(value),
        );

      case 'emojis':
        return (
          <EmojiSelector
            currentResponse={response as string}
            onChange={handleResponseChange}
            questionIndex={questionIndex}
            currentQuestionText={getQuestionText(question)}
          />
        );

      case 'file uploader': {
        const currentFileResponse = (response || {}) as MultiFileResponse;
        const hasExistingFiles =
          currentFileResponse.frontal ||
          currentFileResponse.back ||
          currentFileResponse.side;

        return (
          <div className="bg-[#FCFCFC] p-3 w-full rounded-[12px] border border-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-[12px] text-Text-Primary">
                {questionIndex + 1}. {getQuestionText(question)}
              </div>
              {!isMultiUploadMode && (
                <div
                  onClick={() => setIsMultiUploadMode(true)}
                  className="cursor-pointer flex justify-end items-center gap-1"
                >
                  <UploadCloud className="w-4 h-4 text-Primary-EmeraldGreen" />
                  <span className="text-Primary-EmeraldGreen text-[10px] font-medium">
                    {hasExistingFiles ? 'Re-upload' : 'Upload'}
                  </span>
                </div>
              )}
            </div>

            {isMultiUploadMode ? (
              <>
                <div className="w-full bg-white rounded-[8px] p-2 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-[12px] text-[#B0B0B0]">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleMultiFileUploadCancel}
                        className="w-6 h-6 border-[1.6px] border-[#FC5474] rounded-[8px] p-0 flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-[#FC5474]" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleMultiFileUploadSave}
                        className="w-6 h-6 border-[1.6px] border-Primary-EmeraldGreen bg-Primary-EmeraldGreen rounded-[8px] p-0 flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-[#FFFFFF]" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 justify-items-center mt-2">
                    {/* Frontal File Input */}
                    <div className="flex flex-col items-center w-full sm:max-w-[112px]">
                      <label
                        htmlFor={`frontal-upload-${questionIndex}`}
                        className="cursor-pointer p-4 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center  size-52 sm:size-28  overflow-hidden bg-white"
                      >
                        {tempFrontal?.base64 ? (
                          <img
                            src={tempFrontal.base64}
                            alt="Frontal Preview"
                            className="w-full h-full object-contain rounded"
                          />
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-gray-400" />
                            <span className="text-gray-500 text-xs mt-1">
                              Frontal
                            </span>
                          </>
                        )}
                      </label>
                      <input
                        type="file"
                        id={`frontal-upload-${questionIndex}`}
                        className="hidden"
                        onChange={(e) =>
                          handleIndividualFileChange(e, setTempFrontal)
                        }
                        accept="image/*"
                      />
                      {tempFrontal?.base64 && (
                        <button
                          type="button"
                          onClick={() => setTempFrontal(null)}
                          className="text-red-500 text-xs mt-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Back File Input */}
                    <div className="flex flex-col items-center w-full sm:max-w-[112px]">
                      <label
                        htmlFor={`back-upload-${questionIndex}`}
                        className="cursor-pointer p-4 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center   size-52 sm:size-28 overflow-hidden bg-white"
                      >
                        {tempBack?.base64 ? (
                          <img
                            src={tempBack.base64}
                            alt="Back Preview"
                            className="w-full h-full object-contain rounded"
                          />
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-gray-400" />
                            <span className="text-gray-500 text-xs mt-1">
                              Back
                            </span>
                          </>
                        )}
                      </label>
                      <input
                        type="file"
                        id={`back-upload-${questionIndex}`}
                        className="hidden"
                        onChange={(e) =>
                          handleIndividualFileChange(e, setTempBack)
                        }
                        accept="image/*"
                      />
                      {tempBack?.base64 && (
                        <button
                          type="button"
                          onClick={() => setTempBack(null)}
                          className="text-red-500 text-xs mt-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Side File Input */}
                    <div className="flex flex-col items-center w-full sm:max-w-[112px]">
                      <label
                        htmlFor={`side-upload-${questionIndex}`}
                        className="cursor-pointer p-4 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center size-52 sm:size-28 overflow-hidden bg-white"
                      >
                        {tempSide?.base64 ? (
                          <img
                            src={tempSide.base64}
                            alt="Side Preview"
                            className="w-full h-full object-contain rounded"
                          />
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-gray-400" />
                            <span className="text-gray-500 text-xs mt-1">
                              Side
                            </span>
                          </>
                        )}
                      </label>
                      <input
                        type="file"
                        id={`side-upload-${questionIndex}`}
                        className="hidden"
                        onChange={(e) =>
                          handleIndividualFileChange(e, setTempSide)
                        }
                        accept="image/*"
                      />
                      {tempSide?.base64 && (
                        <button
                          type="button"
                          onClick={() => setTempSide(null)}
                          className="text-red-500 text-xs mt-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : hasExistingFiles ? (
              <div className="mt-2 grid grid-cols-3 gap-4 justify-items-center">
                {currentFileResponse.frontal && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-600 mb-1">
                      Frontal
                    </span>
                    <div className="w-28 h-28 border border-gray-200 rounded-md overflow-hidden bg-white">
                      <img
                        src={currentFileResponse.frontal}
                        alt="Frontal"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                {currentFileResponse.back && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-600 mb-1">Back</span>
                    <div className="w-28 h-28 border border-gray-200 rounded-md overflow-hidden bg-white">
                      <img
                        src={currentFileResponse.back}
                        alt="Back"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                {currentFileResponse.side && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-600 mb-1">Side</span>
                    <div className="w-28 h-28 border border-gray-200 rounded-md overflow-hidden bg-white">
                      <img
                        src={currentFileResponse.side}
                        alt="Side"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 text-[#B0B0B0] text-[10px]">
                No files yet.
              </div>
            )}
            {validationError && (
              <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{validationError}</span>
              </div>
            )}
          </div>
        );
      }

      case 'yes/no':
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
    <div className="container max-w-4xl mx-auto px-1 xl:px-4 py-10">
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
              This survey contains {visibleQuestions.length} questions and will
              take approximately {Math.ceil(visibleQuestions.length * 0.5)}{' '}
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
          className="bg-white shadow-xl  border-0 flex flex-col relative"
        >
          <CardHeader>
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${gradientClass} mb-4`}
            >
              Question {currentStep} of {visibleQuestions.length}
            </div>
            <CardTitle className="text-base 2xl:text-2xl font-bold">
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
          <CardContent className="space-y-6 h-[60%]  pb-20 overflow-auto">
            {renderQuestion(
              currentQuestion,
              getOriginalIndexForVisibleIndex(currentStep - 1),
            )}

            {validationErrors[getOriginalIndexForVisibleIndex(currentStep - 1)] && (
              <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{validationErrors[getOriginalIndexForVisibleIndex(currentStep - 1)]}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-4 absolute bottom-0 w-full bg-white">
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
              className={`bg-gradient-to-r ${gradientClass} -end hover:brightness-105 transition-all text-white`}
            >
              {currentStep === visibleQuestions.length
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
