import { ReportSideMenu } from "../../Components"
import ReportAnalyseView from "../../Components/RepoerAnalyse/ReportAnalyseView"
// import {TreatmentPlan} from "../index.ts";

const Home = () => {
    return (
        <>
            <div className="fixed left-4 top-16">
                <ReportSideMenu></ReportSideMenu>

            </div>


            <div className="w-full pl-[200px]">
                <ReportAnalyseView memberID={123}></ReportAnalyseView>

            </div>
            {/*<div>*/}
            {/*    <TreatmentPlan/>*/}
            {/*</div>*/}

        </>
    )
}

export default Home