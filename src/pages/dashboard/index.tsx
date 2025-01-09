import { NumberBoxes , MessageList} from "../../Components/DashBoardComponents"

const DashBoard =() => {
    return (
        <>
            <div className="px-6 pt-10">
                <NumberBoxes reports={[]}></NumberBoxes>     
                <div className="w-full mt-4 flex justify-between">
            <MessageList />
            </div>   
            </div>
           
        </>
    )
}

export default DashBoard