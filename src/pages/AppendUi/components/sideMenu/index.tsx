/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  ClipboardList,
  LampDesk,
  Network,
  Palette,
  FlaskConical,
  Pill,
  PackageOpen,
  Settings,
  Activity,
  Plug,
  Shield,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { subscribe } from '../../../../utils/event';

const sidebarGroups = [
  {
    group: 'CLINICAL',
    items: [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        key: 'dashboard',
        url: '/dashboard',
      },
      { icon: Users, label: 'Clients', key: 'clients', url: '/' },
      {
        icon: MessageSquare,
        label: 'Messages',
        key: 'messages',
        badge: 4,
        url: '/messages',
      },
      {
        icon: Network,
        label: 'Knowledge Graph',
        key: 'knowledge-graph',
        url: '/aiKnowledge',
      },
      {
        icon: LampDesk,
        label: 'Playground',
        key: 'playground',
        url: '/playground',
      },
    ],
  },
  {
    group: 'CLINICAL ENGINE',
    items: [
      {
        icon: FlaskConical,
        label: 'Biomarkers',
        key: 'biomarkers',
        url: '/biomarkers',
      },
      { icon: ClipboardList, label: 'Forms', key: 'forms', url: '/forms' },
      {
        icon: Pill,
        label: 'Intervention Library',
        key: 'intervention-library',
        url: '/diet',
      },
    ],
  },
  {
    group: 'BRAND & EXPERIENCE',
    items: [
      {
        icon: Palette,
        label: 'Branding',
        key: 'branding',
        url: '/custom-branding',
      },
    ],
  },
  {
    group: 'INTEGRATIONS',
    items: [
      { icon: Plug, label: 'FHIR', key: 'fhir', url: '/fhir-integration' },
    ],
  },
  {
    group: 'ORGANIZATION',
    items: [
      { icon: Shield, label: 'Staff', key: 'staff', url: '/staff' },
      {
        icon: PackageOpen,
        label: 'Packages',
        key: 'packages',
        url: '/packages',
      },
      { icon: Settings, label: 'Settings', key: 'settings', url: '/setting' },
    ],
  },
];

interface SideMenuProps {
  onClose: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const allItems = sidebarGroups.flatMap((group) => group.items);
  const [activePage, setActivePage] = useState<string>(() => {
    const matched = allItems.find((item) => item.url === location.pathname);
    return matched ? matched.key : sidebarGroups[0].items[0].key;
  });

  const [showPlayground, setShowPlayground] = useState(false);
  const [permissions, setPermissions] = useState<any>({});

  subscribe('knowledge_playground-Show', () => {
    setShowPlayground(true);
  });
  subscribe('permissions-show', (data) => {
    setPermissions(data.detail);
  });

  useEffect(() => {
    const currentActiveItem =
      allItems.find((item) => item.url === location.pathname) ||
      sidebarGroups[0].items[0];

    if (currentActiveItem.key !== activePage) {
      setActivePage(currentActiveItem.key);
    }
  }, [location.pathname, activePage, showPlayground]);

  const handleNavClick = (item: any) => {
    setActivePage(item.key);
    navigate(item.url);
    onClose();
  };

  const dontPermisionsToRender = (label: string) => {
    if (label === 'Playground' && !showPlayground) {
      return true;
    }
    if (label === 'Knowledge Graph' && permissions.ai_knowledge === false) {
      return true;
    }
    if (label === 'Packages' && permissions.packages === false) {
      return true;
    }
    if (label === 'Staff' && permissions.staff === false) {
      return true;
    }
    if (label === 'Settings' && permissions.setting === false) {
      return true;
    }
    if (label === 'Drift Analysis' && permissions.drift_analysis === false) {
      return true;
    }
    if (label === 'Peptide' && permissions.peptide === false) {
      return true;
    }
    if (label === 'FHIR' && permissions.fhir === false) {
      return true;
    }
    if (label === 'Other' && permissions.other === false) {
      return true;
    }
    return false;
  };

  return (
    <>
      <aside className="w-[220px] h-screen max-h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="text-[15px] font-bold text-gray-900 tracking-tight">
                HolistiCare
              </span>
              <p className="text-[10px] text-gray-400 -mt-0.5 tracking-wide">
                CLINIC PORTAL
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto px-3 pt-4 pb-3">
          {sidebarGroups.map((group: any) => {
            const hasVisibleItem =
              group.items?.some(
                (item: any) => !dontPermisionsToRender(item.label),
              ) ?? false;

            if (!hasVisibleItem) {
              return null;
            }

            return (
              <div key={group.group} className="mb-5">
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest px-2 mb-1.5">
                  {group.group}
                </p>
                {group.items.map((item: any) => {
                  if (dontPermisionsToRender(item.label)) {
                    return null;
                  }
                  const isActive = item.key === activePage;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        handleNavClick(item);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-colors duration-150 ${isActive ? 'bg-[#10B981]/10 text-[#059669] font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <item.icon
                        className={`w-[16px] h-[16px] ${isActive ? 'text-[#10B981]' : 'text-gray-400'}`}
                      />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <p className="text-[10px] text-gray-300 text-center tracking-wide">
            Powered by AURA
          </p>
        </div>
      </aside>
    </>
  );
};

export default SideMenu;
