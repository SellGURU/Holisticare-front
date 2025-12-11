/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import ProgressDashboard from '.';
import Application from '../../api/app';
import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';

interface ProgressDashboardViewProps {
  onHaveScore:(isHave:boolean) => void;
}

const ProgressDashboardView = ({ onHaveScore }: ProgressDashboardViewProps) => {
  const { id } = useParams<{ id: string }>();
  const [wellnessData, setWellnessData] = useState<any>(null);
  const [progressionData, setProgressionData] = useState<any>(null);
  const [wellnessLoading, setWellnessLoading] = useState(false);
  const [progressionLoading, setProgressionLoading] = useState(false);
  const [wellnessError, setWellnessError] = useState<string | null>(null);
  const [progressionDateRange, setProgressionDateRange] = useState<{
    from_date: string | null;
    to_date: string | null;
  }>({ from_date: null, to_date: null });
  useEffect(() => {
    if (id) {
      // If no date range is set, initialize with default 7 days
      if (!progressionDateRange.from_date || !progressionDateRange.to_date) {
        const endDate = new Date();
        const startDate = subDays(endDate, 7);
        setProgressionDateRange({
          from_date: format(startDate, 'yyyy-MM-dd'),
          to_date: format(endDate, 'yyyy-MM-dd'),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchWellnessData = async () => {
    setWellnessLoading(true);
    setWellnessError(null);

    try {
      const requestData = {
        member_id: Number(id),
      };

      const wellnessResponse = await Application.getWellnessScores(requestData);

      if (wellnessResponse?.data) {
        const data = wellnessResponse.data;
        if( data.scores && data.scores.length > 0) {
          onHaveScore(true);
        } else {
          onHaveScore(false);
        }

        // Helper function to parse score values
        const parseScore = (value: any): number => {
          if (value === null || value === undefined || value === '') return 0;
          const parsed =
            typeof value === 'string' ? parseFloat(value) : Number(value);
          return isNaN(parsed) ? 0 : parsed;
        };

        // Transform wellness data for WellnessSummary component
        // The API returns scores as an array of objects with name, score, description, and factors
        if (data.scores && Array.isArray(data.scores)) {
          // Helper function to find score by matching name patterns
          const findScore = (patterns: string[], scoresArray: any[]): any => {
            for (const pattern of patterns) {
              const found = scoresArray.find((item: any) => {
                if (!item || !item.name) return false;
                const name = item.name.toLowerCase();
                return (
                  name.includes(pattern.toLowerCase()) ||
                  name === pattern.toLowerCase()
                );
              });
              if (found) return found;
            }
            return null;
          };

          // Helper function to get score value
          const getScoreValue = (scoreItem: any): number => {
            if (!scoreItem) return 0;
            return parseScore(scoreItem.score || scoreItem.value || scoreItem);
          };

          // Extract all scores dynamically (except archetype)
          const allScores: { [key: string]: any } = {};
          const allScoresData: { [key: string]: any } = {};
          let archetypeItem: any = null;

          data.scores.forEach((item: any) => {
            if (item && item.name) {
              const name = item.name.toLowerCase();
              // Skip archetype - handle separately
              if (
                name.includes('archetype') ||
                name.includes('type') ||
                name.includes('profile')
              ) {
                archetypeItem = item;
              } else {
                // Store all other scores dynamically
                allScores[item.name] = getScoreValue(item);
                allScoresData[item.name] = item;
              }
            }
          });

          // Find global score separately (for the circular gauge)
          const globalScoreItem = findScore(
            ['global', 'wellness', 'overall'],
            data.scores,
          );
          const globalScoreValue = getScoreValue(globalScoreItem);

          // Extract latest_date from API response (should be at root level of data)
          const latestDate = data.latest_date || null;

          setWellnessData({
            scores: allScores, // All scores dynamically
            scoresData: allScoresData, // All score data dynamically
            globalScore: globalScoreValue, // Separate global score for the gauge
            globalScoreData: globalScoreItem, // Global score data for tooltip
            archetype: archetypeItem?.score || archetypeItem?.value || null,
            archetypeData: archetypeItem,
            latestDate: latestDate, // Last sync date
          });
        } else if (
          data.scores &&
          typeof data.scores === 'object' &&
          !Array.isArray(data.scores)
        ) {
          // Fallback: handle if scores is already an object
          // Extract latest_date from API response
          const latestDate = data.latest_date || null;

          setWellnessData({
            scores: {
              sleep:
                parseFloat(data.scores.sleep) ||
                parseFloat(data.scores.sleep_score) ||
                0,
              activity:
                parseFloat(data.scores.activity) ||
                parseFloat(data.scores.activity_score) ||
                0,
              heart:
                parseFloat(data.scores.heart) ||
                parseFloat(data.scores.heart_score) ||
                0,
              stress:
                parseFloat(data.scores.stress) ||
                parseFloat(data.scores.stress_score) ||
                0,
              calories:
                parseFloat(data.scores.calories) ||
                parseFloat(data.scores.calories_score) ||
                0,
              body:
                parseFloat(data.scores.body) ||
                parseFloat(data.scores.body_score) ||
                0,
              global:
                parseFloat(data.scores.global) ||
                parseFloat(data.scores.global_score) ||
                0,
            },
            scoresData: data.scores, // Use the object directly as scoresData
            archetype: data.archetype || null,
            archetypeData: data.archetype
              ? { description: data.archetype }
              : null,
            latestDate: latestDate, // Last sync date
          });
        } else {
          setWellnessData(null);
        }
      } else {
        setWellnessData(null);
      }
    } catch (error: any) {
      console.error('Error fetching wellness data:', error);
      setWellnessError(
        error?.response?.data?.detail ||
          error?.message ||
          'Failed to load wellness data',
      );
      setWellnessData(null);
    } finally {
      setWellnessLoading(false);
    }
  };

  const fetchHistoricalData = async (fromDate?: string, toDate?: string) => {
    // Validate date range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        setWellnessError('Invalid date format');
        return;
      }
      if (from > to) {
        setWellnessError('From date cannot be greater than to date');
        return;
      }
    }

    setProgressionLoading(true);

    try {
      const requestData: {
        member_id: number;
        from_date?: string;
        to_date?: string;
      } = {
        member_id: Number(id),
      };

      if (fromDate) {
        requestData.from_date = fromDate;
      }
      if (toDate) {
        requestData.to_date = toDate;
      }

      const historicalResponse =
        await Application.getWellnessScoresHistorical(requestData);

      // Handle response - could be in response.data or directly in response
      const responseData = historicalResponse?.data || historicalResponse;

      if (responseData) {
        const historicalData = responseData;
        const parseScore = (value: any): number => {
          if (value === null || value === undefined || value === '') return 0;
          if (typeof value === 'number') return isNaN(value) ? 0 : value;
          const parsed =
            typeof value === 'string' ? parseFloat(value) : Number(value);
          return isNaN(parsed) ? 0 : parsed;
        };

        // Handle different possible response structures
        let historicalArray: any[] = [];

        if (Array.isArray(historicalData)) {
          historicalArray = historicalData;
        } else if (
          historicalData.historical &&
          Array.isArray(historicalData.historical)
        ) {
          historicalArray = historicalData.historical;
        } else if (historicalData.data && Array.isArray(historicalData.data)) {
          historicalArray = historicalData.data;
        } else {
          // Try to find any array property
          for (const key in historicalData) {
            if (Array.isArray(historicalData[key])) {
              historicalArray = historicalData[key];
              break;
            }
          }
        }

        if (historicalArray.length > 0) {
          // The API returns an array where each item has: { name, score, date }
          // We need to group by date and collect all scores for each date
          const dateMap: {
            [date: string]: { date: string; [scoreName: string]: any };
          } = {};

          historicalArray.forEach((item: any, index: number) => {
            // Extract name, score, and date from the item
            const scoreName = item.name;
            const scoreValue = parseScore(item.score || item.value);
            let dateStr = item.date;

            // Skip only if missing required fields (scoreValue === 0 is valid data)
            if (!scoreName || !dateStr) {
              console.warn(`Item ${index} missing required fields, skipping`, {
                scoreName,
                scoreValue,
                dateStr,
              });
              return;
            }

            // Allow scoreValue of 0 as it's valid data (not missing)

            // Format date properly - ensure it's in YYYY-MM-DD format
            if (dateStr.includes('T')) {
              dateStr = dateStr.split('T')[0];
            }
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
              console.warn(`Item ${index} has invalid date: ${dateStr}`);
              return;
            }
            dateStr = format(date, 'yyyy-MM-dd');

            // Group by date
            if (!dateMap[dateStr]) {
              dateMap[dateStr] = { date: dateStr };
            }

            // Add this score to the date entry (include even if scoreValue is 0)
            dateMap[dateStr][scoreName] = scoreValue;
          });

          // Log all score names found
          const allScoreNames = new Set<string>();
          Object.values(dateMap).forEach((point: any) => {
            Object.keys(point).forEach((key) => {
              if (key !== 'date') {
                allScoreNames.add(key);
              }
            });
          });

          // Convert map to array and sort by date
          const transformedHistorical = Object.values(dateMap).sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
          setProgressionData(
            transformedHistorical.length > 0 ? transformedHistorical : null,
          );
        } else {
          console.warn('Historical array is empty or not found');
          setProgressionData(null);
        }
      } else {
        console.warn('Historical response data is missing');
        setProgressionData(null);
      }
    } catch (error: any) {
      console.error('Error fetching historical data:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      setProgressionData(null);
    } finally {
      setProgressionLoading(false);
    }
  };

  const [hasCheckedWellness, setHasCheckedWellness] = useState(false);

  useEffect(() => {
    const checkWellnessDataAvailability = async () => {
      try {
        const requestData = {
          member_id: Number(id),
        };

        const wellnessResponse =
          await Application.getWellnessScores(requestData);

        if (wellnessResponse?.data) {
          const data = wellnessResponse.data;

          // Check if there's at least one score available
          let hasWellnessData = false;

          if (data.scores && Array.isArray(data.scores)) {
            // Check if there's at least one score (excluding archetype)
            hasWellnessData = data.scores.some((item: any) => {
              if (!item || !item.name) return false;
              const name = item.name.toLowerCase();
              // Skip archetype
              if (
                name.includes('archetype') ||
                name.includes('type') ||
                name.includes('profile')
              ) {
                return false;
              }
              // Check if score exists and is not null/undefined (0 is valid)
              const score = item.score || item.value;
              return score !== null && score !== undefined && score !== '';
            });
          } else if (data.scores && typeof data.scores === 'object') {
            // Check if scores object has at least one non-null value
            const scoreKeys = Object.keys(data.scores).filter((key) => {
              const lowerKey = key.toLowerCase();
              return (
                !lowerKey.includes('archetype') &&
                !lowerKey.includes('type') &&
                !lowerKey.includes('profile')
              );
            });
            hasWellnessData = scoreKeys.some((key) => {
              const value = data.scores[key];
              return value !== null && value !== undefined && value !== '';
            });
          }

          // If wellness data exists, switch to Progress tab
          if (hasWellnessData) {
            // setActiveReportSection('Progress');
            setHasCheckedWellness(true);
          } else {
            setHasCheckedWellness(true);
          }
        } else {
          setHasCheckedWellness(true);
        }
      } catch (error) {
        console.error('Error checking wellness data:', error);
        setHasCheckedWellness(true);
        // If check fails, stay on Health tab (default)
      }
    };

    // Only check once when member ID is first resolved
    if (id && !hasCheckedWellness) {
      checkWellnessDataAvailability();
    }
  }, [id, hasCheckedWellness]);

  // Reset check flag when member ID changes
  useEffect(() => {
    setHasCheckedWellness(false);
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchWellnessData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Initialize date range on mount (only once)
  useEffect(() => {
    if (id) {
      // If no date range is set, initialize with default 7 days
      if (!progressionDateRange.from_date || !progressionDateRange.to_date) {
        const endDate = new Date();
        const startDate = subDays(endDate, 7);
        setProgressionDateRange({
          from_date: format(startDate, 'yyyy-MM-dd'),
          to_date: format(endDate, 'yyyy-MM-dd'),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch historical data when date range changes (separate effect to prevent full page refresh)
  useEffect(() => {
    if (id && progressionDateRange.from_date && progressionDateRange.to_date) {
      fetchHistoricalData(
        progressionDateRange.from_date,
        progressionDateRange.to_date,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressionDateRange.from_date, progressionDateRange.to_date]);
  return (
    <div
      className={`pt-[20px] scroll-container relative pb-[50px] xl:pr-28 h-[98vh] xl:ml-6  overflow-x-hidden xl:overflow-x-hidden  px-5 xl:px-0`}
    >
      <ProgressDashboard
        wellnessData={wellnessData}
        progressionData={progressionData}
        wellnessLoading={wellnessLoading}
        progressionLoading={progressionLoading}
        error={wellnessError}
        onDateRangeChange={(fromDate, toDate) => {
          setProgressionDateRange({
            from_date: fromDate || null,
            to_date: toDate || null,
          });
        }}
      ></ProgressDashboard>
    </div>
  );
};

export default ProgressDashboardView;
