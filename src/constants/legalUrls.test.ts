import { describe, expect, it } from 'vitest';
import {
  PATIENT_PRIVACY_PATH,
  PATIENT_TERMS_PATH,
  PROVIDER_PRIVACY_PATH,
  PROVIDER_TERMS_PATH,
} from './legalUrls';

describe('legalUrls', () => {
  it('exposes in-app provider and patient legal paths', () => {
    expect(PROVIDER_PRIVACY_PATH.startsWith('/legal/')).toBe(true);
    expect(PROVIDER_TERMS_PATH.startsWith('/legal/')).toBe(true);
    expect(PATIENT_PRIVACY_PATH).toBe('/privacy');
    expect(PATIENT_TERMS_PATH).toBe('/terms');
  });
});
