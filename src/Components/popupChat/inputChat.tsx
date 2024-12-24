/* eslint-disable @typescript-eslint/no-explicit-any */
import {ChangeEventHandler, FC, useRef} from "react";

interface IInputChat{
    onChange:ChangeEventHandler<HTMLInputElement>;
    sendHandler:any;
}
export const InputChat:FC<IInputChat>=({onChange, sendHandler})=>{
    const btnSendRef= useRef<HTMLInputElement>(null)
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Check if Enter key was pressed
        if (event.key === 'Enter') {
            event.preventDefault();
            sendHandler();
        }
    };
    return (
        <div className={"flex items-center justify-center rounded-xl py-3 px-2 shadow-chat-input"}>
             <input onKeyDown={handleKeyDown} ref={btnSendRef} onChange={onChange} placeholder={"Ask me anything..."} className={"bg-white w-full h-full !border-none !outline-none"}/>
            <img onClick={()=>{
                sendHandler()
                if (btnSendRef.current) {
                    btnSendRef.current.value = "";
                }
            }} src={"/icons/send-2.svg"}/>
        </div>
)
}