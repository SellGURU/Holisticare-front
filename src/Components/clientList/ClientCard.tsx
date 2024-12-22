import { useNavigate } from "react-router-dom"
import { ButtonSecondary } from "../Button/ButtosSecondary"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ClientCardProps {
    client:any
}

const ClientCard:React.FC<ClientCardProps> =({client}) => {
    const navigate = useNavigate()
    return (
        <>
            <div onClick={() => {
                navigate('/report/'+client.member_id)
            }} className="min-w-[315px] w-[333px] p-4  bg-white shadow-200 rounded-[16px]">
                <div className="flex">
                    <div className="w-[72px] h-[72px] overflow-hidden rounded-full object-cover">
                        <img className="w-full h-full" src={client.picture?client.picture:`https://ui-avatars.com/api/?name=${client.name}`} alt="" />
                    </div>
                    <div className="pl-2 grid grid-cols-1 gap-1 ">
                        <div className="text-Text-Primary text-[14px] font-medium">{client.name}</div>
                        <div className="text-Text-Secondary text-[12px]">35 years </div>
                        <div className="text-Text-Secondary text-[12px]">ID: {client.member_id}</div>
                    </div>
                </div>

                <div className="mt-2 flex justify-between items-center">
                    <div className="text-Text-Secondary text-[10px] font-medium">Plan not started. Assign a trainer to start.</div>
                    <ButtonSecondary size="small">
                        Assaign
                    </ButtonSecondary>
                </div>
            </div>
        </>
    )
}

export default ClientCard