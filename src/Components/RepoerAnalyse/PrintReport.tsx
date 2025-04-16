/* eslint-disable @typescript-eslint/no-explicit-any */

// import RefrenceBox from "./Boxs/RefrenceBox"
import { useEffect, useState } from 'react';
import { subscribe } from '../../utils/event';
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
  usrInfoData: any;
  resolveBioMarkers: () => Array<any>;
  resolveCategories: () => Array<any>;
  resolveSubCategories: () => Array<any>;
  helthPlan: any;
  ActionPlan: any;
}

// Header component that will only appear from page 2 onwards
// const PrintHeader = () => {
//   return (
//     <div className="print-header z-50 ">
//       <div className="flex justify-between items-center px-4 py-2">
//         <img src="/icons/poweredBy.svg" alt="HolistiCare" style={{ height: '30px' }} />
//         <div className="text-sm font-medium" style={{ color: '#005F73' }}>Comprehensive Health Plan</div>
//       </div>
//       <div className="w-full" style={{ height: '2px', backgroundColor: '#005F73', opacity: 0.3 }}></div>
//     </div>
//   );
// };

// // Footer component that will only appear from page 2 onwards
// const PrintFooter = () => {
//   return (
//     <div className="print-footer z-50">
//       <div className="w-full" style={{ height: '1px', backgroundColor: '#005F73', opacity: 0.3 }}></div>
//       <div className="flex justify-between items-center px-4 py-2">
//         <div className="text-xs" style={{ color: '#383838' }}>© HolistiCare</div>
//         <div className="text-xs" style={{ color: '#383838' }}>Page <span className="pageNumber"></span></div>
//       </div>
//     </div>
//   );
// };

const PrintReport: React.FC<PrintReportProps> = ({
  ClientSummaryBoxs,
  ResolveConceringData,
  caldenderData,
  TreatMentPlanData,
  usrInfoData,
  resolveSubCategories,
  resolveBioMarkers,
  referenceData,
  resolveCategories,
  helthPlan,
  ActionPlan,
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
  useEffect(() => {
    console.log(helthPlan);
  }, [helthPlan]);
  const [printOptins, setPrintOptions] = useState([
    {
      name: 'Client Summary',
      checked: true,
    },
    {
      name: 'Needs Focus Biomarker',
      checked: true,
    },
    {
      name: 'Detailed Analysis',
      checked: true,
    },
    {
      name: 'Holistic Plan',
      checked: true,
    },
    {
      name: 'Action Plan',
      checked: true,
    },
  ]);
  subscribe('downloadCalled', (data) => {
    setPrintOptions(data.detail);
  });

  return (
    <div style={{ backgroundColor: '#E9F0F2' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            
            .print-header, .print-footer {
              display: none;
            }
            
            /* Hide header/footer on first page */
            body > div > div:first-of-type .print-header,
            body > div > div:first-of-type .print-footer,
            body > div > div:nth-of-type(2) .print-header,
            body > div > div:nth-of-type(2) .print-footer {
              display: none !important;
            }
            
            /* Show header/footer on all other pages */
            body > div > div:not(:first-of-type):not(:nth-of-type(2)) .print-header,
            body > div > div:not(:first-of-type):not(:nth-of-type(2)) .print-footer {
              display: block !important;
              position: fixed;
              width: 100%;
            }
            
            .print-header {
              top: 0;
              left:0;
            }
            
            .print-footer {
              bottom: 0;
              left:0;
            }
            
            /* Add padding to content to accommodate header/footer */
            body > div > div:not(:first-of-type):not(:nth-of-type(2)) {
              padding-top: 60px !important;
              padding-bottom: 40px !important;
            }
          }
        `,
        }}
      />

      {/* First page - Cover page */}
      <div
        className=" w-full relative min-h-full"
        style={{
          pageBreakAfter: 'always',
          height: 'auto',
          overflow: 'hidden',
          backgroundColor: '#E9F0F2',
          zIndex: 1000000,
        }}
      >
        <div
          className="w-full flex justify-center "
          style={{ paddingTop: '500px' }}
        >
          <div className="ml-20">
            <div
              className="text-white uppercase text-center "
              style={{ fontSize: 42, color: '#383838', letterSpacing: '8px' }}
            >
              Comprehensive
            </div>
            <div
              className="text-white uppercase  text-center"
              style={{ fontSize: 42, color: '#383838', letterSpacing: '8px' }}
            >
              Health Plan
            </div>
          </div>
        </div>
        <div className=" justify-end mt-2 hidden items-center">
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

      {/* Second page - Table of contents */}
      <div
        className=" w-full relative min-h-full"
        style={{
          pageBreakAfter: 'always',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 1000000,
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

      {/* Rest of pages - Include header and footer */}
      {printOptins.filter((el) => el.name == 'Client Summary')[0].checked && (
        <div
          className=""
          style={{
            backgroundColor: '#E9F0F2',
            minHeight: '100vh',
            padding: '24px 24px',
          }}
        >
          {/* <PrintHeader /> */}
          <div
            className="flex justify-between items-center"
            style={{ marginTop: '16px' }}
          >
            <div
              className="text-lg"
              style={{ color: '#005F73', fontWeight: '600' }}
            >
              Client Summary
            </div>
            <div className="" style={{ color: '#383838', fontSize: '14px' }}>
              Total of {ClientSummaryBoxs.total_subcategory} biomarkers in{' '}
              {ClientSummaryBoxs.total_category} categories
            </div>
          </div>
          <div className="flex justify-start items-center mt-4 gap-3">
            <div
              style={{ fontSize: '14px', color: '#383838', fontWeight: 500 }}
            >
              {usrInfoData?.name}
            </div>
            <div className="flex justify-center items-center gap-1">
              <div className="" style={{ fontSize: '14px', color: '#383838' }}>
                <div>Gender: {usrInfoData?.sex} </div>
              </div>
              <div
                className=""
                style={{
                  width: '1px',
                  height: '12px',
                  backgroundColor: '#383838',
                }}
              ></div>
              <div className="" style={{ fontSize: '14px', color: '#383838' }}>
                <div>Age: {usrInfoData?.age}</div>
              </div>
            </div>
          </div>
          <div
            style={{ color: '#383838', fontSize: '14px' }}
            className="text-justify mt-4"
          >
            {ClientSummaryBoxs?.client_summary}
          </div>
          <div className="w-full invisible  flex justify-end items-center gap-4 mt-4">
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
                style={{ color: '#383838', fontSize: '12px' }}
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
                style={{ color: '#383838', fontSize: '12px' }}
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
                style={{ color: '#383838', fontSize: '12px' }}
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
                style={{ color: '#383838', fontSize: '12px' }}
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
          {/* <PrintFooter /> */}
        </div>
      )}

      {printOptins.filter((el) => el.name == 'Needs Focus Biomarker')[0]
        .checked && (
        <div
          className=" "
          style={{
            backgroundColor: '#E9F0F2',
            minHeight: '100vh',
            padding: '24px 24px',
          }}
        >
          {/* <PrintHeader /> */}
          <div className="flex justify-between items-center mt-4">
            <div
              id="Out of Reference"
              className="text-lg"
              style={{ color: '#005F73', fontWeight: '600' }}
            >
              Needs Focus Biomarkers
            </div>
            <div
              className="  text-xs"
              style={{ color: '#383838', fontSize: '14px' }}
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
          <div className="w-full mb-3 mt-4 flex items-center justify-between">
            <div
              className="text-lg"
              style={{ color: '#005F73', fontWeight: '600' }}
            >
              Conclusion
            </div>
          </div>
          <div className="px-2">
            <div className="w-full  bg-white rounded-md py-4 px-3 flex justify-between items-center">
              <div
                className="text-gray-700 font-medium "
                style={{ width: 200, fontSize: 12, color: '#383838' }}
              >
                Name
              </div>
              <div
                className="text-gray-700 text-center font-medium "
                style={{ fontSize: 12, width: '60px', color: '#383838' }}
              >
                Result
              </div>
              <div
                className="text-gray-700 text-center font-medium "
                style={{ fontSize: 12, width: '60px', color: '#383838' }}
              >
                Units
              </div>
              <div
                className="text-gray-700 text-center font-medium "
                style={{ fontSize: 12, width: '60px', color: '#383838' }}
              >
                Lab Ref Range
              </div>
              <div
                className="text-gray-700 text-center font-medium "
                style={{ fontSize: 12, width: '60px', color: '#383838' }}
              >
                Baseline
              </div>
              <div
                className="text-gray-700 text-center font-medium "
                style={{ fontSize: 12, width: '60px', color: '#383838' }}
              >
                Optimal Range
              </div>
              <div
                className="text-gray-700 text-center font-medium "
                style={{ fontSize: 12, width: '60px', color: '#383838' }}
              >
                Changes
              </div>
            </div>
            {ResolveConceringData().map((el) => {
              return (
                <>
                  <div className="w-full border bg-white border-gray-200  py-3 px-2 flex justify-between items-center">
                    <div
                      className="text-xs flex justify-start gap-2 items-center text-gray-800"
                      style={{ fontSize: 9, color: '#005F73' }}
                    >
                      <div>
                        <img src="/icons/arrow-square-down.svg" alt="" />
                      </div>
                      {el.subcategory}
                    </div>
                  </div>
                  {el.biomarkers.map((val: any) => {
                    return (
                      <div className="w-full  bg-white  py-3 px-3 flex justify-between items-center">
                        <div
                          className=" text-gray-800"
                          style={{
                            fontSize: '10px',
                            color: '#383838',
                            width: 200,
                          }}
                        >
                          {val.name}
                        </div>
                        <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '10px',
                            width: '60px',
                            color: '#383838',
                          }}
                        >
                          {val.Result}
                        </div>
                        <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '10px',
                            width: '60px',
                            color: '#383838',
                          }}
                        >
                          {val.Units}
                        </div>
                        <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '10px',
                            width: '60px',
                            color: '#383838',
                          }}
                        >
                          {val['Lab Ref Range']}
                        </div>
                        <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '10px',
                            width: '60px',
                            color: '#383838',
                          }}
                        >
                          {val.Baseline}
                        </div>
                        <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '10px',
                            width: '60px',
                            color: '#383838',
                          }}
                        >
                          {val['Optimal Range']}
                        </div>
                        <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '10px',
                            width: '60px',
                            color: '#383838',
                          }}
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
          {/* <PrintFooter /> */}
        </div>
      )}

      {printOptins.filter((el) => el.name == 'Detailed Analysis')[0]
        .checked && (
        <div
          className=""
          style={{
            pageBreakAfter: 'always',
            backgroundColor: '#E9F0F2',
            minHeight: '100vh',
            padding: '24px 24px',
          }}
        >
          {/* <PrintHeader /> */}
          <div
            className="flex justify-between items-center"
            style={{ marginTop: '16px' }}
          >
            <div
              className="text-lg"
              id="Detailed analysis"
              style={{ color: '#005F73', fontWeight: '600' }}
            >
              Detailed Analysis
            </div>
            <div className="" style={{ color: '#383838', fontSize: '14px' }}>
              {referenceData.detailed_analysis_note}
            </div>
          </div>

          <div className="mt-6">
            {resolveCategories().map((el: any) => {
              return (
                <div className="py-6">
                  <DetiledAnalyse
                    refrences={
                      resolveSubCategories().filter(
                        (val) => val.subcategory == el.subcategory,
                      )[0]
                    }
                    data={el}
                  ></DetiledAnalyse>
                </div>
              );
            })}
          </div>
          {/* <PrintFooter /> */}
        </div>
      )}

      {printOptins.filter((el) => el.name == 'Holistic Plan')[0].checked && (
        <div
          className=" "
          style={{
            backgroundColor: '#E9F0F2',
            minHeight: '100vh',
            padding: '24px 24px',
          }}
        >
          {/* <PrintHeader /> */}
          <div
            className="flex justify-between mb-3 items-center"
            style={{ marginTop: '16px' }}
          >
            <div
              className="text-xl"
              style={{ color: '#005F73', fontWeight: '600' }}
            >
              Holistic Plan
            </div>
          </div>
          {helthPlan && (
            <div
              className="w-full mb-4 flex justify-between items-center py-2 px-4 bg-white border border-green-400 mt-4"
              style={{ borderRadius: '12px' }}
            >
              <div className="text-sm" style={{ color: '#005F73' }}>
                {helthPlan[helthPlan.length - 1]?.t_title}
              </div>
              <div className="flex justify-end items-center">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#4C88FF' }}
                ></div>
                <div
                  className="ml-1"
                  style={{ fontSize: '12px', color: '#383838' }}
                >
                  {helthPlan[helthPlan.length - 1]?.state}
                </div>
                <div
                  style={{
                    backgroundColor: '#E5E5E5',
                    marginLeft: '24px',
                    padding: '2.5px 12px',
                    borderRadius: '12px',
                  }}
                >
                  <div
                    className="flex justify-center gap-1 items-center"
                    style={{ fontSize: '12px', color: '#005F73' }}
                  >
                    <img src="/icons/timerprint.svg" alt="" />
                    {helthPlan[helthPlan.length - 1]?.date_text}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="gap-3">
            {TreatMentPlanData.map((el) => {
              return (
                <>
                  <div className="no-split">
                    <div
                      className="text-sm flex bg-white text-center rounded-md w-full justify-center items-center gap-1"
                      style={{
                        width: '193px',
                        borderRadius: '8px',
                        borderBottomLeftRadius: '0px',
                        borderBottomRightRadius: '0px',
                        color: '#005F73',
                      }}
                    >
                      <div className="w-8 h-8  flex justify-center items-center rounded-[8px]">
                        <img
                          src={resolveTreatmentPlanIcon(el.category)}
                          alt=""
                        />
                      </div>
                      {el.category}
                    </div>

                    <div className="w-full flex flex-wrap gap-6  bg-white p-4 rounded-lg mb-2 rounded-tl-none">
                      {el.data.map((el2: any) => {
                        return (
                          <TreatmentPlanPrint data={el2}></TreatmentPlanPrint>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })}
          </div>
          {/* <PrintFooter /> */}
        </div>
      )}

      {printOptins.filter((el) => el.name == 'Action Plan')[0].checked && (
        <div className="" style={{ pageBreakAfter: 'always', padding: '24px' }}>
          {/* <PrintHeader /> */}
          <div
            className="flex justify-between items-center"
            style={{ marginTop: '16px' }}
          >
            <div
              className="text-xl"
              style={{ color: '#005F73', fontWeight: '600' }}
            >
              Action Plan
            </div>
          </div>
          {ActionPlan && (
            <div
              className="w-full mb-4 py-2 px-4 bg-white border border-green-400 mt-4"
              style={{ borderRadius: '12px' }}
            >
              <div className="text-sm mb-2" style={{ color: '#005F73' }}>
                {ActionPlan[ActionPlan.length - 1]?.title}
              </div>
              <div className="text-xs" style={{ color: '#383838' }}>
                {ActionPlan[ActionPlan.length - 1]?.description}
              </div>
              <div className="flex justify-between items-center">
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <div style={{ color: '#383838', fontSize: '12px' }}>
                      Progress
                    </div>
                    <div style={{ color: '#005F73', fontSize: '12px' }}>
                      {ActionPlan[ActionPlan?.length - 1]?.progress
                        ? ActionPlan[ActionPlan?.length - 1]?.progress + '%'
                        : '0%'}
                    </div>
                  </div>
                  <div>
                    <div
                      className="relative"
                      style={{
                        width: '250px',
                        height: '8px',
                        borderRadius: '12px',
                        background: '#E5E5E5',
                      }}
                    >
                      <div
                        className="absolute left-0  "
                        style={{
                          height: '6px',
                          backgroundColor: '#6CC24A',
                          borderRadius: '12px',
                          width: ActionPlan[ActionPlan.length - 1]?.progress
                            ? ActionPlan[ActionPlan.length - 1]?.progress + '%'
                            : '0%',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#4C88FF' }}
                  ></div>
                  <div
                    className="ml-1"
                    style={{ fontSize: '12px', color: '#383838' }}
                  >
                    {ActionPlan[ActionPlan.length - 1]?.state}
                  </div>
                  <div
                    style={{
                      backgroundColor: '#E5E5E5',
                      marginLeft: '24px',
                      padding: '2.5px 12px',
                      borderRadius: '12px',
                    }}
                  >
                    <div
                      className="flex justify-center gap-1 items-center"
                      style={{ fontSize: '12px', color: '#005F73' }}
                    >
                      <img src="/icons/timerprint.svg" alt="" />
                      {ActionPlan[ActionPlan.length - 1]?.to_date}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {caldenderData != null && caldenderData.length > 0 && (
            <CalenderPrint data={caldenderData}></CalenderPrint>
          )}
          {/* <PrintFooter /> */}
        </div>
      )}
    </div>
  );
};

export default PrintReport;
