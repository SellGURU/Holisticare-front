import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages";
import ProtectedRoute from "./protected";
import Layout from "../layout";
import Login from "../pages/login";

const router = createBrowserRouter([
    {
        path:'/',
        element:<ProtectedRoute Component={Layout}></ProtectedRoute>,
        children:[
            {
                path:'/',
                element:<Home></Home>
            }
        ],
    },
    {
        path:'/login',
        element:<Login></Login>
    }
])

export default router