export function canManageClinicIntelligence(clinicId: number | ''): boolean {
  return typeof clinicId === 'number' && clinicId > 0;
}
