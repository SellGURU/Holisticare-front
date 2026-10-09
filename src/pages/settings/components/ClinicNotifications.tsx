import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Application from '../../../api/app';
import Circleloader from '../../../Components/CircleLoader';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';
import SpinnerLoader from '../../../Components/SpinnerLoader';
import {
  ClinicNotificationSettings,
  EMAIL_ROWS,
  PUSH_ROWS,
  emptyClinicNotificationSettings,
} from './clinicNotificationSettings';
import {
  NotificationSwitch,
  NotificationSwitchGroup,
} from './NotificationSwitch';

const readSettings = (data: ClinicNotificationSettings | undefined) => {
  const base = emptyClinicNotificationSettings();
  return {
    email: { ...base.email, ...(data?.email || {}) },
    push: { ...base.push, ...(data?.push || {}) },
  };
};

export const ClinicNotifications = () => {
  const [settings, setSettings] = useState<ClinicNotificationSettings>(
    emptyClinicNotificationSettings(),
  );
  const [initial, setInitial] = useState<ClinicNotificationSettings>(
    emptyClinicNotificationSettings(),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Application.getClinicNotificationSettings()
      .then((res) => {
        const next = readSettings(res.data);
        setSettings(next);
        setInitial(next);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.detail || 'Failed to load notification settings.',
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = (
    channel: 'email' | 'push',
    key: string,
    checked: boolean,
  ) => {
    setSettings((current) => ({
      ...current,
      [channel]: { ...current[channel], [key]: checked },
    }));
  };

  return (
    <div className="bg-backgroundColor-Card h-fit w-full rounded-2xl relative shadow-100 p-4 text-Text-Primary">
      {loading ? (
        <div className="flex h-[300px] w-full items-center justify-center">
          <Circleloader />
        </div>
      ) : (
        <>
          <div className="text-sm font-medium text-Text-Primary">
            Notifications
          </div>
          <div className="my-4 text-[10px] text-[#888888]">
            Choose which patient emails and push notifications this clinic
            sends. In-app notifications stay on.
          </div>
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
          <div className="mt-4 flex items-center justify-end gap-4">
            <button
              type="button"
              className="text-xs font-medium text-Disable"
              onClick={() => setSettings(initial)}
            >
              Back to Default
            </button>
            <ButtonPrimary
              ClassName="min-w-[150px]"
              onClick={() => {
                if (saving) return;
                setSaving(true);
                Application.updateClinicNotificationSettings(settings)
                  .then((res) => {
                    const next = readSettings(res.data);
                    setSettings(next);
                    setInitial(next);
                    toast.success('Notification settings saved.');
                  })
                  .catch((err) => {
                    toast.error(
                      err?.response?.data?.detail ||
                        'Failed to save notification settings.',
                    );
                  })
                  .finally(() => setSaving(false));
              }}
            >
              {saving ? <SpinnerLoader color="#005F73" /> : 'Apply Changes'}
            </ButtonPrimary>
          </div>
        </>
      )}
    </div>
  );
};
