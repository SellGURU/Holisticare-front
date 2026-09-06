/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Mobile from '../../api/mobile';
import Circleloader from '../../Components/CircleLoader';
import { PublicSurveyForm } from '../../Components/survey/public-survey-form';
import { resolvePublicFillLeaveMode } from '../../utils/publicClientPath';
// import mokQuestionary from './mokQuestionary.json';
interface FormViewProps {
  mode?: 'questionary' | 'checkin';
}

const FormView: React.FC<FormViewProps> = ({ mode }) => {
  const { encode, id, 'f-id': fId } = useParams();
  const [isLoading, setIsLaoding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const leaveFillSurface = () => {
    if (resolvePublicFillLeaveMode(window) === 'iframe') {
      window.parent.postMessage({ type: 'QUESTIONARY_SUBMITTED' }, '*');
    }
    window.flutter_inappwebview?.callHandler('questionarySubmitted');
  };
  useEffect(() => {
    setIsLaoding(true);
    setLoadError(null);

    const handleLoaded = (response: { data?: any }) => {
      const payload = response?.data;
      if (!payload || !Array.isArray(payload.questions)) {
        setLoadError(
          'Could not load this questionnaire. Please try again or contact your clinic.',
        );
        setIsLaoding(false);
        return;
      }
      setData(payload);
      setIsLaoding(false);
    };

    const handleLoadError = (error: any) => {
      const detail =
        error?.response?.data?.detail ||
        error?.message ||
        'Could not load this questionnaire.';
      if (
        typeof detail === 'string' &&
        detail.toLowerCase().includes('already answered')
      ) {
        setIsComplete(true);
        setLoadError(null);
      } else {
        setLoadError(
          typeof detail === 'string'
            ? detail
            : 'Could not load this questionnaire.',
        );
      }
      setIsLaoding(false);
    };

    if (mode == 'questionary') {
      Mobile.getQuestionaryEmpty({
        encoded_mi: encode as string,
        unique_id: id as string,
        f_unique_id: fId as string,
      })
        .then(handleLoaded)
        .catch(handleLoadError);
    } else {
      Mobile.getCheckInEmpty({
        encoded_mi: encode as string,
        unique_id: id as string,
      })
        .then(handleLoaded)
        .catch(handleLoadError);
    }
  }, [encode, fId, id, mode]);
  const submit = (e: any) => {
    // setIsLaoding(true);
    const apiCall =
      mode === 'questionary' ? Mobile.fillQuestionary : Mobile.fillCheckin;

    const dataQuestionary = {
      encoded_mi: encode,
      unique_id: id,
      respond: e,
      f_unique_id: fId || '',
    };

    const dataCheckin = {
      encoded_mi: encode,
      unique_id: id,
      respond: e,
    };

    apiCall(mode === 'questionary' ? dataQuestionary : dataCheckin)
      .then(() => {
        setSubmitted(true);
        setTimeout(() => {
          leaveFillSurface();
        }, 1500);
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        const detail =
          error?.response?.data?.detail ||
          error?.detail ||
          error?.message ||
          'Could not submit this questionnaire. Please try again.';
        setLoadError(
          typeof detail === 'string'
            ? detail
            : 'Could not submit this questionnaire. Please try again.',
        );
      })
      .finally(() => {
        setIsLaoding(false);
      });
  };
  const autoSave = (e: any) => {
    Mobile.autoSaveQuestionary({
      encoded_mi: encode,
      unique_id: id,
      respond: e,
      f_unique_id: fId || '',
    }).catch(() => {});
  };
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // const scrollUp = () => {
  //   scrollRef.current?.scrollBy({ top: -100, behavior: 'smooth' });
  // };

  // const scrollDown = () => {
  //   scrollRef.current?.scrollBy({ top: 100, behavior: 'smooth' });
  // };
  return (
    <>
      <div
        className="w-full py-3 px-4 h-svh pb-[150px] overflow-y-scroll"
        ref={scrollRef}
      >
        {submitted || isComplete ? (
          <div className="py-4">
            <div className="text-[12px] text-Text-Secondary text-center">
              {submitted
                ? 'Thank you. Your answers were submitted.'
                : mode == 'questionary'
                  ? 'This Questionary is already answered.'
                  : 'This Checkin is already answered.'}
            </div>
          </div>
        ) : (
          <>
            {isLoading ? (
              <>
                <div className="flex justify-center items-center mt-20">
                  <Circleloader></Circleloader>
                </div>
              </>
            ) : loadError ? (
              <div className="py-4">
                <div className="text-[12px] text-Text-Secondary text-center">
                  {loadError}
                </div>
              </div>
            ) : (
              <>
                <PublicSurveyForm
                  onSubmitClient={(e) => {
                    submit(e);
                  }}
                  isClient={true}
                  isQuestionary={mode === 'questionary'}
                  survey={data}
                  onAutoSaveClient={(e) => {
                    autoSave(e);
                  }}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        <button
          onClick={scrollUp}
          className="bg-white border border-gray-300 shadow-md rounded-full p-2 hover:bg-gray-100 transition"
        >
          <img
            src="/icons/arrow-up.svg"
            alt="Scroll Up"
            className="w-4 h-4 rotate-90"
          />
        </button>
      </div>
      <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50">
        <button
          onClick={scrollDown}
          className="bg-white border border-gray-300 shadow-md rounded-full p-2 hover:bg-gray-100 transition"
        >
          <img
            src="/icons/arrow-down-blue.svg"
            alt="Scroll Down"
            className="w-4 h-4"
          />
        </button>
      </div> */}
    </>
  );
};

export default FormView;
