import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../hooks';
import { localeSelectorEnabled } from '../../../i18n';
import { navKey } from '../../../i18n/wave1Resources';

type SidebarProps = {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  loginWithGoogle: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  setActiveMenu,
  loginWithGoogle,
}) => {
  const { t } = useTranslation(['settings', 'nav']);
  const { accountRole } = useApp();
  const showLanguage = localeSelectorEnabled();
  const isAdmin =
    String(accountRole || '')
      .trim()
      .toLowerCase() === 'admin';

  const menuItems = useMemo(
    () => ({
      General: [
        {
          title: 'Clinic Profile',
          isActive: isAdmin,
        },
        {
          title: 'Clinic Preferences',
          isActive: true,
        },
        {
          title: 'Language & Region',
          isActive: showLanguage,
        },
        {
          title: 'Change Password',
          isActive: loginWithGoogle === false,
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
          isActive: isAdmin,
        },
        {
          title: 'Privacy',
          isActive: true,
        },
      ],
    }),
    [isAdmin, loginWithGoogle, showLanguage],
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const handleMenuClick = (item: string) => {
    setActiveMenu(item);
    setSearchParams({ section: item.replace(/\s+/g, '-').toLowerCase() });
  };
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      const aliases: Record<string, string> = {
        'chat-privacy': 'privacy',
        'show-tutorial': 'privacy',
      };
      const resolved = aliases[section] || section;
      const menuItem = Object.values(menuItems)
        .flat()
        .find(
          (item) => item.title.replace(/\s+/g, '-').toLowerCase() === resolved,
        );
      if (menuItem?.isActive) {
        setActiveMenu(menuItem.title);
      }
    }
  }, [searchParams, setActiveMenu, menuItems]);
  return (
    <div className="w-[180px] bg-transparent pt-5 ">
      <div className="space-y-8">
        {Object.entries(menuItems).map(([category, subItems]) => (
          <div key={category}>
            <h3 className="text-[#B0B0B0] text-[10px] font-normal  my-2">
              {t(`settings:menu.${navKey(category)}`, { defaultValue: category })}
            </h3>
            <ul className="space-y-3 ">
              {subItems.map((item) => (
                <li
                  key={item.title}
                  className={`${loginWithGoogle && item.title === 'Change Password' ? 'hidden' : ''} ${item.isActive ? 'cursor-pointer' : 'cursor-not-allowed'} font-medium text-sm flex items-center  text-nowrap  ${
                    activeMenu === item.title
                      ? 'text-Primary-DeepTeal '
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
                  {t(`settings:menu.${navKey(item.title)}`, {
                    defaultValue: item.title,
                  })}
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
