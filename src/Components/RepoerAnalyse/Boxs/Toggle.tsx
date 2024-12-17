interface ToggleProps {
 checked:boolean   
 setChecked:(action:boolean) => void
}
const Toggle:React.FC<ToggleProps> = ({checked,setChecked}) => {
    return (
        <>
            <div onClick={() => {
                setChecked(!checked)
            }} className="relative">
                <div className={`w-5 h-5  ${checked?'right-0 bg-[#03DAC5]':'left-0 bg-[#F5F7FA]'} absolute top-[-4px] rounded-full`}></div>
                <div className="w-8 h-3 bg-light-overlay dark:bg-[#383838] rounded-[16px]"></div>
            </div>
        </>
    )
}

export default Toggle