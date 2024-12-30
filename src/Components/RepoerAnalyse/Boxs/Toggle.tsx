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
                <div className={`w-5 h-5  ${checked?'right-0 bg-Primary-EmeraldGreen':'left-0 bg-backgroundColor-Main'} absolute top-[-4px] rounded-full`}></div>
                <div className={`w-8 h-3 ${checked?'bg-gray-50':'bg-gray-50'}  border border-gray-50 rounded-[16px]`}></div>
            </div>
        </>
    )
}

export default Toggle