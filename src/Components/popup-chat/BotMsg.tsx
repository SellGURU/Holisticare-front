export const BotMsg=({msg}:any)=>{
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
                <div className={"w-[213px] h-[152px] p-2 text-Text-Primary TextStyle-Body-2 bg-backgroundColor-Card border-Gray-50 border leading-loose rounded-bl-[20px] rounded-br-[20px] rounded-tr-[20px] " }>
                    <p>HbA1c is your average blood glucose (sugar) levels for the last two to three months. If you have
                        diabetes, an ideal HbA1c level is 48mmol/mol (6.5%) or below.</p>
                </div>
            </div>

        </div>
    )
}