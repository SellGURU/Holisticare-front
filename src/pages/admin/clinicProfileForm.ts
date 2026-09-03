export const MIN_CLINIC_NAME_LENGTH = 3;
export const MAX_CLINIC_NAME_LENGTH = 30;
export const MAX_LOGO_BYTES = 4 * 1024 * 1024;
export const VALID_LOGO_EXTENSIONS = ['.png', '.svg', '.jpg', '.jpeg'] as const;

export type ClinicProfileData = {
  clinic_id: number;
  name: string;
  logo: string;
  blob_logo_link?: string;
  public_email: string;
  owner_login_email: string;
  has_unique_owner?: boolean;
};

export type ClinicProfileDraft = {
  name: string;
  logo: string;
  public_email: string;
  owner_login_email: string;
  logoChanged: boolean;
};

export type ClinicProfilePayload = {
  name?: string;
  logo?: string;
  public_email?: string;
  owner_login_email?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emptyClinicProfile = (clinicId: number): ClinicProfileData => ({
  clinic_id: clinicId,
  name: '',
  logo: '',
  blob_logo_link: '',
  public_email: '',
  owner_login_email: '',
  has_unique_owner: false,
});

export const mergeClinicProfile = (
  api: Partial<ClinicProfileData> | undefined,
  fallback: {
    clinicId: number;
    name?: string;
    primaryEmail?: string;
  },
): ClinicProfileData => {
  const name = (api?.name || fallback.name || '').trim();
  const publicEmail = (api?.public_email || '').trim();
  const ownerEmail = (api?.owner_login_email || fallback.primaryEmail || '').trim();
  const logo = api?.logo || api?.blob_logo_link || '';
  return {
    clinic_id: api?.clinic_id ?? fallback.clinicId,
    name,
    logo,
    blob_logo_link: api?.blob_logo_link || '',
    public_email: publicEmail,
    owner_login_email: ownerEmail,
    has_unique_owner: api?.has_unique_owner ?? Boolean(ownerEmail),
  };
};

export const draftFromProfile = (
  profile: ClinicProfileData,
): ClinicProfileDraft => ({
  name: profile.name || '',
  logo: profile.logo || profile.blob_logo_link || '',
  public_email: profile.public_email || '',
  owner_login_email: profile.owner_login_email || '',
  logoChanged: false,
});

export const clinicProfilePreviewSrc = (
  profile: Pick<ClinicProfileData, 'logo' | 'blob_logo_link'> & {
    logoChanged?: boolean;
  },
  draftLogo?: string,
): string => {
  if (draftLogo) return draftLogo;
  return profile.logo || profile.blob_logo_link || '';
};

export const validateClinicName = (value: string): string => {
  const name = value.trim();
  if (!name) return 'Clinic name is required.';
  if (
    name.length < MIN_CLINIC_NAME_LENGTH ||
    name.length > MAX_CLINIC_NAME_LENGTH
  ) {
    return 'Clinic name must be between 3 and 30 characters.';
  }
  return '';
};

export const validateEmail = (value: string, label: string): string => {
  const email = value.trim();
  if (!email) return `${label} is required.`;
  if (!EMAIL_RE.test(email) || email.includes('..')) {
    return `${label} is not a valid email address.`;
  }
  return '';
};

export const validateLogoFile = (file: File): string => {
  const extension = `.${(file.name.split('.').pop() || '').toLowerCase()}`;
  if (!VALID_LOGO_EXTENSIONS.includes(extension as (typeof VALID_LOGO_EXTENSIONS)[number])) {
    return 'File has an unsupported format.';
  }
  if (file.size > MAX_LOGO_BYTES) {
    return 'File exceeds 4 MB.';
  }
  return '';
};

export const buildClinicProfilePayload = (
  initial: ClinicProfileData,
  draft: ClinicProfileDraft,
  options?: { ownerEditable?: boolean },
): ClinicProfilePayload => {
  const payload: ClinicProfilePayload = {};
  const nextName = draft.name.trim();
  const nextPublicEmail = draft.public_email.trim();
  const nextOwnerEmail = draft.owner_login_email.trim();

  if (nextName !== (initial.name || '').trim()) {
    payload.name = nextName;
  }
  if (draft.logoChanged && draft.logo) {
    payload.logo = draft.logo;
  }
  if (nextPublicEmail !== (initial.public_email || '').trim()) {
    payload.public_email = nextPublicEmail;
  }
  if (
    options?.ownerEditable !== false &&
    nextOwnerEmail !== (initial.owner_login_email || '').trim()
  ) {
    payload.owner_login_email = nextOwnerEmail;
  }
  return payload;
};

export const validateClinicProfileDraft = (
  initial: ClinicProfileData,
  draft: ClinicProfileDraft,
  options?: { ownerEditable?: boolean },
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const nameError = validateClinicName(draft.name);
  if (nameError) errors.name = nameError;

  const publicChanged =
    draft.public_email.trim() !== (initial.public_email || '').trim();
  if (publicChanged || draft.public_email.trim()) {
    const publicEmailError = validateEmail(draft.public_email, 'Public email');
    if (publicEmailError) errors.public_email = publicEmailError;
  }

  const ownerChanged =
    draft.owner_login_email.trim() !== (initial.owner_login_email || '').trim();
  if (options?.ownerEditable !== false && (ownerChanged || draft.owner_login_email.trim())) {
    const ownerEmailError = validateEmail(
      draft.owner_login_email,
      'Owner login email',
    );
    if (ownerEmailError) errors.owner_login_email = ownerEmailError;
  }

  if (draft.logoChanged && !draft.logo) {
    errors.logo = 'Logo is required.';
  }
  return errors;
};
