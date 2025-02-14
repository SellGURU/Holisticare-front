import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ActivityMenu from '../../Components/ActivityMenu';
import AiChat from '../../Components/AiChat';
import { Action } from './Action';
type menuItem = {
  name: string;
};
export const Client = () => {
  const menus: Array<menuItem> = [
    // { name: "Overview" },
    { name: 'Action' },

    { name: 'Copilot' },

    // { name: "Generate Report" },
  ];
  const { name, id } = useParams();
  const [activeMenu, setActiveMenu] = useState('Action');
  console.log(id);

  const memberId = id ? parseInt(id) : null;
  const navigate = useNavigate();
  return (
    <div className="w-[100vw] h-full bg-[#E9F0F2]">
      <div className="flex items-cente gap-2 py-[10px] px-6 shadow-100 text-sm font-medium text-Text-Primary ">
        <img onClick={() => navigate(-1)} src="/icons/arrow-back.svg" alt="" />
        {name}
      </div>
      <div className="w-full mt-4 flex flex-col items-center">
        <div className="w-[218px] flex justify-center">
          <ActivityMenu
            activeMenu={activeMenu}
            menus={menus}
            onChangeMenuAction={(menu) => setActiveMenu(menu)}
          />
        </div>
        <div className="w-full px-5 mt-3">
          {activeMenu === 'Copilot' ? (
            <AiChat memberID={memberId} />
          ) : (
            <Action memberID={memberId}></Action>
          )}
        </div>
      </div>
    </div>
  );
};
