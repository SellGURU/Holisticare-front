import { useApp } from '../hooks';

const DemoBanner = () => {
  const { clinicPlan } = useApp();

  if (clinicPlan !== 'demo') return null;

  return (
    <div className="w-full border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-[11px] text-amber-900">
      <span className="font-semibold">Demo plan:</span> Adding or editing data is disabled.
      Upgrade to the paying version for full access.
    </div>
  );
};

export default DemoBanner;
