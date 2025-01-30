import { useParams } from 'react-router-dom';
import { ReportSideMenu } from '../../Components';
import ReportAnalyseView from '../../Components/RepoerAnalyse/ReportAnalyseView';
import { useEffect, useState } from 'react';
import Application from '../../api/app';

const Share = () => {
  const { id } = useParams<{ id: string}>();
  const [memberId,setMemberId] = useState<string>("123")
  useEffect(() => {
    Application.getMemberId(id as string).then((res) => {
      setMemberId(res.data.member_id)
    })
  },[])

  return (
    <>
      <div className="bg-bg-color min-h-screen w-full h-full">
        <div className="fixed z-10 left-4 top-16">
          <ReportSideMenu></ReportSideMenu>
        </div>

        <div className="w-full pl-[200px] fixed">
          
          <ReportAnalyseView memberID={Number(memberId)} uniqKey={id} isShare></ReportAnalyseView>
        </div>
      </div>
    </>
  );
};

export default Share;
