const SideMenu = () => {
    return (
        <>
            <div className="w-[84px] flex justify-center bg-white h-screen border-Boarder border">
                <div className=" w-full mt-6 " >
                    <div className="px-4">
                        <div className="text-Text-Secondary text-[14px] text-center" style={{fontFamily:'Rozha One'}}>Clinic Logo</div>

                    </div>
                    <div className="w-full">
                        <div className="mt-12">
                            <div className="py-3 flex justify-center">
                                <img src="./icons/side-menu/dashboard.svg" alt="" />
                            </div>
                            <div className="py-3 flex justify-center">
                                <img src="./icons/side-menu/shared-witth-you.svg" alt="" />
                            </div>
                            <div className="py-3 w-full flex justify-center border-Primary-DeepTeal border-r-2" style={{boxShadow:'0px -1px 24px 0px #005F731A'}}>
                                <img className="sidemenu-menu-icon-clientList text-Primary-DeepTeal" src="./icons/side-menu/client-list.svg" alt="" />
                            </div>   
                            <div className="py-3 flex justify-center">
                                <img src="./icons/side-menu/messages.svg" alt="" />
                            </div>   
                            <div className="py-3 flex justify-center">
                                <img src="./icons/side-menu/setting-2.svg" alt="" />
                            </div>                                                                                                                
                        </div>

                    </div>

                </div>
            </div>
        </>
    )
}

export default SideMenu