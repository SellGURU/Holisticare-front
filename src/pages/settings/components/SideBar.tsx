import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
type SidebarProps = {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu }) => {
  const menuItems = useMemo(
    () => ({
      General: [
        {
          title: 'Clinic Preferences',
          isActive: true,
        },
        {
          title: 'Language & Region',
          isActive: false,
        },
        {
          title: 'Change Password',
          isActive: false,
        },
      ],
      'Integrations & AI': [
        {
          title: 'Integrations',
          isActive: false,
        },
        {
          title: 'AI Preferences',
          isActive: false,
        },
      ],
      Account: [
        {
          title: 'Notifications',
          isActive: false,
        },
        {
          title: 'Subscription',
          isActive: false,
        },
      ],
    }),
    [],
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const handleMenuClick = (item: string) => {
    setActiveMenu(item);
    setSearchParams({ section: item.replace(/\s+/g, '-').toLowerCase() });
  };
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      const menuItem = Object.values(menuItems)
        .flat()
        .find(
          (item) => item.title.replace(/\s+/g, '-').toLowerCase() === section,
        );
      if (menuItem) {
        setActiveMenu(menuItem.title);
      }
    }
  }, [searchParams, setActiveMenu, menuItems]);
  return (
    <div className="w-[180px] bg-transparent pt-5 ">
      <div className="space-y-8">
        {Object.entries(menuItems).map(([category, subItems]) => (
          <div key={category}>
            <h3 className="text-[#B0B0B0] text-[10px]  my-2">{category}</h3>
            <ul className="space-y-3 ">
              {subItems.map((item) => (
                <li
                  key={item.title}
                  className={` ${item.isActive ? '' : 'opacity-50 cursor-not-allowed'} flex items-center cursor-pointer text-nowrap text-base ${
                    activeMenu === item.title
                      ? 'text-Primary-DeepTeal text-sm'
                      : 'text-[#888888]'
                  }`}
                  onClick={() => {
                    if (item.isActive) {
                      handleMenuClick(item.title);
                    }
                  }}
                >
                  {activeMenu === item.title && (
                    <img alt="" src="/icons/arrow-right-small.svg" />
                  )}
                  {item.title}
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
