import { describe, expect, it } from 'vitest';
import {
  STANDARD_PATIENT_FIELDS,
  answersFromSurveyRespond,
  emptyStandardPatient,
  questionsSignature,
  validateStandardPatient,
} from './patientRegistrationForm';

describe('patient registration form', () => {
  it('keeps the required patient fields locked and leaves phone and timezone optional', () => {
    const required = STANDARD_PATIENT_FIELDS.filter((field) => field.locked);
    expect(required.every((field) => field.required)).toBe(true);
    expect(
      STANDARD_PATIENT_FIELDS.filter((field) => !field.locked).map(
        (field) => field.key,
      ),
    ).toEqual(['phoneNumber', 'timezone']);
    expect(STANDARD_PATIENT_FIELDS.map((field) => field.key)).toEqual([
      'firstName',
      'lastName',
      'email',
      'dateOfBirth',
      'gender',
      'phoneNumber',
      'timezone',
    ]);
  });

  it('requires consent and the fixed fields', () => {
    expect(validateStandardPatient(emptyStandardPatient())).toMatch(
      /required/i,
    );
    const valid = {
      ...emptyStandardPatient('America/Toronto'),
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@clinic.test',
      dateOfBirth: '1990-01-02',
      gender: 'female',
      phoneNumber: '+15551212',
      consent: true,
    };
    expect(validateStandardPatient(valid)).toBeNull();
    expect(validateStandardPatient({ ...valid, consent: false })).toMatch(
      /consent/i,
    );
    expect(validateStandardPatient({ ...valid, gender: 'other' })).toMatch(
      /gender/i,
    );
    expect(
      validateStandardPatient({ ...valid, dateOfBirth: '2011-01-02' }),
    ).toMatch(/18 and 60/);
    expect(validateStandardPatient({ ...valid, firstName: 'Ada2' })).toMatch(
      /letters/,
    );
    expect(validateStandardPatient({ ...valid, phoneNumber: '' })).toBeNull();
    expect(validateStandardPatient({ ...valid, phoneNumber: '+1' })).toBeNull();
    expect(validateStandardPatient({ ...valid, phoneNumber: '+1555' })).toMatch(
      /phone/i,
    );
    expect(
      validateStandardPatient(
        { ...valid, phoneNumber: '', timezone: '' },
        true,
        { phoneNumber: false, timezone: false },
      ),
    ).toBeNull();
    expect(
      validateStandardPatient({ ...valid, dateOfBirth: '2999-01-01' }),
    ).toMatch(/date of birth/i);
    expect(
      validateStandardPatient({ ...valid, dateOfBirth: '1990-02-31' }),
    ).toMatch(/date of birth/i);
    expect(
      validateStandardPatient({ ...valid, timezone: 'Not/AZone' }),
    ).toMatch(/timezone/i);
  });

  it('maps survey responses onto question ids and ignores blanks', () => {
    expect(
      answersFromSurveyRespond([
        { id: 'q1', response: 'energy' },
        { id: 'q2', response: '' },
        { id: '', response: 'skip' },
      ]),
    ).toEqual({ q1: 'energy' });
  });

  it('changes signature when questions change', () => {
    expect(questionsSignature([{ id: 'q1' }])).not.toBe(
      questionsSignature([{ id: 'q2' }]),
    );
  });
});
