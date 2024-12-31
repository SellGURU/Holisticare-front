import { createBrowserRouter } from "react-router-dom";
import { Home, Report } from "../pages";
import ProtectedRoute from "./protected";
import Layout from "../layout";
import GenerateNewActionPlan from "../Components/Action-plan/GenerateNewPlan";
// import PlanManagerModal from "../Components/Action-plan/sections/PLanManager";
import Login from "../pages/login";
import { Targeting } from "../Components/Action-plan/sections/Targeting";
import GenerateCalendar from "../Components/Action-plan/sections/generatecalendar";
import { ClientList } from "../Components";
import AddClient from "../pages/addClient";
import GenerateNewPlan from "../pages/generateTreatmentPlan";
import { DriftAnaysis } from "../pages/driftAnaysis";
import AiKnowledge from "../pages/ai-knowledge/AiKnowledge.tsx";

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
          },
          {
            path:'/drift-analysis',
            element:<DriftAnaysis></DriftAnaysis>
          },
          {
            path: "/aiKnowledge",
            element: <AiKnowledge></AiKnowledge>,
          },
        ]
      },
      {
        path: "/report/:id/:name",
        element: <Report></Report>,
      },
      
      {
        path: "report/Generate-Action-Plan/:id",
        element: <GenerateNewActionPlan></GenerateNewActionPlan>,
      },
      {
        path:'report/Generate-Holistic-Plan/:id',
        element:<GenerateNewPlan></GenerateNewPlan>
      },
      // {
      //   path: "action-plan/orders/:id",
      //   element: <PlanManagerModal dataVal={}></PlanManagerModal>,
      // },
      {
        path: "action-plan/targeting/:id/:blackId",
        element: <Targeting></Targeting>
      },
      {
        path: "action-plan/edit/:id/:blackId",
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
