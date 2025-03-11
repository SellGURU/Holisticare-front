import Checkin from "."

const FormView = () => {
    const formData = {
    "title": "Daily Check in",
    "questions": [
        {
            "type": "paragraph",
            "question": "Did you stick to the Meal Plan?",
            "required": false,
            "response": "",
            "placeHolder":"Write the snacks you took ..."
        },
        {
            "type": "Scale",
            "question": "How many hours did you sleep yesterday?",
            "required": false,
            "response": ""
        },
        {
            "type": "Emojis",
            "question": "How are you feeling today?",
            "required": false,
            "response": ""
        },
        {
            "type": "Star Rating",
            "question": "Rate your workout.",
            "required": false,
            "response": ""
        },
        {
            "type": "File Uploader",
            "question": "Upload your progress pictures.",
            "required": false,
            "response": ""
        },
        {
            "type": "paragraph",
            "question": "What snacks did you take today?",
            "required": false,
            "response": "",
            "placeHolder":"Write the snacks you took ..."
        },
        {
            "type": "paragraph",
            "question": "How many hours did you work today?(Dropdown sample)",
            "required": false,
            "response": "",
            "placeHolder":"Write the snacks you took ..."
        }
    ]
    }
    return (
        <>
            <div className="w-full py-3 px-4 h-svh overflow-y-scroll">
                <Checkin upData={formData.questions}></Checkin>

            </div>
        </>
    )
}

export default FormView