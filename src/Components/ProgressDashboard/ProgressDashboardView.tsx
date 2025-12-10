import { useParams } from "react-router-dom";
import ProgressDashboard from ".";
import Application from "../../api/app";
import { useEffect } from "react";

const ProgressDashboardView = () => {
  const { id } = useParams<{ id: string }>();
  const getWellnessData = () => {
    Application.getWellnessScores({member_id: Number(id)}).then((res) => {})
  }
  useEffect(() => {
    getWellnessData();
  },[])
  return (
    <div className={`pt-[20px] scroll-container relative pb-[50px] xl:pr-28 h-[98vh] xl:ml-6  overflow-x-hidden xl:overflow-x-hidden  px-5 xl:px-0`}>
      <ProgressDashboard
      progressionData={[]}
      wellnessData={null}

      
      ></ProgressDashboard>
    </div>
  );
};

export default ProgressDashboardView;