import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages";
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
            }
        ]
    }
])

export default router