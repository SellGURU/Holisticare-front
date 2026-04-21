/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Download, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import { useAdminContext } from '../../store/adminContext';
import AdminShellLayout from './AdminShellLayout';
import { buildAnalyticsPayload, formatCompactNumber, formatPercentage } from './adminShared';
import {
  deleteGeneratedReport,
  getClinicWorkspaceRecord,
  readSavedReports,
  saveGeneratedReport,
} from '../../utils/adminWorkspaceStore';
import {
  ClinicReport,
  ReportAudience,
  ReportComposerState,
  ReportLength,
  ReportMode,
  ReportTone,
} from '../../types/admin';

const modeOptions: Array<{ value: ReportMode; label: string }> = [
  { value: 'quick_summary', label: 'Quick summary' },
  { value: 'kpi_report', label: 'KPI report' },
  { value: 'reasoning_report', label: 'Reasoning report' },
  { value: 'stakeholder_update', label: 'Stakeholder update' },
  { value: 'portfolio_report', label: 'Portfolio report' },
];

const audienceOptions: Array<{ value: ReportAudience; label: string }> = [
  { value: 'internal_support', label: 'Internal support' },
  { value: 'product_team', label: 'Product team' },
  { value: 'founders', label: 'Founders' },
  { value: 'external_stakeholder', label: 'External stakeholder' },
];

const toneOptions: Array<{ value: ReportTone; label: string }> = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'supportive', label: 'Supportive' },
  { value: 'action_oriented', label: 'Action-oriented' },
  { value: 'executive', label: 'Executive' },
];

const lengthOptions: Array<{ value: ReportLength; label: string }> = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
];

const sectionOptions = [
  'KPI summary',
  'Issues and risks',
  'Opportunities',
  'Timeline notes',
  'Recommendations',
  'Follow-up actions',
];

const defaultComposerState = (selectedClinicEmail: string): ReportComposerState => ({
  clinicEmails: selectedClinicEmail ? [selectedClinicEmail] : [],
  mode: 'stakeholder_update',
  audience: 'internal_support',
  tone: 'action_oriented',
  length: 'medium',
  includeSections: [...sectionOptions],
  customPrompt: '',
});

const downloadMarkdown = (content: string) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clinic-report.md';
  link.click();
  URL.revokeObjectURL(url);
};

const toneLead: Record<ReportTone, string> = {
  neutral: 'This report summarizes the selected clinic activity and support context.',
  supportive: 'This report highlights recent clinic momentum while keeping support context visible.',
  action_oriented: 'This report focuses on the signals that need immediate operational follow-up.',
  executive: 'This report provides a concise leadership view of clinic performance and risk.',
};

const AIReportCopilot = () => {
  const navigate = useNavigate();
  const { clinics, loadingClinics, refreshClinics, selectedClinicEmail, startDate, endDate } =
    useAdminContext();
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState<ClinicReport[]>([]);
  const [generatedReport, setGeneratedReport] = useState('');
  const [composer, setComposer] = useState<ReportComposerState>(() =>
    defaultComposerState(selectedClinicEmail),
  );

  useEffect(() => {
    if (!clinics.length && !loadingClinics) {
      refreshClinics().catch(() => {});
    }
  }, [clinics.length, loadingClinics, refreshClinics]);

  useEffect(() => {
    setSavedReports(readSavedReports());
  }, []);

  useEffect(() => {
    setComposer((current) => {
      if (current.clinicEmails.length > 0) {
        return current;
      }

      return {
        ...current,
        clinicEmails: selectedClinicEmail ? [selectedClinicEmail] : current.clinicEmails,
      };
    });
  }, [selectedClinicEmail]);

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const selectedClinicNames = useMemo(
    () =>
      composer.clinicEmails.map((email) => {
        const clinic = clinics.find((item) => item.clinic_email === email);
        return clinic?.clinic_name || email;
      }),
    [clinics, composer.clinicEmails],
  );

  const toggleClinic = (clinicEmail: string) => {
    setComposer((current) => ({
      ...current,
      clinicEmails: current.clinicEmails.includes(clinicEmail)
        ? current.clinicEmails.filter((email) => email !== clinicEmail)
        : [...current.clinicEmails, clinicEmail],
    }));
  };

  const toggleSection = (section: string) => {
    setComposer((current) => ({
      ...current,
      includeSections: current.includeSections.includes(section)
        ? current.includeSections.filter((item) => item !== section)
        : [...current.includeSections, section],
    }));
  };

  const generateReport = async () => {
    if (composer.clinicEmails.length === 0) {
      toast.error('Choose at least one clinic for the report.');
      return;
    }

    setLoading(true);
    try {
      await AdminApi.checkAuth();

      const analyticsResults = await Promise.all(
        composer.clinicEmails.map(async (clinicEmail) => {
          const res = await AdminApi.getAnalytics(
            buildAnalyticsPayload(clinicEmail, startDate, endDate),
          );
          return {
            clinicEmail,
            analytics: res.data || {},
            workspace: getClinicWorkspaceRecord(clinicEmail),
          };
        }),
      );

      const reportParts: string[] = [];

      reportParts.push(`# ${modeOptions.find((item) => item.value === composer.mode)?.label}`);
      reportParts.push('');
      reportParts.push(`Audience: ${audienceOptions.find((item) => item.value === composer.audience)?.label}`);
      reportParts.push(`Tone: ${toneOptions.find((item) => item.value === composer.tone)?.label}`);
      reportParts.push(`Date range: ${startDate || 'All time'} to ${endDate || 'Today'}`);
      reportParts.push(`Clinics: ${selectedClinicNames.join(', ')}`);
      reportParts.push('');
      reportParts.push(toneLead[composer.tone]);
      reportParts.push('');

      if (composer.includeSections.includes('KPI summary')) {
        reportParts.push('## KPI Summary');
        analyticsResults.forEach(({ clinicEmail, analytics }) => {
          const clinicName =
            clinics.find((clinic) => clinic.clinic_email === clinicEmail)?.clinic_name ||
            clinicEmail;
          const completionRate =
            analytics.num_of_questionnaires_assigned > 0
              ? (analytics.num_of_questionnaires_filled /
                  analytics.num_of_questionnaires_assigned) *
                100
              : 0;
          reportParts.push(
            `- ${clinicName}: ${formatCompactNumber(
              analytics.num_of_new_clients || 0,
            )} new clients, ${formatPercentage(
              completionRate,
            )} questionnaire completion, ${formatCompactNumber(
              analytics.num_of_files_uploaded || 0,
            )} files uploaded.`,
          );
        });
        reportParts.push('');
      }

      if (composer.includeSections.includes('Issues and risks')) {
        reportParts.push('## Issues and Risks');
        analyticsResults.forEach(({ clinicEmail, analytics, workspace }) => {
          const clinicName =
            clinics.find((clinic) => clinic.clinic_email === clinicEmail)?.clinic_name ||
            clinicEmail;
          const openTags = workspace.tags.filter((tag) => tag.status === 'active');
          const riskNotes = workspace.notes.filter((note) => note.followUpRequired);
          const completionRate =
            analytics.num_of_questionnaires_assigned > 0
              ? (analytics.num_of_questionnaires_filled /
                  analytics.num_of_questionnaires_assigned) *
                100
              : 0;
          const risks: string[] = [];
          if (completionRate > 0 && completionRate < 50) {
            risks.push(`low questionnaire completion at ${formatPercentage(completionRate)}`);
          }
          if (workspace.followUpState === 'escalate') {
            risks.push('follow-up state is set to escalate');
          }
          if (openTags.length > 0) {
            risks.push(`${openTags.length} active support tags remain unresolved`);
          }
          if (riskNotes.length > 0) {
            risks.push(`${riskNotes.length} notes require follow-up`);
          }
          reportParts.push(
            `- ${clinicName}: ${
              risks.length > 0 ? risks.join('; ') : 'no high-risk issue was flagged in the current workspace state'
            }.`,
          );
        });
        reportParts.push('');
      }

      if (composer.includeSections.includes('Opportunities')) {
        reportParts.push('## Opportunities');
        analyticsResults.forEach(({ clinicEmail, analytics, workspace }) => {
          const clinicName =
            clinics.find((clinic) => clinic.clinic_email === clinicEmail)?.clinic_name ||
            clinicEmail;
          const opportunityTags = workspace.tags.filter(
            (tag) => tag.tagType === 'opportunity' && tag.status === 'active',
          );
          const positives: string[] = [];
          if ((analytics.num_of_new_clients || 0) > 0) {
            positives.push(`${analytics.num_of_new_clients} new clients joined in the selected period`);
          }
          if (opportunityTags.length > 0) {
            positives.push(`${opportunityTags.length} active opportunity tags are on record`);
          }
          reportParts.push(
            `- ${clinicName}: ${
              positives.length > 0
                ? positives.join('; ')
                : 'no explicit growth signal was captured, but the clinic can be monitored for change'
            }.`,
          );
        });
        reportParts.push('');
      }

      if (composer.includeSections.includes('Timeline notes')) {
        reportParts.push('## Timeline Notes');
        analyticsResults.forEach(({ clinicEmail, workspace }) => {
          const clinicName =
            clinics.find((clinic) => clinic.clinic_email === clinicEmail)?.clinic_name ||
            clinicEmail;
          const timelineNotes = [...workspace.notes]
            .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
            .slice(0, composer.length === 'short' ? 1 : composer.length === 'medium' ? 2 : 4);
          if (timelineNotes.length === 0) {
            reportParts.push(`- ${clinicName}: no operational notes were saved yet.`);
            return;
          }

          timelineNotes.forEach((note) => {
            reportParts.push(
              `- ${clinicName}: ${note.title} (${note.visibility}) - ${note.body}`,
            );
          });
        });
        reportParts.push('');
      }

      if (
        composer.includeSections.includes('Recommendations') ||
        composer.includeSections.includes('Follow-up actions')
      ) {
        reportParts.push('## Recommended Next Steps');
        analyticsResults.forEach(({ clinicEmail, workspace }) => {
          const clinicName =
            clinics.find((clinic) => clinic.clinic_email === clinicEmail)?.clinic_name ||
            clinicEmail;
          const recommendation =
            workspace.followUpState === 'escalate'
              ? 'Escalate this clinic to leadership or product review.'
              : workspace.followUpState === 'follow_up_this_week'
                ? 'Complete direct clinic follow-up this week and attach an outcome note.'
                : workspace.followUpState === 'resolved'
                  ? 'Keep monitoring and document any new changes only if signals reappear.'
                  : 'Continue monitoring and refresh the clinic workspace after the next support touchpoint.';
          reportParts.push(`- ${clinicName}: ${recommendation}`);
        });
        reportParts.push('');
      }

      if (composer.customPrompt.trim()) {
        reportParts.push('## Custom Instruction Focus');
        reportParts.push(composer.customPrompt.trim());
        reportParts.push('');
      }

      const output = reportParts.join('\n');
      setGeneratedReport(output);
      const savedReport = saveGeneratedReport({
        clinicEmails: composer.clinicEmails,
        mode: composer.mode,
        audience: composer.audience,
        tone: composer.tone,
        length: composer.length,
        includeSections: composer.includeSections,
        customPrompt: composer.customPrompt,
        output,
      });
      setSavedReports(readSavedReports());
      toast.success(`Report generated for ${savedReport.clinicEmails.length} clinic(s).`);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        handleAuthFailure();
        return;
      }
      toast.error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

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
      title="AI Report Copilot"
      subtitle="Generate reusable internal or stakeholder-ready summaries using KPIs, activity signals, notes, tags, and follow-up state."
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
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
            <div className="flex items-center gap-2 text-Text-Primary">
              <Sparkles size={16} />
              <div className="TextStyle-Headline-5">Report builder</div>
            </div>
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wide text-Text-Secondary">
                Clinic scope
              </div>
              <div className="mt-2 max-h-[220px] space-y-2 overflow-y-auto pr-1 Custom-scrollbar">
                {clinics.map((clinic) => (
                  <label
                    key={clinic.clinic_email}
                    className="flex items-start gap-3 rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={composer.clinicEmails.includes(clinic.clinic_email)}
                      onChange={() => toggleClinic(clinic.clinic_email)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-[12px] font-medium text-Text-Primary">
                        {clinic.clinic_name}
                      </div>
                      <div className="text-[11px] text-Text-Secondary">{clinic.clinic_email}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <select
                value={composer.mode}
                onChange={(event) =>
                  setComposer((current) => ({
                    ...current,
                    mode: event.target.value as ReportMode,
                  }))
                }
                className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              >
                {modeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={composer.length}
                onChange={(event) =>
                  setComposer((current) => ({
                    ...current,
                    length: event.target.value as ReportLength,
                  }))
                }
                className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              >
                {lengthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={composer.audience}
                onChange={(event) =>
                  setComposer((current) => ({
                    ...current,
                    audience: event.target.value as ReportAudience,
                  }))
                }
                className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              >
                {audienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={composer.tone}
                onChange={(event) =>
                  setComposer((current) => ({
                    ...current,
                    tone: event.target.value as ReportTone,
                  }))
                }
                className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              >
                {toneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wide text-Text-Secondary">
                Include sections
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {sectionOptions.map((section) => (
                  <label
                    key={section}
                    className="flex items-center gap-2 rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] text-Text-Primary"
                  >
                    <input
                      type="checkbox"
                      checked={composer.includeSections.includes(section)}
                      onChange={() => toggleSection(section)}
                    />
                    {section}
                  </label>
                ))}
              </div>
            </div>

            <textarea
              value={composer.customPrompt}
              onChange={(event) =>
                setComposer((current) => ({
                  ...current,
                  customPrompt: event.target.value,
                }))
              }
              placeholder="Optional instruction, for example: Focus on business risk, compare the selected clinics, or keep the report concise for leadership."
              className="mt-4 min-h-[120px] w-full rounded-[16px] border border-Gray-50 bg-[#F8FAFB] px-3 py-3 text-[12px] outline-none"
            />

            <button
              type="button"
              onClick={generateReport}
              disabled={loading}
              className="mt-4 rounded-full bg-Primary-DeepTeal px-4 py-2 text-[12px] text-white disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Generate report
              </span>
            </button>
          </div>

          <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
            <div className="TextStyle-Headline-5 text-Text-Primary">Saved report history</div>
            <div className="mt-4 space-y-3">
              {savedReports.length > 0 ? (
                savedReports.slice(0, 8).map((report) => (
                  <div key={report.id} className="rounded-2xl bg-[#F8FAFB] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[12px] font-medium text-Text-Primary">
                          {modeOptions.find((item) => item.value === report.mode)?.label}
                        </div>
                        <div className="mt-1 text-[11px] text-Text-Secondary">
                          {report.clinicEmails.length} clinics | {report.createdAt}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          deleteGeneratedReport(report.id);
                          setSavedReports(readSavedReports());
                        }}
                        className="rounded-full border border-Gray-50 bg-white px-3 py-1 text-[11px] text-red-600"
                      >
                        <span className="inline-flex items-center gap-1">
                          <Trash2 size={12} />
                          Delete
                        </span>
                      </button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedReport(report.output);
                          setComposer({
                            clinicEmails: report.clinicEmails,
                            mode: report.mode,
                            audience: report.audience,
                            tone: report.tone,
                            length: report.length,
                            includeSections: report.includeSections,
                            customPrompt: report.customPrompt,
                          });
                        }}
                        className="rounded-full border border-Gray-50 bg-white px-3 py-1 text-[11px] text-Text-Primary"
                      >
                        Reopen
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-[#F8FAFB] px-4 py-5 text-[11px] text-Text-Secondary">
                  No saved reports yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="TextStyle-Headline-5 text-Text-Primary">Generated output</div>
              <div className="mt-1 text-[11px] text-Text-Secondary">
                The report is generated from KPI data plus the local clinic workspace notes and tags.
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!generatedReport) return;
                  navigator.clipboard.writeText(generatedReport).then(() => {
                    toast.success('Report copied.');
                  });
                }}
                className="rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px]"
              >
                <span className="inline-flex items-center gap-1">
                  <Copy size={12} />
                  Copy
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!generatedReport) return;
                  downloadMarkdown(generatedReport);
                }}
                className="rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px]"
              >
                <span className="inline-flex items-center gap-1">
                  <Download size={12} />
                  Markdown
                </span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[520px] items-center justify-center">
              <Circleloader />
            </div>
          ) : generatedReport ? (
            <pre className="Custom-scrollbar mt-4 min-h-[520px] overflow-auto rounded-[16px] bg-[#0F172A] p-4 text-[12px] leading-6 text-[#E2E8F0] whitespace-pre-wrap">
              {generatedReport}
            </pre>
          ) : (
            <div className="mt-4 flex min-h-[520px] items-center justify-center rounded-[16px] bg-[#F8FAFB] px-6 text-center text-[12px] text-Text-Secondary">
              Choose clinic scope and report settings, then generate a report.
            </div>
          )}
        </div>
      </div>
    </AdminShellLayout>
  );
};

export default AIReportCopilot;
