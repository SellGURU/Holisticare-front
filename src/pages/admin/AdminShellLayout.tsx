import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface AdminShellLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const navItems = [
  { to: '/admin/marketing', label: 'Marketing Workspace' },
  { to: '/admin/json-uploading', label: 'JSON Uploading' },
];

const AdminShellLayout = ({
  title,
  subtitle,
  actions,
  children,
}: AdminShellLayoutProps) => {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-bg-color px-4 md:px-6 py-8 pb-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="text-2xl font-medium text-Text-Primary">{title}</div>
            {subtitle && (
              <div className="text-[12px] text-Text-Secondary mt-1">{subtitle}</div>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)] gap-4">
          <aside className="bg-white border border-Gray-50 shadow-100 rounded-[16px] p-4 h-fit">
            <div className="text-[11px] uppercase tracking-wide text-Text-Secondary mb-3">
              Admin Menu
            </div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-[12px] transition-colors ${
                      isActive
                        ? 'bg-Primary-DeepTeal text-white'
                        : 'bg-[#F8FAFB] text-Text-Primary hover:bg-gray-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminShellLayout;
