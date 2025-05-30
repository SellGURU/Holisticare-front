// import { useState } from 'react';

import { useState } from 'react';
import SectionOrderModal from './SectionOrder';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation = ({ activeTab, setActiveTab }: TabNavigationProps) => {
  // const [activeTab, setActiveTab] = useState('Warm-Up');

  const [tabs, setTabs] = useState([
    { name: 'Warm-Up', visible: true },
    { name: 'Main work out', visible: true },
    { name: 'Cool Down', visible: true },
    { name: 'Recovery', visible: true },
    { name: 'Finisher', visible: true },
  ]);
  const [showSectionOrder, setShowSectionOrder] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between border-b border-Gray-50 mb-4">
        <div className="flex gap-2 flex-grow-[1]">
          {tabs
            .filter((tab) => tab.visible)
            .map((tab) => (
              <div
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`text-sm transition-all duration-300 cursor-pointer min-w-[12%] flex items-center justify-center flex-col ${
                  activeTab === tab.name
                    ? 'font-medium bg-gradient-to-r from-[#005F73] to-[#6CC24A] bg-clip-text text-transparent'
                    : 'text-Text-Quadruple hover:text-Gray-500'
                }`}
              >
                {tab.name}
                <div
                  className={`w-full h-[1px] ${activeTab === tab.name && 'bg-Primary-DeepTeal'} mt-2.5 -mb-[3px]`}
                ></div>
              </div>
            ))}
        </div>
        <img
          src="/icons/setting-4.svg"
          alt=""
          className="w-6 h-6 cursor-pointer mb-2"
          onClick={() => setShowSectionOrder(true)}
        />
      </div>
      <SectionOrderModal
        isOpen={showSectionOrder}
        onClose={() => setShowSectionOrder(false)}
        onConfirm={(values) => {
          setTabs(values);
          setActiveTab(values[0].name);
          setShowSectionOrder(false);
        }}
      />
    </>
  );
};

export default TabNavigation;
