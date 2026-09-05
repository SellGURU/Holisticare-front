import { describe, expect, it } from 'vitest';
import {
  buildClinicProfilePayload,
  clinicProfilePreviewSrc,
  draftFromProfile,
  emptyClinicProfile,
  mergeClinicProfile,
  validateClinicName,
  validateClinicProfileDraft,
  validateEmail,
  validateLogoFile,
} from './clinicProfileForm';

const profile = {
  clinic_id: 7,
  name: 'Acme Clinic',
  logo: 'https://blob/logo.png',
  blob_logo_link: 'https://blob/logo.png',
  public_email: 'clinic@example.com',
  owner_login_email: 'owner@example.com',
  has_unique_owner: true,
};

describe('clinic profile form helpers', () => {
  it('validates name length and emails', () => {
    expect(validateClinicName('')).toBe('Clinic name is required.');
    expect(validateClinicName('ab')).toBe(
      'Clinic name must be between 3 and 30 characters.',
    );
    expect(validateClinicName('Acme Clinic')).toBe('');
    expect(validateEmail('not-email', 'Public email')).toContain('valid email');
    expect(validateEmail('owner@example.com', 'Owner login email')).toBe('');
  });

  it('validates logo type and size', () => {
    expect(
      validateLogoFile({ name: 'logo.gif', size: 100 } as File),
    ).toBe('File has an unsupported format.');
    expect(
      validateLogoFile({ name: 'logo.png', size: 5 * 1024 * 1024 } as File),
    ).toBe('File exceeds 4 MB.');
    expect(validateLogoFile({ name: 'logo.PNG', size: 1024 } as File)).toBe('');
  });

  it('builds a partial payload from dirty fields only', () => {
    const draft = {
      ...draftFromProfile(profile),
      name: '  New Clinic  ',
      public_email: 'contact@example.com',
      logoChanged: true,
      logo: 'data:image/png;base64,abc',
    };
    expect(buildClinicProfilePayload(profile, draft)).toEqual({
      name: 'New Clinic',
      public_email: 'contact@example.com',
      logo: 'data:image/png;base64,abc',
    });
  });

  it('does not send owner login email when owner is not unique', () => {
    const draft = {
      ...draftFromProfile(profile),
      owner_login_email: 'changed@example.com',
    };
    expect(
      buildClinicProfilePayload(profile, draft, { ownerEditable: false }),
    ).toEqual({});
  });

  it('allows leaving empty public email unchanged', () => {
    const initial = emptyClinicProfile(3);
    initial.name = 'Solo Clinic';
    const draft = draftFromProfile(initial);
    draft.name = 'Solo Clinic Two';
    expect(validateClinicProfileDraft(initial, draft)).toEqual({});
    expect(buildClinicProfilePayload(initial, draft)).toEqual({
      name: 'Solo Clinic Two',
    });
  });

  it('prefers the draft logo for preview', () => {
    expect(clinicProfilePreviewSrc(profile, 'data:image/png;base64,abc')).toBe(
      'data:image/png;base64,abc',
    );
    expect(clinicProfilePreviewSrc({ logo: '', blob_logo_link: 'https://blob/x.png' })).toBe(
      'https://blob/x.png',
    );
  });

  it('prefills name and login email from the clinic list when API fields are empty', () => {
    const merged = mergeClinicProfile(
      {
        clinic_id: 45,
        name: '',
        logo: '',
        public_email: '',
        owner_login_email: '',
        has_unique_owner: false,
      },
      {
        clinicId: 45,
        name: 'Listed Clinic',
        primaryEmail: 'admin@example.com',
      },
    );
    expect(merged.name).toBe('Listed Clinic');
    expect(merged.owner_login_email).toBe('admin@example.com');
    expect(merged.public_email).toBe('');
    expect(merged.has_unique_owner).toBe(false);
  });
});
