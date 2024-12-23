/* eslint-disable @typescript-eslint/no-explicit-any */
import BioMarkerBox from "./BiomarkerBox"
import {  useState } from "react"
import BioMarkerRowSuggestions from "./BiomarkerRow"
import Toggle from "../../../Components/Toggle"
// import StatusChart from "@/pages/RepoerAnalyse/StatusChart"
import AnalyseButton from "../../../Components/AnalyseButton"
import PillarsBox from "./PillarsBox"
import TreatmentplanData from '../../../api/--moch--/data/new/TreatmentPlanData.json'
// import { Button } from "symphony-ui"
import MiniAnallyseButton from "../../../Components/MiniAnalyseButton"
// import Application from "../../../api/app"
// import { useConstructor } from "../../../help"
import { ClipLoader } from "react-spinners"
interface CategoryOrderProps {
    isActionPlan?:boolean
}

const CategoryOrder:React.FC<CategoryOrderProps> = ({isActionPlan}) => {

    const [isLoading,] = useState(false)
    const [active,setActive] = useState<string>('Suggestion')
    const [categoryOrderData,setCategoryData] = useState(TreatmentplanData)
    const [activeBio,setActiveBio] = useState<any>(categoryOrderData.filter(el=>el.checked == true)[0])
    const [activeEl,] = useState<any>()
    const [suggestion,] = useState<any>([])
    const pillarData:any ={
    "Diet": [
        {
            "text": "Consume one serving of calcium-rich food daily (leafy greens, dairy, or fortified grains) and include vitamin D foods (fish, fortified milk) 3 times a week.",
            "reference": [
                {
                    "NIH_Calcium_Fact_Sheet.docx": {
                        "content": "NIH fact sheet on calcium's role, food sources, intake levels, and importance with vitamin D."
                    }
                }
            ]
        },
        {
            "text": "Choose high-fiber vegetables, whole grains, and lean proteins daily. Avoid high-sugar foods to maintain stable blood sugar.",
            "reference": [
                {
                    "ADA_Glycemic_Index_Guide.docx": {
                        "content": "ADA guide on glycemic index for blood sugar control and meal planning."
                    }
                }
            ]
        },
        {
            "text": "Eat iron-rich foods (lean meats, beans, spinach) with vitamin C foods (citrus) to improve iron absorption.",
            "reference": [
                {
                    "WHO_Iron_Nutrition_Guidelines.docx": {
                        "content": "WHO guidelines on dietary iron, absorption, and vitamin C for iron uptake."
                    }
                }
            ]
        },
        {
            "text": "Increase fiber intake with whole grains, vegetables, and legumes daily to lower LDL cholesterol.",
            "reference": [
                {
                    "NIH_Fiber_and_Heart_Health_Guide.docx": {
                        "content": "NIH guide on dietary fiber's impact on cholesterol and heart health."
                    }
                }
            ]
        },
        {
            "text": "Add omega-3 foods (salmon, walnuts, flaxseeds) weekly to reduce triglycerides and inflammation.",
            "reference": [
                {
                    "AHA_Omega-3_Guidelines.docx": {
                        "content": "AHA guidelines on omega-3s for triglyceride reduction and heart health."
                    }
                }
            ]
        }
    ],
    "Supplement": [
        {
            "text": "Consider a vitamin D supplement if diet lacks sufficient sources for bone and immune health.",
            "reference": [
                {
                    "NIH_Vitamin_D_Fact_Sheet.docx": {
                        "content": "NIH fact sheet on vitamin D for bone health, immune function, and supplementation."
                    }
                }
            ]
        },
        {
            "text": "Take an omega-3 supplement if fish or plant sources are low in your diet to support heart and joint health.",
            "reference": [
                {
                    "AHA_Omega-3_Supplement_Guide.docx": {
                        "content": "AHA guide on omega-3 supplements for cardiovascular and anti-inflammatory benefits."
                    }
                }
            ]
        }
    ],
    "Mind": [
        {
            "text": "Practice mindfulness or relaxation techniques daily, like meditation or deep breathing, to manage stress.",
            "reference": [
                {
                    "Mayo_Clinic_Mindfulness_Stress_Reduction_Guide.docx": {
                        "content": "Mayo Clinic guide on mindfulness for stress reduction and mental health."
                    }
                }
            ]
        },
        {
            "text": "Engage in mentally stimulating activities (reading, puzzles, new skills) regularly for cognitive health.",
            "reference": [
                {
                    "WHO_Cognitive_Health_Guide.docx": {
                        "content": "WHO cognitive health guide recommends mental stimulation for brain health."
                    }
                }
            ]
        }
    ],
    "Activity": [
        {
            "text": "Do weight-bearing exercises (resistance training, walking) 3 times a week to support bone health.",
            "reference": [
                {
                    "NIH_Bone_Health_and_Exercise_Factsheet.docx": {
                        "content": "NIH factsheet on weight-bearing exercise benefits for bone health."
                    }
                }
            ]
        },
        {
            "text": "Include strength and flexibility exercises 2-3 times per week to improve muscle strength and mobility.",
            "reference": [
                {
                    "WHO_Physical_Activity_for_Muscle_Strength.docx": {
                        "content": "WHO guidelines on strength and flexibility training for injury prevention and health."
                    }
                }
            ]
        }
    ]
}
    // useConstructor(() => {
    //     setIsLoading(true)
    //     Application.generateTreatmentPlan({  member_id: 187517960166}).then((res) => {
    //         setIsLoading(false)
    //         setCategoryData(res.data["Report Details"])
    //         setSuggestions(res.data.suggestion_tab)
    //     })
    // })
    return (
        <>
            {isActionPlan ? 
                <>
                    <div className="w-full dark:bg-[#383838] bg-light-min-color border-light-border-color mt-2 rounded-[6px] border dark:border-[#383838]  p-6">
                        <div className="w-full flex justify-between">
                            <div className="textStyle-type1 flex items-center"> Report Details</div>
                            <div>
                                <AnalyseButton text="Generate by AI"></AnalyseButton>                           
                            </div>
                        </div>    
                        <div>
                            {Object.keys(pillarData).map((value) => {
                                return (
                                    <PillarsBox onChnageText={()=>{
                                    }} name={value} data={pillarData[value]}></PillarsBox>
                                )
                            })}
                        
                        </div>     
                    </div>

                </>
            :
            <>
                {isLoading ?
                    <>
                        <div className="w-full flex h-[300px] items-center justify-center">
                            <ClipLoader></ClipLoader>
                        </div>
                    </>
                :
                    <>
                        <div className="bg-white rounded-[16px] shadow-100  p-6 h-[256px] mt-2  border border-Gray-50 overflow-auto">
                            <div className="w-full flex items-center justify-between">
                                <div className="text-sm font-medium text-Text-Primary flex items-center gap-2"> <div className="dark:bg-primary-text bg-Text-Triarty rounded-full w-1 h-1"></div>  Report Details</div>
                                <div>
                                    <AnalyseButton text="Generate by AI"></AnalyseButton>                           
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 mt-3">
                                {categoryOrderData.map((el,index) => {
                                    return (
                                        <>
                                        <BioMarkerBox 
                                            isActive={activeBio.category == el.category}
                                            onClick={() => {
                                                setActiveBio(el)
                                                // setActiveEl(el["Out of Reference"][0])
                                            }}
                                            onCheck={() => {
                                            const old:Array<any> = []
                                            categoryOrderData.forEach((value,ind) => {
                                                if(index ==ind){
                                                    old.push(
                                                        {
                                                            ...value,
                                                            checked:!categoryOrderData[index].checked
                                                        }
                                                    )
                                                }else {
                                                    old.push(value)
                                                }
                                            })
                                            
                                            setCategoryData(old)
                                        }} data={el}></BioMarkerBox>       
                                        </>
                                    )
                                })}
                            </div>
                        </div>       
                        <div className="bg-white rounded-[16px]  shadow-100 p-6  mt-2  border border-Gray-25  ">
                                <div className="w-full flex justify-center">
                                    <Toggle active={active} setActive={setActive} value={["Suggestion","Result"]}></Toggle>
                                </div>
                                
                                <div className="w-full flex justify-between">
                                    <div className="flex justify-start items-center">
                                        <div className="w-10 h-10 rounded-full flex justify-center items-center border-2 border-Primary-DeepTeal ">
                                            <img className="" src={activeBio.icon} alt="" />
                                        </div>    
                                        <div>
                                        <div className="ml-2">
                                            <div className="flex">
                                                <div className=" text-Text-Primary text-[14px] ">{activeBio.category}</div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className=" text-Text-Secondary text-[10px]">
                                                    <span className="text-[12px] text-Text-Primary">{activeBio.total_biomarkers}</span> Total Biomarkers <span className="ml-2 text-[12px]  text-Text-Primay">{activeBio.total_needs_focus}</span> Needs Focus
                                        
                                                </div>
                                            </div>
                                        </div>                    
                                        </div>       
                                    </div>
                                    <div className="w-[32px] relative  h-[32px]">
                                        <MiniAnallyseButton></MiniAnallyseButton>                        

                                    </div>
                                </div>
                            
                                <div className="w-full px-6 py-4 bg-backgroundColor-Card  rounded-[16px] border border-Gray-50 mt-4">
                                {active == 'Suggestion' ?
                                        <>
                                            {
                                                suggestion.filter((el:any) => el.category == activeBio.category).length > 0 &&
                                                    <>
                                                        {suggestion.filter((el:any) => el.category == activeBio.category)[0].suggestions.map((el:any) => {
                                                            return (
                                                                <div className="mt-2">
                                                                    <BioMarkerRowSuggestions value={el}></BioMarkerRowSuggestions>
                                                                </div>
                                                            )
                                                        })}
                                                    </>
                                            }
                                        </>
                                :
                                        <>
                                            <div className="w-full bg-backgroundColor-Card  rounded-[16px] border border-Gray-50 min-h-[30px] ">
                                                {activeEl!=null &&
                                                    <>
                                                        {/* <div className="w-[240px] ">
                                                            {activeBio["Out of Reference"].map((value:any) => {
                                                                return (
                                                                    <>
                                                                        <div  onClick={() => {
                                                                            setActiveEl(value)
                                                                        }} className={`w-full h-10 mb-2 cursor-pointer ${activeEl.name==value.name?'dark:border-brand-primary-color border-light-blue-active text-light-secandary-text dark:text-white':'dark:border-[#383838] dark:text-[#FFFFFF99] text-light-primary-text'} dark:bg-[#1E1E1E] border items-center  rounded-[6px] flex justify-between px-4`}>
                                                                            <div className=" text-[12px]">{value.name}</div>
                                                                            <img className="rotate-[-90deg] invert dark:invert-0  w-4" src="./Themes/Aurora/icons/arrow-Combo-left.svg" alt="" />
                                                                        </div>
                                                                    </>
                                                                )
                                                            })}

                                                        </div>       
                                                        <div className="w-full h-[32px] p-6 dark:bg-[#1E1E1E]  rounded-[6px] min-h-[312px]">
                                                            <div className=" text-light-primary-text dark:text-[#FFFFFFDE] text-[14px] font-[500]">
                                                                {activeEl.name}
                                                            </div>
                                                            <div>
                                                                <div style={{lineHeight:'24px'}} className=" text-light-secandary-text dark:text-[#FFFFFF99] text-[12px] mt-3">
                                                                {activeEl.description}
                                                                </div>
                                                            </div>
                                                            <div className="flex w-full justify-center gap-4 mt-4">
                                                                <div>
                                                                    <div className="w-[500px] p-4 border dark:border-[#383838] h-[159px] bg-light-min-color dark:bg-[#1E1E1E] rounded-[6px]">
                                                                        <div className="dark:text-[#FFFFFFDE] text-light-primary-text text-[12px] font-medium mb-20">
                                                                            Current Value
                                                                        </div>
                                                                        <div className="w-full relative flex">
                                                                                <div className={`absolute top-[-26px]  z-10`} style={{left:activeEl.value /activeEl.limite.needAction * 100 + '%'}}>
                                                                                    <div className="text-[10px] text-light-primary-text dark:text-[#FFFFFFDE] ]">{activeEl.value}</div>
                                                                                    <div className="w-[3px] h-[8px] ml-[2.5px] bg-black dark:bg-white"></div>
                                                                                    <div className="w-2 h-2  rotate-45 bg-black dark:bg-white"></div>
                                                                                </div>
                                                                                {
                                                                                    activeEl.mode =='multi' ?
                                                                                    <>
                                                                                        <div className=" relative bg-[#FC5474] h-[8px] rounded-l-[8px]" style={{width:(activeEl.limite.firstNeedAction) /activeEl.limite.needAction * 100 + '%'}}>
                                                                                            <div className="absolute left-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">{activeEl.limite.start}</div>
                                                                                        </div>   
                                                                                        <div className=" relative bg-[#FBAD37] h-[8px] " style={{width:(activeEl.limite.firstAtRisk -activeEl.limite.firstNeedAction) /activeEl.limite.needAction * 100 + '%'}}>
                                                                                            <div className="absolute right-2 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">{activeEl.limite.firstAtRisk}</div>
                                                                                        </div>                                                                                                            
                                                                                        <div className=" relative bg-[#06C78D] h-[8px] " style={{width:(activeEl.limite.normal -activeEl.limite.firstAtRisk) /activeEl.limite.needAction * 100 + '%'}}>
                                                                                       
                                                                                            <div className="absolute right-3 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">{activeEl.limite.normal}</div>
                                                                                        </div>
                                                                                        <div className=" relative bg-[#FBAD37] h-[8px] " style={{width:(activeEl.limite.atRisk -activeEl.limite.normal) /activeEl.limite.needAction * 100 + '%'}}>
                                                                                            <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">{activeEl.limite.atRisk}</div>
                                                                                        </div>
                                                                                        <div className=" relative bg-[#FC5474] h-[8px] rounded-r-[8px]" style={{width:(activeEl.limite.needAction -activeEl.limite.atRisk) /activeEl.limite.needAction * 100 + '%'}}>
                                                                                            <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">{activeEl.limite.needAction}</div>
                                                                                        </div>                                                    
                                                                                    </>
                                                                                    :
                                                                                    <>
                                                                                        <div className=" relative bg-[#06C78D] h-[8px] rounded-l-[8px]" style={{width:activeEl.limite.normal /activeEl.limite.needAction * 100 + '%'}}>
                                                                                            <div className="absolute left-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">{activeEl.limite.start}</div>
                                                                                            <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">{activeEl.limite.normal}</div>
                                                                                        </div>
                                                                                        <div className=" relative bg-[#FBAD37] h-[8px] " style={{width:(activeEl.limite.atRisk -activeEl.limite.normal) /activeEl.limite.needAction * 100 + '%'}}>
                                                                                            <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">{activeEl.limite.atRisk}</div>
                                                                                        </div>
                                                                                        <div className=" relative bg-[#FC5474] h-[8px] rounded-r-[8px]" style={{width:(activeEl.limite.needAction -activeEl.limite.atRisk) /activeEl.limite.needAction * 100 + '%'}}>
                                                                                            <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">{activeEl.limite.needAction}</div>
                                                                                        </div>
                                                                                    </>
                                                                                }
                                                                        </div>                                                                      
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="w-[500px] border dark:border-[#383838] p-4 h-[159px] dark:bg-[#1E1E1E] bg-light-min-color border-light-border-color rounded-[6px]">
                                                                        <div className="dark:text-[#FFFFFFDE] text-light-primary-text text-[12px] font-medium mb-5">
                                                                            Historical Data
                                                                        </div>                                    
                                                                        <div className="mt-0 relative">
                                                                            <StatusChart mode={activeEl.mode} statusBar={activeEl.limite} labels={activeEl.history.label} dataPoints={activeEl.history.values} ></StatusChart>                                               

                                                                        </div>                                    
                                                                    </div>
                                                                </div>                                            

                                                            </div>
                                                        </div> */}
                                                    </>
                                                }
                                            </div>                        
                                        </>
                                }
                                </div>
                        </div> 
                    </>
                }
            
            </>
            }
        </>
    )
}

export default CategoryOrder


 