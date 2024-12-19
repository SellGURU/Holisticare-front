import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages";
import ProtectedRoute from "./protected";
import Layout from "../layout";
import GenerateNewActionPlan from "../Components/Action-plan/GenerateNewPlan";
import PlanManagerModal from "../Components/Action-plan/sections/PLanManager";

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
                path:'generateActionPlan/:id',
                element:<GenerateNewActionPlan></GenerateNewActionPlan>
            },{
                path: 'action-plan/orders/:id',
                element: <PlanManagerModal></PlanManagerModal>
            }
        ]
    }
])

export default router