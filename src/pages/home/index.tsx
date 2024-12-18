import { ReportSideMenu } from "../../Components"
import ReportAnalyseView from "../../Components/RepoerAnalyse/ReportAnalyseView"
import { TopBar } from "../../Components/topBar"
const Home = () => {
    return (
       <div className="h-screen">
        <div className="w-full fixed top-0 ">
            <TopBar></TopBar>
        </div>
            <div className="fixed left-4 top-16">
                <ReportSideMenu></ReportSideMenu>

            </div>


            <div className="w-full pl-[200px] pt-[80px]">
                <ReportAnalyseView memberID={123}></ReportAnalyseView>
               
            </div>
            
           

            </div>
    )
}

export default Home