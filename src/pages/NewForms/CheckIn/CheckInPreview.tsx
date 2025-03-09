/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import Checkin from "../../CheckIn"
import FormsApi from "../../../api/Forms"

interface CheckInPreviewProps {
    id:string
    onClose:() =>void
}

const CheckInPreview:React.FC<CheckInPreviewProps> = ({id,onClose}) => {
    const [data,setData] = useState<any>(null)
    useEffect(() => {
        FormsApi.showCheckIn(id).then((res) => {
            setData(res.data)
        })
    },[])
    return (
        <>
            <div className="w-[500px] bg-white  h-[500px] p-6 rounded-[25px]">
                <div className="text-[14px] text-Text-Primary font-medium w-full border-b border-gray-50 pb-3">
                    Preview
                </div>
                <div className="w-full flex justify-between items-center mt-3">
                    <div className="text-[12px] text-Text-Primary font-medium">{data?.title}</div>
                    <div className="text-Text-Secondary text-[10px]">Last update: 20 days ago</div>
                </div>
                <div className="w-full h-[350px] mt-2 overflow-y-auto">
                    <Checkin upData={data?.questions}></Checkin>

                </div>
                <div className="w-full flex justify-end mt-2 items-center">
                    <div onClick={() => {
                        onClose()
                    }} className="text-[14px] font-medium cursor-pointer text-Disable">Close</div>
                </div>
            </div>
        </>
    )
}

export default CheckInPreview