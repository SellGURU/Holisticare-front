import { useEffect, useState } from 'react';
import Circleloader from '../CircleLoader';

const ClinicList = () => {
  const [isLoading, setIsLoading] = useState(true);
  // const [clinics, setClinics] = useState([
  // ]);
  const getClinics = () => {
    setIsLoading(false);
  };
  useEffect(() => {
    getClinics();
  }, []);
  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default ClinicList;
