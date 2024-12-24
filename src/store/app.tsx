/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, PropsWithChildren, useState } from "react";
interface User {
    age: number;                    // User's age (number)
    conditions: any[];               // Array of conditions, it can be any type (adjust this if you know the type of the conditions)
    email: string;                   // User's email (string)
    enroll_date: string;             // User's enrollment date (string)
    last_followup: string | null;     // Last follow-up date, it could be a string or null
    member_id: number;               // Member ID (number)
    name: string;                    // User's name (string)
    picture: string;                 // User's profile picture (string)
    progress: number | null;         // User's progress, could be a number or null
    score: number | null;            // User's score, could be a number or null
    sex: "male" | "female";          // User's sex, either 'male' or 'female'
    status: string | null;           // Status, could be a string or null
    weight: number | null;           // User's weight, could be a number or null
}

interface AppContextProp {
    permisions:any,
    token:string | null;
    isLoggedId:boolean;
    login: (token: string,permisions?:any) => void;
    logout:() => void
    user: any;
    setInformationUser: (data:User) => void;
}

export const AppContext = createContext<AppContextProp>({
    token:null,
    isLoggedId:false,
    login:() => {},
    permisions:{},
    logout:() => {},
    user: {},
    setInformationUser:()=>{}
})

const AppContextProvider =({children}:PropsWithChildren) => {
    const [token,setToken] = useState<string | null>(localStorage.getItem("token") || null)
    const [permisions,setPermisions] = useState(JSON.parse(localStorage.getItem("permisins") || '{}'))
    const [user, setUser] = useState<any>(); // New state for user data

    const logOut = () => {
      setToken("")
      setPermisions({})
      localStorage.clear()
    }
    const setInformationUser = (data:any) => {
        setUser(data)
    }
    const contextValue:AppContextProp = {
        token:token,
        logout:logOut,
        isLoggedId:!!token,

        login:(token:string,permisins?:any) =>{
            setToken(token)
            setPermisions(permisins)
            localStorage.setItem("permisins",JSON.stringify(permisins))
            localStorage.setItem("token",token)
        },
        permisions:permisions,
        user,
        setInformationUser
    }    
    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export default AppContextProvider;