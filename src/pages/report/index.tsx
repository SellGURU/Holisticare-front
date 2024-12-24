import { ReportSideMenu } from "../../Components"
import ReportAnalyseView from "../../Components/RepoerAnalyse/ReportAnalyseView"
import { TopBar } from "../../Components/topBar"
import { ComboBar } from "../../Components"

const Report = () => {
    return (
       <div className="">
            <div className="w-full sticky z-50 top-0 ">
                <TopBar></TopBar>
            </div>
            <div className="fixed z-10 left-4 top-16">
                <ReportSideMenu></ReportSideMenu>

            </div>


            <div className="w-full pl-[200px] fixed">
                <ReportAnalyseView ></ReportAnalyseView>
               
            </div>
            
           <div className="fixed top-20 right-6 h-[80vh] flex items-center justify-between flex-col ">
            <ComboBar></ComboBar>
           </div>

        </div>
    )
}

export default Report