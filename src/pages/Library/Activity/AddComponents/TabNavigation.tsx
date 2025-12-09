/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from 'react';

import { useEffect, useState } from 'react';
import { SelectBoxField } from '../../../../Components/UnitComponents';
import SectionOrderModal from './SectionOrder';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  orderList?: { name: string; enabled: boolean; order: number }[];
  handleChangeSetOrder?: (value: any) => void;
}

const TabNavigation = ({
  activeTab,
  setActiveTab,
  orderList,
  handleChangeSetOrder,
}: TabNavigationProps) => {
  // const [activeTab, setActiveTab] = useState('Warm-Up');

  const [tabs, setTabs] = useState(
    orderList || [
      { name: 'Warm-Up', enabled: true, order: 1 },
      { name: 'Main work out', enabled: true, order: 2 },
      { name: 'Cool Down', enabled: true, order: 3 },
      { name: 'Recovery', enabled: true, order: 4 },
      { name: 'Finisher', enabled: true, order: 5 },
    ],
  );
  // "name": "Warm-Up", "enabled": True, "order": 1
  const [showSectionOrder, setShowSectionOrder] = useState(false);
  const [isMobilePage, setIsMobilePage] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobilePage(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <>
      <div className="flex items-center justify-between border-b border-Gray-50 mb-4 gap-3 md:gap-0 pr-2 md:pr-0">
        {isMobilePage ? (
          <>
            <SelectBoxField
              label=""
              options={tabs
                .filter((tab) => tab.enabled)
                .sort((a, b) => a.order - b.order)
                .map((tab) => tab.name)}
              value={activeTab}
              onChange={(value) => {
                setActiveTab(value);
              }}
              margin="mb-2"
              top="top-[31px]"
              placeholder=""
            />
          </>
        ) : (
          <div className={`flex gap-2 flex-grow-[1] whitespace-nowrap`}>
            {tabs
              .filter((tab) => tab.enabled)
              .sort((a, b) => a.order - b.order)
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
        )}
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
        orderList={tabs}
        onConfirm={(values) => {
          setTabs(values);
          handleChangeSetOrder?.(values);
          setActiveTab(values[0].name);
          setShowSectionOrder(false);
        }}
      />
    </>
  );
};

export default TabNavigation;
