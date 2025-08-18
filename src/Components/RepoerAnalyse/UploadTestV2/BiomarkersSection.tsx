import React from 'react';

const BiomarkersSection: React.FC = () => {
  return (
    <div className="w-full min-h-[290px] rounded-2xl border border-Gray-50 p-4 shadow-300 text-sm font-medium text-Text-Primary">
      List of Biomarkers
      <div className="flex items-center pt-8 justify-center flex-col text-xs font-medium text-Text-Primary">
        <img src="/icons/EmptyState-biomarkers.svg" alt="" />
        <div className="-mt-5">No data provided yet.</div>
      </div>
    </div>
  );
};

export default BiomarkersSection;