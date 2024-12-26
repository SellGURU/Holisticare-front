import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Breadcrumb = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Split the current pathname into an array
    const pathArray = location.pathname.split("/").filter(Boolean); // Remove empty strings

    return (
        <div className="flex items-center">
            {/* Home Link */}
            <div
                onClick={() => navigate("/")}
                className="TextStyle-Button text-[#445A74] cursor-pointer"
            >
                Home
            </div>
            {
                location.pathname.includes("report")&&

            <div  className="flex items-center gap-2">
                <img className="w-5 h-5" src="/icons/arrow-right.svg" alt="Arrow"/>
                <span className="TextStyle-Button text-[#6783A0]">
                {decodeURIComponent("report")}
              </span>
            </div>}
            {!location.pathname.includes("report")&&pathArray.map((segment, index) => {

                const isLast = index === pathArray.length - 1; // Check if it's the last segment
                const path = `/${pathArray.slice(0, index + 1).join("/")}`; // Construct path up to this segment

                return (
                    <div key={index} className="flex items-center gap-2">
                        <img className="w-5 h-5" src="/icons/arrow-right.svg" alt="Arrow"/>
                        {isLast ? (
                            <span className="TextStyle-Button text-[#6783A0]">
                {decodeURIComponent(segment)}
              </span>
                        ) : (
                            <div
                                onClick={() => navigate(path)}
                                className="TextStyle-Button text-[#445A74] cursor-pointer"
                            >
                                {decodeURIComponent(segment)}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Breadcrumb;
