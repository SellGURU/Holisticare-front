import { createBrowserRouter } from "react-router-dom";
import { Home, Report } from "../pages";
import ProtectedRoute from "./protected";
import Layout from "../layout";
import GenerateNewActionPlan from "../Components/Action-plan/GenerateNewPlan";
import PlanManagerModal from "../Components/Action-plan/sections/PLanManager";
import Login from "../pages/login";
import { Targeting } from "../Components/Action-plan/sections/Targeting";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute Component={Layout}></ProtectedRoute>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/report",
        element: <Report></Report>,
      },
      {
        path: "generateActionPlan/:id",
        element: <GenerateNewActionPlan></GenerateNewActionPlan>,
      },
      {
        path: "action-plan/orders/:id",
        element: <PlanManagerModal></PlanManagerModal>,
      },
      {
        path: "action-plan/targeting/:id",
        element: <Targeting></Targeting>
      }
    ],
  },
  {
    path: "/login",
    element: <Login></Login>,
  },
]);

export default router;
