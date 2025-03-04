/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import FormsComponents from '../../Components/Forms';

const Forms = () => {
  const [active, setActive] = useState<string>('Check-In');
  const [showModal, setShowModal] = useState(false);
  const [checkInListModal, setCheckInListModal] = useState<Array<any>>([]);
  const [checkInLists, setCheckInLists] = useState<Array<any>>([]);
  return (
    <>
      <FormsComponents
        active={active}
        setActive={setActive}
        showModal={showModal}
        setShowModal={setShowModal}
        checkInList={checkInListModal}
        setCheckInList={setCheckInListModal}
        checkInLists={checkInLists}
        setCheckInLists={setCheckInLists}
      />
    </>
  );
};

export default Forms;
