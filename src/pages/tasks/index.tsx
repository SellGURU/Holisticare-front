import { useState } from 'react';
import Circleloader from '../../Components/CircleLoader';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';

const Tasks = () => {
  const [isLoading, setIsLaoding] = useState(false);
  const [status, setStatus] = useState(false);
  const submit = () => {
    // setIsLaoding(true);
    // Mobile.test().finally(() => {
    //   if (window.flutter_inappwebview) {
    //     window.flutter_inappwebview.callHandler('closeWebView');
    //   } else {
    //     console.warn('Flutter WebView bridge not available');
    //   }
    //   setIsComplete(true);
    // });
  };
  return (
    <>
      <div className="w-full py-3 px-4 h-svh pb-[150px] overflow-y-scroll">
        {isLoading ? (
          <>
            <div className="flex justify-center items-center mt-20">
              <Circleloader></Circleloader>
            </div>
          </>
        ) : (
          <>
            <div className="w-full flex flex-col gap-2 justify-center fixed bottom-0 bg-white left-0 mt-2 border-t border-Gray-50 shadow-Btn px-6 py-4">
              <div className="bg-backgroundColor-Main rounded-xl p-3 w-full flex items-center justify-between">
                <div className="text-Text-Primary text-xs font-medium">
                  Status
                </div>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                    className="hidden"
                  />
                  <div
                    className={`w-[14px] h-[14px] flex items-center justify-center rounded ${
                      status
                        ? 'bg-Primary-DeepTeal'
                        : 'bg-white border border-Text-Quadruple'
                    }`}
                  >
                    {status && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-Text-Primary">Done</span>
                </label>
              </div>
              <div className="w-full">
                <ButtonPrimary
                  ClassName="w-full text-sm font-medium h-[40px] border border-bg-color"
                  onClick={submit}
                >
                  Save Changes
                </ButtonPrimary>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Tasks;
