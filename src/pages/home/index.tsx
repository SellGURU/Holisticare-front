import { Outlet } from "react-router-dom"
import { SideMenu } from "../../Components"
import MainTopBar from "../../Components/MainTopBar"
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
            <div className="w-full pl-[84px] pt-10 pb-2 h-[100vh] overflow-y-scroll">
                <Outlet></Outlet>

            </div>

        </div>
    )
}

export default Home