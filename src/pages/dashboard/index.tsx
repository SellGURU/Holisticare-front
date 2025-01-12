import { NumberBoxes , MessageList, TaskManager} from "../../Components/DashBoardComponents"

const DashBoard =() => {
    return (
        <>
            <div className="px-6 pt-10">
                <NumberBoxes reports={[]}></NumberBoxes>     
                <div className="w-full mt-4 flex justify-between">
            <MessageList />
            <TaskManager/>
            <div className="min-w-[315px]"></div>
            </div>   
            </div>
           
        </>
    )
}

export default DashBoard