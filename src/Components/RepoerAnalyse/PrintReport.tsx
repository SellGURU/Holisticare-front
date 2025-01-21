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
      return '/icons/TreatmentPlan/IconApple.svg';
    }
    if (category == 'Activity') {
      return '/icons/TreatmentPlan/IconActivity.svg';
    }
    if (category == 'Supplement') {
      return '/icons/TreatmentPlan/IconSupplement.svg';
    }
    if (category == 'Mind') {
      return '/icons/TreatmentPlan/Iconmind.svg';
    }
    return '/icons/TreatmentPlan/IconApple.svg';
  };
  console.log(resolveCategories());
  return (
    <div style={{ backgroundColor: '#E9F0F2' }}>
      <div
        className=" w-full relative min-h-full"
        style={{
          pageBreakAfter: 'always',
          height: 'auto',
          overflow: 'hidden',
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
        <div className="absolute bottom-4 right-4">
          <div className="text-sm " style={{ color: '#888888' }}>
            Powered by:{' '}
            <span className="" style={{ color: '#383838' }}>
              HolistiCare.io
            </span>
          </div>
        </div>
      </div>
      <div
        className=" w-full relative min-h-full"
        style={{
          pageBreakAfter: 'always',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#005F73',
        }}
      >
        <div className="text-3xl  ml-14 mt-32 text-white font-medium">
          Table of Content
        </div>
        <div
          className="mt-16 pt-16"
          style={{
            backgroundColor: '#337f8f',
            height: '100vh',
            width: '90%',
            marginRight: '146px',
          }}
        >
          <div
            className="px-12  py-20"
            style={{
              backgroundColor: '#F7F7F7',
              height: '100vh',
              width: '92%',
              marginRight: '146px',
            }}
          >
            <div className="flex justify-start gap-4 items-center">
              <div
                className="text-xl"
                style={{ color: '#005F73', fontWeight: '500' }}
              >
                Section 01
              </div>
              <div
                className="text-xl"
                style={{ color: '#383838', fontWeight: '500' }}
              >
                Client Summary
              </div>
            </div>
            <div className="flex justify-start gap-4 mt-5 items-center">
              <div
                className="text-xl"
                style={{ color: '#005F73', fontWeight: '500' }}
              >
                Section 02
              </div>
              <div
                className="text-xl"
                style={{ color: '#383838', fontWeight: '500' }}
              >
                Needs Focus Biomarkers
              </div>
            </div>
            <div className="flex justify-start gap-4 mt-5 items-center">
              <div
                className="text-xl"
                style={{ color: '#005F73', fontWeight: '500' }}
              >
                Section 03
              </div>
              <div
                className="text-xl"
                style={{ color: '#383838', fontWeight: '500' }}
              >
                Detailed Analysis{' '}
              </div>
            </div>
            <div className="flex justify-start gap-4 mt-5 items-center">
              <div
                className="text-xl"
                style={{ color: '#005F73', fontWeight: '500' }}
              >
                Section 04
              </div>
              <div
                className="text-xl"
                style={{ color: '#383838', fontWeight: '500' }}
              >
                Holistic Plan
              </div>
            </div>
            <div className="flex justify-start gap-4 mt-5 items-center">
              <div
                className="text-xl"
                style={{ color: '#005F73', fontWeight: '500' }}
              >
                Section 05
              </div>
              <div
                className="text-xl"
                style={{ color: '#383838', fontWeight: '500' }}
              >
                Action Plan
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className=""
        style={{
          backgroundColor: '#E9F0F2',
          minHeight: '100vh',
          padding: '24px 24px',
        }}
      >
        <div
          className="flex justify-between items-center"
          style={{ marginTop: '16px' }}
        >
          <div
            className="text-sm"
            style={{ color: '#383838', fontWeight: '500' }}
          >
            Client Summary
          </div>
          <div className="" style={{ color: '#888888', fontSize: '10px' }}>
            Total of {ClientSummaryBoxs.total_subcategory} biomarkers in{' '}
            {ClientSummaryBoxs.total_category} Categories
          </div>
        </div>
        <div className="flex justify-start items-center mt-4 gap-3">
          <div style={{ fontSize: '10px', color: '#888888' }}>Mark Spencer</div>
          <div className="" style={{ fontSize: '10px', color: '#888888' }}>
            <div>Gender: Male </div>
          </div>
          <div className="" style={{ fontSize: '10px', color: '#888888' }}>
            <div>Age: 40</div>
          </div>
        </div>
        <div
          style={{ color: '#888888', fontSize: '10px' }}
          className="text-justify mt-4"
        >
          {ClientSummaryBoxs?.client_summary}
        </div>
        <div className="w-full flex justify-end items-center gap-4 mt-4">
          <div className="flex justify-start gap-1 items-center">
            <div
              className=""
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#7F39FB',
                borderRadius: '100%',
              }}
            ></div>
            <div
              style={{ color: '#888888', fontSize: '12px' }}
              className="font-medium"
            >
              Excellent{' '}
            </div>
          </div>
          <div className="flex justify-start gap-1 items-center">
            <div
              className=""
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#06C78D',
                borderRadius: '100%',
              }}
            ></div>
            <div
              style={{ color: '#888888', fontSize: '12px' }}
              className="font-medium"
            >
              Good{' '}
            </div>
          </div>
          <div className="flex justify-start gap-1 items-center">
            <div
              className=""
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#FBAD37',
                borderRadius: '100%',
              }}
            ></div>
            <div
              style={{ color: '#888888', fontSize: '12px' }}
              className="font-medium"
            >
              Ok{' '}
            </div>
          </div>
          <div className="flex justify-start gap-1 items-center">
            <div
              className=""
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#FC5474',
                borderRadius: '100%',
              }}
            ></div>
            <div
              style={{ color: '#888888', fontSize: '12px' }}
              className="font-medium"
            >
              Needs focus{' '}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {resolveCategories().map((el: any) => {
            return <SummaryBoxPrint data={el}></SummaryBoxPrint>;
          })}
        </div>
      </div>

      <div
        className="my-10  "
        style={{
          pageBreakAfter: 'always',
          backgroundColor: '#E9F0F2',
          minHeight: '100vh',
          padding: '24px 24px',
        }}
      >
        <div className="flex justify-between items-center mt-4">
          <div
            id="Out of Reference"
            className=" text-sm font-medium"
            style={{ color: '#383838' }}
          >
            Needs Focus Biomarkers
          </div>
          <div
            className="  text-xs"
            style={{ color: '#888888', fontSize: '10px' }}
          >
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

      <div
        className=""
        style={{
          pageBreakAfter: 'always',
          backgroundColor: '#E9F0F2',
          minHeight: '100vh',
          padding: '24px 24px',
        }}
      >
        <div
          className="flex justify-between items-center"
          style={{ marginTop: '16px' }}
        >
          <div
            className="text-sm"
            id="Detailed analysis"
            style={{ color: '#383838', fontWeight: '500' }}
          >
            Detailed Analysis
          </div>
          <div className="" style={{ color: '#888888', fontSize: '10px' }}>
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
            return (
              <div
                className="py-6"
                style={{
                  pageBreakInside: 'avoid',
                  pageBreakBefore: 'auto',
                  pageBreakAfter: 'auto',
                }}
              >
                <DetiledAnalyse
                  refrences={
                    resolveSubCategories().filter(
                      (val) => val.subcategory == el.subcategory,
                    )[0]
                  }
                  data={el}
                ></DetiledAnalyse>
              </div>
              // <DetiledAnalyse refrences={resolveSubCategories().filter(val =>val.subcategory == el.subcategory )[0]} data={el}></DetiledAnalyse>
            );
          })}
        </div>
      </div>

      <div
        className=" "
        style={{
          backgroundColor: '#E9F0F2',
          minHeight: '100vh',
          padding: '24px 24px',
        }}
      >
        <div
          className="flex justify-between items-center"
          style={{ marginTop: '16px' }}
        >
          <div
            className="text-sm"
            style={{ color: '#383838', fontWeight: '500' }}
          >
            Holistic Plan
          </div>
        </div>

        <div
          className="w-full mb-4 h-9 flex justify-between items-center py-2 px-4 bg-white border border-green-400 mt-4"
          style={{ borderRadius: '12px' }}
        >
          <div className="text-xs" style={{ color: '#005F73' }}>
            Plan 04{' '}
          </div>
          <div className="flex justify-end items-center">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#4C88FF' }}
            ></div>
            <div
              className="ml-1"
              style={{ fontSize: '10px', color: '#383838' }}
            >
              On Going
            </div>
            <div
              style={{
                backgroundColor: '#E5E5E5',
                marginLeft: '24px',
                padding: '2.5px 8px',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#005F73' }}>
                2024/29/09
              </div>
            </div>
          </div>
        </div>
        {TreatMentPlanData.map((el) => {
          return (
            <>
              <div className="no-split">
                <div
                  className="text-xs flex bg-white text-center rounded-md w-full justify-center items-center py-1 gap-1"
                  style={{
                    width: '193px',
                    borderRadius: '8px',
                    borderBottomLeftRadius: '0px',
                    borderBottomRightRadius: '0px',
                    color: '#005F73',
                  }}
                >
                  <div className="w-8 h-8  flex justify-center items-center rounded-[8px]">
                    <img src={resolveTreatmentPlanIcon(el.category)} alt="" />
                  </div>
                  {el.category}
                </div>

                <div className="w-full flex flex-wrap gap-6  bg-white p-4 rounded-lg mb-4">
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
    </div>
  );
};

export default PrintReport;
