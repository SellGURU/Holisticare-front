import { createBrowserRouter } from 'react-router-dom';
import { DashBoard, Home, Report, Share, Tasks } from '../pages';
import ProtectedRoute from './protected';
import Layout from '../layout';
// import GenerateNewActionPlan from '../Components/Action-plan/GenerateNewPlan';
// import PlanManagerModal from "../Components/Action-plan/sections/PLanManager";
import Login from '../pages/login/index2';
import { Targeting } from '../Components/Action-plan/sections/Targeting';
import GenerateCalendar from '../Components/Action-plan/sections/generatecalendar';
import { ClientList } from '../Components';
import AddClient from '../pages/addClient';
// import GenerateNewPlan from '../pages/generateTreatmentPlan';
import { DriftAnaysis } from '../pages/driftAnaysis';
import AiKnowledge from '../pages/ai-knowledge/AiKnowledge.tsx';
import SignUp from '../pages/signUp/index2.tsx';
import ForgetPassword from '../pages/forgetPassword/index.tsx';
import Messages from '../pages/messages/index.tsx';
import Setting from '../pages/settings/index.tsx';
import Reports from '../pages/reports/index.tsx';
import { Client } from '../pages/driftAnaysis/Client.tsx';
import Forms from '../pages/forms/index.tsx';
import { GenerateRecommendation } from '../pages/generateRecommendation/index.tsx';
import NewGenerateHolisticPlan from '../pages/NewGenerateHolisticPlan/index.tsx';
// import NewGenerateActionPlan from '../Components/NewGenerateActionPlan/index.tsx';
import GenerateActionPlan from '../Components/NewGenerateActionPlan/index2.tsx';
// import Checkin from '../pages/CheckIn/index.tsx';
import NewForms from '../pages/NewForms/index.tsx';
import PackagePage from '../pages/settings/components/Package.tsx';
import Staff from '../pages/staff/index.tsx';
import CustomBiomarkers from '../pages/CustomBiomarkers.tsx/index.tsx';
import FormView from '../pages/CheckIn/FormView.tsx';
import CustomBranding from '../pages/CustomBranding/index.tsx';
import Activity from '../pages/Library/Activity/index.tsx';
import Supplement from '../pages/supplement/index.tsx';
import Lifestyle from '../pages/lifestyle/index.tsx';
import Diet from '../pages/diet/index.tsx';
import SignUpNameLogo from '../pages/signUpNameLogo/index.tsx';
const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute Component={Layout}></ProtectedRoute>,
    children: [
      {
        path: '/',
        element: <Home></Home>,
        children: [
          {
            path: '/',
            element: <ClientList></ClientList>,
          },
          {
            path: '/dashboard',
            element: <DashBoard></DashBoard>,
          },
          {
            path: '/drift-analysis',
            element: <DriftAnaysis></DriftAnaysis>,
          },

          {
            path: '/aiKnowledge',
            element: <AiKnowledge></AiKnowledge>,
          },
          {
            path: '/messages',
            element: <Messages></Messages>,
          },
          {
            path: '/setting',
            element: <Setting></Setting>,
          },
          {
            path: '/packages',
            element: <PackagePage></PackagePage>,
          },
          {
            path: '/reports',
            element: <Reports></Reports>,
          },
          {
            path: '/forms2',
            element: <Forms></Forms>,
          },
          {
            path: '/forms',
            element: <NewForms></NewForms>,
          },
          {
            path: '/staff',
            element: <Staff></Staff>,
          },
          {
            path: '/biomarkers',
            element: <CustomBiomarkers></CustomBiomarkers>,
          },
          {
            path: '/custom-branding',
            element: <CustomBranding></CustomBranding>,
          },
          // library
          {
            path: '/activity',
            element: <Activity></Activity>,
          },
          {
            path: '/supplement',
            element: <Supplement></Supplement>,
          },
          {
            path: '/lifestyle',
            element: <Lifestyle></Lifestyle>,
          },
          {
            path: '/diet',
            element: <Diet></Diet>,
          },
        ],
      },
      {
        path: '/drift-analysis/client/:name/:id',
        element: <Client></Client>,
      },
      {
        path: '/report/:id/:name',
        element: <Report></Report>,
      },

      {
        path: 'report/Generate-Action-Plan/:id',
        element: <GenerateActionPlan></GenerateActionPlan>,
      },
      {
        path: 'report/Generate-Holistic-Plan/:id',
        element: <NewGenerateHolisticPlan></NewGenerateHolisticPlan>,
      },
      {
        path: 'report/Generate-Recommendation/:id',
        element: <GenerateRecommendation></GenerateRecommendation>,
      },
      // {
      //   path: "action-plan/orders/:id",
      //   element: <PlanManagerModal dataVal={}></PlanManagerModal>,
      // },
      {
        path: 'action-plan/targeting/:id/:blackId',
        element: <Targeting></Targeting>,
      },
      {
        path: 'action-plan/edit/:id/:blackId',
        element: <GenerateCalendar></GenerateCalendar>,
      },
      {
        path: 'addClient',
        element: <AddClient></AddClient>,
      },
    ],
  },
  {
    path: '/share/:id/:name',
    element: <Share></Share>,
  },
  {
    path: '/login',
    element: <Login></Login>,
  },
  {
    path: '/register',
    element: <SignUp></SignUp>,
  },
  {
    path: '/register-profile',
    element: <SignUpNameLogo></SignUpNameLogo>,
  },
  {
    path: '/forgetPassword',
    element: <ForgetPassword></ForgetPassword>,
  },
  {
    path: '/checkin/:encode/:id',
    element: <FormView mode="checkin"></FormView>,
  },
  {
    path: '/questionary/:encode/:id',
    element: <FormView mode="questionary"></FormView>,
  },
  {
    path: '/tasks',
    element: <Tasks></Tasks>,
  },
]);

export default router;
