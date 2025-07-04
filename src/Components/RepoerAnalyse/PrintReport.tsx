/* eslint-disable @typescript-eslint/no-explicit-any */

// import RefrenceBox from "./Boxs/RefrenceBox"
import { useEffect, useState } from 'react';
import { subscribe } from '../../utils/event';
import BiomarkersPrint from './Print/BiomarkersPrint';
// import CalenderPrint from './Print/CalenderPrint';
import DetiledAnalyse from './Print/DetiledAnalysePrint';
import SummaryBoxPrint from './Print/SummaryBoxPrint';
import TreatmentPlanPrint from './Print/TreatmentplanPrint';
import ActionPlanOverview from './Print/ActionPlanOverview';

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
  const transformConceringData = () => {
    const originalData = ResolveConceringData();
    return originalData.flatMap((item) =>
      item.biomarkers.map((biomarker: any) => ({
        name: biomarker.name,
        Result: biomarker.Result,
        Units: biomarker.Units,
        'Lab Ref Range': biomarker['Lab Ref Range'],
        Baseline: biomarker.Baseline,
        'Optimal Range': biomarker['Optimal Range'],
        Changes: biomarker.Changes,
        subcategory: item.subcategory,
      })),
    );
  };

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
  let pageNumber: number = 0;
  const resolvePageNumber = () => {
    pageNumber++;
    return pageNumber;
  };
  let sectionCounter = 0;
  const getNextSectionNumber = () => {
    sectionCounter++;
    return sectionCounter.toString().padStart(2, '0');
  };
  // console.log(resolveCategories());
  //   const resolveCategories= () => {
  //     return [
  //     {
  //         "subcategory": "Total Body Mass",
  //         "description": "The client's BMI indicates a normal body composition, which is consistent with the absence of medical conditions or specific health goals, suitable for her age and gender.",
  //         "position": "torso",
  //         "num_of_biomarkers": 1,
  //         "out_of_ref": 0,
  //         "status": [
  //             0,
  //             0,
  //             100,
  //             0
  //         ]
  //     },
  //     {
  //         "subcategory": "Cardiovascular Risk",
  //         "description": "The client's cardiovascular biomarkers indicate that total cholesterol is excellent, while total cholesterol/HDL ratio is also excellent. However, total cholesterol needs focus due to elevated levels, with non-HDL cholesterol requiring attention. The LDL/HDL ratio stands out as excellent, showing good cholesterol profile management. Nonetheless, triglycerides and VLDL cholesterol need focus, indicating potential cardiovascular risk. These findings suggest the client might adapt their dietary habits or physical activity levels, given no medical conditions or medications are reported.",
  //         "position": "heart",
  //         "num_of_biomarkers": 15,
  //         "out_of_ref": 4,
  //         "status": [
  //             47,
  //             0,
  //             27,
  //             27
  //         ]
  //     },
  //     {
  //         "subcategory": "Genetics/DNA",
  //         "description": "The client's biomarkers indicate a generally healthy genetic profile at age 42, with stable parameters in key areas. However, attention to 'Vascular Response to Exercise' is necessary for optimizing cardiovascular health.",
  //         "position": "head",
  //         "num_of_biomarkers": 18,
  //         "out_of_ref": 1,
  //         "status": [
  //             0,
  //             0,
  //             94,
  //             6
  //         ]
  //     },
  //     {
  //         "subcategory": "Gut Health",
  //         "description": "The client's gut health biomarkers indicate a mix of excellent and needs focus results. The predominance of 'needs focus' markers suggests potential dysbiosis or imbalance in gut microbiota, which can be influenced by factors such as age (42) and gender (female). Medical conditions and medications weren't provided; however, addressing the underperforming bacteria through dietary changes, probiotics, or medications may be beneficial to achieve gut health goals.",
  //         "position": "abdomen",
  //         "num_of_biomarkers": 64,
  //         "out_of_ref": 51,
  //         "status": [
  //             20,
  //             0,
  //             0,
  //             80
  //         ]
  //     },
  //     {
  //         "subcategory": "Blood",
  //         "description": "All hematology biomarkers including ESR, Hematocrit, Hemoglobin, MPV, PCT, PDW, Platelets, RDW, Transferrin Saturation, and WBC levels are in excellent status for a 42-year-old female, indicating optimal hematological health.",
  //         "position": "left hand",
  //         "num_of_biomarkers": 10,
  //         "out_of_ref": 0,
  //         "status": [
  //             100,
  //             0,
  //             0,
  //             0
  //         ]
  //     },
  //     {
  //         "subcategory": "Thyroid Function",
  //         "description": "The client's TSH level is excellent, indicating optimal thyroid function, which is important for overall hormonal health, especially in a 42-year-old female.",
  //         "position": "neck",
  //         "num_of_biomarkers": 1,
  //         "out_of_ref": 0,
  //         "status": [
  //             100,
  //             0,
  //             0,
  //             0
  //         ]
  //     },
  //     {
  //         "subcategory": "Immune Health",
  //         "description": "The client, a 42-year-old female, shows excellent immune health markers for anti-H.Pylori (Ab-IgA, Ab-IgG, Ab-IgM), HCV antibody, HIV P24 Ag, and HIV1,2 Ab. However, the HBs antibody requires attention, suggesting potential immunization or chronic infection considerations. The strong performance in H.Pylori and viral markers indicates effective immune response, but further evaluation on the HBs antibody is advised to prevent future complications.",
  //         "position": "Hand",
  //         "num_of_biomarkers": 8,
  //         "out_of_ref": 1,
  //         "status": [
  //             88,
  //             0,
  //             0,
  //             12
  //         ]
  //     },
  //     {
  //         "subcategory": "Liver Function",
  //         "description": "The client, a 42-year-old female, presents concerning liver biomarkers (Gamma GT, ALT, Total Bilirubin) indicating potential liver dysfunction; close monitoring and lifestyle adjustments are recommended.",
  //         "position": "abdomen",
  //         "num_of_biomarkers": 3,
  //         "out_of_ref": 3,
  //         "status": [
  //             0,
  //             0,
  //             0,
  //             100
  //         ]
  //     },
  //     {
  //         "subcategory": "Diabetes & Glucose",
  //         "description": "The client, a 42-year-old female, shows excellent biomarkers for Fasting Plasma Glucose, Hb A1C, and Insulin, indicating good blood sugar control. However, the HOMA-IR is at a borderline level, suggesting potential insulin resistance, which should be monitored given the absence of medical conditions or specific medications that could impact metabolic health.",
  //         "position": "abdomen",
  //         "num_of_biomarkers": 4,
  //         "out_of_ref": 0,
  //         "status": [
  //             75,
  //             0,
  //             25,
  //             0
  //         ]
  //     },
  //     {
  //         "subcategory": "Major Essential Minerals",
  //         "description": "Client's biomarkers indicate excellent micronutrient levels, particularly in calcium, chloride, copper, and folic acid, but show areas requiring attention including ferritin, manganese, and total body iron storage.",
  //         "position": "abdomen",
  //         "num_of_biomarkers": 9,
  //         "out_of_ref": 3,
  //         "status": [
  //             56,
  //             11,
  //             0,
  //             33
  //         ]
  //     },
  //     {
  //         "subcategory": "Vitamins",
  //         "description": "At 42 years old, the client shows excellent levels of Vitamin B1, B6, and D, which support metabolic health and bone density. However, she needs to focus on Biotin and Vitamin K1, as deficiencies can impact energy metabolism and proper blood clotting. Other vitamins like Beta Carotene and Vitamin E show no status, indicating potential areas for improvement, given their roles in antioxidant function. No current medical conditions or medications were noted, suggesting a baseline of good health; dietary adjustments may be recommended to enhance micronutrient intake.",
  //         "position": "abdomen",
  //         "num_of_biomarkers": 6,
  //         "out_of_ref": 2,
  //         "status": [
  //             50,
  //             17,
  //             0,
  //             33
  //         ]
  //     },
  //     {
  //         "subcategory": "Kidney Function",
  //         "description": "The client, a 42-year-old female, shows excellent renal health with most biomarkers and notable areas needing focus include Creatinine, S.G.O.T, and TG/HDL ratio which may indicate potential stress on kidney function or metabolic syndrome.",
  //         "position": "kidney",
  //         "num_of_biomarkers": 17,
  //         "out_of_ref": 6,
  //         "status": [
  //             53,
  //             12,
  //             0,
  //             35
  //         ]
  //     },
  //     {
  //         "subcategory": "Inflammatory Health",
  //         "description": "The client's CRP level is acceptable for her age and gender, indicating a stable inflammatory response, while the excellent RF status suggests no acute autoimmune concern, aligning with the absence of current medical conditions.",
  //         "position": "chest",
  //         "num_of_biomarkers": 2,
  //         "out_of_ref": 0,
  //         "status": [
  //             50,
  //             0,
  //             50,
  //             0
  //         ]
  //     },
  //     {
  //         "subcategory": "Sleep Health",
  //         "description": "The female client, aged 42, presents a Snoring Index that indicates a need for focus on sleep health, suggesting potential underlying sleep disorders that could affect overall health.",
  //         "position": "head",
  //         "num_of_biomarkers": 1,
  //         "out_of_ref": 1,
  //         "status": [
  //             0,
  //             0,
  //             0,
  //             100
  //         ]
  //     },
  //     {
  //         "subcategory": "Tumor Health",
  //         "description": "The biomarkers indicate an excellent status for CEA, suggesting no current issues with tumor markers for a 42-year-old female; however, the PSAs show no status, which should be monitored.",
  //         "position": "chest",
  //         "num_of_biomarkers": 1,
  //         "out_of_ref": 0,
  //         "status": [
  //             100,
  //             0,
  //             0,
  //             0
  //         ]
  //     },
  //         {
  //         "subcategory": "Tumor Health",
  //         "description": "The biomarkers indicate an excellent status for CEA, suggesting no current issues with tumor markers for a 42-year-old female; however, the PSAs show no status, which should be monitored.",
  //         "position": "chest",
  //         "num_of_biomarkers": 1,
  //         "out_of_ref": 0,
  //         "status": [
  //             100,
  //             0,
  //             0,
  //             0
  //         ]
  //     },
  //         {
  //         "subcategory": "Tumor Health",
  //         "description": "The biomarkers indicate an excellent status for CEA, suggesting no current issues with tumor markers for a 42-year-old female; however, the PSAs show no status, which should be monitored.",
  //         "position": "chest",
  //         "num_of_biomarkers": 1,
  //         "out_of_ref": 0,
  //         "status": [
  //             100,
  //             0,
  //             0,
  //             0
  //         ]
  //     },
  //         {
  //         "subcategory": "Tumor Health",
  //         "description": "The biomarkers indicate an excellent status for CEA, suggesting no current issues with tumor markers for a 42-year-old female; however, the PSAs show no status, which should be monitored.",
  //         "position": "chest",
  //         "num_of_biomarkers": 1,
  //         "out_of_ref": 0,
  //         "status": [
  //             100,
  //             0,
  //             0,
  //             0
  //         ]
  //     },
  //         {
  //         "subcategory": "Tumor Health",
  //         "description": "The biomarkers indicate an excellent status for CEA, suggesting no current issues with tumor markers for a 42-year-old female; however, the PSAs show no status, which should be monitored.",
  //         "position": "chest",
  //         "num_of_biomarkers": 1,
  //         "out_of_ref": 0,
  //         "status": [
  //             100,
  //             0,
  //             0,
  //             0
  //         ]
  //     },
  //         {
  //         "subcategory": "Tumor Health",
  //         "description": "The biomarkers indicate an excellent status for CEA, suggesting no current issues with tumor markers for a 42-year-old female; however, the PSAs show no status, which should be monitored.",
  //         "position": "chest",
  //         "num_of_biomarkers": 1,
  //         "out_of_ref": 0,
  //         "status": [
  //             100,
  //             0,
  //             0,
  //             0
  //         ]
  //     }
  // ]
  //   }
  const PrintHeader = () => {
    return (
      <div className="print-header z-50 ">
        <img
          className="print-headerImage "
          style={{ position: 'fixed', right: '0', top: '0', zIndex: 10 }}
          src="/icons/wwe.svg"
          alt=""
        />
        <div className="flex justify-between items-center px-6 relative z-50 py-2">
          <div>
            <div style={{ color: '#383838', fontSize: '12px' }}>
              {usrInfoData?.name}
            </div>
            <div style={{ color: '#888888', fontSize: '12px' }}>
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
          <div
            style={{ color: '#005F73', fontSize: '14px', fontWeight: '500' }}
          >
            Comprehensive Health Plan
          </div>
        </div>
        <div
          className="w-full relative z-50"
          style={{ height: '2px', backgroundColor: '#005F73', opacity: 0.3 }}
        ></div>
      </div>
    );
  };
  const PrintFooter = ({ pageNumber }: { pageNumber: number }) => {
    return (
      <div className="print-footer hidden absolute bottom-9 w-full  z-50">
        <div
          className="w-full"
          style={{ height: '1px', backgroundColor: '#005F73', opacity: 0.3 }}
        ></div>
        <div className="flex justify-between items-center px-4 py-2">
          <div className="text-xs invisible" style={{ color: '#383838' }}>
            © HolistiCare
          </div>
          <div className="text-xs" style={{ color: '#383838' }}>
            <span className="pageNumber">{pageNumber}</span>
          </div>
        </div>
      </div>
    );
  };
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
      name: 'Concerning Result',
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

  // Helper function to render biomarker groups
  const renderBiomarkerGroups = (el: any, index: number) => {
    const biomarkers = resolveSubCategories().filter(
      (val) => val.subcategory == el.subcategory,
    )[0]?.biomarkers;

    const totalBiomarkers = biomarkers?.length;
    const groups = [];

    // First group (0-3)
    groups.push(
      <div
        className="relative "
        style={{ minHeight: index == 0 ? '900px' : 'auto' }}
      >
        <DetiledAnalyse
          refrences={biomarkers?.slice(0, 3)}
          data={el}
        ></DetiledAnalyse>
        <PrintFooter pageNumber={resolvePageNumber()} />
      </div>,
    );

    // Additional groups (3-7, 7-11, 11-15)
    for (let i = 3; i < totalBiomarkers; i += 4) {
      if (i < totalBiomarkers) {
        groups.push(
          <div
            className="pt-6 relative "
            style={{ minHeight: '1030px' }}
            key={`group-${i}`}
          >
            <DetiledAnalyse
              isMore={true}
              refrences={biomarkers.slice(i, i + 4)}
              data={el}
            ></DetiledAnalyse>
            <PrintFooter pageNumber={resolvePageNumber()} />
          </div>,
        );
      }
    }

    return groups;
  };
  // const colorsText = ['#06C78D', '#FC5474', '#06C78D', '#F4A261'];

  return (
    <div style={{ backgroundColor: '#E9F0F2' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            
            .print-header{
              display: none;
            }
            
            /* Hide header/footer on first page */
            body > div > div:first-of-type .print-header,
            body > div > div:nth-of-type(2) .print-header {
              display: none !important;
            }
            
            /* Show header/footer on all other pages */
            body > div > div:not(:first-of-type):not(:nth-of-type(2)) .print-header {
              display: block !important;
              position: fixed;
              width: 100%;
            }
            
            .print-header {
              top: 0;
              left:0;
            }
            .print-headerImage {
              top: 0;
              right:0;
              display: block !important;
              position: absolute;
              width: 100%;              
            }            
            .print-footer {
              bottom: 0;
              left:0;
              position:'absolute !important'
            }
            
            /* Add padding to content to accommodate header/footer */
            body > div > div:not(:first-of-type):not(:nth-of-type(2)) {
              padding-top: 60px !important;
              padding-bottom: 40px !important;
            }
            
            /* Ensure links are clickable in PDF */
            a {
              color: #005F73 !important;
              text-decoration: none !important;
              cursor: pointer !important;
            }
            
            /* Ensure section IDs are properly targeted */
            [id] {
              scroll-margin-top: 20px;
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
              className="text-white uppercase text-center"
              style={{
                fontSize: '40px',
                color: '#383838',
                letterSpacing: '8px',
                fontWeight: 600,
                fontStyle: 'italic',
              }}
            >
              Comprehensive
            </div>
            <div
              className="text-white uppercase  text-center"
              style={{
                fontSize: '40px',
                color: '#383838',
                letterSpacing: '8px',
                fontWeight: 600,
                fontStyle: 'italic',
              }}
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
        id="table-of-contents"
        className=" w-full relative min-h-full"
        style={{
          pageBreakAfter: 'always',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 1000000,
          backgroundColor: '#005F73',
        }}
      >
        <div
          className="ml-14 mt-32 text-white font-medium"
          style={{ fontSize: '40px' }}
        >
          Table of Content
        </div>
        <div
          className="mt-16 pt-16"
          style={{
            backgroundColor: '#005F73',
            height: '100vh',
            width: '90%',
            marginRight: '146px',
            backgroundImage: "url('/images/bg-report-page-two.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top right',
            backgroundSize: '100%',
          }}
        >
          <div
            className="px-12 py-20"
            style={{
              backgroundColor: '#F7F7F7',
              height: '100vh',
              width: '92%',
              marginRight: '146px',
              backgroundImage: "url('/images/bg-report-page-two.png')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top right',
              backgroundSize: '100%',
            }}
          >
            {printOptins.filter((el) => el.name === 'Client Summary')[0]
              .checked && (
              <>
                <div className="flex justify-start gap-4 items-center">
                  <img
                    src="/icons/icon-list-report.svg"
                    alt=""
                    style={{ marginRight: '-8px' }}
                  />
                  <div
                    className="text-xl"
                    style={{ color: '#005F73', fontWeight: '500' }}
                  >
                    Section {getNextSectionNumber()}
                  </div>
                  <a
                    href="#client-summary"
                    className="text-xl cursor-pointer hover:underline"
                    style={{ color: '#383838', fontWeight: '500' }}
                  >
                    Client Summary
                  </a>
                </div>
              </>
            )}
            {printOptins.filter((el) => el.name === 'Needs Focus Biomarker')[0]
              .checked && (
              <>
                <div className="flex justify-start gap-4 mt-6 items-center">
                  <img
                    src="/icons/icon-list-report.svg"
                    alt=""
                    style={{ marginRight: '-8px' }}
                  />
                  <div
                    className="text-xl"
                    style={{ color: '#005F73', fontWeight: '500' }}
                  >
                    Section {getNextSectionNumber()}
                  </div>
                  <a
                    href="#needs-focus-biomarkers"
                    className="text-xl cursor-pointer hover:underline"
                    style={{ color: '#383838', fontWeight: '500' }}
                  >
                    Needs Focus Biomarkers
                  </a>
                </div>
              </>
            )}
            {printOptins.filter((el) => el.name === 'Concerning Result')[0]
              .checked && (
              <>
                <div className="flex justify-start gap-4 mt-6 items-center">
                  <img
                    src="/icons/icon-list-report.svg"
                    alt=""
                    style={{ marginRight: '-8px' }}
                  />
                  <div
                    className="text-xl"
                    style={{ color: '#005F73', fontWeight: '500' }}
                  >
                    Section {getNextSectionNumber()}
                  </div>
                  <a
                    href="#concerning-result"
                    className="text-xl cursor-pointer hover:underline"
                    style={{ color: '#383838', fontWeight: '500' }}
                  >
                    Concerning Result
                  </a>
                </div>
              </>
            )}
            {printOptins.filter((el) => el.name === 'Detailed Analysis')[0]
              .checked && (
              <>
                <div className="flex justify-start gap-4 mt-6 items-center">
                  <img
                    src="/icons/icon-list-report.svg"
                    alt=""
                    style={{ marginRight: '-8px' }}
                  />
                  <div
                    className="text-xl"
                    style={{ color: '#005F73', fontWeight: '500' }}
                  >
                    Section {getNextSectionNumber()}
                  </div>
                  <a
                    href="#detailed-analysis"
                    className="text-xl cursor-pointer hover:underline"
                    style={{ color: '#383838', fontWeight: '500' }}
                  >
                    Detailed Analysis
                  </a>
                </div>
              </>
            )}
            {printOptins.filter((el) => el.name === 'Holistic Plan')[0]
              .checked && (
              <div className="flex justify-start gap-4 mt-6 items-center">
                <img
                  src="/icons/icon-list-report.svg"
                  alt=""
                  style={{ marginRight: '-8px' }}
                />
                <div
                  className="text-xl"
                  style={{ color: '#005F73', fontWeight: '500' }}
                >
                  Section {getNextSectionNumber()}
                </div>
                <a
                  href="#holistic-plan"
                  className="text-xl cursor-pointer hover:underline"
                  style={{ color: '#383838', fontWeight: '500' }}
                >
                  Holistic Plan
                </a>
              </div>
            )}
            {printOptins.filter((el) => el.name === 'Action Plan')[0]
              .checked && (
              <div className="flex justify-start gap-4 mt-6 items-center">
                <img
                  src="/icons/icon-list-report.svg"
                  alt=""
                  style={{ marginRight: '-8px' }}
                />
                <div
                  className="text-xl"
                  style={{ color: '#005F73', fontWeight: '500' }}
                >
                  Section {getNextSectionNumber()}
                </div>
                <a
                  href="#action-plan"
                  className="text-xl cursor-pointer hover:underline"
                  style={{ color: '#383838', fontWeight: '500' }}
                >
                  Action Plan
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rest of pages - Include header and footer */}
      {printOptins.filter((el) => el.name == 'Client Summary')[0].checked && (
        <>
          <div
            id="client-summary"
            className=""
            style={{
              backgroundColor: '#E9F0F2',
              minHeight: '100vh',
              position: 'relative',
              padding: '24px 24px',
            }}
          >
            <PrintHeader />

            <div
              className="flex relative  justify-between items-center"
              style={{ marginTop: '16px', zIndex: 60 }}
            >
              <div
                className="text-lg"
                style={{ color: '#383838', fontWeight: '600' }}
              >
                Client Summary
              </div>
              <div className="" style={{ color: '#888888', fontSize: '14px' }}>
                Total of {ClientSummaryBoxs.total_subcategory} Biomarkers in{' '}
                {ClientSummaryBoxs.total_category} Categories
              </div>
            </div>
            <a
              href="#table-of-contents"
              className="text-sm mt-2 inline-block cursor-pointer hover:underline"
              style={{ color: '#005F73', zIndex: 60 }}
            >
              ← Back to Table of Contents
            </a>
            <div
              className="flex justify-start relative   items-center mt-4 gap-3"
              style={{ zIndex: 60 }}
            >
              <div
                style={{ fontSize: '14px', color: '#383838', fontWeight: 500 }}
              >
                {usrInfoData?.name}
              </div>
              <div className="flex justify-center items-center gap-1">
                <div
                  className=""
                  style={{ fontSize: '14px', color: '#888888' }}
                >
                  <div>Gender: {usrInfoData?.sex} </div>
                </div>
                <div
                  className=""
                  style={{
                    width: '1px',
                    height: '12px',
                    backgroundColor: '#B0B0B0',
                  }}
                ></div>
                <div
                  className=""
                  style={{ fontSize: '14px', color: '#888888' }}
                >
                  <div>Age: {usrInfoData?.age}</div>
                </div>
              </div>
            </div>
            <div
              style={{ color: '#383838', fontSize: '14px', zIndex: 60 }}
              className="text-justify relative  mt-4"
            >
              {ClientSummaryBoxs?.client_summary}
            </div>
            <div
              className="w-full relative flex justify-end items-center gap-4 mt-4"
              style={{ zIndex: 60 }}
            >
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
                <div style={{ color: '#888888', fontSize: '10px' }}>
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
                <div style={{ color: '#888888', fontSize: '10px' }}>Good </div>
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
                <div style={{ color: '#888888', fontSize: '10px' }}>Ok </div>
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
                <div style={{ color: '#888888', fontSize: '10px' }}>
                  Needs focus{' '}
                </div>
              </div>
            </div>
            <div
              className="grid grid-cols-2  relative  gap-4 mt-4"
              style={{ zIndex: 60 }}
            >
              {resolveCategories()
                .slice(0, 16)
                .map((el: any) => {
                  return <SummaryBoxPrint data={el}></SummaryBoxPrint>;
                })}
            </div>
            <PrintFooter pageNumber={resolvePageNumber()} />
          </div>
          {resolveCategories().length > 16 && (
            <>
              <div
                id="client-summary"
                className=""
                style={{
                  backgroundColor: '#E9F0F2',
                  minHeight: '100vh',
                  position: 'relative',
                  padding: '24px 24px',
                }}
              >
                <div
                  className="grid grid-cols-2  relative  gap-4 mt-4"
                  style={{ zIndex: 60 }}
                >
                  {resolveCategories()
                    .slice(16, 32)
                    .map((el: any) => {
                      return <SummaryBoxPrint data={el}></SummaryBoxPrint>;
                    })}
                </div>
                <PrintFooter pageNumber={resolvePageNumber()} />
              </div>
            </>
          )}
        </>
      )}

      {printOptins.filter((el) => el.name == 'Needs Focus Biomarker')[0]
        .checked && (
        <div
          id="needs-focus-biomarkers"
          className=" "
          style={{
            backgroundColor: '#E9F0F2',
            minHeight: '100vh',
            padding: '24px 24px',
            position: 'relative',
            pageBreakAfter: 'always',
          }}
        >
          <PrintHeader />
          <div
            className="flex relative justify-between items-center mt-4"
            style={{ zIndex: 60 }}
          >
            <div
              id="Out of Reference"
              className="text-lg"
              style={{ color: '#383838', fontWeight: '600' }}
            >
              Needs Focus Biomarkers
            </div>
            <div
              className="  text-xs"
              style={{ color: '#888888', fontSize: '14px' }}
            >
              {referenceData.total_biomarker_note}
            </div>
          </div>
          <a
            href="#table-of-contents"
            className="text-sm mt-2 inline-block cursor-pointer hover:underline"
            style={{ color: '#005F73', zIndex: 60 }}
          >
            ← Back to Table of Contents
          </a>
          <div
            className="w-full mt-4 relative grid gap-8 grid-cols-1"
            style={{ zIndex: 60 }}
          >
            {resolveBioMarkers()
              .filter((val) => val.outofref == true)
              .slice(0, 6)
              .map((el) => {
                return <BiomarkersPrint data={el}></BiomarkersPrint>;
              })}
          </div>

          <PrintFooter pageNumber={resolvePageNumber()} />
        </div>
      )}

      {printOptins.filter((el) => el.name == 'Needs Focus Biomarker')[0]
        .checked &&
        resolveBioMarkers().filter((val) => val.outofref == true).length >
          6 && (
          <>
            {Array.from({
              length: Math.ceil(
                (resolveBioMarkers().filter((val) => val.outofref == true)
                  .length -
                  6) /
                  6,
              ),
            }).map((_, index) => (
              <div
                key={`biomarker-page-${index}`}
                className=""
                style={{
                  backgroundColor: '#E9F0F2',
                  minHeight: '100vh',
                  padding: '24px 24px',
                  position: 'relative',
                  pageBreakAfter: 'always',
                }}
              >
                <div
                  className="w-full relative mt-4 grid gap-8 grid-cols-1"
                  style={{ zIndex: 60 }}
                >
                  {resolveBioMarkers()
                    .filter((val) => val.outofref == true)
                    .slice(6 + index * 6, 6 + (index + 1) * 6)
                    .map((el) => {
                      return (
                        <BiomarkersPrint
                          key={el.id || Math.random()}
                          data={el}
                        ></BiomarkersPrint>
                      );
                    })}
                </div>
                <PrintFooter pageNumber={resolvePageNumber()} />
              </div>
            ))}
          </>
        )}
      {printOptins.filter((el) => el.name == 'Concerning Result')[0]
        .checked && (
        <>
          <div
            className=" "
            style={{
              backgroundColor: '#E9F0F2',
              minHeight: '100vh',
              padding: '24px 24px',
              position: 'relative',
              pageBreakAfter: 'always',
            }}
          >
            <PrintHeader />
            <div
              className="w-full relative mb-3 mt-4 flex items-center justify-between"
              style={{ zIndex: 60 }}
            >
              <div
                className="text-lg"
                id="concerning-result"
                style={{ color: '#005F73', fontWeight: '600' }}
              >
                Concerning Result
              </div>
            </div>
            <div className="pr-2 relative" style={{ zIndex: 60 }}>
              <div className="w-full  bg-white rounded-md py-4 px-3 flex justify-between items-center">
                <div
                  className="text-gray-700 font-medium "
                  style={{ width: 200, fontSize: 12, color: '#383838' }}
                >
                  Name
                </div>
                <div
                  className="text-gray-700 text-center font-medium "
                  style={{ fontSize: 12, width: '80px', color: '#383838' }}
                >
                  Result
                </div>
                <div
                  className="text-gray-700 text-center font-medium "
                  style={{ fontSize: 12, width: '80px', color: '#383838' }}
                >
                  Units
                </div>
                <div
                  className="text-gray-700 text-center font-medium "
                  style={{ fontSize: 12, width: '100px', color: '#383838' }}
                >
                  Lab Ref Range
                </div>
                {/* <div
                  className="text-gray-700 text-center font-medium "
                  style={{ fontSize: 12, width: '60px', color: '#383838' }}
                >
                  Baseline
                </div> */}
                <div
                  className="text-gray-700 text-center font-medium "
                  style={{ fontSize: 12, width: '100px', color: '#383838' }}
                >
                  Optimal Range
                </div>
                {/* <div
                  className="text-gray-700 text-center font-medium "
                  style={{ fontSize: 12, width: '60px', color: '#383838' }}
                >
                  Changes
                </div> */}
              </div>
              {transformConceringData()
                .slice(0, 10)
                .map((el) => {
                  return (
                    <>
                      <div className="w-full  bg-white  py-3 px-3 flex justify-between items-center">
                        <div
                          className=" text-gray-800"
                          style={{
                            fontSize: '12px',
                            color: '#383838',
                            width: 200,
                          }}
                        >
                          <div>{el.subcategory}</div>
                          <div>{el.name}</div>
                        </div>
                        <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '12px',
                            width: '80px',
                            // color: colorsText[index % 4],
                          }}
                        >
                          {el.Result != '' ? el.Result : '-'}
                        </div>
                        <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '12px',
                            width: '80px',
                            color: '#888888',
                          }}
                        >
                          {el.Units != '' ? el.Units : '-'}
                        </div>
                        <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '12px',
                            width: '100px',
                            color: '#888888',
                          }}
                        >
                          {el['Lab Ref Range'] != ''
                            ? el['Lab Ref Range']
                            : '-'}
                        </div>
                        {/* <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '12px',
                            width: '60px',
                            color: '#888888',
                          }}
                        >
                          {el.Baseline}
                        </div> */}
                        <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '12px',
                            width: '100px',
                            color: '#888888',
                          }}
                        >
                          {el['Optimal Range'] != ''
                            ? el['Optimal Range']
                            : '-'}
                        </div>
                        {/* <div
                          className=" text-gray-800 text-center"
                          style={{
                            fontSize: '12px',
                            width: '60px',
                            // color: colorsText[index % 4],
                          }}
                        >
                          {el.Changes}
                        </div> */}
                      </div>
                    </>
                  );
                })}
            </div>
            <PrintFooter pageNumber={resolvePageNumber()} />
          </div>
          {transformConceringData().length > 10 && (
            <>
              {Array.from({
                length: Math.ceil((transformConceringData().length - 10) / 12),
              }).map((_e, index1) => {
                return (
                  <>
                    <div
                      className=" "
                      style={{
                        backgroundColor: '#E9F0F2',
                        minHeight: '100vh',
                        padding: '24px 24px',
                        position: 'relative',
                        pageBreakAfter: 'always',
                      }}
                    >
                      <div className="px-2 relative" style={{ zIndex: 60 }}>
                        {transformConceringData()
                          .slice(index1 * 12 + 10, index1 * 12 + 10 + 12)
                          .map((el) => {
                            return (
                              <>
                                <div className="w-full  bg-white  py-3 px-3 flex justify-between items-center">
                                  <div
                                    className=" text-gray-800"
                                    style={{
                                      fontSize: '12px',
                                      color: '#383838',
                                      width: 200,
                                    }}
                                  >
                                    <div>{el.subcategory}</div>
                                    <div>{el.name}</div>
                                  </div>
                                  <div
                                    className=" text-gray-800 text-center"
                                    style={{
                                      fontSize: '12px',
                                      width: '80px',
                                      // color: colorsText[index % 4],
                                    }}
                                  >
                                    {el.Result != '' ? el.Result : '-'}
                                  </div>
                                  <div
                                    className=" text-gray-800 text-center"
                                    style={{
                                      fontSize: '12px',
                                      width: '80px',
                                      color: '#888888',
                                    }}
                                  >
                                    {el.Units != '' ? el.Units : '-'}
                                  </div>
                                  <div
                                    className=" text-gray-800 text-center"
                                    style={{
                                      fontSize: '12px',
                                      width: '100px',
                                      color: '#888888',
                                    }}
                                  >
                                    {el['Lab Ref Range'] != ''
                                      ? el['Lab Ref Range']
                                      : '-'}
                                  </div>
                                  {/* <div
                                    className=" text-gray-800 text-center"
                                    style={{
                                      fontSize: '12px',
                                      width: '60px',
                                      color: '#888888',
                                    }}
                                  >
                                    {el.Baseline}
                                  </div> */}
                                  <div
                                    className=" text-gray-800 text-center"
                                    style={{
                                      fontSize: '12px',
                                      width: '100px',
                                      color: '#888888',
                                    }}
                                  >
                                    {el['Optimal Range']
                                      ? el['Optimal Range']
                                      : '-'}
                                  </div>
                                  {/* <div
                                    className=" text-gray-800 text-center"
                                    style={{
                                      fontSize: '12px',
                                      width: '60px',
                                      // color: colorsText[index % 4],
                                    }}
                                  >
                                    {el.Changes}
                                  </div> */}
                                </div>
                              </>
                            );
                          })}
                      </div>
                      <PrintFooter pageNumber={resolvePageNumber()} />
                    </div>
                  </>
                );
              })}
            </>
          )}
        </>
      )}

      {printOptins.filter((el) => el.name == 'Detailed Analysis')[0]
        .checked && (
        <div
          id="detailed-analysis"
          className=""
          style={{
            pageBreakAfter: 'always',
            backgroundColor: '#E9F0F2',
            minHeight: '100vh',
            position: 'relative',
            padding: '24px 24px',
          }}
        >
          <PrintHeader />
          <div
            className="flex relative  justify-between items-center"
            style={{ marginTop: '16px', zIndex: 60 }}
          >
            <div
              className="text-lg"
              id="Detailed analysis"
              style={{ color: '#383838', fontWeight: '600' }}
            >
              Detailed Analysis
            </div>
            <div className="" style={{ color: '#888888', fontSize: '14px' }}>
              {referenceData.detailed_analysis_note}
            </div>
          </div>
          <a
            href="#table-of-contents"
            className="text-sm mt-2 inline-block cursor-pointer hover:underline"
            style={{ color: '#005F73', zIndex: 60 }}
          >
            ← Back to Table of Contents
          </a>
          <div className="relative" style={{ zIndex: 60 }}>
            {resolveCategories()?.map((el: any, index: number) => {
              return (
                <div className="py-6">{renderBiomarkerGroups(el, index)}</div>
              );
            })}
          </div>
          {/* <PrintFooter /> */}
          {/* <PrintFooter pageNumber={resolvePageNumber()} /> */}
        </div>
      )}

      {printOptins.filter((el) => el.name == 'Holistic Plan')[0].checked && (
        <div
          id="holistic-plan"
          className=" "
          style={{
            backgroundColor: '#E9F0F2',
            minHeight: '100vh',
            padding: '24px 24px',
            position: 'relative',
          }}
        >
          <PrintHeader />
          <div
            className="flex relative justify-between items-center"
            style={{ marginTop: '16px', zIndex: '60' }}
          >
            <div
              className="text-xl"
              style={{ color: '#383838', fontWeight: '600' }}
            >
              Holistic Plan
            </div>
          </div>
          <a
            href="#table-of-contents"
            className="text-sm mt-2 inline-block cursor-pointer hover:underline"
            style={{ color: '#005F73', zIndex: 60 }}
          >
            ← Back to Table of Contents
          </a>
          {helthPlan && (
            <div
              className="w-full relative mb-4 mt-4"
              style={{
                borderRadius: '12px',
                zIndex: 60,
                background:
                  'linear-gradient(88.52deg, #005F73 3%, #6CC24A 140.48%)',
                padding: '1px',
              }}
            >
              <div
                style={{
                  borderRadius: '11px',
                  background: '#FFFFFF',
                  width: '100%',
                }}
                className="py-2 px-4 flex justify-between items-center"
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
                      {helthPlan[helthPlan.length - 1]?.formatted_date}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="gap-3 relative" style={{ zIndex: 60 }}>
            {TreatMentPlanData.map((el, index) => {
              return (
                <>
                  {el.data.length > 0 ? (
                    <>
                      <div
                        className=" relative  mt-14"
                        style={{
                          pageBreakAfter: 'always',
                          // minHeight: index == 0 ? '870px' : '1020px',
                        }}
                      >
                        {index != 0 && <div className="h-8"></div>}
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

                        <div
                          className="w-full grid gap-6  bg-white p-4 rounded-lg mb-2 rounded-tl-none"
                          style={{ pageBreakAfter: 'always' }}
                        >
                          {el.data.slice(0, 2).map((el2: any) => {
                            return (
                              <TreatmentPlanPrint
                                data={el2}
                              ></TreatmentPlanPrint>
                            );
                          })}
                        </div>
                        {el.data.length > 2 && (
                          <>
                            {Array.from({
                              length: Math.ceil((el.data.length - 2) / 3),
                            }).map((_, index) => (
                              <div
                                key={`treatment-plan-page-${index}`}
                                className="no-split relative mt-14"
                                style={{
                                  pageBreakAfter: 'always',
                                  minHeight: '1020px',
                                }}
                              >
                                <div
                                  className="w-full grid gap-6 bg-white p-4 rounded-lg mb-2 rounded-tl-none"
                                  style={{ pageBreakAfter: 'always' }}
                                >
                                  {el.data
                                    .slice(2 + index * 3, 2 + (index + 1) * 3)
                                    .map((el2: any) => (
                                      <TreatmentPlanPrint
                                        key={el2.id || Math.random()}
                                        data={el2}
                                      ></TreatmentPlanPrint>
                                    ))}
                                </div>
                                <PrintFooter pageNumber={resolvePageNumber()} />
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              );
            })}
          </div>

          {/* <PrintFooter /> */}
        </div>
      )}

      {printOptins.filter((el) => el.name == 'Action Plan')[0].checked && (
        <>
          <div
            id="action-plan"
            className="relative min-h-screen"
            style={{ pageBreakAfter: 'always', padding: '24px' }}
          >
            {/* <PrintHeader /> */}
            <div
              className="flex justify-between relative items-center"
              style={{ marginTop: '16px', zIndex: '60' }}
            >
              <div
                className="text-xl"
                style={{ color: '#383838', fontWeight: '600' }}
              >
                Action Plan
              </div>
            </div>
            <a
              href="#table-of-contents"
              className="text-sm mt-2 inline-block cursor-pointer hover:underline"
              style={{ color: '#005F73', zIndex: 60 }}
            >
              ← Back to Table of Contents
            </a>
            {ActionPlan && (
              <>
                <div
                  className="w-full relative mb-4 mt-4"
                  style={{
                    borderRadius: '12px',
                    zIndex: 60,
                    background:
                      'linear-gradient(88.52deg, #005F73 3%, #6CC24A 140.48%)',
                    padding: '1px',
                  }}
                >
                  <div
                    style={{
                      borderRadius: '11px',
                      background: '#FFFFFF',
                      width: '100%',
                    }}
                    className="py-2 px-4"
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
                              ? ActionPlan[ActionPlan?.length - 1]?.progress +
                                '%'
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
                                width: ActionPlan[ActionPlan.length - 1]
                                  ?.progress
                                  ? ActionPlan[ActionPlan.length - 1]
                                      ?.progress + '%'
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
                </div>
                <ActionPlanOverview
                  classData={caldenderData ? caldenderData?.slice(0, 4) : []}
                ></ActionPlanOverview>
              </>
            )}
            {/* {caldenderData != null && caldenderData.length > 0 && (
              <CalenderPrint data={caldenderData}></CalenderPrint>
            )} */}
            <PrintFooter pageNumber={resolvePageNumber()} />
          </div>
          {caldenderData?.length > 4 && (
            <div
              className="relative min-h-screen"
              style={{ pageBreakAfter: 'always', padding: '24px' }}
            >
              {/* <PrintHeader /> */}

              <ActionPlanOverview
                classData={caldenderData?.slice(4, 8)}
              ></ActionPlanOverview>
              {/* {caldenderData != null && caldenderData.length > 0 && (
                <CalenderPrint data={caldenderData}></CalenderPrint>
              )} */}
              <PrintFooter pageNumber={resolvePageNumber()} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrintReport;
