import {ChangeEventHandler, FC, MouseEventHandler, useRef} from "react";

interface IInputChat{
    onChange:ChangeEventHandler<HTMLInputElement>;
    sendHandler:MouseEventHandler<HTMLImageElement>;
}
export const InputChat:FC<IInputChat>=({onChange, sendHandler})=>{
    const btnSendRef= useRef<HTMLInputElement>(null)
    return (
        <div className={"flex items-center justify-center rounded-xl py-3 px-2 shadow-chat-input"}>
             <input ref={btnSendRef} onChange={onChange} placeholder={"Ask me anything..."} className={"bg-white w-full h-full !border-none !outline-none"}/>
            <img onClick={(event)=>{
                sendHandler(event)
                if (btnSendRef.current) {
                    btnSendRef.current.value = "";
                }

            }} src={"/icons/send-2.svg"}/>
        </div>
)
}