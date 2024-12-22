import { createBrowserRouter } from "react-router-dom";
import { Home, Report } from "../pages";
import ProtectedRoute from "./protected";
import Layout from "../layout";
import GenerateNewActionPlan from "../Components/Action-plan/GenerateNewPlan";
import PlanManagerModal from "../Components/Action-plan/sections/PLanManager";
import Login from "../pages/login";
import { Targeting } from "../Components/Action-plan/sections/Targeting";
import GenerateCalendar from "../Components/Action-plan/sections/generatecalendar";
import { ClientList } from "../Components";
import AddClient from "../pages/addClient";
import { TreatmentPlan } from "../Components/TreatmentPlan";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute Component={Layout}></ProtectedRoute>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
        children:[
          {
            path:'/',
            element:<ClientList></ClientList>
          }
        ]
      },
      {
        path: "/report/:id",
        element: <Report></Report>,
      },
      {
        path: 'treatment-plan',
        element : <TreatmentPlan></TreatmentPlan>
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
      },
      {
        path: "action-plan/edit/:id",
        element: <GenerateCalendar></GenerateCalendar>
      },
      {
        path:'addClient',
        element:<AddClient></AddClient>
      }
    ],
  },
  {
    path: "/login",
    element: <Login></Login>,
  },
]);

export default router;
