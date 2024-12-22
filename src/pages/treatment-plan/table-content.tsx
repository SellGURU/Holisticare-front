import {useState} from "react";
import TreatmentCard from "../../Components/RepoerAnalyse/Boxs/TreatmentPlanCard.tsx";

export const TableData=(data:any)=>{
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [TreatMentPlanData, setTreatmentPlanData] = useState<any>([])
    const [aciveTreatmentPlan ,setActiveTreatmentplan] = useState<string>("Diet")

    // Function to handle enabling the border
    const handleEnable = (index: number): void => {
        setActiveIndex(index);
    };

    // Items array
    const items: {name:string,imageSrc:string}[] = [{"name":"Diet","imageSrc":"/icons/TreatmentPlan/IconApple.svg"}, {"name":"Mind","imageSrc":"/icons/TreatmentPlan/Iconmind.svg"}, {"name":"Activity","imageSrc":"/icons/TreatmentPlan/IconActivity.svg"}, {"name":"Supplement","imageSrc":"/icons/TreatmentPlan/IconSupplement.svg"}];

    return(
        <div className={"space-y-4"}>
            <h1 className={"TextStyle-Headline-4"}>Treatment Plan</h1>
            <div className={"flex items-center justify-center gap-4 w-[1131px]"}>
                {/*<div*/}
                {/*    className={"w-[300px] h-[48px] flex items-center justify-center border-[1px] border-Green gap-2 rounded-[16px] bg-white"}>*/}
                {/*    <img src={"/icons/TreatmentPlan/IconApple.svg"}/>*/}
                {/*    <p className={"TextStyle-Headline-5 text-Primary-DeepTeal"}>Diet</p>*/}
                {/*</div>*/}
                <div className="flex items-center justify-start gap-2 ">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleEnable(index)}
                            className={`w-[277px] !h-[48px] flex items-center justify-center gap-2 rounded-[16px] bg-white cursor-pointer 
                        ${activeIndex === index ? "border-[1px] border-Green" : ""}`}
                        >
                            <img src={item.imageSrc} alt="Icon"/>
                            <p className="TextStyle-Headline-5 text-Primary-DeepTeal">{item.name}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div
                className={"w-[1131px] h-[380] bg-white rounded-[16px] flex items-center justify-start border-[1px] border-Gray-50 flex-wrap p-4 gap-2"}>

                {TreatMentPlanData?.filter((value:any)  => value.category ==aciveTreatmentPlan)[0].data.map((el:any) => {
                                    return (
                                        // <TreatmentCard data={el}></TreatmentCard>
                                        <div
                                            className={"w-[360px] h-[185px] rounded-2xl bg-backgroundColor-Card  border-[1px] border-Gray-50 px-4 py-2 space-y-4"}>
                                            <h1 className={"TextStyle-Body-1"}>Continue 5/2 diet.null</h1>
                                            <div className={"flex items-start"}><p
                                                className={"TextStyle-Body-2"}>Notes:</p><p
                                                className={"TextStyle-Body-2"}> Try also to substitute healthy fats such
                                                as avocado and sh for
                                                meat and dairy fats.</p></div>
                                            <p className={"TextStyle-Button text-Primary-DeepTeal"}>Based on your LDL
                                                Cholesterol</p>
                                        </div>

                                    )
                })}
                <div
                    className={"w-[360px] h-[185px] rounded-2xl bg-backgroundColor-Card  border-[1px] border-Gray-50 px-4 py-2 space-y-4"}>
                    <h1 className={"TextStyle-Body-1"}>Continue 5/2 diet.null</h1>
                    <div className={"flex items-start"}><p className={"TextStyle-Body-2"}>Notes:</p><p
                        className={"TextStyle-Body-2"}> Try also to substitute healthy fats such as avocado and sh for
                        meat and dairy fats.</p></div>
                    <p className={"TextStyle-Button text-Primary-DeepTeal"}>Based on your LDL Cholesterol</p>
                </div>
                  </div>
        </div>
    )
}
//                    <div className="my-10 hidden">
//                         <div className="w-full mb-3 flex items-center justify-between">
//                             <div id="Treatment Plan" className="text-light-primary-text dark:text-[#FFFFFFDE] text-[24px] font-medium">Treatment Plan </div>
//                             <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
//                                 {/* Total of 30 Treatment in 4 category */}
//                             </div>
//                             {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
//                         </div>
//                         <div className="w-full gap-2 flex justify-between items-center">
//                             <div onClick={() => {
//                                 setActiveTreatmentplan('Diet')
//                             }} className={` bg-light-min-color dark:bg-[#1E1E1E] cursor-pointer h-[48px] gap-2 rounded-[6px] text-light-primary-text dark:text-[#FFFFFFDE] ${aciveTreatmentPlan == 'Diet'?'border dark:border-primary-color border-light-blue-active':''} w-full flex items-center px-4`}>
//                                 <div className="w-6 h-6 dark:bg-[#333333] bg-light-overlay flex justify-center items-center rounded-[8px]">
//                                     <img src="./images/report/treatment/apple.svg" alt="" />
//                                 </div>
//                                 Diet
//                                 </div>
//                             <div onClick={() => {
//                                 setActiveTreatmentplan('Mind')
//                             }} className={`bg-light-min-color dark:bg-[#1E1E1E] cursor-pointer gap-2 h-[48px] rounded-[6px] text-light-primary-text dark:text-[#FFFFFFDE] ${aciveTreatmentPlan == 'Mind'?'border dark:border-primary-color border-light-blue-active':''} w-full flex items-center px-4`}>
//                                 <div className="w-6 h-6 dark:bg-[#333333] bg-light-overlay  flex justify-center items-center rounded-[8px]">
//                                     <img src="./images/report/treatment/mental-disorder.svg" alt="" />
//                                 </div>
//                                 Mind</div>
//                             <div onClick={() => {
//                                 setActiveTreatmentplan('Activity')
//                             }} className={`bg-light-min-color dark:bg-[#1E1E1E] cursor-pointer gap-2 h-[48px] rounded-[6px] text-light-primary-text dark:text-[#FFFFFFDE] ${aciveTreatmentPlan == 'Activity'?'border  dark:border-primary-color border-light-blue-active':''} w-full flex items-center px-4`}>
//                                 <div className="w-6 h-6 dark:bg-[#333333] bg-light-overlay  flex justify-center items-center rounded-[8px]">
//                                     <img src="./images/report/treatment/weight.svg" alt="" />
//                                 </div>
//                                 Activity</div>
//                             <div onClick={() => {
//                                 setActiveTreatmentplan('Supplement')
//                             }} className={`bg-light-min-color dark:bg-[#1E1E1E] cursor-pointer gap-2 h-[48px] rounded-[6px] text-light-primary-text dark:text-[#FFFFFFDE] ${aciveTreatmentPlan == 'Supplement'?'border dark:border-primary-color border-light-blue-active':''} w-full flex items-center px-4`}>
//                                 <div className="w-6 h-6 dark:bg-[#333333] bg-light-overlay  flex justify-center items-center rounded-[8px]">
//                                     <img src="./images/report/treatment/pil.svg" alt="" />
//                                 </div>
//                                 Supplement </div>
//                         </div>
//                         {TreatMentPlanData.length >0 &&
//                             <div className="w-full flex flex-wrap gap-6 bg-light-min-color dark:bg-[#1E1E1E] p-4 rounded-[6px] mt-4">
//                                 {TreatMentPlanData?.filter((value:any)  => value.category ==aciveTreatmentPlan)[0].data.map((el:any) => {
//                                     return (
//                                         <TreatmentCard data={el}></TreatmentCard>
//                                     )
//                                 })}
//                             </div>
//                         }
//                     </div>