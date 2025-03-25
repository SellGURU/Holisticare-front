/* eslint-disable @typescript-eslint/no-explicit-any */
interface ExerciseItemProps {
    index: number;
    exercise: any;
}

const ExerciseItem = ({index, exercise}: ExerciseItemProps) => {
    return (
        <>
            <div
            key={index}
            className="w-full min-h-[172px] h-[172px] border border-Gray-50 rounded-2xl bg-backgroundColor-Card p-3"
            >
            <div className="w-full flex items-center justify-between">
                <div className="flex items-center">
                <div className="relative">
                    <img
                    src="/images/activity/activity-demo.png"
                    alt=""
                    className="w-8 h-8 bg-cover rounded-lg mr-1"
                    />
                    <img
                    src="/icons/youtube.svg"
                    alt=""
                    className="w-[15.48px] h-[16px] absolute top-[8px] left-[9px]"
                    />
                </div>
                <div className="text-xs ml-2 font-medium text-Text-Primary">{exercise.Exercises[0].Exercise.Title}</div>
                </div>
                <img
                src="/icons/more.svg"
                alt=""
                className="w-4 h-4 cursor-pointer"
                />
            </div>
            <div>
                <div className='text-xs max-w-[450px] text-nowrap overflow-hidden text-ellipsis text-Text-Primary mt-2'><span className='font-medium text-Text-Secondary'>Instruction:</span> {exercise.Exercises[0].Exercise.Instruction}</div>
            </div>
            <div className="h-[25px]"></div>
            <div className='w-full h-[1px] bg-Gray-50 my-2'></div>
            <div className='flex justify-between items-center'>
                <div className='mt-2'>
                <div className='text-center text-[8px] text-Text-Primary'>set</div>
                <input type='number' className='w-[112px] px-3 text-center h-[24px] rounded-[8px] bg-white border border-gray-50 outline-none text-[10px] text-Text-Primary' />
                </div>
                <div className='mt-2'>
                <div className='text-center text-[8px] text-Text-Primary'>Reps</div>
                <input type='number' className='w-[112px] px-3 text-center h-[24px] rounded-[8px] bg-white border border-gray-50 outline-none text-[10px] text-Text-Primary' />
                </div>
                <div className='mt-2'>
                <div className='text-center text-[8px] text-Text-Primary'>setWeight</div>
                <input type='number' className='w-[112px] px-3 text-center h-[24px] rounded-[8px] bg-white border border-gray-50 outline-none text-[10px] text-Text-Primary' />
                </div>
                <div className='mt-2'>
                <div className='text-center text-[8px] text-Text-Primary'>Rest (min)</div>
                <input type='number' className='w-[112px] px-3 text-center h-[24px] rounded-[8px] bg-white border border-gray-50 outline-none text-[10px] text-Text-Primary' />
                </div>                                                                  
            </div>
            </div>        
        </>
    )
}

export default ExerciseItem