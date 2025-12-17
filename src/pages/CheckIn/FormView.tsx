/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
// import Checkin from '.';
import Mobile from '../../api/mobile';
// import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
// import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import Circleloader from '../../Components/CircleLoader';
import { PublicSurveyForm } from '../../Components/survey/public-survey-form';
// import Checkin from '.';

interface FormViewProps {
  mode?: 'questionary' | 'checkin';
}

const FormView: React.FC<FormViewProps> = ({ mode }) => {
  const { encode, id, 'f-id': fId } = useParams();
  const [isLoading, setIsLaoding] = useState(false);
  const [isComplete] = useState(false);

  const [data, setData] = useState<any>(null);
  // const [resolvedData, ] = useState<any>(null);
  useEffect(() => {
    setIsLaoding(true);
    if (mode == 'questionary') {
      Mobile.getQuestionaryEmpty({
        encoded_mi: encode as string,
        unique_id: id as string,
        f_unique_id: fId as string,
      })
        .then((e) => {
          setData(e.data);
          setIsLaoding(false);
        })
        .catch(() => {});
    } else {
      Mobile.getCheckInEmpty({
        encoded_mi: encode as string,
        unique_id: id as string,
      })
        .then((e) => {
          setData(e.data);
          setIsLaoding(false);
        })
        .catch(() => {});
    }
  }, []);
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
        // On successful submission, update state and then close the window
        setTimeout(() => {
          if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('closeWebView');
          } else {
            console.warn(
              'Flutter WebView bridge not available, attempting to close window.',
            );
            window.close();
            window.parent.postMessage({ type: 'QUESTIONARY_SUBMITTED' }, '*');
          }
        }, 1500); // Wait for 1.5 seconds to give the user time to see the success message
      })
      .catch((error) => {
        // Handle submission error, but still might want to close for a clean slate
        console.error('Error submitting form:', error);
        if (window.flutter_inappwebview) {
          window.flutter_inappwebview.callHandler('closeWebView');
        } else {
          window.close();
          window.parent.postMessage({ type: 'QUESTIONARY_SUBMITTED' }, '*');
        }
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
        {isComplete ? (
          <div className="py-4">
            <div className="text-[12px] text-Text-Secondary text-center">
              {mode == 'questionary'
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
            ) : (
              <>
                <PublicSurveyForm
                  onSubmitClient={(e) => {
                    submit(e);
                    // Mobile.fillQuestionary({
                    //   encoded_mi: encode,
                    //   unique_id: id,
                    //   respond: e,
                    // }).finally(() => {
                    //   if (window.flutter_inappwebview) {
                    //     window.flutter_inappwebview.callHandler(
                    //       'closeWebView',
                    //     );
                    //   } else {
                    //     console.warn('Flutter WebView bridge not available');
                    //   }
                    //   setIsComplete(true);
                    //   // window.flutter_inappwebview.callHandler('closeWebView')
                    //   // setIsLaoding(false)
                    // });
                  }}
                  isClient={true}
                  isQuestionary={mode === 'questionary'}
                  survey={data}
                  onAutoSaveClient={(e) => {
                    autoSave(e);
                  }}
                />
                {/* <Checkin
                      upData={data?.questions}
                      onChange={(questions) => {
                        console.log(questions);
                        setResolvedData({
                          ...data,
                          questions: questions,
                        });
                      }}
                    ></Checkin>
                    <div className="w-full flex justify-center fixed bottom-0 bg-white h-[50px] left-0 my-2">
                      <div className="w-full px-6">
                        <ButtonPrimary ClassName="w-full" onClick={submit}>
                          save
                        </ButtonPrimary>
                      </div>
                    </div> */}
                {/* </> */}
                {/* )} */}
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
