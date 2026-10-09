/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminApi from '../../api/admin';
import Circleloader from '../../Components/CircleLoader';
import {
  ClinicNotificationSettings,
  EMAIL_ROWS,
  PUSH_ROWS,
  emptyClinicNotificationSettings,
} from '../settings/components/clinicNotificationSettings';
import {
  NotificationSwitch,
  NotificationSwitchGroup,
} from '../settings/components/NotificationSwitch';

type ClinicNotificationsModalProps = {
  clinicId: number;
  clinicName: string;
  onClose: () => void;
};

const readSettings = (data: ClinicNotificationSettings | undefined) => {
  const base = emptyClinicNotificationSettings();
  return {
    email: { ...base.email, ...(data?.email || {}) },
    push: { ...base.push, ...(data?.push || {}) },
  };
};

const ClinicNotificationsModal = ({
  clinicId,
  clinicName,
  onClose,
}: ClinicNotificationsModalProps) => {
  const [settings, setSettings] = useState<ClinicNotificationSettings>(
    emptyClinicNotificationSettings(),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    AdminApi.getClinicNotificationSettings(clinicId)
      .then((res) => setSettings(readSettings(res.data)))
      .catch((err) => {
        toast.error(
          err?.response?.data?.detail || 'Failed to load notification settings.',
        );
      })
      .finally(() => setLoading(false));
  }, [clinicId]);

  const toggle = (channel: 'email' | 'push', key: string, checked: boolean) => {
    setSettings((current) => ({
      ...current,
      [channel]: { ...current[channel], [key]: checked },
    }));
  };

  const save = () => {
    setSaving(true);
    AdminApi.updateClinicNotificationSettings(clinicId, settings)
      .then(() => {
        toast.success('Notification settings saved.');
        onClose();
      })
      .catch((err: any) => {
        toast.error(
          err?.response?.data?.detail || 'Failed to save notification settings.',
        );
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-2xl bg-white p-5 shadow-100">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-Text-Primary">
              Notifications
            </div>
            <div className="mt-1 text-[12px] text-Text-Secondary">
              {clinicName || `Clinic #${clinicId}`}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {loading ? (
          <div className="flex h-[220px] items-center justify-center">
            <Circleloader />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <NotificationSwitchGroup title="Email">
                {EMAIL_ROWS.map((row) => (
                  <NotificationSwitch
                    key={row.key}
                    label={row.label}
                    checked={settings.email[row.key]}
                    onChange={(next) => toggle('email', row.key, next)}
                  />
                ))}
              </NotificationSwitchGroup>
              <NotificationSwitchGroup title="Push">
                {PUSH_ROWS.map((row) => (
                  <NotificationSwitch
                    key={row.key}
                    label={row.label}
                    checked={settings.push[row.key]}
                    onChange={(next) => toggle('push', row.key, next)}
                  />
                ))}
              </NotificationSwitchGroup>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="rounded-xl bg-Primary-DeepTeal px-4 py-2 text-[12px] text-white disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClinicNotificationsModal;
