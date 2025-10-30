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

const toLocalDateOnly = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const msToMin = (ms: number) => Math.round(ms / 60000);
const formatTimeRange = (startIso: string, endIso: string) => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const two = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${two(s.getHours())}:${two(s.getMinutes())} - ${two(e.getHours())}:${two(e.getMinutes())}`;
};

const LogDetails = () => {
  const { id: clinicId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clinicIdInput, setClinicIdInput] = useState<string>(clinicId || '');

  // Placeholder sample; replace with API fetch later
  const [data] = useState<SessionLog[]>([]);

  const [fromDate, setFromDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d;
  });
  const [toDate, setToDate] = useState<Date | null>(() => new Date());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

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

  const stats = useMemo(() => {
    const sessionsCount = filtered.length;
    const totalActive = filtered.reduce(
      (acc, s) => acc + s.totalActiveTimeMs,
      0,
    );
    const avgActiveMin = sessionsCount
      ? Math.round(totalActive / sessionsCount / 60000)
      : 0;
    const uniqueUsers = new Set(filtered.map((s) => s.userId)).size;
    const by = (key: keyof UserAgent) => {
      const map = new Map<string, number>();
      filtered.forEach((s) => {
        const k = String(s.userAgent[key]);
        map.set(k, (map.get(k) || 0) + 1);
      });
      return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    };
    const topBrowser = by('browser')[0]?.[0];
    const topOS = by('os')[0]?.[0];
    const topDevice = by('deviceType')[0]?.[0];
    return {
      sessionsCount,
      totalActiveMin: msToMin(totalActive),
      avgActiveMin,
      uniqueUsers,
      topBrowser,
      topOS,
      topDevice,
    };
  }, [filtered]);

  const selectedSession = useMemo(
    () =>
      filtered.find((s) => s.sessionId === selectedSessionId) || filtered[0],
    [filtered, selectedSessionId],
  );

  const getLog = () => {
    Admin.getLog(
      clinicIdInput,
      fromDate?.toISOString() || '',
      toDate?.toISOString() || '',
    )
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getLog();
  }, [fromDate, toDate]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center gap-3">
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

      <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
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
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">Sessions</div>
          <div className="text-base font-semibold text-Text-Primary">
            {stats.sessionsCount}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">
            Total Active (min)
          </div>
          <div className="text-base font-semibold text-Text-Primary">
            {stats.totalActiveMin}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">
            Avg Active (min)
          </div>
          <div className="text-base font-semibold text-Text-Primary">
            {stats.avgActiveMin}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">Users</div>
          <div className="text-base font-semibold text-Text-Primary">
            {stats.uniqueUsers}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">Top Browser</div>
          <div className="text-base font-semibold text-Text-Primary">
            {stats.topBrowser || '-'}
          </div>
        </div>
        <div className="bg-white border border-Gray-50 rounded-xl p-3 shadow-100">
          <div className="text-[10px] text-Text-Secondary">Top Device</div>
          <div className="text-base font-semibold text-Text-Primary">
            {stats.topDevice || '-'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Sessions list */}
        <div className="bg-white border border-Gray-50 rounded-2xl p-4 shadow-100">
          <div className="text-sm font-medium text-Text-Primary mb-3">
            Sessions
          </div>
          <div className="max-h-[420px] overflow-auto pr-1">
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
                {filtered.map((s) => (
                  <tr
                    key={s.sessionId}
                    className={`cursor-pointer hover:bg-backgroundColor-Card ${selectedSession?.sessionId === s.sessionId ? 'bg-backgroundColor-Card' : ''}`}
                    onClick={() => setSelectedSessionId(s.sessionId)}
                  >
                    <td className="py-2 pr-2 text-Text-Primary">{s.userId}</td>
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
                {filtered.length === 0 && (
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
            <div className="text-[10px] md:text-xs text-Text-Secondary mb-3">
              {new Date(selectedSession.startedAt).toLocaleDateString()} —{' '}
              {formatTimeRange(
                selectedSession.startedAt,
                selectedSession.endedAt,
              )}
            </div>
          ) : null}
          <div className="max-h-[420px] overflow-auto pr-2">
            {selectedSession?.events.map((ev, idx) => (
              <div key={ev.id} className="relative pl-6 py-2">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-Gray-50"></div>
                <div className="absolute left-[-5px] top-[14px] w-3 h-3 bg-Primary-DeepTeal rounded-full"></div>
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
                      className="bg-backgroundColor-Card rounded-md px-2 py-1"
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
