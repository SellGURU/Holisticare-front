import { useEffect, useState } from 'react';
import Toggle from '../../../Components/RepoerAnalyse/Boxs/Toggle';

export const ShowTutorial = () => {
  const [hasTutorial, setHasTutorial] = useState(true);
  useEffect(() => {
    const tutorial = localStorage.getItem('showTutorialAgain');
    if (tutorial === 'true') {
      setHasTutorial(true);
    } else if (tutorial === 'false') {
      setHasTutorial(false);
    } else {
      setHasTutorial(true);
      localStorage.setItem('showTutorialAgain', 'true');
    }
  }, []);
  return (
    <div className="bg-backgroundColor-Card h-fit min-h-[348px] border border-Gray-50 w-full rounded-2xl relative shadow-100 p-4 text-Text-Primary ">
      <div className="text-sm font-medium ">Show Tutorial</div>
      <div className="text-[10px] text-[#888888] my-2">
        View the tutorial to learn how to use the platform.
      </div>

      <div className="w-full flex items-center gap-4 mt-4">
        <div>
          You can turn the help display on or off using the toggle button below:
        </div>
        <Toggle
          checked={hasTutorial}
          setChecked={(value) => {
            if (value) {
              localStorage.setItem('showTutorialAgain', 'true');
            } else {
              localStorage.setItem('showTutorialAgain', 'false');
            }
            setHasTutorial(value);
          }}
        />
        <div className="text-[10px] text-[#888888]">
          {hasTutorial ? 'On' : 'Off'}
        </div>
      </div>
    </div>
  );
};
