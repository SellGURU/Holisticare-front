import type { ReactNode } from 'react';

export type RegistrationBrand = {
  clinicName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  headline: string;
  coachPhoto: string;
  coachName: string;
  coachTitle: string;
  coachPhone: string;
  coachEmail: string;
  coachWebsite: string;
  coachSocial: string;
};

const EMPTY_BRAND: RegistrationBrand = {
  clinicName: '',
  logoUrl: '',
  primaryColor: '',
  secondaryColor: '',
  headline: '',
  coachPhoto: '',
  coachName: '',
  coachTitle: '',
  coachPhone: '',
  coachEmail: '',
  coachWebsite: '',
  coachSocial: '',
};

const textOf = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

export const emptyRegistrationBrand = (): RegistrationBrand => ({
  ...EMPTY_BRAND,
});

export function brandFromSources(
  ...sources: Array<Record<string, unknown> | null | undefined>
): RegistrationBrand {
  const pick = (...keys: string[]) => {
    for (const source of sources) {
      if (!source) continue;
      for (const key of keys) {
        const value = textOf(source[key]);
        if (value) return value;
      }
    }
    return '';
  };
  return {
    clinicName: pick('clinicName', 'name'),
    logoUrl: pick('logoUrl', 'logo'),
    primaryColor: pick('primaryColor', 'primary_color'),
    secondaryColor: pick('secondaryColor', 'secondary_color'),
    headline: pick('headline'),
    coachPhoto: pick('coachPhoto', 'coach_photo'),
    coachName: pick('coachName', 'coach_name'),
    coachTitle: pick('coachTitle', 'coach_title'),
    coachPhone: pick('coachPhone', 'coach_phone'),
    coachEmail: pick('coachEmail', 'coach_email'),
    coachWebsite: pick('coachWebsite', 'coach_website'),
    coachSocial: pick('coachSocial', 'coach_social'),
  };
}

const hexChannels = (color: string) => {
  let raw = color.trim().replace('#', '');
  if (raw.length === 3)
    raw = raw
      .split('')
      .map((char) => char + char)
      .join('');
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  return [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16));
};

const isLightColor = (color: string) => {
  const channels = hexChannels(color);
  if (!channels) return false;
  const [red, green, blue] = channels;
  return red * 0.299 + green * 0.587 + blue * 0.114 > 186;
};

export const softBrandColor = (color: string) => {
  const channels = hexChannels(color);
  if (!channels) return '#ececec';
  const mixed = channels.map((channel) =>
    Math.round(channel * 0.22 + 255 * 0.78),
  );
  return `#${mixed.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
};

export const brandButtonStyle = (color: string) => {
  const backgroundColor = color || '#005F73';
  return {
    backgroundColor,
    color: isLightColor(backgroundColor) ? '#303030' : '#ffffff',
  };
};

const externalHref = (value: string) => {
  const cleaned = value.trim().replace(/^@/, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://'))
    return cleaned;
  return `https://${cleaned}`;
};

const hasCoach = (brand: RegistrationBrand) =>
  Boolean(
    brand.coachPhoto ||
      brand.coachName ||
      brand.coachTitle ||
      brand.coachPhone ||
      brand.coachEmail ||
      brand.coachWebsite ||
      brand.coachSocial,
  );

const PhoneIcon = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
    <rect
      x="4.5"
      y="1"
      width="7"
      height="14"
      rx="1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <circle cx="8" cy="12.2" r="0.7" fill="currentColor" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
    <rect
      x="1.5"
      y="3.5"
      width="13"
      height="9"
      rx="1.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M2 4.2 8 9l6-4.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  </svg>
);

const WebIcon = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
    <circle
      cx="8"
      cy="8"
      r="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <ellipse
      cx="8"
      cy="8"
      rx="2.6"
      ry="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path d="M2 8h12" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const SocialIcon = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
    <circle
      cx="12"
      cy="4"
      r="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <circle
      cx="4"
      cy="8"
      r="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <circle
      cx="12"
      cy="12"
      r="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M6 7.2 10 5M6 8.8 10 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  </svg>
);

const ContactRow = ({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) => (
  <a
    href={href}
    className="flex min-h-8 min-w-0 items-center gap-2 text-sm leading-5 text-[#303030] no-underline"
  >
    <span className="text-[#303030]">{icon}</span>
    <span className="min-w-0 break-all">{label}</span>
  </a>
);

const BrandFooter = ({
  brand,
  accent,
  secondary,
}: {
  brand: RegistrationBrand;
  accent: string;
  secondary: string;
}) => {
  if (!hasCoach(brand)) return null;
  const footerBg = softBrandColor(accent);
  const contacts = [
    brand.coachSocial
      ? {
          key: 'social',
          href: externalHref(brand.coachSocial),
          label: brand.coachSocial,
          icon: <SocialIcon />,
        }
      : null,
    brand.coachPhone
      ? {
          key: 'phone',
          href: `tel:${brand.coachPhone.replace(/[^0-9+]/g, '')}`,
          label: brand.coachPhone,
          icon: <PhoneIcon />,
        }
      : null,
    brand.coachEmail
      ? {
          key: 'email',
          href: `mailto:${brand.coachEmail}`,
          label: brand.coachEmail,
          icon: <MailIcon />,
        }
      : null,
    brand.coachWebsite
      ? {
          key: 'web',
          href: externalHref(brand.coachWebsite),
          label: brand.coachWebsite,
          icon: <WebIcon />,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    href: string;
    label: string;
    icon: ReactNode;
  }>;

  return (
    <div
      className="rounded-b-2xl px-4 pb-5 pt-6 sm:px-6 sm:pb-6"
      style={{ backgroundColor: footerBg }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {brand.coachPhoto ? (
          <div
            className="mt-1 shrink-0 self-center rounded-full p-1 sm:self-start"
            style={{ backgroundColor: accent }}
          >
            <div className="rounded-full bg-white p-[3px]">
              <div
                className="rounded-full p-1"
                style={{ backgroundColor: secondary }}
              >
                <img
                  src={brand.coachPhoto}
                  alt={brand.coachName || brand.clinicName}
                  className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
                />
              </div>
            </div>
          </div>
        ) : null}
        <div className="min-w-0 pt-1 text-center text-[#303030] sm:pt-2 sm:text-start">
          {brand.coachName ? (
            <div className="text-lg font-bold leading-7">{brand.coachName}</div>
          ) : null}
          {brand.coachTitle ? (
            <div className="mt-1 text-[13px] leading-5">{brand.coachTitle}</div>
          ) : null}
          {brand.clinicName ? (
            <div className="mt-1 text-[13px] leading-5">{brand.clinicName}</div>
          ) : null}
          {contacts.length > 0 ? (
            <div className="mt-3 space-y-1.5 text-start">
              {contacts.map((contact) => (
                <ContactRow
                  key={contact.key}
                  href={contact.href}
                  label={contact.label}
                  icon={contact.icon}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default function RegistrationBrandFrame({
  brand,
  title,
  children,
}: {
  brand: RegistrationBrand;
  title?: string;
  children: ReactNode;
}) {
  const accent = brand.primaryColor || '#005F73';
  const secondary = brand.secondaryColor || accent;
  const showIdentity = Boolean(
    brand.clinicName || brand.logoUrl || brand.headline || hasCoach(brand),
  );
  if (!showIdentity) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-4 shadow-100 sm:p-6">
        {children}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl overflow-visible rounded-2xl bg-white shadow-100">
      <div className="grid grid-cols-[76px_1fr] overflow-hidden rounded-t-2xl sm:grid-cols-[104px_1fr]">
        <div
          className="row-span-2 px-3 pt-3 sm:px-4 sm:pt-4"
          style={{
            backgroundImage: `linear-gradient(#ffffff 0,#ffffff 36px,${accent} 36px,${accent} 100%)`,
          }}
        >
          {brand.logoUrl ? (
            <div
              className="rounded-2xl p-[3px]"
              style={{ backgroundColor: accent }}
            >
              <div className="rounded-[13px] bg-white p-1">
                <img
                  src={brand.logoUrl}
                  alt={brand.clinicName}
                  className="h-11 w-11 object-contain sm:h-14 sm:w-14"
                />
              </div>
            </div>
          ) : (
            <div className="h-11 sm:h-14" />
          )}
        </div>
        <div className="h-9 bg-white sm:h-11" />
        <div
          className="h-12 sm:h-14"
          style={{
            backgroundImage: `linear-gradient(90deg,${accent} 0%,${secondary} 100%)`,
          }}
        />
      </div>
      <div className="px-4 pb-1 pt-4 sm:px-6 sm:pt-5">
        {brand.clinicName ? (
          <h1 className="break-words text-lg font-medium leading-7 text-[#303030]">
            {brand.clinicName}
          </h1>
        ) : null}
        {brand.headline ? (
          <p className="mt-1 break-words text-sm text-[#555]">
            {brand.headline}
          </p>
        ) : null}
        {title ? <p className="mt-1 text-sm text-[#666]">{title}</p> : null}
      </div>
      <div className="px-4 pb-8 pt-3 sm:px-6 sm:pb-10">{children}</div>
      <BrandFooter brand={brand} accent={accent} secondary={secondary} />
    </div>
  );
}
