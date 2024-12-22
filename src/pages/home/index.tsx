import { Outlet } from "react-router-dom"
import { SideMenu } from "../../Components"
import MainTopBar from "../../Components/MainTopBar"
import {SidBarMenu} from "../../Components/sidebar-menu";
// import { TopBar } from "../../Components/topBar"

const Home = () => {
    return (
       <div className="h-screen">
            <div className="w-full fixed z-50 top-0 ">
                <MainTopBar></MainTopBar>
            </div>
            <div className="fixed left-0 top-0 z-[60]">
                <SideMenu></SideMenu>
            </div>
           <div className="w-full pl-[84px] pt-10 pb-2 h-[100vh] flex items-center-center justify-between overflow-y-scroll">
               <div className={"flex w-[90vw] items-center-center  justify-center "}>

               <Outlet></Outlet>
               </div>
               <div className={"w-[7vw] flex items-center justify-between flex-col py-[5vh] "}>

               <SidBarMenu/>
                   <div className={"space-y-1"}>
                       <div className={"w-8 h-8 rounded-md flex bg-Primary-EmeraldGreen items-center justify-center"}>
                              <img src={"/icons/sidbar-menu/pluse.png"}/>
                    </div>
                       <div className={"w-8 h-8 rounded-md bg-white flex items-center justify-center"}>
                           <img src={"/icons/sidbar-menu/message-question.svg"}/>
                       </div>
                   </div>
               </div>
           </div>


       </div>
    )
}

export default Home