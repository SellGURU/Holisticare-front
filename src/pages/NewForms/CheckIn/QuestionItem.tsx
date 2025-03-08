import { useState } from "react"

interface QuestionItemProps {
    question:checkinType
    index?:number
    onRemove:() => void
}

const QuestionItem:React.FC<QuestionItemProps> = ({
    question,index,onRemove
}) => {
    const [sureRemove,setSureRemove] = useState(false)
    return (
        <>
        <div className="flex items-center justify-between w-full h-[36px] py-2 px-4 bg-backgroundColor-Card rounded-xl border border-Gray-50">
        <div className="text-Text-Quadruple text-[10px] w-[60%]">
            {index!=undefined?index+1:''}
            {'  '}
            {question.question}
        </div>
        <div className="flex items-center justify-between w-[40%]">
            <div className="text-Orange text-[8px] flex items-center justify-center w-[41%]">
            {question.required ? (
                <img
                src="./icons/danger-new.svg"
                alt=""
                className="w-[12px] h-[12px] mr-1"
                />
            ) : (
                ''
            )}
            {question.required ? 'Required' : ''}
            </div>
            <div className="text-Text-Quadruple text-[10px] w-[30%] flex items-center justify-center text-nowrap">
            {question.type}
            </div>
            <div
            className={`flex items-center justify-end ${sureRemove ? 'w-[35%]' : 'w-[24%]'}`}
            >
            <>
            {sureRemove ? (
                <div className="flex items-center justify-center gap-1 ml-4">
                <div className="text-Text-Quadruple text-xs">Sure?</div>
                <img
                    src="/icons/tick-circle-green.svg"
                    alt=""
                    className="w-[20px] h-[20px] cursor-pointer"
                    onClick={() =>onRemove()}
                />
                <img
                    src="/icons/close-circle-red.svg"
                    alt=""
                    className="w-[20px] h-[20px] cursor-pointer"
                    onClick={() => setSureRemove(false)}
                />
                </div>
            ) : (
                <>
                <img
                    src="./icons/edit-blue.svg"
                    alt=""
                    className="w-[16px] h-[16px] cursor-pointer"
                    // onClick={() => handleEdit(index)}
                />
                <img
                    src="./icons/trash-blue.svg"
                    alt=""
                    className="w-[16px] h-[16px] ml-2 cursor-pointer"
                    onClick={() => setSureRemove(true)}
                />
                </>
            )}
            </>
            </div>
        </div>
        </div>        
        </>
    )
}

export default QuestionItem