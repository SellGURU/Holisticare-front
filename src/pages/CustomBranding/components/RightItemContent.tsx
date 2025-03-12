import { FC, useState } from 'react';
import EmailOverview from './EmailOverview';
import TheAppOverview from './TheAppOverview';
import ToggleCustomBranding from './Toggle';

interface RightItemContentProps {
  customTheme: {
    primaryColor: string;
    secondaryColor: string;
    selectedImage: string | null;
    name: string;
    headLine: string;
  };
}

const RightItemContent: FC<RightItemContentProps> = ({ customTheme }) => {
  const [activeToggle, setActiveToggle] = useState('The App Overview');
  return (
    <div className="flex-grow-[1] h-full bg-backgroundColor-Card border border-Gray-50 rounded-2xl p-4 shadow-100">
      <div className="w-full h-full">
        <div className="text-sm font-medium text-Text-Primary">Preview</div>
        <div className="text-[10px] text-Text-Quadruple mt-3">
          This section shows users with a quick, interactive display and
          allowing you to see a sample before making a full commitment or
          decision.
        </div>
        <div className="w-full mt-6 flex flex-col items-center gap-7">
          <ToggleCustomBranding
            active={activeToggle}
            setActive={setActiveToggle}
            value={[
              'The App Overview',
              'E-mail Overview',
              'Health Plan Overview',
            ]}
          />
          {activeToggle === 'The App Overview' ? (
            <TheAppOverview customTheme={customTheme} />
          ) : activeToggle === 'E-mail Overview' ? (
            <EmailOverview customTheme={customTheme} />
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  );
};

export default RightItemContent;
