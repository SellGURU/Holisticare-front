import { ReactNode, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Brain,
  ChevronRight,
  Database,
  FileCog,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Sparkles,
  X,
} from 'lucide-react';
import { useAdminContext } from '../../store/adminContext';

interface AdminShellLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  showGlobalFilters?: boolean;
}

const navigationSections = [
  {
    label: 'Analytics',
    items: [
      { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
      { to: '/admin/sessions', label: 'Session Insights', icon: BarChart3 },
      { to: '/admin/explorer', label: 'Data Explorer', icon: Database },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/workspace', label: 'Clinic Workspace', icon: FolderKanban },
      { to: '/admin/reports', label: 'AI Report Copilot', icon: Sparkles },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/config', label: 'Config Publishing', icon: FileCog },
      { to: '/admin/json-uploading', label: 'JSON Uploading', icon: FileCog },
      { to: '/admin/llm-prompts', label: 'LLM Prompts', icon: Brain },
    ],
  },
];

const AdminShellLayout = ({
  title,
  subtitle,
  actions,
  children,
  showGlobalFilters = true,
}: AdminShellLayoutProps) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    clinics,
    loadingClinics,
    selectedClinicEmail,
    startDate,
    endDate,
    setSelectedClinicEmail,
    setStartDate,
    setEndDate,
    refreshClinics,
  } = useAdminContext();

  useEffect(() => {
    if (clinics.length === 0 && !loadingClinics) {
      refreshClinics().catch(() => {});
    }
  }, [clinics.length, loadingClinics, refreshClinics]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const breadcrumb = useMemo(() => {
    const currentPath = location.pathname;
    const currentItem = navigationSections
      .flatMap((section) => section.items)
      .find((item) => item.to === currentPath);

    return currentItem?.label || title;
  }, [location.pathname, title]);

  const sidebar = (
    <aside className="bg-white border border-Gray-50 shadow-100 rounded-[20px] p-4 h-fit">
      <div className="rounded-[18px] bg-gradient-to-r from-Primary-DeepTeal to-Primary-EmeraldGreen px-4 py-4 text-white">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/70">
          HolistiCare Admin
        </div>
        <div className="mt-1 text-lg font-semibold">Support Intelligence Console</div>
        <div className="mt-2 text-[11px] leading-5 text-white/80">
          Analytics, click activity, clinic context, reports, and publishing in one place.
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {navigationSections.map((section) => (
          <div key={section.label}>
            <div className="mb-2 px-2 text-[11px] uppercase tracking-wide text-Text-Secondary">
              {section.label}
            </div>
            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-3 py-3 text-[12px] transition-colors ${
                        isActive
                          ? 'bg-Primary-DeepTeal text-white shadow-100'
                          : 'bg-[#F8FAFB] text-Text-Primary hover:bg-Gray-15'
                      }`
                    }
                  >
                    <Icon size={16} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-bg-color px-4 md:px-6 py-8 pb-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-Text-Secondary">
              HolistiCare Admin
            </div>
            <div className="text-lg font-semibold text-Text-Primary">Support Console</div>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-full border border-Gray-50 bg-white p-3 text-Text-Primary shadow-100"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && <div className="mb-4 lg:hidden">{sidebar}</div>}

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] text-Text-Secondary">
                <span>Admin</span>
                <ChevronRight size={12} />
                <span>{breadcrumb}</span>
              </div>
              <div className="mt-1 text-2xl font-medium text-Text-Primary">{title}</div>
              {subtitle && (
                <div className="text-[12px] text-Text-Secondary mt-1 max-w-3xl">{subtitle}</div>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>

          {showGlobalFilters && (
            <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                <div className="min-w-0 flex-1">
                  <label className="mb-1 block text-[11px] text-Text-Secondary">
                    Clinic scope
                  </label>
                  <select
                    value={selectedClinicEmail}
                    onChange={(event) => setSelectedClinicEmail(event.target.value)}
                    className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                  >
                    <option value="">All allowed clinics</option>
                    {clinics.map((clinic) => (
                      <option key={clinic.clinic_email} value={clinic.clinic_email}>
                        {clinic.clinic_name} ({clinic.clinic_email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] text-Text-Secondary">
                      Start date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-Text-Secondary">
                      End date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-Text-Secondary">
                {loadingClinics
                  ? 'Refreshing clinic access...'
                  : 'These filters stay shared across Overview, Session Insights, Data Explorer, and Config.'}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)] gap-4">
          <div className="hidden xl:block">{sidebar}</div>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminShellLayout;
