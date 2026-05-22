import DashboardHeader from './DashboardHeader';
import ClinicalAttentionRadar from './ClinicalAttentionRadar';
import EngagementHealth from './EngagementHealth';
import AiPriorityQueue from './AiPriorityQueue';
import CommunicationCenter from './CommunicationCenter';
import InterventionInsights from './InterventionInsights';
import ActivePatientGrowth from './ActivePatientGrowth';

const Dashboard = () => {
  return (
    <div className="px-6 pt-6 pb-12">
      <DashboardHeader />
      <div className="grid grid-cols-12 gap-5 mb-5">
        <ClinicalAttentionRadar />
        <EngagementHealth />
      </div>
      <div className="grid grid-cols-12 gap-5 mb-5">
        <AiPriorityQueue />
        <CommunicationCenter />
      </div>
      <div className="grid grid-cols-12 gap-5">
        <InterventionInsights />
        <ActivePatientGrowth />
      </div>
    </div>
  );
};

export default Dashboard;
