import { createBrowserRouter } from 'react-router-dom';
import {
  AddClient,
  AiKnowledge,
  SignUp,
  HtmlViewer,
  Playground,
  Messages,
  Setting,
  DashBoard,
  ForgetPassword,
  DriftAnaysis,
  Home,
  Report,
  Login,
  Share,
  Tasks,
  ClientList,
  MaintenancePage,
  NotFound,
} from '../pages';
import ProtectedRoute from './protected';
import Layout from '../layout';
import { Client } from '../pages/driftAnaysis/Client.tsx';
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
import PublicSurveyPage from '../pages/surveys/public/[id]/page.tsx';
import SurveyResponsesPage from '../pages/surveysView/page.tsx';

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
          {
            path: 'playground',
            element: <Playground></Playground>,
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
        path: 'report/Generate-Holistic-Plan/:id/:treatment_id',
        element: <NewGenerateHolisticPlan></NewGenerateHolisticPlan>,
      },
      {
        path: 'report/Generate-Recommendation/:id/:treatment_id',
        element: <GenerateRecommendation></GenerateRecommendation>,
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
    path: '/questionary/:encode/:id/:f-id',
    element: <FormView mode="questionary"></FormView>,
  },
  {
    path: '/tasks/:encode/:id',
    element: <Tasks></Tasks>,
  },
  {
    path: '/surveys/:member-id/:q-id/:f-id/:action',
    element: <PublicSurveyPage></PublicSurveyPage>,
  },
  {
    path: '/surveys-view/:member-id/:q-id/:f-id',
    element: <SurveyResponsesPage></SurveyResponsesPage>,
  },
  {
    path: '/html-previewer/:id',
    element: <HtmlViewer></HtmlViewer>,
  },
  {
    path: '/maintenance',
    element: <MaintenancePage></MaintenancePage>,
  },
  {
    path: '*',
    element: <NotFound></NotFound>,
  },
]);

export default router;
