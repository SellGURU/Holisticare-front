export const REGISTRATION_API_SAMPLE_IDS = [
  'curl',
  'javascript',
  'typescript',
  'react',
  'python',
] as const;

export type RegistrationApiSampleId =
  (typeof REGISTRATION_API_SAMPLE_IDS)[number];

export const REGISTRATION_API_SAMPLE_LABELS: Record<
  RegistrationApiSampleId,
  string
> = {
  curl: 'cURL',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
  python: 'Python',
};

const patientBody = `{
  "email": "ada@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "gender": "female",
  "dateOfBirth": "1990-01-02",
  "phoneNumber": "+14165550100",
  "timezone": "America/Toronto",
  "consent": true,
  "answers": {}
}`;

export const registrationApiSamples = (
  apiBase: string,
): Record<RegistrationApiSampleId, string> => {
  const base = apiBase.replace(/\/$/, '');
  const patients = `${base}/v1/clinic-registration/patients`;
  return {
    curl: `curl -s ${patients} \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Idempotency-Key: unique-request-1" \\
  -H "Content-Type: application/json" \\
  -d '${patientBody}'`,
    javascript: `const response = await fetch("${patients}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "YOUR_KEY",
    "Idempotency-Key": "unique-request-1"
  },
  body: JSON.stringify(${patientBody})
});

if (!response.ok) {
  throw new Error(await response.text());
}

const patient = await response.json();
// patient.patient_id, patient.submission_id, patient.idempotent`,
    typescript: `type RegistrationResult = {
  patient_id: number;
  submission_id: string;
  status: string;
  idempotent: boolean;
};

const response = await fetch("${patients}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "YOUR_KEY",
    "Idempotency-Key": "unique-request-1"
  },
  body: JSON.stringify(${patientBody})
});

if (!response.ok) {
  throw new Error(await response.text());
}

const patient: RegistrationResult = await response.json();`,
    react: `async function registerPatient(apiKey: string) {
  const response = await fetch("${patients}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "Idempotency-Key": crypto.randomUUID()
    },
    body: JSON.stringify(${patientBody})
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export function RegisterPatientButton({ apiKey }: { apiKey: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        registerPatient(apiKey).then((patient) => {
          console.log(patient.patient_id);
        });
      }}
    >
      Register
    </button>
  );
}`,
    python: `import requests

response = requests.post(
    "${patients}",
    headers={
        "X-API-Key": "YOUR_KEY",
        "Idempotency-Key": "unique-request-1",
    },
    json={
        "email": "ada@example.com",
        "firstName": "Ada",
        "lastName": "Lovelace",
        "gender": "female",
        "dateOfBirth": "1990-01-02",
        "phoneNumber": "+14165550100",
        "timezone": "America/Toronto",
        "consent": True,
        "answers": {},
    },
)
response.raise_for_status()
patient = response.json()
# patient["patient_id"], patient["submission_id"], patient["idempotent"]`,
  };
};
