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
