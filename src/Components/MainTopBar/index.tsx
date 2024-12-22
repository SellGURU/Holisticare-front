// import { useNavigate } from "react-router-dom";

const MainTopBar =() => {
    // const navigate = useNavigate();
    return (
        <div className="w-full flex items-center justify-end bg-white border-b  border-gray-50 pl-4 pr-6 py-2 shadow-100">

        <div className="flex gap-10 ">

            
            <div className="flex items-center gap-1 TextStyle-Body-2 cursor-pointer text-[#383838]">
            <img src="/icons/topbar-logo2.png" alt="" />
            Clinic Longevity 1
            </div>
        </div>
        </div>
    )
}

export default MainTopBar