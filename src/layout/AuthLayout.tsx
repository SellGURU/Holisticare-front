import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <>
      <div className="w-full h-screen overflow-hidden flex justify-between items-start">
        <div className="hidden lg:block w-[50%] h-screen">
          <img
            src="./images/loginImage.png"
            className="w-full object-cover h-full"
            alt=""
          />
        </div>
        {/* use desktop */}
        <div className="hidden lg:flex flex-grow justify-center items-center bg-backgroundColor-Main min-h-screen">
          <div className="w-[300px]">{children}</div>
        </div>
        {/* use mobile */}
        <div className="flex lg:hidden flex-grow justify-center items-center bg-[url('./images/loginImage.png')] bg-cover bg-center min-h-screen relative">
          <div className="absolute inset-0 bg-white/70"></div>
          <div className="w-[300px] border-2 border-white p-[32px] rounded-[20px] bg-white/50 backdrop-blur-md shadow-loginBox">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
