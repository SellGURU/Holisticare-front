/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminApi from '../../api/admin';
import { blobToBase64 } from '../../help';
import Circleloader from '../../Components/CircleLoader';
import {
  ClinicProfileData,
  ClinicProfileDraft,
  buildClinicProfilePayload,
  draftFromProfile,
  mergeClinicProfile,
  validateClinicName,
  validateClinicProfileDraft,
  validateEmail,
  validateLogoFile,
} from './clinicProfileForm';

type ClinicProfileModalProps = {
  clinicId: number;
  clinicName: string;
  fallbackEmail?: string;
  onClose: () => void;
  onSaved: (profile: ClinicProfileData) => void;
};

const readErrorDetail = (err: any): string => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  return 'Failed to save clinic profile.';
};

const ClinicProfileModal = ({
  clinicId,
  clinicName,
  fallbackEmail = '',
  onClose,
  onSaved,
}: ClinicProfileModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [profile, setProfile] = useState<ClinicProfileData>(() =>
    mergeClinicProfile(undefined, {
      clinicId,
      name: clinicName,
      primaryEmail: fallbackEmail,
    }),
  );
  const [draft, setDraft] = useState<ClinicProfileDraft>(() =>
    draftFromProfile(
      mergeClinicProfile(undefined, {
        clinicId,
        name: clinicName,
        primaryEmail: fallbackEmail,
      }),
    ),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const ownerEditable = profile.has_unique_owner !== false;

  const loadProfile = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await AdminApi.getClinicProfile(clinicId);
      const nextProfile = mergeClinicProfile(res.data || {}, {
        clinicId,
        name: clinicName,
        primaryEmail: fallbackEmail,
      });
      setProfile(nextProfile);
      setDraft(draftFromProfile(nextProfile));
      setFieldErrors({});
    } catch (err: any) {
      setLoadError(readErrorDetail(err) || 'Failed to load clinic profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  const updateDraft = (changes: Partial<ClinicProfileDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setSaveError('');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const logoError = validateLogoFile(file);
    if (logoError) {
      setFieldErrors((current) => ({ ...current, logo: logoError }));
      event.target.value = '';
      return;
    }
    blobToBase64(file).then((result: any) => {
      updateDraft({ logo: String(result || ''), logoChanged: true });
      setFieldErrors((current) => {
        const next = { ...current };
        delete next.logo;
        return next;
      });
    });
  };

  const handleSave = async () => {
    const errors = validateClinicProfileDraft(profile, draft, { ownerEditable });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = buildClinicProfilePayload(profile, draft, { ownerEditable });
    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const res = await AdminApi.updateClinicProfile(clinicId, payload);
      const saved = {
        ...profile,
        ...(res.data || {}),
      } as ClinicProfileData;
      toast.success('Clinic profile updated.');
      onSaved(saved);
    } catch (err: any) {
      setSaveError(readErrorDetail(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-[20px] bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-[16px] font-semibold text-Text-Primary">
              Edit clinic profile
            </div>
            <div className="mt-1 text-[12px] text-Text-Secondary">
              {clinicName || `Clinic #${clinicId}`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-Text-Secondary"
          >
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex h-[280px] items-center justify-center">
            <Circleloader />
          </div>
        ) : loadError ? (
          <div className="rounded-2xl bg-red-50 p-3 text-[12px] text-red-700">
            {loadError}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1 text-[12px] font-medium text-Text-Primary">
                Logo
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[56px] w-[56px] overflow-hidden rounded-lg border border-Gray-50 bg-[#F8FAFB]"
                >
                  {draft.logo ? (
                    <img
                      src={draft.logo}
                      alt="Clinic logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-Text-Secondary">
                      No logo
                    </span>
                  )}
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] text-Text-Primary"
                  >
                    Replace logo
                  </button>
                  <div className="mt-1 text-[10px] text-Text-Secondary">
                    PNG, SVG, JPG, JPEG · max 4 MB
                  </div>
                  {fieldErrors.logo && (
                    <div className="mt-1 text-[10px] text-red-700">
                      {fieldErrors.logo}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.svg,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-medium text-Text-Primary">
                Clinic name
              </span>
              <input
                value={draft.name}
                maxLength={30}
                onChange={(event) => {
                  updateDraft({ name: event.target.value });
                  setFieldErrors((current) => ({
                    ...current,
                    name: validateClinicName(event.target.value),
                  }));
                }}
                className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              />
              {fieldErrors.name && (
                <span className="text-[10px] text-red-700">
                  {fieldErrors.name}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-medium text-Text-Primary">
                Public / contact email
              </span>
              <input
                value={draft.public_email}
                onChange={(event) => {
                  updateDraft({ public_email: event.target.value });
                  setFieldErrors((current) => ({
                    ...current,
                    public_email: validateEmail(
                      event.target.value,
                      'Public email',
                    ),
                  }));
                }}
                className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              />
              {fieldErrors.public_email && (
                <span className="text-[10px] text-red-700">
                  {fieldErrors.public_email}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-medium text-Text-Primary">
                Owner login email
              </span>
              <input
                value={draft.owner_login_email}
                disabled={!ownerEditable}
                onChange={(event) => {
                  updateDraft({ owner_login_email: event.target.value });
                  setFieldErrors((current) => ({
                    ...current,
                    owner_login_email: validateEmail(
                      event.target.value,
                      'Owner login email',
                    ),
                  }));
                }}
                className="rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none disabled:text-Text-Secondary"
              />
              {!ownerEditable && (
                <span className="text-[10px] text-Text-Secondary">
                  A unique clinic owner was not found, so login email cannot be
                  changed.
                </span>
              )}
              {fieldErrors.owner_login_email && (
                <span className="text-[10px] text-red-700">
                  {fieldErrors.owner_login_email}
                </span>
              )}
            </label>

            {saveError && (
              <div className="rounded-2xl bg-red-50 p-3 text-[12px] text-red-700">
                {saveError}
              </div>
            )}

            <div className="mt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-[12px] text-Text-Secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="rounded-full border border-Gray-50 bg-[#F8FAFB] px-4 py-2 text-[12px] text-Text-Primary"
              >
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicProfileModal;
