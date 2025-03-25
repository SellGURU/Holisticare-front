/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/PerformanceChart.tsx
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartOptions, Plugin } from 'chart.js';
import { BeatLoader } from 'react-spinners';
import { sortKeysWithValues } from './Boxs/Help';

// Register necessary components from Chart.js
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

interface PerformanceChartProps {
  labels: string[]; // X-axis labels
  dataPoints: number[]; // Data for the line chart
  statusBar: any;
  mode?: string;
  isStringValues?: boolean;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  labels,
  mode,
  dataPoints,
  statusBar,
  isStringValues,
}) => {
  // const maxVal = resolveMaxValue(statusBar);
  console.log(dataPoints)
  const [themeColor, setThemeColor] = useState(
    localStorage.getItem('theme-base') || 'light',
  );
  const [, setXLabelColor] = useState(
    themeColor === 'dark' ? '#FFFFFFDE' : '#262626',
  );
  console.log(statusBar);
  console.log(sortKeysWithValues(statusBar));
  useEffect(() => {
    const handleThemeChange = () => {
      const newThemeColor = localStorage.getItem('theme-base') || 'light';
      setThemeColor(newThemeColor);
      setXLabelColor(newThemeColor === 'dark' ? '#FFFFFFDE' : '#262626');
    };

    // Assume that 'mode' changes indicate a theme change
    handleThemeChange();
  }, [mode]);
  const resolveColor = (key: string) => {
    if (key == 'Needs Focus') {
      return '#FC5474';
    }
    if (key == 'Ok') {
      return '#FBAD37';
    }
    if (key == 'Good') {
      return '#06C78D';
    }
    if (key == 'Excellent') {
      return '#7F39FB';
    }
    return '#FBAD37';
  };
  const resolveLayerColor = (key: string) => {
    if (key == 'Needs Focus') {
      return 'rgba(252, 84, 116, 0.1)';
    }
    if (key == 'Ok') {
      return 'rgba(251, 173, 55, 0.3)';
    }
    if (key == 'Good') {
      return 'rgba(6, 199, 141, 0.1)';
    }
    if (key == 'Excellent') {
      return 'rgba(250, 110, 245,0.1)';
    }
    return '#FBAD37';
  };
  // Chart Data
  const pointColors = dataPoints.map((value) => {
    let resolvedColor = '#FC5474';
    sortKeysWithValues(statusBar).forEach((el) => {
      if (value >= el.value[0] && value < el.value[1]) {
        resolvedColor = resolveColor(el.key);
      }
    });
    return resolvedColor;
  });

  const data = {
    labels: labels, // Labels passed as props
    datasets: [
      {
        label: 'value',
        data: dataPoints, // Data points passed as props
        fill: false,
        pointBackgroundColor: pointColors, // Point fill color
        pointBorderColor: pointColors, // Point border color
        pointRadius: 4, // Point size
        pointHoverRadius: 6, // Point size when hovered
        borderColor: pointColors,
        tension: 0, // Smooth curve
        borderWidth: 1.5, // Thinner line for better clarity in smaller height
      },
    ],
  };

  // Chart Options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false, // Disable aspect ratio to control height
    scales: {
      y: {
        beginAtZero: true,
        // max: maxVal.value[1],
        display: false, // Hide y-axis labels for compact design
      },
      x: {
        ticks: {
          color: '#005F73', // Change the text color of x-axis labels
          font: {
            size: 10, // Change the font size of x-axis labels
          },
        },
        display: true, // Hide x-axis labels for compact design
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend to save space
      },
      tooltip: {
        enabled: true, // Keep tooltip enabled if needed
      },
    },
  };

  // Plugin to draw background layers for "Perfect", "Good", and "Need Focus"
  const backgroundLayerPlugin: Plugin<'line'> = {
    id: 'backgroundLayer',
    beforeDraw: (chart) => {
      const {
        ctx,
        chartArea: { left, right },
        scales: { y },
      } = chart;

      // Function to draw layers with colors
      const drawLayer = (yMin: number, yMax: number, color: string) => {
        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(
          left,
          y.getPixelForValue(yMax),
          right - left,
          y.getPixelForValue(yMin) - y.getPixelForValue(yMax),
        );
        ctx.restore();
      };
      sortKeysWithValues(statusBar).forEach((el) => {
        drawLayer(el.value[0], el.value[1], resolveLayerColor(el.key));
      });
      // if (mode == "multi") {
      //   drawLayer(0, statusBar["Needs Focus"][0][1], "rgba(252, 84, 116, 0.1)");

      //   drawLayer(
      //     statusBar["Ok"][0][0],
      //     statusBar["Ok"][0][1],
      //     "rgba(251, 173, 55, 0.3)"
      //   );
      //   drawLayer(
      //     statusBar["Good"][0][0],
      //     statusBar["Good"][0][1],
      //     "rgba(6, 199, 141, 0.1)"
      //   );
      //   drawLayer(
      //     statusBar["Ok"][1][0],
      //     statusBar["Ok"][1][1],
      //     "rgba(251, 173, 55, 0.3)"
      //   );
      //   drawLayer(
      //     statusBar["Needs Focus"][1][0],
      //     statusBar["Needs Focus"][1][1],
      //     "rgba(252, 84, 116, 0.1)"
      //   );

      // } else {
      //   if(statusBar["Needs Focus"].length > 1){
      //     drawLayer(
      //       statusBar["Needs Focus"][0][0],
      //       statusBar["Needs Focus"][0][1],
      //       "rgba(252, 84, 116, 0.1)"
      //     );
      //     drawLayer(
      //       statusBar["Good"][0][0],
      //       statusBar["Good"][0][1],
      //       "rgba(6, 199, 141, 0.1)"
      //     );
      //     drawLayer(
      //       statusBar["Ok"][0][0],
      //       statusBar["Ok"][0][1],
      //       "rgba(251, 173, 55, 0.3)"
      //     );
      //     drawLayer(
      //       statusBar["Needs Focus"][1][0],
      //       statusBar["Needs Focus"][1][1],
      //       "rgba(252, 84, 116, 0.1)"
      //     );
      //   }else {
      //     drawLayer(
      //       statusBar["Good"][0][0],
      //       statusBar["Good"][0][1],
      //       "rgba(6, 199, 141, 0.1)"
      //     );
      //     drawLayer(
      //       statusBar["Ok"][0][0],
      //       statusBar["Ok"][0][1],
      //       "rgba(251, 173, 55, 0.3)"
      //     );
      //     drawLayer(
      //       statusBar["Needs Focus"][0][0],
      //       statusBar["Needs Focus"][0][1],
      //       "rgba(252, 84, 116, 0.1)"
      //     );

      //   }

      // }

      // Draw "Need Focus" Layer (0-60)
    },
  };
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{index: number, value: number} | null>(null);
  useEffect(() => {
    setIsLoading(true);
  }, [dataPoints]);
  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  }, [isLoading]);
  return (
    <>
      {isLoading ? (
        <div className="w-full h-[90px] flex justify-center items-center">
          <BeatLoader size={8} color="#0CBC84"></BeatLoader>
        </div>
      ) : (
        <div style={{ width: '100%', height: '90px' }}>
          {' '}
          {/* Set container height to 64px */}
          {isStringValues ? (
            <>
              {sortKeysWithValues(statusBar).map((el) => {
                return (
                  <>
                    <div className="w-full relative" style={{height:70/sortKeysWithValues(statusBar).length+"px"}}>
                      <div
                        className="w-full h-full opacity-15 "
                        style={{ backgroundColor: resolveColor(el.key) }}
                      ></div>
                      <div className='w-full h-full absolute border-r-[5px] top-0 items-center gap-2 flex justify-between' style={{borderColor: resolveColor(el.key) }}>
                        {dataPoints.map((point, index) => (
                          <div
                            key={index}
                            style={{ backgroundColor: resolveColor(el.key) }}
                            className={`w-2 h-2 border border-gray-50 rounded-full relative ${
                              String(point).toLowerCase() === String(el.value[0]).toLowerCase() ? `` : 'bg-transparent invisible'
                            }`}
                            onMouseEnter={() => setHoveredPoint({index, value: point})}
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            {hoveredPoint?.index === index && (
                              <div 
                                className="absolute -top-6 left-1/2 transform text-[8px] text-Text-Primary -translate-x-1/2 bg-[#8ECAE6]  text-xs px-3 py-1 rounded whitespace-nowrap z-10"
                              >
                                {point}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })}
              <div>
                <div className="flex flex-col w-full mt-1">
                  {labels.map((label, index) => (
                    <div key={index} className="text-[10px] text-[#005F73]">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <Line
              data={data}
              options={options}
              plugins={[backgroundLayerPlugin]}
            />
          )}
        </div>
      )}
    </>
  );
};

export default PerformanceChart;
