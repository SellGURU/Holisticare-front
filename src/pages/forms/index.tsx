import { useState } from 'react';
import FormsComponents from '../../Components/Forms';

const Forms = () => {
  const [active, setActive] = useState<string>('Check-In');
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <FormsComponents
        active={active}
        setActive={setActive}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </>
  );
};

export default Forms;
