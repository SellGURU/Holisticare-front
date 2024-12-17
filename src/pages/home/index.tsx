import { ReportSideMenu } from "../../Components"
import ReportAnalyseView from "../../Components/RepoerAnalyse/ReportAnalyseView"

const Home = () => {
    return (
        <>
            <div className="fixed left-4 top-16">
                <ReportSideMenu></ReportSideMenu>

            </div>


            <div className="w-full pl-[200px]">
                <ReportAnalyseView memberID={123}></ReportAnalyseView>

            </div>

        </>
    )
}

export default Home