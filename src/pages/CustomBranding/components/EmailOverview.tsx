import { FC, useEffect, useMemo, useState } from 'react';
import Application from '../../../api/app';

interface EmailOverviewProps {
  customTheme: {
    primaryColor: string;
    secondaryColor: string;
    selectedImage: string | null;
    name: string;
    headLine: string;
    slug: string;
    coachPhoto: string | null;
    coachName: string;
    coachTitle: string;
    coachPhone: string;
    coachEmail: string;
    coachWebsite: string;
    coachSocial: string;
  };
}

const EmailOverview: FC<EmailOverviewProps> = ({ customTheme }) => {
  const [html, setHtml] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const previewPayload = useMemo(
    () => ({
      logo: customTheme.selectedImage || '',
      name: customTheme.name,
      primary_color: customTheme.primaryColor,
      secondary_color: customTheme.secondaryColor,
      slug: customTheme.slug,
      coach_photo: customTheme.coachPhoto || '',
      coach_name: customTheme.coachName,
      coach_title: customTheme.coachTitle,
      coach_phone: customTheme.coachPhone,
      coach_email: customTheme.coachEmail,
      coach_website: customTheme.coachWebsite,
      coach_social: customTheme.coachSocial,
    }),
    [customTheme],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    const timer = window.setTimeout(() => {
      Application.previewWelcomeEmail(previewPayload)
        .then((res) => {
          if (cancelled) return;
          setHtml((res.data as { html?: string }).html || '');
          setSubject((res.data as { subject?: string }).subject || '');
          setLoading(false);
        })
        .catch(() => {
          if (!cancelled) {
            setFailed(true);
            setLoading(false);
          }
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [previewPayload]);

  const resizeIframe = (iframe: HTMLIFrameElement) => {
    const doc = iframe.contentDocument;
    if (!doc?.body) return;
    iframe.style.height = `${Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight, 640)}px`;
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-Gray-50 bg-white shadow-sm">
      <div className="flex min-w-0 items-start gap-3 border-b border-Gray-50 bg-white px-4 py-3 sm:px-5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-backgroundColor-Main">
          <span className="text-sm text-Primary-DeepTeal">@</span>
        </div>
        <div className="min-w-0">
          <div className="text-[9px] font-medium uppercase tracking-wide text-Text-Quadruple">
            Email subject
          </div>
          <div className="mt-0.5 break-words text-xs font-medium text-Text-Primary sm:text-sm">
            {subject || 'Welcome to [Clinic Name] – Your Account is Ready'}
          </div>
        </div>
      </div>
      <div className="w-full min-w-0 max-w-full overflow-hidden bg-[#eef1f4] p-2 sm:p-4">
        {loading ? (
          <div className="mx-auto max-w-[548px] animate-pulse overflow-hidden rounded-lg bg-white p-6">
            <div className="h-14 rounded bg-Gray-50" />
            <div className="mt-8 h-8 rounded bg-Gray-50" />
            <div className="mt-5 h-28 rounded bg-Gray-50" />
          </div>
        ) : failed ? (
          <div className="py-20 text-center">
            <div className="text-sm font-medium text-Text-Primary">
              Preview is unavailable
            </div>
            <div className="mt-1 text-[11px] text-Text-Quadruple">
              Check the backend connection and try again.
            </div>
          </div>
        ) : (
          <iframe
            title="Welcome email preview"
            className="block w-full min-w-0 max-w-full border-0 bg-transparent"
            style={{ minHeight: 640 }}
            srcDoc={html}
            sandbox="allow-same-origin"
            scrolling="no"
            onLoad={(event) => resizeIframe(event.currentTarget)}
          />
        )}
      </div>
    </div>
  );
};

export default EmailOverview;
