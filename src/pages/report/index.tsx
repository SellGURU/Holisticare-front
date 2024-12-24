import { ReportSideMenu } from "../../Components"
import ReportAnalyseView from "../../Components/RepoerAnalyse/ReportAnalyseView"
import { TopBar } from "../../Components/topBar"
import { ComboBar } from "../../Components"

const Report = () => {
    return (
       <div className="h-screen">
            <div className="w-full fixed z-50 top-0 ">
                <TopBar></TopBar>
            </div>
            <div className="fixed left-4 top-16">
                <ReportSideMenu></ReportSideMenu>

            </div>


            <div className="w-full pl-[200px]">
                <ReportAnalyseView ></ReportAnalyseView>
               
            </div>
            
           <div className="absolute top-20 right-6 h-[80vh] flex items-center justify-between flex-col ">
            <ComboBar></ComboBar>
           </div>

        </div>
    )
}

export default Report