/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import WellnessSummary from './WellnessSummary';
import ScoreProgression from './ScoreProgression';

interface ProgressDashboardProps {
  wellnessData: {
    scores: { [key: string]: number }; // Dynamic scores object
    scoresData?: { [key: string]: any }; // Dynamic scores data object
    globalScore: number; // Global score for the circular gauge
    globalScoreData: any; // Global score data for tooltip
    archetype: string;
    archetypeData: any;
    latestDate: string | null; // Last sync date
  } | null;
  progressionData: Array<{
    date: string;
    global: number;
    sleep: number;
    activity: number;
    heart: number;
    stress: number;
    calories: number;
    body: number;
  }> | null;
  wellnessLoading?: boolean;
  progressionLoading?: boolean;
  error?: string | null;
  onDateRangeChange?: (fromDate?: string, toDate?: string) => void;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  wellnessData,
  progressionData,
  wellnessLoading = false,
  progressionLoading = false,
  error = null,
  onDateRangeChange,
}) => {
  return (
    <div className="w-full p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      <WellnessSummary data={wellnessData} loading={wellnessLoading} />
      <ScoreProgression
        data={progressionData}
        loading={progressionLoading}
        onDateRangeChange={onDateRangeChange}
      />
    </div>
  );
};

export default ProgressDashboard;
