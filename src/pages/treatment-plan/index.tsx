import {useState} from "react";

const TreatmentPlan=()=>{
    return (
       <div id='treatment-plan' className={"pt-[54px]  pr-6 overflow-y-scroll overflow-x-hidden pl-[200px] "}>
           {/*<TreatmentPlanEmpty/>*/}
           {/*<TabelData/>*/}
           {/*<div className={"w-full h-full items-center justify-center flex "}>*/}

           {/*         <CircleData/>*/}
           {/*</div>*/}

</div>
    )
}
export default TreatmentPlan;





const CircleData=()=>{
    return (
        <div className={"relative flex items-center justify-center flex-col   "}>
            <div className={"w-[200px] absolute bottom-0 left-0 "}>
                <img src={"/icons/TreatmentPlan/up.svg"} alt="Icon"/>
            </div>
            <div className={"w-[140px] bottom-0 left-0 h-[140px] rounded-full bg-white"}>
                <h1 className={"TextStyle-Body-3 text-Text-Primary"}>Treatment Plan 02</h1>
                <p>Something short</p>
                <div>
                    <div></div>
                    <h1>Paused</h1>
                </div>
            </div>

        </div>
    )
}