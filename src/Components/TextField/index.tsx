interface TextFieldProps  extends React.InputHTMLAttributes<HTMLInputElement> {
    label?:string
}

const TextField:React.FC<TextFieldProps> = ({label,...props}) => {
    return (
        <>
            <div>
                <label className="text-Text-Primary  text-[12px] font-medium">{label}</label>
                <input type="text" className="w-full h-[28px] rounded-[16px] mt-1 border placeholder:text-gray-400 text-[12px] px-3 outline-none border-gray-50 shadow-300" {...props}/>
            </div>
        </>
    )
}

export default TextField