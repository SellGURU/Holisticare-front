import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hammer, Sparkles } from 'lucide-react';
import AdminShellLayout from './AdminShellLayout';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';

interface AdminPlaceholderPageProps {
  title: string;
  subtitle: string;
  bullets: string[];
  icon?: ReactNode;
}

const AdminPlaceholderPage = ({
  title,
  subtitle,
  bullets,
  icon,
}: AdminPlaceholderPageProps) => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await AdminApi.logout();
    } catch {
      // ignore
    } finally {
      removeAdminToken();
      navigate('/admin/login');
    }
  };

  return (
    <AdminShellLayout
      title={title}
      subtitle={subtitle}
      actions={
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
        >
          Log out
        </button>
      }
    >
      <div className="rounded-[20px] border border-Gray-50 bg-white p-6 shadow-100">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#F8FAFB] p-3 text-Text-Primary">
            {icon || <Hammer size={18} />}
          </div>
          <div>
            <div className="TextStyle-Headline-5 text-Text-Primary">Planned Next</div>
            <div className="mt-1 text-[11px] text-Text-Secondary">
              This section is scaffolded in the new admin navigation and ready for the next implementation pass.
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {bullets.map((bullet) => (
            <div key={bullet} className="rounded-2xl bg-[#F8FAFB] px-4 py-4 text-[12px] text-Text-Primary">
              {bullet}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-Gray-100 bg-[#FBFCFD] px-4 py-4 text-[11px] text-Text-Secondary">
          The new shell, routing, overview, session insights, and data explorer are live now. This page is the next step for notes, tags, follow-up workflows, and stakeholder-ready reports.
        </div>
      </div>
    </AdminShellLayout>
  );
};

export const ClinicWorkspacePlaceholder = () => (
  <AdminPlaceholderPage
    title="Clinic Workspace"
    subtitle="This will become the support workspace for notes, tags, follow-up state, and clinic context."
    bullets={[
      'Clinic header with owner, status, tags, and follow-up state.',
      'Notes and timeline with date, visibility, and follow-up metadata.',
      'Tag history plus active and resolved support context.',
      'Quick actions to generate reports, add notes, and export evidence.',
    ]}
    icon={<Hammer size={18} />}
  />
);

export const ReportCopilotPlaceholder = () => (
  <AdminPlaceholderPage
    title="AI Report Copilot"
    subtitle="This will generate internal and stakeholder-ready reports using KPIs, notes, tags, and activity signals."
    bullets={[
      'Multi-clinic and single-clinic report builder.',
      'Audience, tone, length, and section controls.',
      'Saved report history with reopen and regenerate support.',
      'Copy, markdown export, and PDF handoff paths.',
    ]}
    icon={<Sparkles size={18} />}
  />
);

export default AdminPlaceholderPage;
