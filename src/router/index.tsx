import { createBrowserRouter } from "react-router-dom";
import {Home, TreatmentPlan} from "../pages";
import ProtectedRoute from "./protected";
import Layout from "../layout";

const router = createBrowserRouter([
    {
        path:'/',
        element:<ProtectedRoute Component={Layout}></ProtectedRoute>,
        children:[
            {
                path:'/',
                element:<Home></Home>
            },
            {
                path:'/TreatmentPlan',
                element:<TreatmentPlan></TreatmentPlan>
            },
        ]
    }
])

export default router