const SkeletonBar = ({
  className = '',
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) => (
  <div
    className={`h-2.5 rounded bg-Gray-100 animate-pulse ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  />
);

/** Right-panel category cards lazy load while categories API is in flight. */
export const ClientSummaryContentSkeleton = () => (
  <div className="w-full mt-4 grid gap-4 grid-cols-1 xl:grid-cols-2 animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="h-[64px] rounded-[6px] border border-Gray-25 bg-white shadow-100 p-4 flex items-center gap-3"
        style={{ animationDelay: `${i * 60}ms` }}
      >
        <div className="size-10 rounded-full bg-Gray-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBar className="w-2/3 h-3" />
          <SkeletonBar className="w-1/2" delay={40} />
        </div>
      </div>
    ))}
  </div>
);

export const ClientSummarySkeleton = () => (
  <div className="flex flex-col xl:flex-row gap-6 xl:gap-14 animate-pulse">
    <div className="min-w-[430px] w-full xl:w-[330px] relative xl:min-h-[750px]">
      <SkeletonBar className="w-32 mb-2" />
      <SkeletonBar className="w-48 mb-6" delay={80} />
      <div className="relative hidden xl:block">
        <div className="w-full max-w-[280px] mx-auto aspect-[3/5] rounded-2xl bg-Gray-100" />
      </div>
    </div>
    <div className="flex-grow w-full mt-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-6 rounded-full bg-Gray-100" />
        <SkeletonBar className="w-28" />
        <SkeletonBar className="w-20" delay={60} />
        <SkeletonBar className="w-12" delay={120} />
      </div>
      <ClientSummaryContentSkeleton />
    </div>
  </div>
);

export const NeedFocusSkeleton = () => (
  <div className="w-full mt-4 grid gap-4 xl:grid-cols-2 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="rounded-xl border border-Gray-25 bg-Gray-15 p-4 space-y-3"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        <SkeletonBar className="w-1/2" />
        <SkeletonBar className="w-full" delay={40} />
        <SkeletonBar className="w-3/4" delay={80} />
      </div>
    ))}
  </div>
);

export const ConcerningResultSkeleton = () => (
  <div className="animate-pulse">
    <div className="w-full bg-gray-100 rounded-t-[6px] border-b border-Gray-50 h-[56px] hidden xl:flex items-center gap-4 px-6">
      <SkeletonBar className="w-[800px]" />
      <SkeletonBar className="w-[120px]" delay={40} />
      <SkeletonBar className="w-[120px]" delay={80} />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="w-full border-b border-Gray-25 h-[56px] flex items-center gap-4 px-6"
        style={{ animationDelay: `${i * 60}ms` }}
      >
        <SkeletonBar className="w-[800px] hidden xl:block" />
        <SkeletonBar className="w-full xl:hidden" />
        <SkeletonBar className="w-[120px] hidden xl:block" delay={40} />
      </div>
    ))}
  </div>
);

export const DetailedAnalysisSkeleton = () => (
  <div className="mt-6 space-y-4 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="rounded-xl border border-Gray-25 bg-Gray-15 p-5 space-y-3"
        style={{ animationDelay: `${i * 100}ms` }}
      >
        <SkeletonBar className="w-1/3" />
        <SkeletonBar className="w-full" delay={40} />
        <SkeletonBar className="w-5/6" delay={80} />
        <div className="grid grid-cols-3 gap-3 pt-2">
          <SkeletonBar delay={120} />
          <SkeletonBar delay={160} />
          <SkeletonBar delay={200} />
        </div>
      </div>
    ))}
  </div>
);

export const HolisticPlanSkeleton = () => (
  <div className="mt-6 space-y-4 animate-pulse">
    <div className="flex gap-2 mb-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBar key={i} className="w-20 h-8 rounded-full" delay={i * 50} />
      ))}
    </div>
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="rounded-xl border border-Gray-25 bg-Gray-15 p-5 space-y-3"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        <SkeletonBar className="w-1/4" />
        <SkeletonBar className="w-full" delay={40} />
        <SkeletonBar className="w-2/3" delay={80} />
      </div>
    ))}
  </div>
);

export const ActionPlanSkeleton = () => (
  <div className="mt-4 space-y-4 animate-pulse">
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonBar key={i} className="h-8" delay={i * 30} />
      ))}
    </div>
    <div className="rounded-xl border border-Gray-25 bg-Gray-15 p-5 min-h-[300px] space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonBar key={i} className="w-full" delay={i * 60} />
      ))}
    </div>
  </div>
);
