/* eslint-disable @typescript-eslint/no-explicit-any */

// import RefrenceBox from "./Boxs/RefrenceBox"
import BiomarkersPrint from './Print/BiomarkersPrint';
import CalenderPrint from './Print/CalenderPrint';
import DetiledAnalyse from './Print/DetiledAnalysePrint';
import SummaryBoxPrint from './Print/SummaryBoxPrint';
import TreatmentPlanPrint from './Print/TreatmentplanPrint';

interface PrintReportProps {
  ClientSummaryBoxs: any;
  referenceData: any;
  ResolveConceringData: () => Array<any>;
  TreatMentPlanData: Array<any>;
  caldenderData: any;
  resolveBioMarkers: () => Array<any>;
  resolveCategories: () => Array<any>;
  resolveSubCategories: () => Array<any>;
}

const PrintReport: React.FC<PrintReportProps> = ({
  ClientSummaryBoxs,
  ResolveConceringData,
  caldenderData,
  TreatMentPlanData,
  resolveSubCategories,
  resolveBioMarkers,
  referenceData,
  resolveCategories,
}) => {
  const resolveTreatmentPlanIcon = (category: string) => {
    if (category == 'Diet') {
      return './images/report/treatment/apple.svg';
    }
    if (category == 'Activity') {
      return './images/report/treatment/weight.svg';
    }
    if (category == 'Supplement') {
      return './images/report/treatment/pil.svg';
    }
    if (category == 'Mind') {
      return './images/report/treatment/mental-disorder.svg';
    }
    return './images/report/treatment/apple.svg';
  };
  return (
    <>
      <div
        className=" w-full relative min-h-full"
        style={{
          pageBreakAfter: 'always',
          height: 'auto',
          backgroundColor: '#E9F0F2',
        }}
      >
        <div
          className="w-full flex justify-center "
          style={{ paddingTop: '500px' }}
        >
          <div className="ml-20">
            <div
              className="text-white uppercase text-center "
              style={{ fontSize: 42, color: '#383838' }}
            >
              Comprehensive
            </div>
            <div
              className="text-white uppercase  text-center"
              style={{ fontSize: 42, color: '#383838' }}
            >
              Health Plan
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-2 items-center">
          <div
            className=""
            style={{
              backgroundColor: '#B0B0B0',
              width: '500px',
              height: '2px',
            }}
          ></div>
        </div>
        <div className="absolute left-10 top-0">
          <div
            className="rounded-full rounded-t-none "
            style={{
              backgroundColor: '#005F73',
              width: '12px',
              height: '200px',
              marginLeft: '95px',
            }}
          ></div>
          <img
            className="mt-6"
            style={{ width: '200px' }}
            src="/icons/poweredBy.svg"
            alt=""
          />
          <div
            className="rounded-full mt-6 rounded-b-none "
            style={{
              backgroundColor: '#005F73',
              width: '12px',
              height: '680px',
              marginLeft: '95px',
            }}
          ></div>
        </div>
      </div>
      <div>
        <div className="mt-4">
          <div className=" text-light-primary-text dark:text-[#FFFFFFDE] flex items-center text-xl font-medium">
            Client Information
          </div>
        </div>

        <div className="mt-3">
          <div className="w-full mt-1 flex gap-1 justify-center">
            <div className="w-1/2 bg-gray-100 px-2 py-1 text-gray-700 font-medium rounded-md ">
              Full Name:
            </div>
            <div className="w-1/2 px-2 py-1 text-gray-900 border-b border-b-gray-100  rounded-md ">
              Leslie Alexander
            </div>
          </div>
          <div className="w-full mt-1 gap-1 flex justify-center">
            <div className="w-1/2 bg-gray-100 px-2 py-1 text-gray-700 font-medium rounded-md ">
              Age:
            </div>
            <div className="w-1/2 px-2 py-1 text-gray-900 border-b border-b-gray-100  rounded-md">
              48 Years
            </div>
          </div>
          <div className="w-full mt-1 flex gap-1 justify-center">
            <div className="w-1/2 bg-gray-100 px-2 py-1 text-gray-700 font-medium rounded-md ">
              Sex:
            </div>
            <div className="w-1/2 px-2 py-1 text-gray-900 border-b border-b-gray-100  rounded-md">
              Female
            </div>
          </div>
          <div className="w-full mt-1 flex gap-1 justify-center">
            <div className="w-1/2 bg-gray-100 px-2 py-1 text-gray-700 font-medium rounded-md ">
              Height:
            </div>
            <div className="w-1/2 px-2 py-1 text-gray-900 border-b border-b-gray-100  rounded-md">
              180 cm
            </div>
          </div>
          <div className="w-full mt-1 flex gap-1 justify-center">
            <div className="w-1/2 bg-gray-100 px-2 py-1 text-gray-700 font-medium rounded-md ">
              Weight:
            </div>
            <div className="w-1/2 px-2 py-1 text-gray-900  border-b border-b-gray-100 rounded-md">
              75 kg
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className=" text-light-primary-text dark:text-[#FFFFFFDE] flex items-center text-xl font-medium">
          Client Summary
        </div>
        {ClientSummaryBoxs && (
          <div className=" text-light-secandary-text dark:text-[#FFFFFF99] text-xs">
            Total of {ClientSummaryBoxs.total_subcategory} groups in{' '}
            {ClientSummaryBoxs.total_category} category
          </div>
        )}
      </div>
      <div
        className=" text-light-secandary-text dark:text-[#FFFFFF99] text-justify text-xs mt-4"
        style={{ lineHeight: '24px' }}
      >
        {ClientSummaryBoxs?.client_summary}
      </div>
      <div
        className="w-full mt-4 grid gap-4 grid-cols-2"
        style={{ pageBreakAfter: 'always' }}
      >
        {resolveCategories().map((el: any) => {
          return <SummaryBoxPrint data={el}></SummaryBoxPrint>;
        })}
      </div>
      <div
        className="my-10 text-light-primary-text dark:text-primary-text "
        style={{ pageBreakAfter: 'always' }}
      >
        <div>
          <div id="Out of Reference" className=" text-xl font-medium">
            Needs Focus Biomarkers
          </div>
          <div className=" text-light-secandary-text dark:text-[#FFFFFF99] text-xs">
            {referenceData.total_biomarker_note}
          </div>
        </div>
        <div className="w-full mt-4 grid gap-8 grid-cols-1">
          {resolveBioMarkers()
            .filter((val) => val.outofref == true)
            .map((el) => {
              return <BiomarkersPrint data={el}></BiomarkersPrint>;
            })}
        </div>
      </div>

      <div className="my-10 " style={{ pageBreakAfter: 'always' }}>
        <div>
          <div
            id="Detailed analysis"
            className=" text-light-primary-text dark:text-[#FFFFFFDE] text-xl font-medium"
          >
            Detailed Analysis
          </div>
          <div className=" text-light-primary-text dark:text-[#FFFFFF99] text-xs">
            {referenceData.detailed_analysis_note}
          </div>
        </div>
        {/* <div className="w-full mt-4 grid gap-8 grid-cols-1">
                    {resolveBioMarkers().map((el) => {
                        return (
                            <BiomarkersPrint data={el}></BiomarkersPrint>
                        )
                    })}
                
                </div>                                   */}

        <div className="mt-6">
          {resolveCategories().map((el: any) => {
            console.log(el);
            return (
              <>
                <DetiledAnalyse
                  refrences={
                    resolveSubCategories().filter(
                      (val) => val.subcategory == el.subcategory,
                    )[0]
                  }
                  data={el}
                ></DetiledAnalyse>
              </>
              // <DetiledAnalyse refrences={resolveSubCategories().filter(val =>val.subcategory == el.subcategory )[0]} data={el}></DetiledAnalyse>
            );
          })}
        </div>
      </div>

      <div className="my-10 " style={{ pageBreakAfter: 'always' }}>
        <div className="w-full mb-3 flex items-center justify-between">
          <div
            id="Treatment Plan"
            className="text-light-primary-text dark:text-[#FFFFFFDE] text-[24px] font-medium"
          >
            Treatment Plan{' '}
          </div>
        </div>
        {TreatMentPlanData.map((el) => {
          return (
            <>
              <div className="no-split">
                <div className="text-base flex bg-blue-200 rounded-md w-full justify-start items-center gap-1">
                  <div className="w-8 h-8 dark:bg-[#333333] bg-light-overlay flex justify-center items-center rounded-[8px]">
                    <img src={resolveTreatmentPlanIcon(el.category)} alt="" />
                  </div>
                  {el.category}
                </div>

                <div className="w-full flex flex-wrap gap-6  bg-slate-500 p-4 rounded-sm mt-4">
                  {el.data.map((el2: any) => {
                    return <TreatmentPlanPrint data={el2}></TreatmentPlanPrint>;
                  })}
                </div>
              </div>
            </>
          );
        })}
      </div>

      <div className="my-10 " style={{ pageBreakAfter: 'always' }}>
        <div className="w-full mb-3 flex items-center justify-between">
          <div className="text-light-primary-text dark:text-[#FFFFFFDE] text-[24px] font-medium">
            Action Plan{' '}
          </div>
        </div>
        {caldenderData != null && caldenderData.length > 0 && (
          <CalenderPrint data={caldenderData}></CalenderPrint>
        )}
      </div>

      <div className="my-10 " style={{ pageBreakAfter: 'always' }}>
        <div className="w-full mb-3 flex items-center justify-between">
          <div className="text-light-primary-text dark:text-[#FFFFFFDE] text-[24px] font-medium">
            Concerning Result
          </div>
        </div>
        <div className="px-2">
          <div className="w-full  bg-gray-100 rounded-md py-3 px-2 flex justify-between items-center">
            <div
              className="text-gray-700 font-medium "
              style={{ width: 200, fontSize: 10 }}
            >
              Name
            </div>
            <div
              className="text-gray-700 font-medium "
              style={{ fontSize: 10 }}
            >
              Result
            </div>
            <div
              className="text-gray-700 font-medium "
              style={{ fontSize: 10 }}
            >
              Units
            </div>
            <div
              className="text-gray-700 font-medium "
              style={{ fontSize: 10 }}
            >
              Lab Ref Range
            </div>
            <div
              className="text-gray-700 font-medium "
              style={{ fontSize: 10 }}
            >
              Baseline
            </div>
            <div
              className="text-gray-700 font-medium "
              style={{ fontSize: 10 }}
            >
              Optimal Range
            </div>
            <div
              className="text-gray-700 font-medium "
              style={{ fontSize: 10 }}
            >
              Changes
            </div>
          </div>
          {ResolveConceringData().map((el) => {
            return (
              <>
                <div className="w-full border bg-gray-50 border-gray-200 mt-3 rounded-md py-3 px-2 flex justify-between items-center">
                  <div
                    className="text-xs text-gray-800"
                    style={{ fontSize: 9 }}
                  >
                    {el.subcategory}
                  </div>
                </div>
                {el.biomarkers.map((val: any) => {
                  return (
                    <div className="w-full border  border-gray-200 mt-3 rounded-md py-3 px-2 flex justify-between items-center">
                      <div
                        className=" text-gray-800"
                        style={{ fontSize: '8px', width: 200 }}
                      >
                        {val.name}
                      </div>
                      <div
                        className=" text-gray-800"
                        style={{ fontSize: '8px' }}
                      >
                        {val.Result}
                      </div>
                      <div
                        className=" text-gray-800"
                        style={{ fontSize: '8px' }}
                      >
                        {val.Units}
                      </div>
                      <div
                        className=" text-gray-800"
                        style={{ fontSize: '8px' }}
                      >
                        {val['Lab Ref Range']}
                      </div>
                      <div
                        className=" text-gray-800"
                        style={{ fontSize: '8px' }}
                      >
                        {val.Baseline}
                      </div>
                      <div
                        className=" text-gray-800"
                        style={{ fontSize: '8px' }}
                      >
                        {val['Optimal Range']}
                      </div>
                      <div
                        className=" text-gray-800"
                        style={{ fontSize: '8px' }}
                      >
                        {val.Changes}
                      </div>
                    </div>
                  );
                })}
              </>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PrintReport;
