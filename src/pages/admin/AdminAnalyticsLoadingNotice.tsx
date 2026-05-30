import { Loader2 } from 'lucide-react';

const AdminAnalyticsLoadingNotice = ({
  detail = 'Fetching metrics for the selected clinic and date range.',
}: {
  detail?: string;
}) => (
  <div className="rounded-[16px] border border-Primary-DeepTeal/20 bg-[#E8F4F6] px-4 py-3 flex items-start gap-3">
    <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin text-Primary-DeepTeal" />
    <div>
      <div className="text-[12px] font-medium text-Text-Primary">Loading analytics data…</div>
      <div className="mt-0.5 text-[11px] text-Text-Secondary leading-5">{detail}</div>
    </div>
  </div>
);

export default AdminAnalyticsLoadingNotice;
