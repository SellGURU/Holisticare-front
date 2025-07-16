import { useRef, useState } from 'react';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import Circleloader from '../../Components/CircleLoader';
// import BoxActivity from './components/BoxActivity';
import BoxTexts from './components/BoxTexts';
import BoxTitleText from './components/BoxTitleText';
import BoxValue from './components/BoxValue';
import Frequency from './components/Frequency';
import RenderNutrient from './components/RenderNutrient';
import Times from './components/Times';
// import { mockData } from './mockData';

const Tasks = () => {
  const [isLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const [value, setValue] = useState(6);
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
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollUp = () => {
    scrollRef.current?.scrollBy({ top: -100, behavior: 'smooth' });
  };

  const scrollDown = () => {
    scrollRef.current?.scrollBy({ top: 100, behavior: 'smooth' });
  };

  return (
    <>
      <div
        className="w-full py-3 px-4 h-[82vh] overflow-y-scroll"
        ref={scrollRef}
      >
        {isLoading ? (
          <>
            <div className="flex justify-center items-center mt-20">
              <Circleloader></Circleloader>
            </div>
          </>
        ) : (
          <div className="flex flex-col w-full h-full gap-2">
            <BoxTitleText title="Description" text="test amir" />
            <BoxTitleText title="Instruction" text="test amir 2" />
            <Frequency type="weekly" data={['sun']} />
            <Times times={['Morning']} />
            <div className="w-full p-3 rounded-xl border border-Gray-15 bg-backgroundColor-Secondary flex flex-col gap-2">
              <div className="text-xs font-medium text-Text-Primary">
                Macros Goal
              </div>
              <div className="flex items-center flex-grow-[1] justify-between">
                {RenderNutrient('Carbs', 21, '/icons/carbs-preview.svg')}
                {RenderNutrient('Proteins', 9, '/icons/proteins-preview.svg')}
                {RenderNutrient('Fats', 5, '/icons/fats-preview.svg')}
              </div>
            </div>
            <BoxTitleText title="Dose" text="500mg" />
            <BoxValue title="Value" value={value} setVal={setValue} />
            <BoxTexts texts={['Carbs', 'Proteins', 'Fats']} />
            {/* <BoxActivity activities={mockData} /> */}
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
          </div>
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
      </div>
      <div className="fixed bottom-36 right-4 flex flex-col gap-2 z-50">
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

export default Tasks;
