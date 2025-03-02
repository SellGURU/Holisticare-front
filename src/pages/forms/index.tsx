/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import FormsComponents from '../../Components/Forms';

const Forms = () => {
  const [active, setActive] = useState<string>('Check-In');
  const [showModal, setShowModal] = useState(false);
  const [checkInList, setCheckInList] = useState<Array<any>>([]);
  return (
    <>
      <FormsComponents
        active={active}
        setActive={setActive}
        showModal={showModal}
        setShowModal={setShowModal}
        checkInList={checkInList}
        setCheckInList={setCheckInList}
      />
    </>
  );
};

export default Forms;
