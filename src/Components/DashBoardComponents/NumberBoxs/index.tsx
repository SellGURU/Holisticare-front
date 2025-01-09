/* eslint-disable @typescript-eslint/no-explicit-any */
import NumberBox from "../../NumberBox"
interface NumberBoxesProps {
  reports:Array<any>
}

const NumberBoxes:React.FC<NumberBoxesProps> = ({reports}) => {
    const resolveValue =(key:string) => {
      if(reports.length > 0){
        return reports.filter((e) => e.key == key)[0].value
      }
      return 0
    }    
    return (
        <>
          <div
            className={
              "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3  md:gap-4 w-full h-full"
            }
          >
            <NumberBox
              mode="added"
              value={resolveValue("Total Enrollment")}
              title="Total Enrollment"
              icon={'/icons/profile-tick.svg'}

            />
            <NumberBox
              mode="increase"
              value={resolveValue("Incomplete Client Data")}
              title="Incomplete Client Data"
              icon={'icons/profile-delete.svg'}

            />
            <NumberBox
              mode="reduction"
              value={resolveValue("Client Needs Check")}
              title="Client Need Checking"
              icon={'icons/profile-check.svg'}
            />
            <NumberBox
              mode="increase"
              value={resolveValue("Client Checked")}
              title="Clients Checked"
              icon={'/icons/profile-tick.svg'}

            />
          </div>        
        </>
    )
}

export default NumberBoxes