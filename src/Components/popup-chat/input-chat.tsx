export const InputChat=()=>{
    return (
        <div className={"flex items-center justify-center rounded-xl py-3 px-2 shadow-chat-input"}>
        <input placeholder={"Ask me anything..."} className={"bg-white w-full h-full !border-none !outline-none"}/>
    <img src={"/icons/send-2.svg"}/>
    </div>
)
}