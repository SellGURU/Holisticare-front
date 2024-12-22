/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import SummaryBox from "./SummaryBox"
// import MyChartComponent from "./StatusChart"
import RefrenceBox from "./Boxs/RefrenceBox"
import DetiledAnalyse from "./Boxs/DetiledAnalyse"
import ConceringRow from "./Boxs/ConceringRow"
import TreatmentCard from "./Boxs/TreatmentPlanCard"
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
// import { toast } from "react-toastify"
// import { useConstructor } from "@/help"
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

useEffect(() => {
    setLoading(true); 
    if(memberID != 123){
        Application.getClientSummaryOutofrefs({ member_id: resolvedMemberID }).then((res) => {
            setReferenceData(res.data);        
        })
        Application.getClientSummaryCategories({ member_id: resolvedMemberID }).then(res => {
            setClientSummaryBoxs(res.data);     
       
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
}, [resolvedMemberID]);

    useEffect(() => {
        if(memberID == 123){
            setReferenceData(referencedata)
            setClientSummaryBoxs(mydata)
            setConcerningResult(conceringResultData)
            setTreatmentPlanData(treatmentPlanData)
            setCalenderData(calenderDataMoch)
        }
    },[])

    const [aciveTreatmentPlan ,setActiveTreatmentplan] = useState("Diet")
    const [ClientSummaryBoxs,setClientSummaryBoxs] = useState<any>(null)
    const [ConcerningResult, setConcerningResult] = useState<any[]>([]);
    const [referenceData, setReferenceData] = useState<any>(null)
    const [TreatMentPlanData, setTreatmentPlanData] = useState<any>([])
    useEffect(() => {
        if(ClientSummaryBoxs != null &&referenceData!= null && caldenderData!=null){
            setLoading(false)
        }
    },[ClientSummaryBoxs,referenceData,TreatMentPlanData,caldenderData])    
    // useEffect(() => {
    //     setClientSummaryBoxs(clientData?clientData:mydata)
    // },[clientData])
    

    // const [summaryBoxCategory,setSummaryBOxCategory] = useState("")
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
    return (
        <>        
         {loading ? (
                    <div className="h-[600px] w-full flex items-center justify-center">
                    <BeatLoader size={8} color="#36d7b7" loading={loading} />
                </div>
                ): (
                    <div className="pt-[54px] pb-[200px] mt-[40px] pr-6 h-[98vh] ml-6 overflow-y-scroll overflow-x-hidden  ">
               
                    <div className="flex gap-14">
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

                                {/* <div className=" flex items-center gap-5 justify-end">
                                    <div className="flex justify-end items-center">
                                        <div className="bg-[#06C78D] w-4 h-4 rounded-full"></div>
                                        <div className="text-[#FFFFFFDE] text-[12px] ml-1">Normal</div>
                                    </div>
    
                                    <div className="flex justify-end items-center">
                                        <div className="bg-[#FBAD37] w-4 h-4 rounded-full"></div>
                                        <div className="text-[#FFFFFFDE] text-[12px] ml-1">At risk</div>
                                    </div>
    
                                    <div className="flex justify-end items-center">
                                        <div className="bg-[#FC5474] w-4 h-4 rounded-full"></div>
                                        <div className="text-[#FFFFFFDE] text-[12px] ml-1">Need action</div>
                                    </div>                                        
                                </div> */}
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
                    <div className="my-10 hidden">
                        <div className="w-full mb-3 flex items-center justify-between">
                            <div id="Treatment Plan" className="TextStyle-Headline-4 text-Text-Primary">Treatment Plan </div>
                            <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
                                {/* Total of 30 Treatment in 4 category */}
                            </div>
                            {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
                        </div>      
                        <div className="w-full gap-2 flex justify-between items-center">
                            <div onClick={() => {
                                setActiveTreatmentplan('Diet')
                            }} className={` bg-light-min-color dark:bg-[#1E1E1E] cursor-pointer h-[48px] gap-2 rounded-[6px] text-light-primary-text dark:text-[#FFFFFFDE] ${aciveTreatmentPlan == 'Diet'?'border dark:border-primary-color border-light-blue-active':''} w-full flex items-center px-4`}>
                                <div className="w-6 h-6 dark:bg-[#333333] bg-light-overlay flex justify-center items-center rounded-[8px]">
                                    <img src="./images/report/treatment/apple.svg" alt="" />
                                </div>
                                Diet
                                </div>
                            <div onClick={() => {
                                setActiveTreatmentplan('Mind')
                            }} className={`bg-light-min-color dark:bg-[#1E1E1E] cursor-pointer gap-2 h-[48px] rounded-[6px] text-light-primary-text dark:text-[#FFFFFFDE] ${aciveTreatmentPlan == 'Mind'?'border dark:border-primary-color border-light-blue-active':''} w-full flex items-center px-4`}>
                                <div className="w-6 h-6 dark:bg-[#333333] bg-light-overlay  flex justify-center items-center rounded-[8px]">
                                    <img src="./images/report/treatment/mental-disorder.svg" alt="" />
                                </div>                                        
                                Mind</div>
                            <div onClick={() => {
                                setActiveTreatmentplan('Activity')
                            }} className={`bg-light-min-color dark:bg-[#1E1E1E] cursor-pointer gap-2 h-[48px] rounded-[6px] text-light-primary-text dark:text-[#FFFFFFDE] ${aciveTreatmentPlan == 'Activity'?'border  dark:border-primary-color border-light-blue-active':''} w-full flex items-center px-4`}>
                                <div className="w-6 h-6 dark:bg-[#333333] bg-light-overlay  flex justify-center items-center rounded-[8px]">
                                    <img src="./images/report/treatment/weight.svg" alt="" />
                                </div>                                         
                                Activity</div>
                            <div onClick={() => {
                                setActiveTreatmentplan('Supplement')
                            }} className={`bg-light-min-color dark:bg-[#1E1E1E] cursor-pointer gap-2 h-[48px] rounded-[6px] text-light-primary-text dark:text-[#FFFFFFDE] ${aciveTreatmentPlan == 'Supplement'?'border dark:border-primary-color border-light-blue-active':''} w-full flex items-center px-4`}>
                                <div className="w-6 h-6 dark:bg-[#333333] bg-light-overlay  flex justify-center items-center rounded-[8px]">
                                    <img src="./images/report/treatment/pil.svg" alt="" />
                                </div>                                          
                                Supplement </div>
                        </div>            
                        {TreatMentPlanData.length >0 &&
                            <div className="w-full flex flex-wrap gap-6 bg-light-min-color dark:bg-[#1E1E1E] p-4 rounded-[6px] mt-4">
                                {TreatMentPlanData?.filter((value:any)  => value.category ==aciveTreatmentPlan)[0].data.map((el:any) => {
                                    return (
                                        <TreatmentCard data={el}></TreatmentCard>
                                    )
                                })}
                            </div>            
                        }
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
                    <div id="Action Plan" className="my-10">
                        <div className="TextStyle-Headline-4 text-Text-Primary mb-4">Action Plan</div>
                        <ActionPlan></ActionPlan>
                    </div>
                                                        
                    <div className="hidden print:block" id="printDiv">
                        <PrintReport ResolveConceringData={ResolveConceringData} caldenderData={caldenderData} TreatMentPlanData={TreatMentPlanData} resolveSubCategories={resolveSubCategories} resolveBioMarkers={resolveBioMarkers} referenceData={referenceData} resolveCategories={resolveCategories} ClientSummaryBoxs={ClientSummaryBoxs}></PrintReport>
                    </div>
                </div>   
                )}
        </>
    )
}

export default ReportAnalyseView