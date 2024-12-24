export const BotMsg=({msg}:{msg:string})=>{
    return (
        <div className={"flex items-start justify-start gap-1"}>
            <div>
                <img src={"/images/chat/Float Button.svg"}/>
            </div>
            <div className={"pt-2"}>
                <div className={"flex gap-1"}>
                    <h1 className={"text-Text-Primary TextStyle-Headline-6 "}>AI Copilot</h1>
                    <p className={"TextStyle-Body-2 text-Text-Primary"}>11:46</p>
                </div>
                <div className={"w-[213px] min-h-[152px] p-2 text-Text-Primary TextStyle-Body-2 bg-backgroundColor-Card border-Gray-50 border leading-loose rounded-bl-[20px] rounded-br-[20px] rounded-tr-[20px] " }>
                    <p>{msg}</p>
                </div>
            </div>

        </div>
    )
}