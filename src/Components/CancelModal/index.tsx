export const CancelModal = () => {
  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm bg-[#0000004D] flex items-center justify-center">
      <div className="rounded-2xl p-6 pb-8 bg-white shadow-800">
        <div className="w-full flex gap-3 items-center border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
          <img src="/icons/danger.svg" alt="" />
          Cancel Subscription
        </div>
        <div className="mt-4 text-center text-xs font-medium">
          Are you sure you want to cancel your subscription?{' '}
        </div>
        <div className="mt-2 text-xs text-Text-Secondary">
          After canceling your subscription, you will still have access to
          features until September 27th, 2024.
        </div>
      </div>
    </div>
  );
};
