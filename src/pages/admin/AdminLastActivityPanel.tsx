import { LogIn, LogOut } from 'lucide-react';
import {
  formatPreciseDateTime,
  formatRelativeDate,
} from '../../utils/formatRelativeDate';
import {
  formatVisitDuration,
  logoutReasonLabel,
  type LatestAuthMoments,
} from '../../utils/sessionParser';

interface AdminLastActivityPanelProps {
  moments: LatestAuthMoments;
  scopeLabel: string;
}

const TimestampBlock = ({
  value,
  emptyLabel,
}: {
  value: string | null;
  emptyLabel: string;
}) => {
  if (!value) {
    return (
      <div>
        <div className="text-xl font-semibold text-Text-Primary">{emptyLabel}</div>
        <div className="mt-1 text-[11px] text-Text-Secondary">
          No timestamp in this date range
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-xl font-semibold text-Text-Primary">
        {formatRelativeDate(value) || 'Unknown'}
      </div>
      <div className="mt-1 font-mono text-[12px] text-Text-Primary">
        {formatPreciseDateTime(value)}
      </div>
    </div>
  );
};

const AdminLastActivityPanel = ({
  moments,
  scopeLabel,
}: AdminLastActivityPanelProps) => {
  const lastVisit = moments.lastVisit;

  return (
    <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="TextStyle-Headline-5 text-Text-Primary">
            Last login and logout
          </div>
          <div className="mt-1 text-[11px] text-Text-Secondary">
            Precise portal presence for {scopeLabel}. Nearby 2-minute activity
            chunks are merged into one visit.
          </div>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-medium ${
            moments.appearsActive
              ? 'bg-[#ECFDF3] text-[#027A48]'
              : 'bg-[#F2F4F7] text-[#475467]'
          }`}
        >
          {moments.appearsActive ? 'Appears active' : 'No active session'}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-[#F8FAFB] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-Text-Secondary">
            <LogIn size={14} />
            Last login
          </div>
          <div className="mt-3">
            <TimestampBlock
              value={moments.lastLoginAt}
              emptyLabel="No login yet"
            />
          </div>
          {lastVisit && (
            <div className="mt-3 text-[11px] text-Text-Secondary">
              Visit length {formatVisitDuration(lastVisit.durationMs)}
              {lastVisit.sessionCount > 1
                ? ` · ${lastVisit.sessionCount} activity chunks`
                : ''}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#F8FAFB] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-Text-Secondary">
            <LogOut size={14} />
            Last logout
          </div>
          <div className="mt-3">
            <TimestampBlock
              value={moments.lastLogoutAt}
              emptyLabel="No logout recorded"
            />
          </div>
          <div className="mt-3 text-[11px] text-Text-Secondary">
            {moments.lastLogoutAt
              ? logoutReasonLabel(moments.lastLogoutReason)
              : 'The clinic may still be in the portal, or logout was not captured.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLastActivityPanel;
