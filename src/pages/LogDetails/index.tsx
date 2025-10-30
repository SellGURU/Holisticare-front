import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SimpleDatePicker from '../../Components/SimpleDatePicker';
import Admin from '../../api/Admin';

type ScreenSize = { width: number; height: number };
type UserAgent = {
  browser: string;
  os: string;
  deviceType: string;
  screen: ScreenSize;
};

type LogEvent = {
  id: string;
  eventName: string;
  timestamp: string; // ISO
  props: Record<string, string | number | boolean>;
};

type SessionLog = {
  sessionId: string;
  userId: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  totalActiveTimeMs: number;
  userAgent: UserAgent;
  events: LogEvent[];
};

type ApiSession = {
  data: SessionLog;
  created_date: string;
};

type AnalyticsResponse = {
  num_of_new_clients: number;
  num_of_questionnaires_assigned: number;
  num_of_questionnaires_filled: number;
  num_of_files_uploaded: number;
  num_of_holistic_plans_saved: number;
  num_of_action_plans_saved: number;
  num_of_library_entries_created: number;
  num_of_library_entries_updated: number;
  sessions: ApiSession[];
};

// Merge contiguous sessions for the same user and device if the gap is small
function mergeContiguousSessions(
  sessions: SessionLog[],
  options?: { gapThresholdMs?: number },
): SessionLog[] {
  const gapThresholdMs = options?.gapThresholdMs ?? 2 * 60 * 1000; // default: 2 minutes
  if (!Array.isArray(sessions) || sessions.length === 0) return [];

  // Group by user to avoid cross-user merges
  const byUser: Record<string, SessionLog[]> = sessions.reduce(
    (acc, s) => {
      (acc[s.userId] ||= []).push(s);
      return acc;
    },
    {} as Record<string, SessionLog[]>,
  );

  const mergedAll: SessionLog[] = [];

  Object.values(byUser).forEach((userSessions) => {
    // Sort ascending by start time to merge forward
    const sorted = [...userSessions].sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
    );

    let current: SessionLog | null = null;

    const pushCurrent = () => {
      if (!current) return;
      // Ensure events are sorted
      current.events = [...(current.events || [])].sort(
        (e1, e2) =>
          new Date(e1.timestamp).getTime() - new Date(e2.timestamp).getTime(),
      );
      mergedAll.push(current);
      current = null;
    };

    for (const s of sorted) {
      if (!current) {
        current = { ...s, events: [...(s.events || [])] };
        continue;
      }

      const lastEnd = new Date(current.endedAt).getTime();
      const nextStart = new Date(s.startedAt).getTime();
      const sameDevice =
        current.userAgent?.deviceType === s.userAgent?.deviceType &&
        current.userAgent?.browser === s.userAgent?.browser;

      // Merge if contiguous (overlap or small gap) and same device
      if (sameDevice && nextStart - lastEnd <= gapThresholdMs) {
        current = {
          ...current,
          sessionId: `${current.sessionId}+${s.sessionId}`,
          startedAt:
            new Date(current.startedAt).getTime() <=
            new Date(s.startedAt).getTime()
              ? current.startedAt
              : s.startedAt,
          endedAt:
            new Date(current.endedAt).getTime() >= new Date(s.endedAt).getTime()
              ? current.endedAt
              : s.endedAt,
          totalActiveTimeMs:
            (current.totalActiveTimeMs || 0) + (s.totalActiveTimeMs || 0),
          events: [...(current.events || []), ...(s.events || [])],
        };
      } else {
        pushCurrent();
        current = { ...s, events: [...(s.events || [])] };
      }
    }

    pushCurrent();
  });

  // Sort final list descending by start time like original `filtered`
  return mergedAll.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

const toLocalDateOnly = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const msToMin = (ms: number) => Math.round(ms / 60000);
const formatTimeRange = (startIso: string, endIso: string) => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const two = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${two(s.getHours())}:${two(s.getMinutes())} - ${two(e.getHours())}:${two(e.getMinutes())}`;
};

function hasData<T>(val: unknown): val is { data: T } {
  return (
    typeof val === 'object' &&
    val !== null &&
    Object.prototype.hasOwnProperty.call(val, 'data')
  );
}

const LogDetails = () => {
  const { id: clinicId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clinicIdInput, setClinicIdInput] = useState<string>(clinicId || '');

  const [data, setData] = useState<SessionLog[]>([]);
  const [kpis, setKpis] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [fromDate, setFromDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d;
  });
  const [toDate, setToDate] = useState<Date | null>(() => new Date());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  const sessionDurations = useMemo(() => {
    const totalMs = data.reduce((acc, s) => acc + s.totalActiveTimeMs, 0);
    const totalMin = msToMin(totalMs);
    // Average per day across selected date range (inclusive)
    const start = fromDate ? toLocalDateOnly(fromDate) : null;
    const end = toDate ? toLocalDateOnly(toDate) : null;
    let days = 1;
    if (start && end) {
      const diff = end.getTime() - start.getTime();
      days = Math.max(1, Math.floor(diff / (24 * 60 * 60 * 1000)) + 1);
    }
    const avgMin = Math.round(totalMs / days / 60000);
    return { totalMin, avgMin, days };
  }, [data, fromDate, toDate]);

  const totalEvents = useMemo(() => {
    return data.reduce((acc, s) => acc + (s.events?.length || 0), 0);
  }, [data]);

  const activityScore = useMemo(() => {
    const days = sessionDurations.days || 1;
    const minutesPerDay = sessionDurations.totalMin / days;
    const eventsPerDay = totalEvents / days;
    const minutesScore = Math.min(1, minutesPerDay / 60); // 60 دقیقه در روز = 100%
    const eventsScore = Math.min(1, eventsPerDay / 30); // 30 ایونت در روز = 100%
    const score = Math.round((minutesScore * 0.6 + eventsScore * 0.4) * 100);
    return Math.max(0, Math.min(100, score));
  }, [sessionDurations, totalEvents]);

  const filtered = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
    if (!fromDate && !toDate) return sorted;
    const from = fromDate ? toLocalDateOnly(fromDate).getTime() : -Infinity;
    const to = toDate
      ? toLocalDateOnly(toDate).getTime() + 24 * 60 * 60 * 1000 - 1
      : Infinity;
    return sorted.filter((s) => {
      const started = new Date(s.startedAt).getTime();
      return started >= from && started <= to;
    });
  }, [data, fromDate, toDate]);

  // Merge contiguous sessions for display and event listing
  const merged = useMemo(() => mergeContiguousSessions(filtered), [filtered]);

  // stats removed; top KPIs now come directly from API in kpis

  const selectedSession = useMemo(
    () => merged.find((s) => s.sessionId === selectedSessionId) || merged[0],
    [merged, selectedSessionId],
  );

  const fetchLogs = () => {
    if (!clinicId) return;
    setLoading(true);
    Admin.getLog(
      clinicId,
      fromDate?.toISOString() || '',
      toDate?.toISOString() || '',
    )
      .then((res) => {
        const payload: AnalyticsResponse = hasData<AnalyticsResponse>(res)
          ? res.data
          : (res as AnalyticsResponse);
        setKpis(payload);
        const sessions = Array.isArray(payload?.sessions)
          ? payload.sessions.map((s: ApiSession) => s.data)
          : [];
        setData(sessions);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, fromDate, toDate]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            aria-label="Back"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-Gray-50 bg-white text-Text-Primary hover:bg-backgroundColor-Card"
            onClick={() => navigate(-1)}
          >
            {/* Left arrow icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <label
              htmlFor="clinicIdInput"
              className="text-xs text-Text-Secondary"
            >
              Clinic ID
            </label>
            <input
              id="clinicIdInput"
              value={clinicIdInput}
              onChange={(e) => setClinicIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && clinicIdInput.trim()) {
                  navigate(`/log/${clinicIdInput.trim()}`);
                }
              }}
              placeholder="Enter clinic id"
              className="text-xs md:text-sm border border-Gray-50 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-Primary-DeepTeal bg-white text-Text-Primary min-w-[160px]"
            />
            <button
              className="text-xs bg-Primary-DeepTeal text-white px-3 py-1 rounded-md disabled:opacity-50"
              disabled={!clinicIdInput.trim()}
              onClick={() =>
                clinicIdInput.trim() && navigate(`/log/${clinicIdInput.trim()}`)
              }
            >
              Go
            </button>
          </div>
        </div>
        <div className="flex justify-end items-center">
          <div className="text-Text-Primary text-xs md:text-sm min-w-[60px]">
            From
          </div>
          <SimpleDatePicker
            date={fromDate}
            setDate={setFromDate}
            placeholder="Select"
          />
          <div className="text-Text-Primary text-xs md:text-sm min-w-[60px]">
            To
          </div>
          <SimpleDatePicker
            date={toDate}
            setDate={setToDate}
            placeholder="Select"
          />
          <button
            aria-label="Reload"
            className="ml-2 text-xs bg-Primary-DeepTeal text-white px-3 py-1 rounded-md disabled:opacity-50"
            disabled={!clinicId || loading}
            onClick={fetchLogs}
          >
            {loading ? 'Loading...' : 'Reload'}
          </button>
          <button
            className="ml-auto md:ml-3 text-xs bg-Primary-DeepTeal text-white px-3 py-1 rounded-md"
            onClick={() => {
              setFromDate(null);
              setToDate(null);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Session-based metrics */}

      {/* <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
        <div className="text-Text-Primary text-xs md:text-sm min-w-[60px]">
          From
        </div>
        <SimpleDatePicker
          date={fromDate}
          setDate={setFromDate}
          placeholder="Select"
        />
        <div className="text-Text-Primary text-xs md:text-sm min-w-[60px]">
          To
        </div>
        <SimpleDatePicker
          date={toDate}
          setDate={setToDate}
          placeholder="Select"
        />
        <button
          className="ml-auto md:ml-3 text-xs bg-Primary-DeepTeal text-white px-3 py-1 rounded-md"
          onClick={() => {
            setFromDate(null);
            setToDate(null);
          }}
        >
          Clear
        </button>
      </div> */}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">New Clients</div>
          <div className="text-base font-semibold text-Text-Primary">
            {kpis?.num_of_new_clients ?? '-'}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">
            Questionnaires Assigned
          </div>
          <div className="text-base font-semibold text-Text-Primary">
            {kpis?.num_of_questionnaires_assigned ?? '-'}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">
            Questionnaires Filled
          </div>
          <div className="text-base font-semibold text-Text-Primary">
            {kpis?.num_of_questionnaires_filled ?? '-'}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">Files Uploaded</div>
          <div className="text-base font-semibold text-Text-Primary">
            {kpis?.num_of_files_uploaded ?? '-'}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">
            Holistic Plans Saved
          </div>
          <div className="text-base font-semibold text-Text-Primary">
            {kpis?.num_of_holistic_plans_saved ?? '-'}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">
            Action Plans Saved
          </div>
          <div className="text-base font-semibold text-Text-Primary">
            {kpis?.num_of_action_plans_saved ?? '-'}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">
            Library Entries Created
          </div>
          <div className="text-base font-semibold text-Text-Primary">
            {kpis?.num_of_library_entries_created ?? '-'}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">
            Library Entries Updated
          </div>
          <div className="text-base font-semibold text-Text-Primary">
            {kpis?.num_of_library_entries_updated ?? '-'}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">
            Total Active (min)
          </div>
          <div className="text-base font-semibold text-Text-Primary">
            {sessionDurations.totalMin}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">
            Avg Active (min)
          </div>
          <div className="text-base font-semibold text-Text-Primary">
            {sessionDurations.avgMin}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">Activity Score</div>
          <div className="text-base font-semibold text-Text-Primary">
            {activityScore}
            <span className="ml-1 text-[10px] text-Text-Secondary">/100</span>
          </div>
          <div
            className={`text-[10px] mt-1 ${activityScore >= 60 ? 'text-green-600' : 'text-amber-600'}`}
          >
            {activityScore >= 60 ? 'Active' : 'Needs Attention'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Sessions list */}
        <div className="bg-white border border-Gray-50 rounded-2xl p-4 shadow-100">
          <div className="text-sm font-medium text-Text-Primary mb-3">
            Sessions
          </div>
          <div
            className=" overflow-auto pr-1"
            style={{ height: window.innerHeight - 500 + 'px' }}
          >
            <table className="w-full text-[10px] md:text-xs">
              <thead>
                <tr className="text-Text-Secondary text-left">
                  <th className="py-2 pr-2">User</th>
                  <th className="py-2">Start-End</th>
                  <th className="py-2">Active (m)</th>
                  <th className="py-2">Device</th>
                </tr>
              </thead>
              <tbody>
                {merged.map((s) => (
                  <tr
                    key={s.sessionId}
                    className={`cursor-pointer transition-colors ${
                      selectedSession?.sessionId === s.sessionId
                        ? 'bg-Primary-DeepTeal/10 border-l-4 border-Primary-DeepTeal'
                        : 'hover:bg-backgroundColor-Card'
                    }`}
                    onClick={() => setSelectedSessionId(s.sessionId)}
                  >
                    <td className="py-2 pr-2 text-Text-Primary">
                      {Date.now() - new Date(s.endedAt).getTime() <=
                        5 * 60 * 1000 && (
                        <span
                          title="online"
                          className="relative inline-flex mr-2 align-middle"
                        >
                          <span className="absolute inline-flex w-2 h-2 rounded-full bg-green-500 opacity-75 animate-ping"></span>
                          <span className="relative inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        </span>
                      )}
                      {s.events?.some((e) => e.eventName === 'api_error') && (
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 align-middle" />
                      )}
                      <span className="align-middle">{s.userId}</span>
                    </td>
                    <td className="py-2 text-Text-Secondary">
                      {formatTimeRange(s.startedAt, s.endedAt)}
                    </td>
                    <td className="py-2 text-Text-Primary">
                      {msToMin(s.totalActiveTimeMs)}
                    </td>
                    <td className="py-2 text-Text-Secondary">
                      {s.userAgent.deviceType} / {s.userAgent.browser}
                    </td>
                  </tr>
                ))}
                {merged.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-Text-Secondary"
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Events of selected session */}
        <div className="bg-white border border-Gray-50 rounded-2xl p-4 shadow-100">
          <div className="text-sm font-medium text-Text-Primary mb-1">
            Session events
          </div>
          {selectedSession ? (
            <div className="text-[10px] md:text-xs text-Text-Secondary mb-3 flex items-center gap-1">
              {Date.now() - new Date(selectedSession.endedAt).getTime() <=
                5 * 60 * 1000 && (
                <span title="online" className="relative inline-flex mr-1">
                  <span className="absolute inline-flex w-2 h-2 rounded-full bg-green-500 opacity-75 animate-ping"></span>
                  <span className="relative inline-block w-2 h-2 rounded-full bg-green-500"></span>
                </span>
              )}
              <span>
                {new Date(selectedSession.startedAt).toLocaleDateString()} —{' '}
                {formatTimeRange(
                  selectedSession.startedAt,
                  selectedSession.endedAt,
                )}
              </span>
            </div>
          ) : null}
          <div
            className=" overflow-auto pr-2"
            style={{ height: window.innerHeight - 500 + 'px' }}
          >
            {selectedSession?.events.map((ev, idx) => (
              <div key={ev.id} className="relative pl-6 py-2">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-Gray-50"></div>
                <div
                  className={`absolute left-[-5px] top-[14px] w-3 h-3 rounded-full ${
                    ev.eventName === 'api_error'
                      ? 'bg-red-500'
                      : 'bg-Primary-DeepTeal'
                  }`}
                ></div>
                <div className="flex items-center justify-between">
                  <div className="text-Text-Primary font-medium">
                    {idx + 1}. {ev.eventName}
                  </div>
                  <div className="text-Text-Secondary">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-Text-Secondary">
                  {Object.entries(ev.props || {}).map(([k, v]) => (
                    <div
                      key={k}
                      className={`${
                        ev.eventName === 'api_error'
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-backgroundColor-Card'
                      } rounded-md px-2 py-1`}
                    >
                      <span className="text-[10px] text-Text-Primary">
                        {k}:
                      </span>{' '}
                      <span className="break-all">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!selectedSession && (
              <div className="py-6 text-center text-Text-Secondary">
                No session selected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetails;
