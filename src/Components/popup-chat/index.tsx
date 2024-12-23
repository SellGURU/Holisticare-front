import {BotMsg} from "./BotMsg.tsx";
import {UserMsg} from "./UserMsg.tsx";
import {InputChat} from "./input-chat.tsx";


export const PopUpChat = ({isOpen}:{isOpen:boolean}) => {

    return (
       <>
           {isOpen && <div
               className={"w-[315px] h-[438px] bg-white border border-Gray-50 p-4 absolute bottom-20 right-28 rounded-2xl space-y-6"}>
               <h1 className={"TextStyle-Headline-6"}>Copilot</h1>
               <div className={"w-[283px] h-[273px] overflow-y-auto overscroll-y-auto"}>
                   <BotMsg/>
                   <UserMsg/>
               </div>
               <InputChat></InputChat>
           </div>}
       </>
    );
};


