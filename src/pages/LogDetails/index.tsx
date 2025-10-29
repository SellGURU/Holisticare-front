import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import SimpleDatePicker from '../../Components/SimpleDatePicker';

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

  // Placeholder sample; replace with API fetch later
  const [data] = useState<SessionLog[]>([
    {
      sessionId: '7fe3379c-9560-45b8-a3c5-ac95a3a85c9f',
      userId: 'anonymous_user',
      startedAt: '2025-10-28T07:15:17.572Z',
      endedAt: '2025-10-28T07:15:47.641Z',
      totalActiveTimeMs: 30069,
      userAgent: {
        browser: 'Chrome',
        os: 'Android',
        deviceType: 'mobile',
        screen: { width: 1430, height: 733 },
      },
      events: [
        {
          id: 'a3908f38-32f1-4b0e-a0a1-b5aafbedc6a3',
          eventName: 'session_start',
          timestamp: '2025-10-28T07:15:17.572Z',
          props: { path: '/' },
        },
        {
          id: '9aa2d2f8-229a-457f-96bc-dd32c9d1a6dd',
          eventName: 'page_view',
          timestamp: '2025-10-28T07:15:17.887Z',
          props: { path: '/', title: 'Holisticare' },
        },
        {
          id: '26945c91-0b3c-41a8-9a8a-2a4dd60a36dd',
          eventName: 'click',
          timestamp: '2025-10-28T07:15:38.434Z',
          props: {
            element: 'div.text-[10px].font-medium.sm:text-xs.ml-[0.5px]',
            text: 'Health Plan',
            route: '/report/840206839852/lowto%20dd',
          },
        },
        {
          id: '084a486a-0282-477b-91f1-d7094c01e7e4',
          eventName: 'click',
          timestamp: '2025-10-28T07:15:40.475Z',
          props: {
            element:
              'div.cursor-pointer.w-full.md:w-[477px].h-[269px].rounded-2xl.border.p-3.md:p-6.flex.flex-col.items-center.gap-[12px].relative.bg-white.shadow-100.border-Gray-50',
            text: 'Upload Lab Report or Add BiomarkersUpload your cli',
            route: '/report/840206839852/lowto%20dd',
          },
        },
        {
          id: '70bf472e-f799-496b-b76b-f39d40a13150',
          eventName: 'click',
          timestamp: '2025-10-28T07:15:41.671Z',
          props: {
            element: 'div.TextStyle-Button.text-[#445A74].cursor-pointer.ml-1',
            text: 'Client List',
            route: '/',
          },
        },
        {
          id: '14bdc1ae-d530-404e-a95d-ecf5bbb47b23',
          eventName: 'page_view',
          timestamp: '2025-10-28T07:15:41.704Z',
          props: { path: '/', title: 'Holisticare' },
        },
        {
          id: '18e1500d-fb0b-48c3-8b4d-c263455b7cd8',
          eventName: 'click',
          timestamp: '2025-10-28T07:15:45.610Z',
          props: {
            element: 'div.text-Primary-DeepTeal',
            text: 'Dashboard',
            route: '/dashboard',
          },
        },
        {
          id: 'df5acf70-a3c5-4ad1-a744-46a2dbc88721',
          eventName: 'page_view',
          timestamp: '2025-10-28T07:15:45.624Z',
          props: { path: '/dashboard', title: 'Holisticare' },
        },
        {
          id: '80990ceb-0408-4d18-a0aa-3c85be905246',
          eventName: 'click',
          timestamp: '2025-10-28T07:15:47.640Z',
          props: { element: 'img', text: '', route: '/dashboard' },
        },
      ],
    },
    {
      sessionId: 'b2d1c0b1-2222-4333-8444-555555555555',
      userId: 'user_123',
      startedAt: '2025-10-27T11:02:10.000Z',
      endedAt: '2025-10-27T11:25:10.000Z',
      totalActiveTimeMs: 23 * 60 * 1000,
      userAgent: {
        browser: 'Safari',
        os: 'iOS',
        deviceType: 'mobile',
        screen: { width: 1170, height: 2532 },
      },
      events: [
        {
          id: 'evt-1',
          eventName: 'session_start',
          timestamp: '2025-10-27T11:02:10.000Z',
          props: { path: '/' },
        },
        {
          id: 'evt-2',
          eventName: 'page_view',
          timestamp: '2025-10-27T11:02:15.000Z',
          props: { path: '/', title: 'Holisticare' },
        },
        {
          id: 'evt-3',
          eventName: 'click',
          timestamp: '2025-10-27T11:05:00.000Z',
          props: { element: 'button#login', text: 'Login', route: '/login' },
        },
        {
          id: 'evt-4',
          eventName: 'page_view',
          timestamp: '2025-10-27T11:05:02.000Z',
          props: { path: '/login', title: 'Login' },
        },
      ],
    },
    {
      sessionId: 'c3e2d1f0-aaaa-bbbb-cccc-666666666666',
      userId: 'anonymous_user',
      startedAt: '2025-10-28T08:10:00.000Z',
      endedAt: '2025-10-28T08:40:00.000Z',
      totalActiveTimeMs: 30 * 60 * 1000,
      userAgent: {
        browser: 'Chrome',
        os: 'Windows',
        deviceType: 'desktop',
        screen: { width: 1920, height: 1080 },
      },
      events: [
        {
          id: 'evt-5',
          eventName: 'session_start',
          timestamp: '2025-10-28T08:10:00.000Z',
          props: { path: '/' },
        },
        {
          id: 'evt-6',
          eventName: 'page_view',
          timestamp: '2025-10-28T08:10:02.000Z',
          props: { path: '/', title: 'Holisticare' },
        },
        {
          id: 'evt-7',
          eventName: 'click',
          timestamp: '2025-10-28T08:12:30.000Z',
          props: {
            element: 'a#dashboard',
            text: 'Dashboard',
            route: '/dashboard',
          },
        },
        {
          id: 'evt-8',
          eventName: 'page_view',
          timestamp: '2025-10-28T08:12:33.000Z',
          props: { path: '/dashboard', title: 'Dashboard' },
        },
      ],
    },
  ]);

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

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 text-xs text-Text-Secondary">
        Clinic ID: {clinicId}
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
