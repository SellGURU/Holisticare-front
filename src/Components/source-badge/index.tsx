
interface SourceTagProps {
  source: string;
  isSmall?: boolean;
}
export const SourceTag = ({ source, isSmall }: SourceTagProps) => {
  return (
    <div style={{ backgroundColor: source === 'From Questionnaire' ? '#DEF7EC' : 
     source === 'From Lab Result' ? '#FFD8E4' : '#CADCFF' }} className={`rounded-full  flex items-center gap-[2px] text-[8px] text-Text-Primary ${isSmall ? 'h-2 p-1' : 'h-4 p-2 py-[10px]'}`}>
        <img src={source === 'From Questionnaire' ? '/icons/task-square-green.svg' : source === 'From Lab Result' ? '/icons/glass-red.svg' : '/icons/watch-status-blue-small.svg'} alt={source} className='w-4 h-4' />
        {
            !isSmall && (
                <div> {source}</div>
            )
        }
    </div>
  )
}
