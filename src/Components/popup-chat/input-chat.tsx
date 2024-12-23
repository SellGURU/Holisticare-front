import {ChangeEventHandler, FC, MouseEventHandler} from "react";

interface IInputChat{
    onChange:ChangeEventHandler<HTMLInputElement>;
    sendHandler:MouseEventHandler<HTMLImageElement>;
}
export const InputChat:FC<IInputChat>=({onChange, sendHandler})=>{
    return (
        <div className={"flex items-center justify-center rounded-xl py-3 px-2 shadow-chat-input"}>
        <input onChange={onChange} placeholder={"Ask me anything..."} className={"bg-white w-full h-full !border-none !outline-none"}/>
    <img onClick={sendHandler} src={"/icons/send-2.svg"}/>
    </div>
)
}