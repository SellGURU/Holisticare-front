import { createBrowserRouter, Navigate } from 'react-router-dom';
import {
  AddClient,
  AiKnowledge,
  SignUp,
  HtmlViewer,
  PatientResourceViewer,
  Playground,
  Messages,
  Setting,
  DashBoard,
  ForgetPassword,
  StaffRegister,
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
import RoleProtectedRoute from './roleProtected';
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
import CustomParametric from '../pages/CustomParametric/index.tsx';
import Activity from '../pages/Library/Activity/index.tsx';
import Supplement from '../pages/supplement/index.tsx';
import Lifestyle from '../pages/lifestyle/index.tsx';
import Diet from '../pages/diet/index.tsx';
import Peptide from '../pages/peptide/index.tsx';
import Other from '../pages/other/index.tsx';
import FHIRIntegration from '../pages/FHIRIntegration/index.tsx';
import SignUpNameLogo from '../pages/signUpNameLogo/index.tsx';
import PublicSurveyPage from '../pages/surveys/public/[id]/page.tsx';
import SurveyResponsesPage from '../pages/surveysView/page.tsx';
import JsonUploading from '../pages/JsonUploading/index.tsx';
import AdminLogin from '../pages/admin/Login.tsx';
import AdminProtectedRoute from './AdminProtected.tsx';
import AdminJsonUploading from '../pages/admin/JsonUploading.tsx';
import OverviewDashboard from '../pages/admin/OverviewDashboard.tsx';
import SessionInsights from '../pages/admin/SessionInsights.tsx';
import DataExplorer from '../pages/admin/DataExplorer.tsx';
import AdminConfig from '../pages/admin/AdminConfig.tsx';
import Clinics from '../pages/admin/Clinics.tsx';
import AdminDemoPatient from '../pages/admin/AdminDemoPatient.tsx';
import LlmPromptCatalog from '../pages/admin/LlmPromptCatalog.tsx';
import LlmCallLog from '../pages/admin/LlmCallLog.tsx';
import ClinicWorkspace from '../pages/admin/ClinicWorkspace.tsx';
import AIReportCopilot from '../pages/admin/AIReportCopilot.tsx';
import RookCsvComparison from '../pages/admin/RookCsvComparison.tsx';
import QuestionnaireManagement from '../pages/admin/QuestionnaireManagement.tsx';
import AdminIntelligenceModels from '../pages/admin/AdminIntelligenceModels.tsx';
import RouteErrorFallback from './RouteErrorFallback';
import LegalDocument from '../pages/legal/LegalDocument';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute Component={Layout}></ProtectedRoute>,
    errorElement: <RouteErrorFallback />,
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
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Staff />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/biomarkers',
            element: <CustomBiomarkers></CustomBiomarkers>,
          },
          {
            path: '/json-uploading',
            element: <JsonUploading></JsonUploading>,
          },
          {
            path: '/custom-branding',
            element: <CustomBranding></CustomBranding>,
          },
          {
            path: '/custom-parametric',
            element: <CustomParametric />,
          },
          {
            path: '/custom-parametric/:tab',
            element: <CustomParametric />,
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
            path: '/peptide',
            element: <Peptide></Peptide>,
          },
          {
            path: '/other',
            element: <Other></Other>,
          },
          {
            path: '/fhir-integration',
            element: <FHIRIntegration></FHIRIntegration>,
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
        errorElement: <RouteErrorFallback />,
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
    path: '/admin/login',
    element: <AdminLogin></AdminLogin>,
  },
  {
    path: '/admin',
    element: <AdminProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="overview" replace />,
      },
      {
        path: 'overview',
        element: <OverviewDashboard />,
      },
      {
        path: 'marketing',
        element: <Navigate to="/admin/overview" replace />,
      },
      {
        path: 'sessions',
        element: <SessionInsights />,
      },
      {
        path: 'explorer',
        element: <DataExplorer />,
      },
      {
        path: 'workspace',
        element: <ClinicWorkspace />,
      },
      {
        path: 'reports',
        element: <AIReportCopilot />,
      },
      {
        path: 'config',
        element: <AdminConfig />,
      },
      {
        path: 'clinics',
        element: <Clinics />,
      },
      {
        path: 'demo-patient',
        element: <AdminDemoPatient />,
      },
      {
        path: 'questionnaires',
        element: <QuestionnaireManagement />,
      },
      {
        path: 'intelligence-models',
        element: <AdminIntelligenceModels />,
      },
      {
        path: 'llm-prompts',
        element: <LlmPromptCatalog />,
      },
      {
        path: 'llm-calls',
        element: <LlmCallLog />,
      },
      {
        path: 'json-uploading',
        element: <AdminJsonUploading />,
      },
      {
        path: 'rook-csv-comparison',
        element: <RookCsvComparison />,
      },
    ],
  },
  {
    path: '/register',
    element: <SignUp></SignUp>,
  },
  {
    path: '/privacy',
    element: <LegalDocument kind="privacy" audience="provider" />,
  },
  {
    path: '/terms',
    element: <LegalDocument kind="terms" audience="provider" />,
  },
  {
    path: '/legal/providers-privacy-policy',
    element: <LegalDocument kind="privacy" audience="provider" />,
  },
  {
    path: '/legal/providers-terms-of-service',
    element: <LegalDocument kind="terms" audience="provider" />,
  },
  {
    path: '/staff/register',
    element: <StaffRegister></StaffRegister>,
  },
  {
    path: '/register-profile',
    element: (
      <ProtectedRoute
        Component={() => (
          <RoleProtectedRoute allowedRoles={['admin']}>
            <SignUpNameLogo />
          </RoleProtectedRoute>
        )}
      />
    ),
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
    path: '/patient-resource',
    element: <PatientResourceViewer />,
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
