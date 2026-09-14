import { Link } from 'react-router-dom';
import {
  PATIENT_PRIVACY_URL,
  PATIENT_TERMS_URL,
  PROVIDER_PRIVACY_URL,
  PROVIDER_TERMS_URL,
} from '../../constants/legalUrls';

type LegalKind = 'privacy' | 'terms';
type LegalAudience = 'provider' | 'patient';

export default function LegalDocument({
  kind,
  audience = 'provider',
}: {
  kind: LegalKind;
  audience?: LegalAudience;
}) {
  const isPrivacy = kind === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  const officialUrl =
    audience === 'provider'
      ? isPrivacy
        ? PROVIDER_PRIVACY_URL
        : PROVIDER_TERMS_URL
      : isPrivacy
        ? PATIENT_PRIVACY_URL
        : PATIENT_TERMS_URL;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          HolistiCare processes clinic and health information to provide the
          portal. We collect account details, clinic identifiers, and the health
          records you upload so we can generate reports and care plans.
        </p>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          You can request deletion of a patient record from the clinic portal.
          Patients can request deletion from the mobile app. Erasure removes
          stored health files, lab data, and wearable links for that person.
        </p>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          For privacy questions, contact{' '}
          <a
            className="text-Primary-DeepTeal underline"
            href="mailto:support@holisticare.com"
          >
            support@holisticare.com
          </a>
          .
        </p>
        <a
          className="mt-6 inline-block text-sm text-Primary-DeepTeal underline"
          href={officialUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open the published {title.toLowerCase()}
        </a>
        <div className="mt-8">
          <Link
            to="/register"
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Back to sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
