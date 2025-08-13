/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
type ValidationField = "Instructions" | ""
class ValidationForms {
    public static IsvalidField(name:ValidationField, value:any) {
        switch (name) {
            case "Instructions":
                return this.validationInstructions(value);
            default:
                return false;
        }
    }
    public static ValidationText(name:ValidationField, value:any) {    
        switch (name) {
            case "Instructions":
                return this.validationInstructionsText(value);
            default:
                return "";
        }
    
    
    }
    



    // Instructions
    private static validationInstructions(value:any) {
        // required field
        if (value.length >0) {
            return true;
        }
        return false;
    }
    private static validationInstructionsText(value:any) {
        if (value.length ==0) {  
            return "Instructions is required";
        }
        return ""
        
    }
    
}

export default ValidationForms;