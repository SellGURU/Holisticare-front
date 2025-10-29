import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../pages';
import ProtectedRoute from './protected';
import Layout from '../layout';
// import GenerateNewActionPlan from '../Components/Action-plan/GenerateNewPlan';
// import PlanManagerModal from "../Components/Action-plan/sections/PLanManager";
import Login from '../pages/login/index2';
// import { Targeting } from '../Components/Action-plan/sections/Targeting';
// import GenerateCalendar from '../Components/Action-plan/sections/generatecalendar';
// import { ClientList } from '../Components';

import MaintenancePage from '../pages/maintenance/index.tsx';
import ClinicList from '../Components/ClinicList/index.tsx';
import LogDetails from '../pages/LogDetails/index.tsx';
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
            element: <ClinicList></ClinicList>,
          },
          {
            path: '/log/:id',
            element: <LogDetails></LogDetails>,
          },
          // {
          //   path: '/dashboard',
          //   element: <DashBoard></DashBoard>,
          // },
          // {
          //   path: '/drift-analysis',
          //   element: <DriftAnaysis></DriftAnaysis>,
          // },

          // {
          //   path: '/aiKnowledge',
          //   element: <AiKnowledge></AiKnowledge>,
          // },
          // {
          //   path: '/messages',
          //   element: <Messages></Messages>,
          // },
          // {
          //   path: '/setting',
          //   element: <Setting></Setting>,
          // },
          // {
          //   path: '/packages',
          //   element: <PackagePage></PackagePage>,
          // },
          // {
          //   path: '/reports',
          //   element: <Reports></Reports>,
          // },
          // {
          //   path: '/forms2',
          //   element: <Forms></Forms>,
          // },
          // {
          //   path: '/forms',
          //   element: <NewForms></NewForms>,
          // },
          // {
          //   path: '/staff',
          //   element: <Staff></Staff>,
          // },
          // {
          //   path: '/biomarkers',
          //   element: <CustomBiomarkers></CustomBiomarkers>,
          // },
          // {
          //   path: '/custom-branding',
          //   element: <CustomBranding></CustomBranding>,
          // },
          // library
          // {
          //   path: '/activity',
          //   element: <Activity></Activity>,
          // },
          // {
          //   path: '/supplement',
          //   element: <Supplement></Supplement>,
          // },
          // {
          //   path: '/lifestyle',
          //   element: <Lifestyle></Lifestyle>,
          // },
          // {
          //   path: '/diet',
          //   element: <Diet></Diet>,
          // },
          // {
          //   path: 'playground',
          //   element: <Playground></Playground>,
          // },
        ],
      },
      // {
      //   path: '/drift-analysis/client/:name/:id',
      //   element: <Client></Client>,
      // },
      // {
      //   path: '/report/:id/:name',
      //   element: <Report></Report>,
      // },

      // {
      //   path: 'report/Generate-Action-Plan/:id',
      //   element: <GenerateActionPlan></GenerateActionPlan>,
      // },
      // {
      //   path: 'report/Generate-Holistic-Plan/:id',
      //   element: <NewGenerateHolisticPlan></NewGenerateHolisticPlan>,
      // },
      // {
      //   path: 'report/Generate-Recommendation/:id',
      //   element: <GenerateRecommendation></GenerateRecommendation>,
      // },
      // {
      //   path: "action-plan/orders/:id",
      //   element: <PlanManagerModal dataVal={}></PlanManagerModal>,
      // },
      // {
      //   path: 'action-plan/targeting/:id/:blackId',
      //   element: <Targeting></Targeting>,
      // },
      // {
      //   path: 'action-plan/edit/:id/:blackId',
      //   element: <GenerateCalendar></GenerateCalendar>,
      // },
      // {
      //   path: 'addClient',
      //   element: <AddClient></AddClient>,
      // },
    ],
  },
  // {
  //   path: '/share/:id/:name',
  //   element: <Share></Share>,
  // },
  {
    path: '/login',
    element: <Login></Login>,
  },
  // {
  //   path: '/register',
  //   element: <SignUp></SignUp>,
  // },
  // {
  //   path: '/register-profile',
  //   element: <SignUpNameLogo></SignUpNameLogo>,
  // },
  // {
  //   path: '/forgetPassword',
  //   element: <ForgetPassword></ForgetPassword>,
  // },
  // {
  //   path: '/checkin/:encode/:id',
  //   element: <FormView mode="checkin"></FormView>,
  // },
  // {
  //   path: '/questionary/:encode/:id',
  //   element: <FormView mode="questionary"></FormView>,
  // },
  // {
  //   path: '/tasks/:encode/:id',
  //   element: <Tasks></Tasks>,
  // },
  // {
  //   path: '/surveys/:member-id/:q-id',
  //   element: <PublicSurveyPage></PublicSurveyPage>,
  // },
  // {
  //   path: '/surveys-view/:member-id/:q-id',
  //   element: <SurveyResponsesPage></SurveyResponsesPage>,
  // },
  {
    path: '/maintenance',
    element: <MaintenancePage></MaintenancePage>,
  },
]);

export default router;
