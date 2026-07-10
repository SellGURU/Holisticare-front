const OfflineBanner = () => (
  <div
    role="status"
    aria-live="polite"
    className="fixed inset-x-0 top-0 z-[9999] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2.5 text-center text-sm font-medium text-white shadow-md"
  >
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 16.5a5 5 0 017 0M2 8.82a15 15 0 0118 0M5 12.55a11 11 0 0114 0M12 20h.01"
      />
      <path strokeLinecap="round" d="M4 4l16 16" />
    </svg>
    <span>
      No internet connection. We&apos;ll retry when you&apos;re back online.
    </span>
  </div>
);

export default OfflineBanner;
