import { NumberBoxes , MessageList, Tasks, Clients, Reminder, Employes} from "../../Components/DashBoardComponents"

const DashBoard =() => {
    return (
        <>
            <div className="px-6 py-10">
                <NumberBoxes reports={[]}></NumberBoxes>     
                <div className="w-full mt-4 grid gap-4 grid-cols-4">
                    <MessageList />
                    <div className="col-span-2 grid gap-4">
                        <Tasks></Tasks>
                        <Clients></Clients>
                    </div>
                    <div className=" grid gap-4">
                        <Reminder></Reminder>
                        <Employes></Employes>
                    </div>
                </div>   
            </div>
           
        </>
    )
}

export default DashBoard