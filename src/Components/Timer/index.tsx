import React, { useState, useEffect } from 'react';
interface TimerProps {
    initialMinute:number
    initialSeconds:number
    oncomplete:() => void
}

const Timer:React.FC<TimerProps> = ({initialMinute,initialSeconds,oncomplete}) => {
    const [ minutes, setMinutes ] = useState(initialMinute);
    const [seconds, setSeconds ] =  useState(initialSeconds);
    useEffect(()=>{
        const myInterval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(myInterval)
                    oncomplete()
                } else {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                }
            } 
        }, 1000)
        return ()=> {
            clearInterval(myInterval);
        };
    });

    return (
        <div>
        { minutes === 0 && seconds === 0
            ? null
            : <h1 className='text-Text-Primary'> {minutes}:{seconds < 10 ?  `0${seconds}` : seconds}</h1> 
        }
        </div>
    )
}

export default Timer;