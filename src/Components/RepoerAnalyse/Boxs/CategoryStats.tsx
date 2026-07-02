import SpinnerLoader from '../../SpinnerLoader';

type CategoryStatsProps = {
  numOfBiomarkers?: number;
  outOfRef?: number;
  isProcessing?: boolean;
  biomarkerLabel?: 'Biomarkers' | 'biomarkers';
  needFocusQuoted?: boolean;
};

/** Shared Need Focus / biomarker count row — matches Client Summary SummaryBox. */
const CategoryStats = ({
  numOfBiomarkers = 0,
  outOfRef = 0,
  isProcessing = false,
  biomarkerLabel = 'Biomarkers',
  needFocusQuoted = true,
}: CategoryStatsProps) => {
  const needFocusLabel =
    outOfRef > 1
      ? needFocusQuoted
        ? '"Needs Focus"'
        : 'Needs Focus'
      : needFocusQuoted
        ? '"Need Focus"'
        : 'Need Focus';

  return (
    <div className="flex justify-start items-center">
      <div className="TextStyle-Body-3 text-Text-Secondary">
        {numOfBiomarkers} {biomarkerLabel}
      </div>
      <div className="TextStyle-Body-3 text-Text-Secondary ml-2">
        {isProcessing ? (
          <span className="inline-flex items-center gap-1 text-Text-Triarty">
            <SpinnerLoader color="#9CA3AF" />
            Analyzing…
          </span>
        ) : (
          <>
            {outOfRef} {needFocusLabel}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryStats;
