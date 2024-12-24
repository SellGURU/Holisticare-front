import {useParams} from "react-router-dom";

export const UserMsg=({msg}:{msg:string})=>{
    const {name } = useParams<{ name:string }>();

    return (
        <div className={"flex items-start justify-end gap-2 mt-5"}>

            <div className={"pt-2 spa"}>
                <div className={"flex items-end justify-end gap-1 "}>
                    <p className={"TextStyle-Body-2 text-Text-Primary"}>11:46</p>
                    <h1 className={"text-Text-Primary TextStyle-Headline-6 "}>{name}</h1>
                </div>
                <div
                    style={{
                        backgroundColor:"rgba(0, 95, 115, 0.25)"
                    }}
                    className={"w-[213px] min-h-[52px] p-2 pl-4 text-Text-Primary TextStyle-Body-2 flex items-center  border-Gray-50 border leading-loose rounded-bl-[20px] rounded-br-[20px] rounded-tl-[20px] "}>
                    <p>{msg}</p>
                </div>
            </div>
            <div>
                <img src={"/images/chat/Float Button.svg"}/>
            </div>
        </div>
    )
}