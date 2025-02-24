import { useState } from "react"
import SearchBox from "../../SearchBox"
import LibBox from "./LibBox"

const Stadio = () => {
    const [selectCategory,setSelectedCategory] = useState("Diet")
    const AllCategories = ['Diet','Activity','Supplement','Lifestyle']
    return (
        <>
            <div className="flex px-6">
                <div className="flex-grow"></div>
                <div className="w-[342px] p-4 min-h-[200px] bg-white rounded-[24px] border border-gray-50 shadow-100">
                    <SearchBox
                        ClassName="rounded-2xl border shadow-none h-[40px] bg-white md:min-w-full"
                        placeHolder="Search for actions ..."
                        onSearch={() => {}}
                    ></SearchBox>
                    <div>
                        <div className="flex w-full gap-2 text-center items-center justify-between mt-2 flex-wrap">
                            {AllCategories.map((cat) => {
                                return (
                                    <>
                                        <div
                                        className={`${selectCategory === cat ? 'bg-[linear-gradient(89.73deg,_rgba(0,95,115,0.5)_-121.63%,_rgba(108,194,74,0.5)_133.18%)] text-Primary-DeepTeal' : 'bg-backgroundColor-Main text-Text-Primary'} px-4 py-2 rounded-2xl text-[10px] flex-grow cursor-pointer`}
                                        onClick={() => setSelectedCategory(cat)}
                                        >
                                        {cat}
                                        </div>                                     
                                    </>
                                )
                            })}
                        </div>        
                        <div className="mt-2">
                            <LibBox>

                            </LibBox>
                        </div>                
                    </div>
                </div>
            </div>
        </>
    )
}

export default Stadio