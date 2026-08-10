import type { Page, Route } from '@playwright/test';

export const FIXTURE_PATIENT = {
  member_id: 900001,
  name: 'Cleanup Fixture Patient',
  email: 'cleanup.fixture@example.com',
  picture: '',
  favorite: false,
  refresh_in_progress: false,
  drift_analyzed: false,
  archived: false,
  status: 'checked',
  age: 42,
  sex: 'female',
  score: 80,
  progress: 50,
  weight: 70,
  enroll_date: '2026-01-15',
  last_followup: '2026-07-01',
  last_checkin: '2026-07-20',
  assigned_to: ['Cleanup Coach'],
  'Check-in': 'Done',
  Questionary: 'Done',
};

export const FIXTURE_DASHBOARD_STATS = [
  { title: 'Total Enrollment', number: 12 },
  { title: 'Incomplete Client Data', number: 3 },
  { title: 'Client Needs Check', number: 2 },
  { title: 'Client Checked', number: 7 },
];

export const FIXTURE_TOKEN = {
  access_token: 'cleanup-e2e-portal-token',
  token_type: 'bearer',
  permission: { role: 'coach', clinic_id: 1 },
};

export const FIXTURE_CHECKIN_FORM = {
  title: 'Cleanup Check-in Form',
  questions: 1,
  created_on: '08/01/2026',
  created_by: 'Cleanup Coach',
  id: 'cleanup-checkin-form-1',
  time_required: 5,
};

export const FIXTURE_QUESTIONARY_FORM = {
  title: 'Cleanup Questionnaire Form',
  questions: 2,
  created_on: '08/01/2026',
  created_by: 'Cleanup Coach',
  id: 'cleanup-questionary-form-1',
  time_required: 8,
  show_consent: false,
  consent_text: '',
};

const BLOCKED_HOST_SNIPPETS = [
  'vercel.app',
  'vercel-backend',
  'azure',
  'blob.core.windows.net',
  'openai.com',
  'firebase',
  'sentry.io',
];

// Google GIS may load with a dummy client id; allow script hosts, still block API data hosts above.

function isBlockedExternal(url: string): boolean {
  const lower = url.toLowerCase();
  if (lower.includes('127.0.0.1') || lower.includes('localhost')) {
    return false;
  }
  return BLOCKED_HOST_SNIPPETS.some((snippet) => lower.includes(snippet));
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function handleApi(route: Route) {
  const request = route.request();
  const url = request.url();
  const method = request.method().toUpperCase();
  const path = new URL(url).pathname;

  if (method === 'OPTIONS') {
    return route.fulfill({
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (path.endsWith('/health') || path === '/health') {
    return json(route, {
      status: 'OK',
      git_sha: 'cleanup-e2e',
      started_at: '2026-08-01T00:00:00Z',
    });
  }

  if (path.includes('/auth/token') && method === 'POST') {
    return json(route, FIXTURE_TOKEN);
  }

  if (path.endsWith('/patients') && method === 'GET') {
    return json(route, { patients_list_data: [FIXTURE_PATIENT] });
  }

  if (path.includes('/dashboard/clinic/clients_statistics')) {
    return json(route, FIXTURE_DASHBOARD_STATS);
  }

  if (path.includes('/dashboard/staff/staff_list')) {
    return json(route, []);
  }

  if (path.includes('/dashboard/clients/clients_list')) {
    // Clients widget uses data.client_list.length
    return json(route, { client_list: [] });
  }

  if (path.includes('/dashboard/checkin/checkin_list')) {
    return json(route, []);
  }

  if (path.includes('/dashboard/action_needed/list_of_actions')) {
    return json(route, []);
  }

  if (path.includes('/dashboard/tasks/tasks_list')) {
    return json(route, []);
  }

  if (path.includes('/dashboard/')) {
    // Most dashboard widgets call .map() on list payloads.
    return json(route, []);
  }

  if (
    path.includes('/patients/patient_data') ||
    path.includes(`/patients/${FIXTURE_PATIENT.member_id}`)
  ) {
    return json(route, {
      member_id: FIXTURE_PATIENT.member_id,
      name: FIXTURE_PATIENT.name,
      email: FIXTURE_PATIENT.email,
    });
  }

  if (path.includes('/forms/check_in/list_checkin_forms')) {
    return json(route, [FIXTURE_CHECKIN_FORM]);
  }

  if (path.includes('/forms/questionary/list_questionary_forms')) {
    return json(route, [FIXTURE_QUESTIONARY_FORM]);
  }

  if (path.includes('/forms/check_in/duplicate_checkin_form')) {
    return json(route, {
      unique_id: 'cleanup-checkin-form-copy',
      title: `${FIXTURE_CHECKIN_FORM.title} (Copy)`,
    });
  }

  if (path.includes('/forms/questionary/duplicate_questionary_form')) {
    return json(route, {
      unique_id: 'cleanup-questionary-form-copy',
      title: `${FIXTURE_QUESTIONARY_FORM.title} (Copy)`,
    });
  }

  if (path.includes('/forms') || path.includes('/check')) {
    return json(route, []);
  }

  if (path.includes('/config/public')) {
    // Non-empty client id prevents GoogleOAuthProvider from throwing
    // "Missing required parameter client_id" during offline E2E.
    return json(route, {
      google_client_id: 'cleanup-e2e.apps.googleusercontent.com',
      azure_storage_account_url: '',
      allowed_containers: [],
      sas_ttl_seconds_default: 600,
      sas_ttl_seconds_max: 900,
    });
  }

  if (
    path.includes('show_brand') ||
    path.includes('settings_show_logo') ||
    path.includes('show_logo')
  ) {
    return json(route, {
      auto_copmile: false,
      brand_elements: {
        logo: '/icons/topbar-logo2.svg',
        name: 'Cleanup Clinic',
        headline: 'Cleanup fixture brand',
        clinic_plan: 'paying',
        clinic_status: 'active',
        knowledge_playground: false,
      },
    });
  }

  if (path.includes('/auth/logout') || path.includes('/logout')) {
    return json(route, { ok: true });
  }

  // Deterministic default for other local API calls used by shells.
  if (method === 'GET') {
    return json(route, {});
  }
  // Prefer empty arrays for unknown POSTs that feed .map() widgets.
  return json(route, []);
}

/**
 * Installs network mocks for portal cleanup E2E.
 * Blocks production/Vercel/Azure and serves deterministic local API responses.
 */
export async function installPortalApiMocks(page: Page) {
  await page.route('**/*', async (route) => {
    const url = route.request().url();

    if (isBlockedExternal(url)) {
      return route.abort('blockedbyclient');
    }

    const isLocalApi =
      url.includes('127.0.0.1:3800') || url.includes('localhost:3800');

    if (isLocalApi) {
      return handleApi(route);
    }

    return route.continue();
  });
}
