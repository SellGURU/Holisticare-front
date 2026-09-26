import { describe, expect, it } from 'vitest';
import { clinicLabel, clinicMatches } from './ClinicSearchSelect';
import { normalizeAdminClinicOption } from './types';

const clinic = {
  clinic_id: 12,
  name: 'North Clinic',
  primary_email: 'owner@north.example',
};

describe('clinicMatches', () => {
  it('matches clinic name', () => {
    expect(clinicMatches(clinic, 'north')).toBe(true);
  });

  it('matches full email and local part', () => {
    expect(clinicMatches(clinic, 'owner@north.example')).toBe(true);
    expect(clinicMatches(clinic, 'owner')).toBe(true);
  });

  it('matches name plus email tokens together', () => {
    expect(clinicMatches(clinic, 'north owner')).toBe(true);
  });

  it('rejects unrelated terms', () => {
    expect(clinicMatches(clinic, 'south')).toBe(false);
  });
});

describe('clinicLabel', () => {
  it('shows name and email together', () => {
    expect(clinicLabel(clinic)).toBe('North Clinic  ·  owner@north.example');
  });
});

describe('normalizeAdminClinicOption', () => {
  it('maps clinic_email onto primary_email', () => {
    expect(
      normalizeAdminClinicOption({
        clinic_id: 7,
        clinic_name: 'Portal',
        clinic_email: 'alexandra@theportal.house',
      }),
    ).toEqual({
      clinic_id: 7,
      name: 'Portal',
      primary_email: 'alexandra@theportal.house',
    });
  });
});
