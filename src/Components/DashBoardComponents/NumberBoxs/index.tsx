import React from 'react';
import NumberBox from '../../NumberBox';

interface NumberBoxesProps {
  reports: Array<{ title: string; number: number }>;
}

const NumberBoxes: React.FC<NumberBoxesProps> = ({ reports }) => {
  // Default icons for each title, you can modify these paths as needed
  const iconPaths: { [key: string]: string } = {
    'Total Enrollment': '/icons/profile-add.svg',
    'Incomplete Client Data': 'icons/profile-delete.svg',
    'Client Needs Check': 'icons/profile-check.svg',
    'Client Checked': '/icons/profile-tick.svg',
  };
  const resolveMode = (title: string): string => {
    switch (title) {
      case 'Total Enrollment':
        return 'added';
      case 'Incomplete Client Data':
        return 'increase';
      case 'Client Needs Check':
        return 'reduction';
      case 'Client Checked':
        return 'increase';
      default:
        return 'added'; // Default mode if not matched
    }
  };
  return (
    <div
      className={
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 w-full'
      }
    >
      {reports?.map((report) => (
        <NumberBox
          key={report.title}
          mode={resolveMode(report.title)} // You can change modes based on your logic
          value={report.number}
          title={report.title}
          icon={iconPaths[report.title] || '/icons/profile-add.svg'} // Default icon if not found
        />
      ))}
    </div>
  );
};

export default NumberBoxes;
