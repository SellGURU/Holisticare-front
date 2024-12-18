import {useState} from "react";

const TreatmentPlan=()=>{
    return (
       <div id='treatment-plan' className={"pt-[54px]  pr-6 h-[98vh] overflow-y-scroll overflow-x-hidden pl-[200px] "}>
           {/*<TreatmentPlanEmpty/>*/}
           <TabelData/>
       </div>
    )
}
export default TreatmentPlan;


const TreatmentPlanEmpty=()=>{
    return (
        <div className={"w-full h-full "}>
            <h1 className={"TextStyle-Headline-4"}>Treatment Plan</h1>
            <div className={"w-full flex items-center flex-col justify-center h-5/6"}>
                <img src={"/images/EmptyState.svg"} />
                <h1 className={"TextStyle-Headline-4"}>No Treatment Plan Generated Yet</h1>
                <p className={"TextStyle-Body-2 mb-5"}>Start creating your treatment plan</p>
                <button>Generate New</button>
            </div>
        </div>
    )
}


const TabelData=()=>{
    const [activeIndex, setActiveIndex] = useState<number>(0);

    // Function to handle enabling the border
    const handleEnable = (index: number): void => {
        setActiveIndex(index);
    };

    // Items array
    const items: {name:string,imageSrc:string}[] = [{"name":"Diet","imageSrc":"/icons/TreatmentPlan/IconApple.svg"}, {"name":"Mind","imageSrc":"/icons/TreatmentPlan/Iconmind.svg"}, {"name":"Activity","imageSrc":"/icons/TreatmentPlan/IconActivity.svg"}, {"name":"Supplement","imageSrc":"/icons/TreatmentPlan/IconSupplement.svg"}];

    return(
        <div className={"space-y-4"}>
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
                <div
                    className={"w-[360px] h-[185px] rounded-2xl bg-backgroundColor-Card  border-[1px] border-Gray-50 px-4 py-2 space-y-4"}>
                    <h1 className={"TextStyle-Body-1"}>Continue 5/2 diet.null</h1>
                    <div className={"flex items-start"}><p className={"TextStyle-Body-2"}>Notes:</p><p
                        className={"TextStyle-Body-2"}> Try also to substitute healthy fats such as avocado and sh for
                        meat and dairy fats.</p></div>
                    <p className={"TextStyle-Button text-Primary-DeepTeal"}>Based on your LDL Cholesterol</p>
                </div>
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
