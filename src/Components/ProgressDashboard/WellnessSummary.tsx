/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { format } from 'date-fns';
import InfoIcon from './InfoIcon';

interface WellnessSummaryProps {
  data: {
    scores: { [key: string]: number }; // Dynamic scores object
    scoresData?: { [key: string]: any }; // Dynamic scores data object
    globalScore?: number; // Global score for the circular gauge
    globalScoreData?: any; // Global score data for tooltip
    archetype: string;
    archetypeData?: any;
    latestDate?: string | null; // Last sync date
  } | null;
  loading?: boolean;
}

// Helper function to format tooltip from API data
const formatTooltip = (scoreData: any): string => {
  if (!scoreData) return '';
  
  let tooltip = '';
  
  if (scoreData.description) {
    tooltip += scoreData.description;
  }
  
  if (scoreData.factors && Array.isArray(scoreData.factors) && scoreData.factors.length > 0) {
    tooltip += '\n\nKey factors:';
    scoreData.factors.forEach((factor: string) => {
      tooltip += `\n• ${factor}`;
    });
  }
  
  return tooltip || '';
};

const archetypeExplanations: { [key: string]: string } = {
  'Night Owl': `You often:
• Fall asleep late
• Have irregular sleep timing
• May have slightly lower sleep efficiency

What it means:
Your rhythm leans toward late nights, which can affect sleep quality.`,
  'Strong Sleeper': `You generally:
• Have good sleep efficiency
• Get solid deep & REM sleep
• Maintain consistent sleep patterns

What it means:
You recover well and have strong nighttime restoration.`,
  'Sedentary Worker': `You typically:
• Take few steps per day
• Have long periods of inactivity
• Show low vigorous or moderate activity
• May have higher BMI

What it means:
You may sit or stay inactive for extended times, even if other areas are strong.`,
  'Stress Responder': `You often:
• Spend long durations in a high-stress physiological state
• Or have lower HRV (body stays "on alert")

What it means:
Your nervous system is sensitive to stress and may need more recovery.`,
  'High Performer': `You usually:
• Sleep well
• Stay active
• Have strong cardiovascular metrics
• Show balanced stress responses

What it means:
You perform strongly across multiple domains.`,
  'Balanced Individual': `You show:
• No major weaknesses
• No extreme strengths
• Generally stable markers

What it means:
A stable lifestyle with room to grow in any direction.`,
  'Recovery Needed': `You have:
• Several biomarker areas in the "low" or "critical" ranges
• Or an overall low global score

What it means:
Your body may need recovery or lifestyle changes across multiple areas.`,
};

// Helper function to get icon and color for a score name
const getScoreConfig = (name: string): { icon: string; color: string; label: string } => {
  const lowerName = name.toLowerCase();
  
  // Icon mapping
  if (lowerName.includes('sleep')) return { icon: '🌙', color: '#7F39FB', label: 'Sleep' };
  if (lowerName.includes('activity')) return { icon: '🏃', color: '#06C78D', label: 'Activity' };
  if (lowerName.includes('heart') || lowerName.includes('cardio')) return { icon: '❤️', color: '#FC5474', label: 'Heart Health' };
  if (lowerName.includes('stress')) return { icon: '😮‍💨', color: '#FBAD37', label: 'Stress' };
  if (lowerName.includes('calorie') || lowerName.includes('metabolic')) return { icon: '🔥', color: '#F5C842', label: 'Metabolic' };
  if (lowerName.includes('body') || lowerName.includes('bmi') || lowerName.includes('composition')) return { icon: '🧍', color: '#4FC3F7', label: 'Body Composition' };
  if (lowerName.includes('global') || lowerName.includes('wellness') || lowerName.includes('overall')) return { icon: '⭐', color: '#005F73', label: 'Global' };
  
  // Default fallback
  return { icon: '📊', color: '#888888', label: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
};

const WellnessSummary: React.FC<WellnessSummaryProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Loading wellness data...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No wellness data available</div>
          <div className="text-gray-300 text-sm">Wellness summary will appear here once data is available</div>
        </div>
      </div>
    );
  }

  const { scores, scoresData, globalScore: globalScoreValue, globalScoreData, archetype, archetypeData, latestDate } = data;
  const globalScore = globalScoreValue || 0;
  
  // Check if latestDate exists (not null, undefined, or empty string)
  const hasLatestDate = latestDate !== null && latestDate !== undefined && latestDate !== '';
  
  console.log('WellnessSummary - data received:', { 
    hasLatestDate, 
    latestDate, 
    latestDateType: typeof latestDate,
    latestDateValue: latestDate
  }); // Debug
  
  // Format last sync date to be client-friendly: yyyy-mm-dd hh:mm:ss
  const formatLastSync = (dateStr: string | null | undefined): string => {
    if (!dateStr) {
      console.log('formatLastSync - No date string provided');
      return '';
    }
    try {
      console.log('formatLastSync - Input:', dateStr, 'Type:', typeof dateStr);
      
      // JavaScript Date can handle ISO strings with microseconds directly
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        console.warn('formatLastSync - Invalid date:', dateStr);
        return '';
      }
      
      console.log('formatLastSync - Parsed date:', date);
      
      // Format as "yyyy-mm-dd hh:mm:ss" (24-hour format)
      const formatted = format(date, "yyyy-MM-dd HH:mm:ss");
      console.log('formatLastSync - Formatted:', formatted);
      return formatted;
    } catch (e) {
      console.error('formatLastSync - Error formatting date:', dateStr, e);
      return '';
    }
  };
  
  // Format the last sync date
  const lastSyncText = useMemo(() => {
    if (!latestDate) {
      console.log('WellnessSummary - No latestDate provided');
      return '';
    }
    
    console.log('WellnessSummary - Formatting latestDate:', latestDate, 'Type:', typeof latestDate);
    
    // Try the main formatting function
    const formatted = formatLastSync(latestDate);
    if (formatted) {
      console.log('WellnessSummary - Formatted successfully:', formatted);
      return formatted;
    }
    
    // Fallback: try direct Date parsing with simpler format
    console.log('WellnessSummary - Main formatting failed, trying fallback');
    try {
      const date = new Date(latestDate);
      if (!isNaN(date.getTime())) {
        const fallbackFormatted = format(date, "yyyy-MM-dd HH:mm:ss");
        console.log('WellnessSummary - Fallback formatted:', fallbackFormatted);
        return fallbackFormatted;
      }
    } catch (e) {
      console.error('WellnessSummary - Fallback formatting error:', e);
    }
    
    console.warn('WellnessSummary - All formatting attempts failed for:', latestDate);
    return '';
  }, [latestDate]);
  
  // Get all score names except global (global is shown separately in the gauge)
  const scoreNames = Object.keys(scores || {}).filter(
    (name) => {
      const lowerName = name.toLowerCase();
      return !lowerName.includes('global') && !lowerName.includes('wellness') && !lowerName.includes('overall');
    }
  );

  // Calculate percentage for circular progress (0-100)
  const globalPercentage = Math.min(100, Math.max(0, globalScore));

  // Get archetype tooltip from API or fallback
  const archetypeTooltip = archetypeData?.description 
    ? (archetypeData.factors && Array.isArray(archetypeData.factors) && archetypeData.factors.length > 0
        ? `${archetypeData.description}\n\nKey factors:\n${archetypeData.factors.map((f: string) => `• ${f}`).join('\n')}`
        : archetypeData.description)
    : (archetypeExplanations[archetype] || 'User archetype based on health patterns');

  return (
    <div id="wellness-summary" className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Wellness Summary</h2>
        {archetype && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
            <span className="text-sm font-medium text-blue-700">{archetype}</span>
            <InfoIcon text={archetypeTooltip} />
          </div>
        )}
      </div>

      {/* Global Score and Metrics Layout */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 mb-6">
        {/* Global Score Circular Gauge - Centered with equal margins */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center lg:px-6">
          <div className="relative" style={{ width: '200px', height: '200px' }}>
            <svg style={{ height: 0 }}>
              <defs>
                <linearGradient id="globalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4FC3F7" />
                  <stop offset="100%" stopColor="#7F39FB" />
                </linearGradient>
              </defs>
            </svg>
            <CircularProgressbar
              value={globalPercentage}
              text={`${globalScore.toFixed(1)}`}
              styles={buildStyles({
                pathColor: 'url(#globalGradient)',
                trailColor: '#E5E5E5',
                textColor: '#005F73',
                textSize: '32px',
              })}
            />
          </div>
          {/* Global Score Label - Outside the circle */}
          <div className="mt-4 text-center">
            <div className="flex items-center gap-1 justify-center">
              <span className="text-sm font-medium text-gray-700">Global Score</span>
              <InfoIcon text={formatTooltip(globalScoreData) || 'Your Global Wellness Score is a combined view of all health metrics.'} />
            </div>
          </div>
        </div>

        {/* Metric Cards Grid - Right Side - Dynamic based on API response */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          {scoreNames.map((scoreName) => {
            const score = scores[scoreName] || 0;
            const scoreData = scoresData?.[scoreName];
            const config = getScoreConfig(scoreName);
            const tooltipText = formatTooltip(scoreData) || `Information about ${config.label} score`;
            
            return (
              <div
                key={scoreName}
                className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center min-h-[90px]"
              >
                <div className="text-xl mb-1.5">{config.icon}</div>
                <div className="text-2xl font-bold mb-1" style={{ color: config.color }}>
                  {Math.round(score)}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">{config.label}</span>
                  <InfoIcon text={tooltipText} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Last Sync Date */}
      {hasLatestDate && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-xs text-gray-500">
            Last synced {lastSyncText || (latestDate ? String(latestDate).substring(0, 19).replace('T', ' ') : 'date unavailable')}
          </span>
        </div>
      )}
    </div>
  );
};

export default WellnessSummary;

