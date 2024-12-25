
import SummaryBox from "./SummaryBox"
// import MyChartComponent from "./StatusChart"
import RefrenceBox from "./Boxs/RefrenceBox"
import DetiledAnalyse from "./Boxs/DetiledAnalyse"
import ConceringRow from "./Boxs/ConceringRow"
// import TreatmentCard from "./Boxs/TreatmentPlanCard"
import Legends from "./Legends"
// import Point from "./Point"
import { useEffect, useState } from "react"
import mydata from '../../api/--moch--/data/new/client_summary_categories.json';
import treatmentPlanData from '../../api/--moch--/data/new/treatment_plan_report.json';
import conceringResultData from '../../api/--moch--/data/new/concerning_results.json';
import referencedata from '../../api/--moch--/data/new/client_summary_outofrefs.json';
import calenderDataMoch from '../../api/--moch--/data/new/Calender.json';

import Point from "./Point"
import resolvePosition from "./resolvePosition"
import resolveStatusArray from "./resolveStatusArray"
import  Application  from "../../api/app"
import { useParams } from "react-router-dom";
import { BeatLoader } from "react-spinners"
// import CalenderComponent from "../information/calender/ComponentCalender"
import PrintReport from "./PrintReport"
import { ActionPlan } from "../Action-plan"
import { TreatmentPlan } from "../TreatmentPlan"
import UploadTest from "./UploadTest"
import { useLocation } from 'react-router-dom';
// import { toast } from "react-toastify"
// import { useConstructor } from "@/help"
import { publish } from "../../utils/event"
interface ReportAnalyseViewprops {
    clientData?:any,
    memberID? : number | null
}

const ReportAnalyseView:React.FC<ReportAnalyseViewprops> = ({
    memberID
}) => {
    const { id } = useParams<{ id: string }>();
    const resolvedMemberID = id ? parseInt(id) : memberID;
    const [loading, setLoading] = useState(true);
    const [caldenderData,setCalenderData] = useState<any>(null)
    const [isHaveReport,setIsHaveReport] = useState(true)
    const [isGenerated,setISGenerated] = useState(false)
    useEffect(() => {
        setLoading(true); 
        if(memberID != 123){
            Application.getClientSummaryOutofrefs({ member_id: resolvedMemberID }).then((res) => {
                setReferenceData(res.data);        
            })
            Application.getClientSummaryCategories({ member_id: resolvedMemberID }).then(res => {
                setClientSummaryBoxs(res.data);    
                if(res.data.categories.length == 0){
                    setIsHaveReport(false)
                    setISGenerated(false)
                } else {
                    setIsHaveReport(true)
                }
        
            })
            Application.getConceringResults({ member_id: resolvedMemberID }).then(res => {
                setConcerningResult(res.data);     
                
            })    
            Application.getOverviewtplan({member_id: resolvedMemberID}).then(res => {
                setTreatmentPlanData(res.data);     
                    
            })
            Application.getCaldenderdata({member_id: resolvedMemberID}).then(res => {
                setCalenderData(res.data)
            })

        }
    }, [resolvedMemberID,isGenerated]);

    useEffect(() => {
        if(memberID == 123 || (!isHaveReport && !isGenerated)){
            setReferenceData(referencedata)
            setClientSummaryBoxs(mydata)
            setConcerningResult(conceringResultData)
            setTreatmentPlanData(treatmentPlanData)
            setCalenderData(calenderDataMoch)
        }
    },[isHaveReport,isGenerated])
    // const [aciveTreatmentPlan ,setActiveTreatmentplan] = useState("Diet")
    const [ClientSummaryBoxs,setClientSummaryBoxs] = useState<any>(null)
    const [ConcerningResult, setConcerningResult] = useState<any[]>([]);
    const [referenceData, setReferenceData] = useState<any>(null)
    const [TreatMentPlanData, setTreatmentPlanData] = useState<any>([])
    useEffect(() => {
        if(ClientSummaryBoxs != null &&referenceData!= null ){
            setLoading(false)
        }
    },[ClientSummaryBoxs,referenceData,TreatMentPlanData,caldenderData,isHaveReport])    
    const resolveBioMarkers =() => {
        const refData:Array<any> =[]
        referenceData.categories?.forEach((el:any) => {
                el.subcategories.forEach((val:any) => {
                    refData.push(
                        ...val.biomarkers
                    )
                })
            })
        console.log(refData)
        return refData
    } 
    const resolveSubCategories =() => {
        const refData:Array<any> =[]
        referenceData?.categories.forEach((el:any) => {
                refData.push(
                    ...el.subcategories
                )
            })
        return refData
    }    
    const ResolveConceringData = () => {
        const refData: Array<any> = [];
        if (ConcerningResult.length > 0) {
          ConcerningResult.forEach((el: any) => {
            refData.push(...el.subcategories);
          });
        }
        return refData;
      };
    
      const resolveCategories = () => {
        const refData: Array<any> = [];
        if (ClientSummaryBoxs?.categories) {
          ClientSummaryBoxs?.categories.forEach((el: any) => {
            refData.push(...el.subcategories);
          });
        }
        return refData;
      };    
      const location = useLocation();
      useEffect(() => {
        const params = new URLSearchParams(location.search);
        const section = params.get('section');
      
        console.log('Scrolling to section:', section); // Debug log
      
        if (!loading && section) { // Ensure loading is complete
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          } else {
            console.warn(`Element with ID '${section}' not found.`);
          }
        }
      }, [location, loading]); // Add 'loading' to dependencies
      useEffect(() => {
        if (!isHaveReport) {
          publish('noReportAvailable', { message: 'No report available' });
        }
      }, [isHaveReport]);
    return (
        <>        
         {loading ? (
                <div className="h-[600px] w-full flex items-center justify-center">
                    <BeatLoader size={8} color="#36d7b7" loading={loading} />
                </div>
                ): (
                    <>

                        <div className={`pt-[20px] relative pb-[200px]  pr-28 h-[98vh] ml-6 ${isHaveReport?'overflow-y-scroll':'overflow-y-hidden '}  overflow-x-hidden `}>
                    
                            <div className="flex gap-14" >
                                <div className="min-w-[330px] w-[330px] relative">
                                    <div>
                                        <div id="Client Summary" className=" text-Text-Primary TextStyle-Headline-4  flex items-center ">
                                            Client Summary
                                            <div className="ml-4">
                                                <Legends></Legends>
                                            </div>
                                        </div>
                                        {ClientSummaryBoxs &&
                                            <div className="text-Text-Secondary text-[12px]">Total of {ClientSummaryBoxs.total_subcategory} groups in {ClientSummaryBoxs.total_category} category</div>
                                        }
                                    </div> 
                                    <div className="relative">
                                        <img className="" src="/human.png" alt="" />
                                        <div>
                                            {resolveCategories().map((el:any) => {
                                                return (
                                                    <>
                                                        <Point name={el.subcategory} status={resolveStatusArray(el.status)} onClick={() => {
                                                            // setSummaryBOxCategory(el.name)
                                                            document.getElementById(el.subcategory)?.scrollIntoView({
                                                                behavior:'smooth'
                                                            })
                                                        }} top={resolvePosition(el.position).top} left={resolvePosition(el.position).left}></Point>
                                                    </>
                                                )
                                            })}
                                        </div>
                                    </div>                           
                                </div>
            
                                <div className="flex-grow w-full ">
                                    <div className="w-full flex justify-between">

                                    
                                    </div>
                                    <div className="  text-justify text-Text-Primary TextStyle-Body-2  mt-4" style={{lineHeight:'24px'}}>{ClientSummaryBoxs?.client_summary}</div>
                                    <div className="w-full mt-4 grid gap-4 grid-cols-2">
                                        {resolveCategories().map((el:any) => {
                                            return (
                                                <SummaryBox isActive={false} data={el}></SummaryBox>
                                            )
                                        })}
                                    </div>
            
            
            
                                </div>
            
                            </div>
                            <div className="my-10  text-light-primary-text dark:text-primary-text ">
                                <div>
                                    <div id="Needs Focus Biomarkers" className=" text-Text-Primary TextStyle-Headline-4 ">Needs Focus Biomarkers</div>
                                    <div className=" text-Text-Secondary text-[12px]">{referenceData.total_biomarker_note}</div>
                                </div>   
                                <div className="w-full mt-4 grid gap-4 grid-cols-2">
                                    {resolveBioMarkers().filter(val=>val.outofref== true).map((el) => {
                                        return (
                                            <RefrenceBox data={el}></RefrenceBox>
                                        )
                                    })}
                                
                                </div>  
                                
                                        {/* <CustomCanvasChart></CustomCanvasChart> */}
                            </div>       
                            <div className="my-10 ">
                                <div>
                                    <div id="Detailed Analysis" className=" text-Text-Primary TextStyle-Headline-4">Detailed Analysis</div>
                                    <div className="TextStyle-Body-2 text-Text-Secondary mt-2">{referenceData.detailed_analysis_note}</div>
                                </div>  
            
                                <div className="mt-6">
                                    {resolveCategories().map((el:any) => {
                                        return (
                                            <DetiledAnalyse refrences={resolveSubCategories().filter(val =>val.subcategory == el.subcategory )[0]} data={el}></DetiledAnalyse>
                                        )
                                    })}
                                </div>
                            </div>     
                            <div className="my-10 ">
                                <div className="w-full mb-3 flex items-center justify-between">
                                    <div id="Concerning Result" className=" TextStyle-Headline-4 text-Text-Primary">Concerning Result</div>
                                    <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
                                        {/* Total of 30 Treatment in 4 category */}
                                    </div>
                                    {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
                                </div>    
                                <div >
                                    <div className="w-full bg-white rounded-t-[6px] border-b border-Gray-50 h-[56px] flex justify-end items-center">
                                        <div className="TextStyle-Headline-6 text-Text-Primary w-[800px] pl-6">Name</div>
                                        <div className="TextStyle-Headline-6 text-Text-Primary w-[120px] text-center">Result</div>
                                        <div className="TextStyle-Headline-6 text-Text-Primary   w-[120px] text-center">Units</div>
                                        <div className="TextStyle-Headline-6 text-Text-Primary  w-[180px] text-center">Lab Ref Range</div>
                                        <div className="TextStyle-Headline-6 text-Text-Primary  w-[130px] text-center">Baseline</div>
                                        <div className="TextStyle-Headline-6 text-Text-Primary w-[150px] text-center">Optimal Range</div>
                                        <div className="TextStyle-Headline-6 text-Text-Primary  w-[130px] text-center">Changes</div>
                                    </div>
                                    {ResolveConceringData().map((el:any) => {
                                        return (
                                            <>
                                                <ConceringRow data={el}></ConceringRow>
                                            </>
                                        )
                                    })}
                                </div>
                            </div>          
                            <div className="my-10 min-h-[650px]">
                                <div className="w-full flex items-center justify-between">
                                    <div id="Treatment Plan" className="TextStyle-Headline-4 text-Text-Primary">Treatment Plan </div>
                                    <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
                                        {/* Total of 30 Treatment in 4 category */}
                                    </div>
                                    {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
                                </div> 
                                <TreatmentPlan treatmentPlanData={TreatMentPlanData}></TreatmentPlan>     
                            
                            </div>    
                            
                            <div className="my-10 hidden">
                                <div className="w-full mb-3 flex items-center justify-between">
                                    <div id="Treatment Plan" className="text-light-primary-text dark:text-[#FFFFFFDE] text-[24px] font-medium">Action Plan</div>
                                    <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
                                        {/* Total of 30 Treatment in 4 category */}
                                    </div>
                                    {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
                                </div>
                                {caldenderData!=null &&
                                    <div>
                                        {/* <CalenderComponent data={caldenderData}></CalenderComponent>  */}
                                    </div>                       
                                }  
                            </div>
                            <div id="Action Plan" className="my-10  min-h-[650px]">
                                <div className="TextStyle-Headline-4 text-Text-Primary mb-4">Action Plan</div>
                                <ActionPlan></ActionPlan>
                            </div>
                             {
                                isHaveReport &&
                                    <div className="hidden print:block" id="printDiv">
                                        <PrintReport ResolveConceringData={ResolveConceringData} caldenderData={caldenderData} TreatMentPlanData={TreatMentPlanData} resolveSubCategories={resolveSubCategories} resolveBioMarkers={resolveBioMarkers} referenceData={referenceData} resolveCategories={resolveCategories} ClientSummaryBoxs={ClientSummaryBoxs}></PrintReport>
                                    </div>

                             }                                   
                            {!isHaveReport &&
                                <UploadTest onGenderate={() => {
                                    setLoading(true)
                                    setTimeout(() => {
                                        setISGenerated(true)
                                    }, 5000);
                                }} memberId={resolvedMemberID}></UploadTest>
                            }                            
                        </div>   

                    </>
                )}
        </>
    )
}

export default ReportAnalyseView