import { describe, expect, it } from 'vitest';
import { filterAdminClinics } from './AdminClinicSearchSelect';

const clinics = [
  { clinic_name: 'The Portal', clinic_email: 'alexandra@theportal.house' },
  { clinic_name: 'North Clinic', clinic_email: 'admin@north.example' },
];

describe('filterAdminClinics', () => {
  it('matches by email substring', () => {
    expect(filterAdminClinics(clinics, 'alexandra@')).toEqual([clinics[0]]);
  });

  it('matches by clinic name', () => {
    expect(filterAdminClinics(clinics, 'north')).toEqual([clinics[1]]);
  });

  it('matches the local part of an email', () => {
    expect(filterAdminClinics(clinics, 'alexandra')).toEqual([clinics[0]]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterAdminClinics(clinics, 'missing@clinic')).toEqual([]);
  });
});
