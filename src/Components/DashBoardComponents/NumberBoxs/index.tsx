/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Application from '../../../api/app';
import NumberBox from '../../NumberBox';
interface NumberBoxesProps {
  reports: Array<any>;
}

const NumberBoxes: React.FC<NumberBoxesProps> = ({ reports }) => {
  console.log(reports);

  // const resolveValue = (key: string) => {
  //   if (reports.length > 0) {
  //     return reports.filter((e) => e.key == key)[0].value;
  //   }
  //   return 0;
  // };
  const [Enrollment, setEnrollment] = useState(0);
  const [Incomplete, setIncomplete] = useState(0);
  const [NeedCheck, setNeedCheck] = useState(0);
  const [Checked, setChecked] = useState(0);
  // const [Enrollment, setEnrollment] = useState(0)
  useEffect(() => {
    Application.clientsStats()
      .then((Response) => {
        setEnrollment(Response.data['Total Enrollment']);
        setIncomplete(Response.data['Incomplete Client Data']);
        setNeedCheck(Response.data['Client Needs Check']);
        setChecked(Response.data['Client Checked']);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, []);
  return (
    <>
      <div
        className={
          'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3  md:gap-4 w-full h-full'
        }
      >
        <NumberBox
          mode="added"
          // value={resolveValue('Total Enrollment')}
          value={Enrollment}
          title="Total Enrollment"
          icon={'/icons/profile-add.svg'}
        />
        <NumberBox
          mode="increase"
          // value={resolveValue('Incomplete Client Data')}
          value={Incomplete}
          title="Incomplete Client Data"
          icon={'icons/profile-delete.svg'}
        />
        <NumberBox
          mode="reduction"
          // value={resolveValue('Client Needs Check')}
          value={NeedCheck}
          title="Client Need Checking"
          icon={'icons/profile-check.svg'}
        />
        <NumberBox
          mode="increase"
          // value={resolveValue('Client Checked')}
          value={Checked}
          title="Clients Checked"
          icon={'/icons/profile-tick.svg'}
        />
      </div>
    </>
  );
};

export default NumberBoxes;
