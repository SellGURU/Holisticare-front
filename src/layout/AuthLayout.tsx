import { ReactNode } from "react"

interface AuthLayoutProps {
    children:ReactNode
}

const AuthLayout:React.FC<AuthLayoutProps> = ({children}) => {
    return (
        <>
        <div className="w-full h-screen overflow-hidden flex justify-between items-start">
            <div className="hidden lg:block w-[50%] h-screen">
                <img src="./images/loginImage.png" className="w-full object-cover h-full" alt="" />
            </div>
            <div className="flex-grow flex justify-center items-center bg-backgroundColor-Main min-h-screen">
                <div className="w-[300px]">
                    {children}
                </div>
            </div>
        </div>
        </>
    )
}

export default AuthLayout