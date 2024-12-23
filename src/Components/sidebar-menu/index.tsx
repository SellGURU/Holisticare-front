import {PopUpChat} from "../popup-chat";
import {useState} from "react";

export const SidBarMenu = () => {
    const itemList:string[] = [
        "/images/sidbar-menu/info-circle.svg",
        "/icons/sidbar-menu/clipboard-text.svg",
        "/icons/sidbar-menu/cloud-change.svg",
        "/icons/sidbar-menu/messages.svg",
        "/icons/sidbar-menu/note-2.svg",
        "/icons/sidbar-menu/repeat.svg",
        "/icons/sidbar-menu/task-square.svg",
        "/icons/sidbar-menu/timeline.svg"
    ];
    const [toogleOpenChat, setToogleOpenChat] = useState<boolean>(false);
    return (
        <>
            <div className={"w-[80px] flex justify-center bg-white h-[500px] border-Boarder border rounded-xl p-5 "}>

                <ul className={"flex items-center flex-col gap-3"}>
                    <li>
                        <img src={"/avatar.svg"} className={"w-10 h-10 rounded-full border-2 border-whiteavatar"}/>

                    </li>
                    <li className={"text-Text-Primary TextStyle-Headline-6 text-center"}>Alex
                        Margo
                    </li>
                    <li className={"h-[2px] w-full px-[1px] bg-green-400"}></li>
                    {itemList.map((srcImage) => (
                        <li className={"rounded-full border w-8 h-8 flex items-center justify-center"}>
                            <img src={srcImage} className={"w-5 h-5"}/>
                        </li>

                    ))}
                </ul>
            </div>
            <div className={"space-y-1"}>
                <div className={"w-8 h-8 rounded-md flex bg-Primary-EmeraldGreen items-center justify-center"}>
                    <img src={"/icons/add.svg"}/>
                </div>
                <div onClick={()=>setToogleOpenChat(!toogleOpenChat)} className={"w-8 h-8 rounded-md bg-white flex items-center justify-center"}>
                    {toogleOpenChat ?
                        <img src={"/icons/close.svg"}/>:
                        <img src={"/icons/sidbar-menu/message-question.svg"}/>
                    }
                </div>
                <PopUpChat isOpen={toogleOpenChat}></PopUpChat>
            </div>
        </>
    );
};
