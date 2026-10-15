import Api from './api';

class PatientRegistrationApi extends Api {
  static getSettings() {
    return this.get('/settings/patient-registration');
  }

  static updateSettings(payload: Record<string, unknown>) {
    return this.patch('/settings/patient-registration', payload);
  }

  static listApiKeys() {
    return this.get('/settings/patient-registration/api-keys');
  }

  static createApiKey(name: string) {
    return this.post('/settings/patient-registration/api-keys', { name });
  }

  static revokeApiKey(id: string) {
    return this.delete(`/settings/patient-registration/api-keys/${id}`);
  }

  static rotateApiKey(id: string) {
    return this.post(
      `/settings/patient-registration/api-keys/${id}/rotate`,
      {},
    );
  }

  static listInvites() {
    return this.get('/settings/patient-registration/invites');
  }

  static createInvites(emails: string[]) {
    return this.post('/settings/patient-registration/invites', {
      emails,
      expiresInDays: 14,
    });
  }

  static resendInvite(id: string) {
    return this.post(`/settings/patient-registration/invites/${id}/resend`, {});
  }

  static revokeInvite(id: string) {
    return this.post(`/settings/patient-registration/invites/${id}/revoke`, {});
  }

  static listSubmissions() {
    return this.get('/settings/patient-registration/submissions');
  }

  static approveSubmission(id: string) {
    return this.post(
      `/settings/patient-registration/submissions/${id}/approve`,
      {},
    );
  }

  static declineSubmission(id: string) {
    return this.post(
      `/settings/patient-registration/submissions/${id}/decline`,
      {},
    );
  }

  static publicBrand(slug: string) {
    return this.get('/mobile/public_brand_info', {
      noAuth: true,
      params: { clinic: slug },
    });
  }

  static publicForm(slug: string) {
    return this.get(
      `/public/patient-registration/${encodeURIComponent(slug)}`,
      {
        noAuth: true,
      },
    );
  }

  static submitPublic(slug: string, payload: Record<string, unknown>) {
    return this.post(
      `/public/patient-registration/${encodeURIComponent(slug)}`,
      payload,
      { noAuth: true },
    );
  }

  static inviteForm(token: string) {
    return this.get(
      `/public/patient-registration/invite/${encodeURIComponent(token)}`,
      {
        noAuth: true,
      },
    );
  }

  static submitInvite(token: string, payload: Record<string, unknown>) {
    return this.post(
      `/public/patient-registration/invite/${encodeURIComponent(token)}`,
      payload,
      { noAuth: true },
    );
  }
}

export default PatientRegistrationApi;
