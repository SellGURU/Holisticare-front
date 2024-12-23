
/* eslint-disable @typescript-eslint/no-explicit-any */
interface ToggleProps {
    value:Array<string>
    active:string
    setActive:(value:string) => void
}
const Toggle:React.FC<ToggleProps> = ({value,active,setActive}) => {
    
    return (
        <>
            <div className=" bg-light-min-color dark:bg-[#272727] h-10 w-[240px] px-2 flex justify-between items-center rounded-[24px]">
                <div onClick={() => {
                    setActive(value[0])
                }} className={`text-[#1E1E1E] cursor-pointer ${active == value[0] ? ' bg-light-blue-active dark:bg-brand-primary-color':'dark:bg-[#2F2F2F] text-light-primary-text border-light-border-color dark:text-[#FFFFFFDE] border dark:border-[#383838]'}  w-[100px] h-[24px] rounded-[16px] flex justify-center items-center text-[12px]`}>{value[0]}</div>
                <div className="w-[1px] h-[17px] bg-[#383838] dark:bg-gray-400"></div>
                <div onClick={() => {
                    setActive(value[1])
                }} className={`text-[#1E1E1E] cursor-pointer ${active == value[1] ? ' bg-light-blue-active dark:bg-brand-primary-color':'dark:bg-[#2F2F2F] bg-light-input-color text-light-primary-text border-light-border-color dark:text-[#FFFFFFDE] border dark:border-[#383838]'}  w-[100px] h-[24px] rounded-[16px] flex justify-center items-center text-[12px]`}>{value[1]}</div>
            </div>        
        </>
    )
}
export default Toggle