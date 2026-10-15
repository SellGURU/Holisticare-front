import { describe, expect, it } from 'vitest';
import {
  REGISTRATION_API_SAMPLE_IDS,
  registrationApiSamples,
} from './registrationApiSamples';

describe('registration API samples', () => {
  const samples = registrationApiSamples('https://api.example.com/');

  it('covers each language with the create-patient call', () => {
    for (const id of REGISTRATION_API_SAMPLE_IDS) {
      expect(samples[id]).toContain(
        'https://api.example.com/v1/clinic-registration/patients',
      );
      expect(samples[id]).toContain('X-API-Key');
      expect(samples[id]).toContain('ada@example.com');
    }
  });

  it('keeps Python consent as a Python boolean', () => {
    expect(samples.python).toContain('"consent": True');
    expect(samples.python).not.toContain('"consent": true');
  });
});
