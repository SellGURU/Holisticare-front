/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  RefreshCw,
} from 'lucide-react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import { useAdminContext } from '../../store/adminContext';
import AdminShellLayout from './AdminShellLayout';
import {
  buildAnalyticsPayload,
  buildPreviousRange,
  formatCompactNumber,
  formatDeltaLabel,
  formatPercentage,
  getChangeTone,
  summaryCards,
} from './adminShared';
import { aggregateRoutes, flattenEvents, parseSessions, summariseEventsByDay } from '../../utils/sessionParser';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

const toneClasses: Record<string, string> = {
  positive: 'bg-[#ECFDF3] text-[#027A48]',
  negative: 'bg-[#FEF3F2] text-[#B42318]',
  neutral: 'bg-[#F2F4F7] text-[#475467]',
};

const OverviewDashboard = () => {
  const navigate = useNavigate();
  const { selectedClinicEmail, startDate, endDate } = useAdminContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [previousAnalytics, setPreviousAnalytics] = useState<any>(null);

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const loadAnalytics = async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      await AdminApi.checkAuth();
      const currentPayload = buildAnalyticsPayload(selectedClinicEmail, startDate, endDate);
      const previousRange = buildPreviousRange(startDate, endDate);

      const requests = [AdminApi.getAnalytics(currentPayload)];
      if (previousRange) {
        requests.push(
          AdminApi.getAnalytics(
            buildAnalyticsPayload(
              selectedClinicEmail,
              previousRange.startDate,
              previousRange.endDate,
            ),
          ),
        );
      }

      const [currentRes, previousRes] = await Promise.all(requests);
      setAnalytics(currentRes.data || null);
      setPreviousAnalytics(previousRes?.data || null);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        handleAuthFailure();
        return;
      }
      setAnalytics(null);
      setPreviousAnalytics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics().catch(() => {});
  }, [selectedClinicEmail, startDate, endDate]);

  const parsedSessions = useMemo(
    () => parseSessions(analytics?.sessions || []),
    [analytics?.sessions],
  );
  const allEvents = useMemo(() => flattenEvents(parsedSessions), [parsedSessions]);
  const dailySummary = useMemo(() => summariseEventsByDay(allEvents), [allEvents]);
  const routeSummary = useMemo(() => aggregateRoutes(parsedSessions).slice(0, 5), [parsedSessions]);

  const chartData = useMemo(
    () => ({
      labels: dailySummary.map((item) => item.label),
      datasets: [
        {
          label: 'Clicks',
          data: dailySummary.map((item) => item.clicks),
          borderColor: '#005F73',
          backgroundColor: 'rgba(0, 95, 115, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 2,
        },
        {
          label: 'Page Views',
          data: dailySummary.map((item) => item.pageViews),
          borderColor: '#6CC24A',
          backgroundColor: 'rgba(108, 194, 74, 0.10)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 2,
        },
        {
          label: 'Errors',
          data: dailySummary.map((item) => item.errors),
          borderColor: '#FC5474',
          backgroundColor: 'rgba(252, 84, 116, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 2,
        },
      ],
    }),
    [dailySummary],
  );

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const completionRate = useMemo(() => {
    const assigned = analytics?.num_of_questionnaires_assigned || 0;
    const filled = analytics?.num_of_questionnaires_filled || 0;
    if (!assigned) {
      return 0;
    }

    return (filled / assigned) * 100;
  }, [analytics]);

  const alerts = useMemo(() => {
    const nextAlerts: Array<{ title: string; detail: string; tone: keyof typeof toneClasses }> = [];

    if (completionRate > 0 && completionRate < 50) {
      nextAlerts.push({
        title: 'Questionnaire completion is low',
        detail: `Only ${formatPercentage(completionRate)} of assigned questionnaires were filled during this range.`,
        tone: 'negative',
      });
    }

    const errorCount = allEvents.filter(
      (event) => event.eventName === 'error' || event.eventName === 'api_error',
    ).length;
    if (errorCount > 0) {
      nextAlerts.push({
        title: 'Support issues need review',
        detail: `${errorCount} error events were captured in recent sessions.`,
        tone: 'negative',
      });
    }

    if ((analytics?.num_of_new_clients || 0) === 0) {
      nextAlerts.push({
        title: 'No new clients captured',
        detail: 'This period returned zero newly added clients. Validate campaign or onboarding status.',
        tone: 'neutral',
      });
    }

    const dominantRoute = routeSummary[0];
    if (dominantRoute) {
      nextAlerts.push({
        title: 'Most active route',
        detail: `${dominantRoute.route} generated ${dominantRoute.clicks} clicks across ${dominantRoute.sessions} sessions.`,
        tone: 'positive',
      });
    }

    return nextAlerts.slice(0, 4);
  }, [allEvents, analytics?.num_of_new_clients, completionRate, routeSummary]);

  const insightCards = useMemo(
    () => [
      {
        label: 'Questionnaire completion',
        value: formatPercentage(completionRate),
        helper: 'Filled questionnaires divided by assigned questionnaires',
      },
      {
        label: 'Tracked sessions',
        value: formatCompactNumber(parsedSessions.length),
        helper: 'Frontend sessions captured in the selected period',
      },
      {
        label: 'Unique support users',
        value: formatCompactNumber(new Set(parsedSessions.map((session) => session.userId)).size),
        helper: 'Distinct browser/user identifiers seen in activity logs',
      },
      {
        label: 'Avg session length',
        value: parsedSessions.length
          ? `${Math.round(
              parsedSessions.reduce(
                (total, session) => total + session.totalActiveTimeMs,
                0,
              ) /
                parsedSessions.length /
                60000,
            )} min`
          : '0 min',
        helper: 'Average active time across captured sessions',
      },
    ],
    [completionRate, parsedSessions],
  );

  const logout = async () => {
    try {
      await AdminApi.logout();
    } catch {
      // ignore logout errors
    } finally {
      removeAdminToken();
      navigate('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="h-screen overflow-y-auto w-full flex justify-center items-center min-h-[550px] px-6 py-[80px]">
        <Circleloader />
      </div>
    );
  }

  return (
    <AdminShellLayout
      title="Overview Dashboard"
      subtitle="A support-friendly summary of clinic performance, recent activity, and operational signals."
      actions={
        <>
          <button
            type="button"
            onClick={() => loadAnalytics(true)}
            className="rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
          >
            Log out
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const currentValue = analytics?.[card.key] ?? 0;
            const previousValue = previousAnalytics?.[card.key] ?? 0;
            const delta = currentValue - previousValue;
            const tone = getChangeTone(delta);

            return (
              <div
                key={card.key}
                className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100"
              >
                <div className="text-[11px] uppercase tracking-wide text-Text-Secondary">
                  {card.label}
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="text-2xl font-semibold text-Text-Primary">
                    {formatCompactNumber(currentValue)}
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] ${toneClasses[tone]}`}
                  >
                    {tone === 'positive' && <ArrowUpRight size={12} />}
                    {tone === 'negative' && <ArrowDownRight size={12} />}
                    {tone === 'neutral' && <Minus size={12} />}
                    <span>{formatDeltaLabel(delta)}</span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-Text-Secondary">
                  Compared with the previous matching date range.
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="TextStyle-Headline-5 text-Text-Primary">
                  Activity Trend
                </div>
                <div className="mt-1 text-[11px] text-Text-Secondary">
                  Clicks, page views, and error volume parsed from the stored frontend sessions.
                </div>
              </div>
            </div>

            {dailySummary.length > 0 ? (
              <div className="mt-4 h-[320px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-[#F8FAFB] px-4 py-8 text-center text-[12px] text-Text-Secondary">
                No session history was found for the current filters.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
              <div className="TextStyle-Headline-5 text-Text-Primary">Support Snapshot</div>
              <div className="mt-4 grid gap-3">
                {insightCards.map((card) => (
                  <div key={card.label} className="rounded-2xl bg-[#F8FAFB] px-4 py-3">
                    <div className="text-[11px] uppercase tracking-wide text-Text-Secondary">
                      {card.label}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-Text-Primary">
                      {card.value}
                    </div>
                    <div className="mt-1 text-[11px] text-Text-Secondary">{card.helper}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
              <div className="flex items-center gap-2 text-Text-Primary">
                <AlertTriangle size={16} />
                <div className="TextStyle-Headline-5">Alerts and Opportunities</div>
              </div>
              <div className="mt-4 space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div
                      key={alert.title}
                      className={`rounded-2xl px-4 py-3 ${toneClasses[alert.tone]}`}
                    >
                      <div className="text-[12px] font-medium">{alert.title}</div>
                      <div className="mt-1 text-[11px] leading-5 opacity-90">{alert.detail}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#F8FAFB] px-4 py-3 text-[11px] text-Text-Secondary">
                    No high-signal alerts were generated for the current range.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="TextStyle-Headline-5 text-Text-Primary">Top Active Routes</div>
              <div className="mt-1 text-[11px] text-Text-Secondary">
                The pages that generated the most interaction in captured sessions.
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {routeSummary.length > 0 ? (
              routeSummary.map((route) => (
                <div key={route.route} className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] p-4">
                  <div className="truncate text-[12px] font-medium text-Text-Primary">
                    {route.route}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-Text-Secondary">
                    <div>
                      <div>Clicks</div>
                      <div className="mt-1 text-base font-semibold text-Text-Primary">
                        {route.clicks}
                      </div>
                    </div>
                    <div>
                      <div>Sessions</div>
                      <div className="mt-1 text-base font-semibold text-Text-Primary">
                        {route.sessions}
                      </div>
                    </div>
                    <div>
                      <div>Page Views</div>
                      <div className="mt-1 text-base font-semibold text-Text-Primary">
                        {route.pageViews}
                      </div>
                    </div>
                    <div>
                      <div>Exits</div>
                      <div className="mt-1 text-base font-semibold text-Text-Primary">
                        {route.exits}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-[#F8FAFB] px-4 py-5 text-[11px] text-Text-Secondary md:col-span-2 xl:col-span-5">
                No route activity was available for this filter set.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShellLayout>
  );
};

export default OverviewDashboard;
