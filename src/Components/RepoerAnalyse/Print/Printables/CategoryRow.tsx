/* eslint-disable @typescript-eslint/no-explicit-any */
import SummaryBoxPrint from "../SummaryBoxPrint"

interface CategoryRowProps {
    contents:Array<any>
}

const CategoryRow:React.FC<CategoryRowProps> = ({contents}) => {
    return (
        <>
            <div
              className="grid grid-cols-2  relative  gap-4 mt-4"
              style={{ zIndex: 60 }}
            >
                {contents.map((el) => {
                    return (
                        <SummaryBoxPrint data={el}></SummaryBoxPrint>
                    )
                })}
            </div>        
        </>
    )
}

export default CategoryRow