/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { ButtonSecondary } from "../Button/ButtosSecondary"
import Application from "../../api/app"
import ClientCard from "./ClientCard"
import { useNavigate } from "react-router-dom"

const ClientList =() => {
    const [clientList,setClientList] = useState([])
    const navigate = useNavigate()
    useEffect(() => {
        Application.getPatients().then((res) => {
            setClientList(res.data.patients_list_data)
        })
    },[])
    return (
        <>
        <div className="px-6 pt-8 ">
            {clientList.length> 0 ?
            <>
                <div className="w-full flex justify-between items-center">
                    <div className="text-Text-Primary font-medium opacity-[87%]">
                        Clients List
                    </div>
                    <ButtonSecondary onClick={() => {
                        navigate('/addClient')
                    }}>
                        <div>Add Client</div>
                    </ButtonSecondary>
                </div>
                <div className="w-full h-[1px] bg-white my-3"></div>

                <div className=" w-full flex flex-wrap gap-4">
                    {clientList.map((client:any) => {
                        return (
                            <ClientCard client={client}></ClientCard>
                        )
                    })}
                </div>
            </>
            :
            <>
                <div className="w-full h-[80vh] flex justify-center items-center">
                    <div>
                        <div className="flex justify-center">
                            <img src="./icons/EmptyState.svg" alt="" />

                        </div>
                        <div>
                            <ButtonSecondary onClick={() => {
                                navigate('/addClient')
                            }}>
                                <div className="w-[260px]">
                                    Add Client
                                </div>
                            </ButtonSecondary>
                        </div>
                    </div>
                </div>
            </>
            }
        </div>
        </>
    )
}

export default ClientList