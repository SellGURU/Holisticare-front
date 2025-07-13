/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Checkin from '.';
import Mobile from '../../api/mobile';
// import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import Circleloader from '../../Components/CircleLoader';

interface FormViewProps {
  mode?: 'questionary' | 'checkin';
}

const FormView: React.FC<FormViewProps> = ({ mode }) => {
  const { encode, id } = useParams();
  const [isLoading, setIsLaoding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  // const formData = {
  //   title: 'Daily Check in',
  //   questions: [
  //     {
  //       type: 'paragraph',
  //       question: 'Did you stick to the Meal Plan?',
  //       required: false,
  //       response: '',
  //       placeHolder: 'Write the snacks you took ...',
  //     },
  //     {
  //       type: 'Scale',
  //       question: 'How many hours did you sleep yesterday?',
  //       required: false,
  //       response: '',
  //     },
  //     {
  //       type: 'Emojis',
  //       question: 'How are you feeling today?',
  //       required: false,
  //       response: '',
  //     },
  //     {
  //       type: 'Star Rating',
  //       question: 'Rate your workout.',
  //       required: false,
  //       response: '',
  //     },
  //     {
  //       type: 'File Uploader',
  //       question: 'Upload your progress pictures.',
  //       required: false,
  //       response: '',
  //     },
  //     {
  //       type: 'paragraph',
  //       question: 'What snacks did you take today?',
  //       required: false,
  //       response: '',
  //       placeHolder: 'Write the snacks you took ...',
  //     },
  //     {
  //       type: 'paragraph',
  //       question: 'How many hours did you work today?(Dropdown sample)',
  //       required: false,
  //       response: '',
  //       placeHolder: 'Write the snacks you took ...',
  //     },
  //   ],
  // };
  const [data, setData] = useState<any>(null);
  const [resolvedData, setResolvedData] = useState<any>(null);
  useEffect(() => {
    setIsLaoding(true);
    if (mode == 'questionary') {
      Mobile.getQuestionaryEmpty({
        encoded_mi: encode as string,
        unique_id: id as string,
      }).then((e) => {
        setData(e.data);
        setIsLaoding(false);
      });
    } else {
      Mobile.getCheckInEmpty({
        encoded_mi: encode as string,
        unique_id: id as string,
      }).then((e) => {
        setData(e.data);
        setIsLaoding(false);
      });
    }
  }, []);
  const submit = () => {
    setIsLaoding(true);
    // window.close();
    if (mode == 'questionary') {
      Mobile.fillQuestionary({
        encoded_mi: encode,
        unique_id: id,
        respond: resolvedData.questions,
      }).finally(() => {
        if (window.flutter_inappwebview) {
          window.flutter_inappwebview.callHandler('closeWebView');
        } else {
          console.warn('Flutter WebView bridge not available');
        }
        setIsComplete(true);
        // window.flutter_inappwebview.callHandler('closeWebView')
        // setIsLaoding(false)
      });
    } else {
      Mobile.fillCheckin({
        encoded_mi: encode,
        unique_id: id,
        respond: resolvedData.questions,
      }).finally(() => {
        if (window.flutter_inappwebview) {
          window.flutter_inappwebview.callHandler('closeWebView');
        } else {
          console.warn('Flutter WebView bridge not available');
        }
        setIsComplete(true);
      });
    }
  };
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollUp = () => {
    scrollRef.current?.scrollBy({ top: -200, behavior: 'smooth' });
  };

  const scrollDown = () => {
    scrollRef.current?.scrollBy({ top: 200, behavior: 'smooth' });
  };
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
                <Checkin
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
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
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
      </div>
    </>
  );
};

export default FormView;
