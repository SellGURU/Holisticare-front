import { useEffect, useState } from 'react';
import Toggle from '../../../Components/RepoerAnalyse/Boxs/Toggle';
import Circleloader from '../../../Components/CircleLoader';
import Application from '../../../api/app';

type PrivacyRowProps = {
  title: string;
  description: string;
  control: React.ReactNode;
  comingSoon?: boolean;
};

function PrivacyRow({
  title,
  description,
  control,
  comingSoon = false,
}: PrivacyRowProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0 ${
        comingSoon ? 'opacity-60' : ''
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-Text-Primary">{title}</p>
          {comingSoon && (
            <span className="rounded-full border border-Gray-50 bg-[#F7F7F7] px-1.5 py-0.5 text-[9px] font-medium text-[#888888]">
              Coming soon
            </span>
          )}
        </div>
        <p className="mt-1 text-[10px] leading-4 text-[#888888]">
          {description}
        </p>
      </div>
      <div className="shrink-0 pt-0.5">{control}</div>
    </div>
  );
}

function PrivacySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-Gray-50 bg-[#FDFDFD] px-4 py-3">
      <h3 className="mb-3 text-[10px] font-medium uppercase tracking-[0.04em] text-[#B0B0B0]">
        {title}
      </h3>
      <div className="divide-y divide-Gray-50">{children}</div>
    </section>
  );
}

export const PrivacySettings = () => {
  const [shareOnline, setShareOnline] = useState(true);
  const [hasTutorial, setHasTutorial] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tutorial = localStorage.getItem('showTutorialAgain');
    setHasTutorial(tutorial !== 'false');

    Application.chatPresencePrivacy()
      .then((res) => {
        setShareOnline(res.data?.share_online !== false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveShareOnline = (next: boolean) => {
    setShareOnline(next);
    Application.chatPresencePrivacy({ share_online: next }).catch(() => {
      setShareOnline(!next);
    });
  };

  const saveTutorial = (next: boolean) => {
    setHasTutorial(next);
    localStorage.setItem('showTutorialAgain', next ? 'true' : 'false');
  };

  return (
    <div className="relative h-fit min-h-[348px] w-full rounded-2xl border border-Gray-50 bg-backgroundColor-Card p-4 text-Text-Primary shadow-100">
      {loading ? (
        <div className="flex h-[300px] w-full items-center justify-center">
          <Circleloader />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-sm font-medium">Privacy</div>
            <p className="mt-1 max-w-[520px] text-[10px] leading-4 text-[#888888]">
              Global controls for what others can see about you in Holisticare.
              Chat is live now; more account-wide options will land here.
            </p>
          </div>

          <PrivacySection title="Chat">
            <PrivacyRow
              title="Online status"
              description="Patients can see when you are active in the Holisticare portal. Turn this off to keep your presence private."
              control={
                <div className="flex items-center gap-2">
                  <Toggle checked={shareOnline} setChecked={saveShareOnline} />
                  <span className="w-10 text-[10px] text-[#888888]">
                    {shareOnline ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              }
            />
            <PrivacyRow
              title="Read receipts"
              description="Let patients know when you have opened their messages."
              comingSoon
              control={
                <div className="pointer-events-none">
                  <Toggle checked={false} setChecked={() => undefined} />
                </div>
              }
            />
            <PrivacyRow
              title="Typing indicator"
              description="Show patients when you are writing a reply."
              comingSoon
              control={
                <div className="pointer-events-none">
                  <Toggle checked={false} setChecked={() => undefined} />
                </div>
              }
            />
          </PrivacySection>

          <PrivacySection title="Experience">
            <PrivacyRow
              title="Product tutorial"
              description="Show Holisticare walkthroughs and helper tips in the portal."
              control={
                <div className="flex items-center gap-2">
                  <Toggle checked={hasTutorial} setChecked={saveTutorial} />
                  <span className="w-10 text-[10px] text-[#888888]">
                    {hasTutorial ? 'On' : 'Off'}
                  </span>
                </div>
              }
            />
          </PrivacySection>

          <PrivacySection title="Coming later">
            <PrivacyRow
              title="Notification privacy"
              description="Choose which clinic events can surface your activity to patients."
              comingSoon
              control={
                <div className="pointer-events-none">
                  <Toggle checked={false} setChecked={() => undefined} />
                </div>
              }
            />
            <PrivacyRow
              title="Data sharing"
              description="Manage clinic-wide defaults for what staff can share outside the portal."
              comingSoon
              control={
                <div className="pointer-events-none">
                  <Toggle checked={false} setChecked={() => undefined} />
                </div>
              }
            />
          </PrivacySection>
        </div>
      )}
    </div>
  );
};
