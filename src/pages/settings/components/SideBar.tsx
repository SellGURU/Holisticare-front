import React from 'react';

type SidebarProps = {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu }) => {
  const menuItems = {
    Account: [
      'Overview',
      'Update Your Profile',
      'Change Password',
      'Zapier',
      'Share feedback',
    ],
    Clinic: [
      'Staff',
      'Community',
      'Plan Priority',
      'Customize Questionnaire',
      'Integration',
      'Biomarkers',
    ],
    Archive: ['Surveys', 'Previous Clients'],
  };

  return (
    <div className="w-[180px] bg-transparent pt-5">
      <div className="space-y-8">
        {Object.entries(menuItems).map(([category, subItems]) => (
          <div key={category}>
            <h3 className="text-Text-Triarty text-xs  my-2">{category}</h3>
            <ul className="space-y-3 ">
              {subItems.map((item) => (
                <li
                  key={item}
                  className={`flex items-center cursor-pointer text-nowrap text-base ${
                    activeMenu === item
                      ? 'text-Primary-DeepTeal font-medium'
                      : 'text-Text-Secondary'
                  }`}
                  onClick={() => setActiveMenu(item)}
                >
                  {activeMenu === item && (
                    <img alt="" src="/icons/arrow-right-small.svg" />
                  )}
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
