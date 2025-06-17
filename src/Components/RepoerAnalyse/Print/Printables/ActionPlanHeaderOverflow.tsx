const AddActionPlanHeaderOverflow =() => {
    return (
        <>
        <div className="relative" style={{ zIndex: 60 }}>
            <div className="w-full  bg-white rounded-md py-4 px-3 flex justify-between items-center">
            <div
                className="text-gray-700 font-medium "
                style={{ width: 200, fontSize: 12, color: '#383838' }}
            >
                Category
            </div>
            <div
                className="text-gray-700 text-center font-medium "
                style={{ fontSize: 12, width: '80px', color: '#383838' }}
            >
                	
                Title
            </div>
            <div
                className="text-gray-700 text-center font-medium "
                style={{ fontSize: 12, width: '80px', color: '#383838' }}
            >
                Frequency
            </div>

            </div>
        </div>        
        </>
    )
}

export default AddActionPlanHeaderOverflow