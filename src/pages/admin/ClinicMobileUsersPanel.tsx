/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { KeyRound, Search, Smartphone, X } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminApi from '../../api/admin';
import {
  expiryMsFromRemaining,
  formatCountdown,
  remainingSecondsFromMs,
} from './tempPasswordCountdown';

export interface MobileUserRow {
  mobile_user_id: number;
  patients_id: number;
  member_id: number | null;
  name: string;
  login_email: string;
  is_active: boolean;
  temp_password_expires_at: string | null;
  temp_password_remaining_seconds?: number | null;
  tempExpiresAtMs?: number | null;
}

interface ClinicMobileUsersPanelProps {
  clinicId: number;
  clinicName: string;
  onClose: () => void;
  onGrant: (payload: {
    clinic_id: number;
    clinic_name: string;
    login_email: string;
    temporary_password: string;
    expires_at: string;
    expires_in_seconds: number;
    account_kind: 'mobile';
    display_name?: string;
  }) => void;
}

const withLocalExpiry = (user: MobileUserRow, nowMs = Date.now()): MobileUserRow => ({
  ...user,
  tempExpiresAtMs: expiryMsFromRemaining(
    user.temp_password_remaining_seconds,
    nowMs,
  ),
});

const ClinicMobileUsersPanel = ({
  clinicId,
  clinicName,
  onClose,
  onGrant,
}: ClinicMobileUsersPanelProps) => {
  const [loading, setLoading] = useState(true);
  const [grantingId, setGrantingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<MobileUserRow[]>([]);
  const [nowTick, setNowTick] = useState(0);

  const loadUsers = async (term = search) => {
    setLoading(true);
    try {
      const res = await AdminApi.listClinicMobileUsers(clinicId, term.trim());
      const nowMs = Date.now();
      setUsers(
        (res.data?.mobile_users || []).map((user: MobileUserRow) =>
          withLocalExpiry(user, nowMs),
        ),
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to load mobile users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers('').catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  const hasActive = users.some(
    (user) => remainingSecondsFromMs(user.tempExpiresAtMs) > 0,
  );

  useEffect(() => {
    if (!hasActive) return undefined;
    const timer = window.setInterval(() => setNowTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [hasActive]);

  void nowTick;

  const visibleUsers = useMemo(() => users, [users]);

  const grantTempPassword = async (user: MobileUserRow) => {
    if (
      !window.confirm(
        `Set a 60-second mobile password for ${user.login_email || user.name || `user #${user.mobile_user_id}`}? The original password will be restored automatically.`,
      )
    ) {
      return;
    }

    setGrantingId(user.mobile_user_id);
    try {
      const res = await AdminApi.grantTempMobilePassword(
        clinicId,
        user.mobile_user_id,
      );
      const expiresAtMs = expiryMsFromRemaining(res.data?.expires_in_seconds || 60);
      setUsers((current) =>
        current.map((item) =>
          item.mobile_user_id === user.mobile_user_id
            ? {
                ...item,
                temp_password_expires_at: res.data.expires_at,
                temp_password_remaining_seconds: res.data.expires_in_seconds,
                tempExpiresAtMs: expiresAtMs,
              }
            : item,
        ),
      );
      onGrant({
        clinic_id: clinicId,
        clinic_name: clinicName,
        login_email: res.data.login_email,
        temporary_password: res.data.temporary_password,
        expires_at: res.data.expires_at,
        expires_in_seconds: res.data.expires_in_seconds,
        account_kind: 'mobile',
        display_name: res.data.display_name,
      });
      toast.success('Temporary mobile password is active for 60 seconds.');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          'Failed to create a temporary mobile password.',
      );
    } finally {
      setGrantingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-Gray-50 px-4 py-3">
          <div>
            <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-Text-Primary">
              <Smartphone size={16} />
              Mobile users
            </div>
            <div className="mt-1 text-[12px] text-Text-Secondary">
              {clinicName || `Clinic #${clinicId}`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-Text-Secondary"
          >
            <X size={16} />
          </button>
        </div>
        <div className="border-b border-Gray-50 px-4 py-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-Text-Secondary"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') loadUsers(search).catch(() => {});
              }}
              placeholder="Search name, email, or member ID"
              className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] py-2 pl-9 pr-3 text-[12px] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => loadUsers(search)}
            className="mt-2 text-[11px] text-Text-Secondary"
          >
            Search
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="py-8 text-center text-[12px] text-Text-Secondary">
              Loading mobile users...
            </div>
          ) : visibleUsers.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-Text-Secondary">
              No active mobile users found.
            </div>
          ) : (
            <div className="divide-y divide-Gray-50">
              {visibleUsers.map((user) => {
                const activeSeconds = remainingSecondsFromMs(user.tempExpiresAtMs);
                const busy = grantingId === user.mobile_user_id;
                return (
                  <div
                    key={user.mobile_user_id}
                    className="flex items-start justify-between gap-3 py-3"
                  >
                    <div>
                      <div className="text-[12px] font-medium text-Text-Primary">
                        {user.name || 'Unnamed client'}
                      </div>
                      <div className="mt-1 text-[11px] text-Text-Secondary">
                        {user.login_email || 'No email'}
                        {user.member_id != null ? ` · member ${user.member_id}` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => grantTempPassword(user)}
                      className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] text-Text-Primary"
                    >
                      <KeyRound size={14} />
                      {activeSeconds > 0
                        ? `Temp ${formatCountdown(activeSeconds)}`
                        : 'Temp password'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicMobileUsersPanel;
