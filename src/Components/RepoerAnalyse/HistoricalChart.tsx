import { Tooltip } from 'react-tooltip';
import { SourceTag } from '../source-badge';
import { useEffect, useMemo, useState } from 'react';
import {
  buildHistoricalBandLayout,
  findHistoricalBandLayoutEntry,
  getHistoricalPointY,
  inferValueKind,
  sortChartBounds,
  type ChartBound,
} from '../../utils/chartBoundMatching';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface HistoricalChartProps {
  statusBar: any;
  dataPoints: number[];
  labels: string[];
  dataStatus: Array<string>;
  sources: string[];
  unit: string;
  chartId: string;
}

const CHART_PLOT_HEIGHT = 70;
const POINT_COLUMN_STEP = 43.4;
const POINT_X_OFFSET = 10;

const HistoricalChart = ({
  statusBar,
  dataPoints,
  dataStatus,
  labels,
  sources,
  unit,
  chartId,
}: HistoricalChartProps) => {
  const [ITEMS_PER_PAGE, setITEMS_PER_PAGE] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const svg = document.getElementById(`historical-chart-svg-${chartId}`);
    if (svg) {
      setITEMS_PER_PAGE(Math.floor(svg.clientWidth / 50));
    }
  }, [chartId]);

  const totalPages = Math.ceil(dataPoints.length / ITEMS_PER_PAGE);

  const start = page * ITEMS_PER_PAGE;
  const end = Math.min(start + ITEMS_PER_PAGE, dataPoints.length);

  const visibleDataPoints = dataPoints.slice(start, end);
  const visibleLabels = labels.slice(start, end);

  const bounds = useMemo(
    () => (Array.isArray(statusBar) ? statusBar : []) as ChartBound[],
    [statusBar],
  );

  const valueKind = useMemo(
    () => inferValueKind(bounds, dataPoints[0]),
    [bounds, dataPoints],
  );

  const boundsAsc = useMemo(
    () => sortChartBounds(bounds, valueKind),
    [bounds, valueKind],
  );

  const bandLayout = useMemo(
    () => buildHistoricalBandLayout(bounds, valueKind, CHART_PLOT_HEIGHT),
    [bounds, valueKind],
  );

  const resolveColor = (key: string, color?: string) => {
    if (color && color != '') {
      return color;
    }
    if (key == 'Needs Focus' || key == 'CriticalRange') {
      return '#B2302E';
    }
    if (key == 'DiseaseRange') {
      return '#BA5225';
    }
    if (key == 'Ok' || key == 'BorderlineRange') {
      return '#D8D800';
    }
    if (key == 'Good' || key == 'HealthyRange') {
      return '#72C13B';
    }
    if (key == 'Excellent' || key == 'OptimalRange') {
      return '#37B45E';
    }
    return '#FBAD37';
  };

  const getPointY = (value: unknown, status: string) =>
    getHistoricalPointY(value, status, bandLayout, boundsAsc, valueKind);

  const getPointX = (visibleIndex: number) =>
    visibleIndex * POINT_COLUMN_STEP + POINT_X_OFFSET;

  const getPointColor = (value: unknown, status: string) => {
    const entry = findHistoricalBandLayoutEntry(
      value,
      status,
      bandLayout,
      boundsAsc,
    );
    if (entry) {
      return resolveColor(entry.bound.status, entry.bound.color);
    }
    return resolveColor(status);
  };

  return (
    <>
      <div className="w-full h-full relative pr-4 ">
        <div className="relative w-full" style={{ height: CHART_PLOT_HEIGHT }}>
          <svg
            id={`historical-chart-svg-${chartId}`}
            className="absolute w-full h-full top-0 left-3"
            style={{ zIndex: 0, overflow: 'visible' }}
            height={CHART_PLOT_HEIGHT}
          >
            {visibleDataPoints.map((_point, index) => {
              const realIndex = start + index;
              if (realIndex === dataPoints.length - 1) return null;

              const currentStatus = dataStatus[realIndex];
              const nextStatus = dataStatus[realIndex + 1];
              const currentValue = dataPoints[realIndex];
              const nextValue = dataPoints[realIndex + 1];

              const x1 = getPointX(index);
              const x2 = getPointX(index + 1);
              const y1 = getPointY(currentValue, currentStatus);
              const y2 = getPointY(nextValue, nextStatus);

              return (
                <line
                  key={`line-${realIndex}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#888888"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              );
            })}
          </svg>

          {bandLayout.map((entry, inde) => {
            const el = entry.bound;
            return (
              <div
                key={`status-${inde}`}
                className="w-full absolute left-0 right-0"
                style={{
                  top: entry.top,
                  height: entry.height,
                }}
              >
                <div
                  className="w-full h-full opacity-15"
                  style={{ backgroundColor: resolveColor(el.status, el.color) }}
                ></div>

                <div
                  className="w-full h-full absolute border-r-[5px] pl-2 top-0"
                  style={{ borderColor: resolveColor(el.status, el.color) }}
                ></div>

                {el.high ? (
                  <div className="absolute right-[8px] text-nowrap overflow-hidden text-[8px] bottom-[2px] opacity-35 text-center">
                    {el.high && el.low != null && <>{el.low + '-' + el.high}</>}
                    {el.low == null && <>{el.high + '>'}</>}
                  </div>
                ) : (
                  <div className="absolute right-[8px] text-nowrap overflow-hidden text-[8px] bottom-[4px] opacity-35 text-center">
                    {el.low + '<'}
                  </div>
                )}
              </div>
            );
          })}

          <div
            className="absolute top-0 left-3 w-full pointer-events-none"
            style={{ height: CHART_PLOT_HEIGHT, zIndex: 1 }}
          >
            {visibleDataPoints.map((point, index) => {
              const realIndex = start + index;
              const tooltipId = `point-${chartId}-${realIndex}`;
              const status = dataStatus[realIndex];
              const y = getPointY(point, status);
              const x = getPointX(index);
              const dotColor = getPointColor(point, status);

              return (
                <div
                  key={`point-${realIndex}`}
                  className="absolute pointer-events-auto"
                  style={{
                    left: x,
                    top: y,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    data-tooltip-id={tooltipId}
                    style={{ backgroundColor: dotColor }}
                    className="w-2 h-2 border border-gray-50 rounded-full relative"
                  >
                    <Tooltip
                      id={tooltipId}
                      place="top"
                      className="!bg-Red !w-fit !leading-5 !text-nowrap !shadow-100 !text-Text-Primary !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                    >
                      <div className="flex items-center gap-2">
                        {sources?.[realIndex] && (
                          <SourceTag source={sources?.[realIndex]} isSmall />
                        )}
                        value: {point} {unit}
                      </div>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex relative justify-start items-center w-full ml-2 mt-1">
            {visibleLabels.map((label, index) => {
              return (
                <div key={index} className="text-[8px] w-[45px]">
                  <div className="flex justify-start text-[#888888] font-medium  items-center">
                    <div>{label.split('-')[2]}.</div>
                    <div>{label.split('-')[1]}.</div>
                  </div>
                  <div className="text-[#B0B0B0] mt-[-2px] ml-[2px]">
                    {label.split('-')[0]}
                  </div>
                  {index === visibleLabels.length - 1 && totalPages > 1 && (
                    <div className="absolute top-0 right-[24px] transform translate-x-[20px] flex gap-2 z-10">
                      <button
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        className="px-2 py-1 text-[10px] border rounded hover:bg-gray-200 disabled:opacity-30"
                      >
                        Back
                      </button>
                      <button
                        disabled={page + 1 >= totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(p + 1, totalPages - 1))
                        }
                        className="px-2 py-1 text-[10px] border rounded hover:bg-gray-200 disabled:opacity-30"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoricalChart;
