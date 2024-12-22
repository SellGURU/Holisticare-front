/* eslint-disable @typescript-eslint/no-explicit-any */
interface ClientCardProps {
    client:any
}

const ClientCard:React.FC<ClientCardProps> =({client}) => {
    return (
        <>
            <div className="min-w-[315px] w-[333px] p-4 h-[264px] bg-white shadow-200 rounded-[16px]">
                <div className="flex">
                    <div className="w-[72px] h-[72px] overflow-hidden rounded-full object-cover">
                        <img className="w-full h-full" src={client.picture?client.picture:`https://ui-avatars.com/api/?name=${client.name}`} alt="" />
                    </div>
                    <div className="pl-2 ">
                        <div className="text-Text-Primary text-[14px] font-medium">{client.name}</div>
                        <div className="text-Text-Secondary text-[12px]">35 years </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ClientCard