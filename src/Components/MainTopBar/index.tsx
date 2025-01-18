// import { useNavigate } from "react-router-dom";

import LogOutModal from '../LogOutModal';

const MainTopBar = () => {
  // const navigate = useNavigate();

  return (
    <div className="w-full flex items-center justify-end bg-white border-b  border-gray-50 pl-4 pr-6 py-2 shadow-100">
      <LogOutModal></LogOutModal>
    </div>
  );
};

export default MainTopBar;
