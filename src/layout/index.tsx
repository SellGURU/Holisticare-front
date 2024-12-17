import { Outlet } from "react-router-dom"

const Layout = () => {
    return (
        <>
            <div className="w-full bg-bg-color h-screen">
                <Outlet></Outlet>
            </div>        
        </>
    )
}

export default Layout