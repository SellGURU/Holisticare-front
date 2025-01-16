import * as yup from "yup";

const YoupValidation = (type:string) => {
    if(type == 'email') {
        return yup.string().email("Enter a valid email").required("Email is required")
    }
    if(type == 'password'){
        return  yup.string()
                .min(8, "Password must be at least 8 characters")
                .matches(/[a-z]/, "Password must contain at least one lowercase letter")
                .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
                .matches(/[0-9]/, "Password must contain at least one number")
                .matches(/[@$!%*?&#]/, "Password must contain at least one special character")
                .required("Password is required")
    }
    return yup.string()
}

export default YoupValidation