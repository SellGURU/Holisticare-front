/* eslint-disable @typescript-eslint/no-explicit-any */
import StatusBarChartv3 from './StatusBarChartv3';

interface ChartModalProps {
  data: any;
  onClose: () => void;
}

const getThresholdCharts = (data: any) => {
  const thresholds = data?.thresholds || {};
  return (['male', 'female'] as const).flatMap((gender) => {
    const genderData = thresholds?.[gender] || {};
    return Object.keys(genderData)
      .map((ageRange) => ({
        gender,
        ageRange,
        ranges: Array.isArray(genderData[ageRange])
          ? genderData[ageRange]
          : [],
      }))
      .filter((item) => item.ranges.length > 0);
  });
};

const ChartModal: React.FC<ChartModalProps> = ({ data, onClose }) => {
  const charts = getThresholdCharts(data);

  return (
    <div className="w-[94vw] max-w-[980px] max-h-[86vh] bg-white rounded-[18px] flex flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-Gray-50">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-Text-Primary truncate">
            {data?.Biomarker || 'Biomarker chart'}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-Text-Secondary">
            <span>{data?.Category || 'No category'}</span>
            <span className="h-1 w-1 rounded-full bg-Text-Quadruple" />
            <span>{data?.['Benchmark areas'] || 'No panel'}</span>
            {data?.unit ? (
              <>
                <span className="h-1 w-1 rounded-full bg-Text-Quadruple" />
                <span>{data.unit}</span>
              </>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-full border border-Gray-50 text-[14px] text-Text-Secondary hover:border-Primary-DeepTeal hover:text-Primary-DeepTeal"
          aria-label="Close chart modal"
        >
          x
        </button>
      </div>

      <div className="overflow-y-auto px-5 py-4">
        {data?.Definition ? (
          <div className="mb-4 rounded-xl bg-[#F8FAFA] border border-Gray-50 px-3 py-2 text-[11px] leading-5 text-Text-Secondary">
            {data.Definition}
          </div>
        ) : null}

        {charts.length > 0 ? (
          <div className="grid gap-3">
            {charts.map((chart) => (
              <div
                key={`${chart.gender}-${chart.ageRange}`}
                className="rounded-2xl border border-Gray-50 bg-white px-4 py-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-[11px] font-semibold capitalize text-Text-Primary">
                    {chart.gender} - {chart.ageRange}
                  </div>
                  <div className="text-[10px] text-Text-Secondary">
                    {chart.ranges.length} ranges
                  </div>
                </div>
                <div className="w-full pt-10 pb-2">
                  <StatusBarChartv3
                    isCustom
                    data={chart.ranges.map((range: any) => ({ ...range }))}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-[12px] text-Text-Secondary">
            No chart ranges are defined for this biomarker.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartModal;
