import { ReportSideMenu } from '../../Components';
import ReportAnalyseView from '../../Components/RepoerAnalyse/ReportAnalyseView';

const Share = () => {
  return (
    <>
      <div className="bg-bg-color min-h-screen w-full h-full">
        <div className="fixed z-10 left-4 top-16">
          <ReportSideMenu></ReportSideMenu>
        </div>

        <div className="w-full pl-[200px] fixed">
          <ReportAnalyseView isShare></ReportAnalyseView>
        </div>
      </div>
    </>
  );
};

export default Share;
