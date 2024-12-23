/* eslint-disable @typescript-eslint/no-explicit-any */
import Tag from "../../../Components/Tag"
interface BioMarkerBoxProps {
    data:any,
    onCheck:() => void,
    onClick:() => void
    isActive?:boolean
}

const BioMarkerBox:React.FC<BioMarkerBoxProps> =({data,onCheck,onClick,isActive}) => {
    const resolveTitle =() => {
        if(data.category.length> 30){
            return data.category.substring(0,30)+ ' ...'
        }else {
            return data.category
        }
    }

    const resolveIcon =(name:string) => {
        if(name == 'Cardiovascular and Respiratory Health'){
            return './images/report/heart.svg'
        }
        if(name == 'Organ Health and Function'){
            return './images/report/abdomil.svg'
        }    
        if(name == 'Urinary Health'){
            return './images/report/virus.svg'
        }    
        if(name == 'Metabolic and Nutritional Health'){
            return './images/report/intestine.svg'
        }    
        if(name == 'Immune, Inflammation, and Hormonal Health'){
            return './images/report/muscle.svg'
        }                                
        // ./images/report/intestine.svg"
        // ./images/report/muscle.svg
        // ./images/report/virus.svg
        return './images/report/heart.svg'
    }
    return (
        <>
            <div className="flex justify-start items-center">
                <input onClick={() => {
                    onCheck()
                }} checked={data.checked} type="checkbox"  className="mr-2 peer shrink-0 appearance-none w-6 h-6 rounded-md bg-light-input-color dark:bg-black-primary border border-light-border-color dark:border-main-border checked:dark:bg-brand-secondary-color checked:bg-light-blue-active checked:border-transparent checked:text-black checked:before:content-['✔'] checked:before:text-black checked:before:block checked:before:text-center" />                                
                <div onClick={() => {
                    onClick()
                }} className={` ${isActive?'border-light-blue-active dark:border-brand-primary-color':' border-light-border-color dark:border-[#383838]'} dark:bg-[#272727] w-[360px] cursor-pointer flex justify-start gap-2 items-center p-[12px] h-[64px] rounded-[6px] border `}>
                    <div className="w-10 h-10 rounded-full flex justify-center items-center border-2 border-primary-color">
                        <img className="invert dark:invert-0" src={resolveIcon(data.category)} alt="" />
                    </div>
                    <div>
                        <div className="flex">
                            <div className="textStyle-type2 w-[207px]">{resolveTitle()}</div>
                            {data.tags.length > 0&&
                                <div className="ml-1">
                                    <Tag value={data.tags[0]}></Tag>
                                </div>
                            }
                        </div>
                        <div className="flex justify-between items-center">
                            <div className=" text-light-secandary-text dark:text-[#FFFFFF99] text-[10px]">
                                <span className="text-[12px]text-light-secandary-text dark:text-[#FFFFFFDE]">{data.total_biomarkers}</span> Total Biomarkers <span className="ml-2 text-[12px]text-light-secandary-text dark:text-[#FFFFFFDE]">{data.total_needs_focus}</span> Needs Focus
                     
                            </div>
                            {data.tags.length > 1&&
                                <div className="ml-1">
                                    <Tag value={data.tags[1]}></Tag>
                                </div>
                            }   
                        </div>
                    </div>
                </div>
            </div>        
        </>
    )
}

export default BioMarkerBox