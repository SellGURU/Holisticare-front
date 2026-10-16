import { useState } from 'react';
import { uiText } from '../../i18n/uiText';
import ClientSummaryDetailsModal, {
  type ClientSummaryDetails,
} from './ClientSummaryDetailsModal';

type ClientIdentity = {
  name?: string;
  picture?: string;
  sex?: string;
  age?: string | number;
  date_of_birth?: string | null;
  ethnicity?: string | null;
};

type ClientIdentityHeaderProps = {
  user: ClientIdentity | null;
  memberId?: string | number | null;
  compact?: boolean;
  details?: ClientSummaryDetails;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function formatDob(value?: string | null) {
  if (!value) return '';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function hasPicture(picture?: string) {
  const value = String(picture || '');
  return value.startsWith('data:image/') || value.startsWith('http');
}

export const ClientIdentityHeader = ({
  user,
  memberId,
  compact = false,
  details,
}: ClientIdentityHeaderProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  if (!user) return null;

  const dob = formatDob(user.date_of_birth);
  const facts = [
    user.sex ? { label: 'Sex', value: String(uiText(user.sex)) } : null,
    user.age != null && user.age !== ''
      ? { label: 'Age', value: `${user.age} years` }
      : null,
    user.ethnicity
      ? { label: 'Ethnicity', value: String(user.ethnicity) }
      : null,
  ].filter((item): item is { label: string; value: string } => item != null);
  const meta = [
    memberId != null && memberId !== '' ? `ID: ${memberId}` : '',
    dob ? `DOB: ${dob}` : '',
  ].filter(Boolean);

  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <Avatar user={user} size="size-8" />
        <div className="min-w-0 truncate text-sm font-medium text-Text-Primary">
          {user.name}
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="group relative flex min-h-[148px] min-w-0 w-full overflow-hidden rounded-2xl border border-[#E6EEF0] bg-white shadow-sm">
        <Avatar
          user={user}
          size="min-h-[148px] w-[148px] self-stretch rounded-none text-2xl"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
          <h2 className="truncate text-lg font-semibold text-Text-Primary">
            {user.name}
          </h2>
          {meta.length > 0 && (
            <p className="mt-1 truncate text-xs text-Text-Secondary">
              {meta.join(' · ')}
            </p>
          )}
          {facts.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#EEF3F4] pt-3 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <div className="text-[11px] text-Text-Secondary">
                    {fact.label}
                  </div>
                  <div className="mt-0.5 text-sm font-medium text-Text-Primary">
                    {fact.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {details ? (
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="absolute bottom-3 end-3 rounded-full bg-[#005F73] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow transition hover:bg-[#004E5F] focus:opacity-100 group-hover:opacity-100"
          >
            {String(uiText('View details'))}
          </button>
        ) : null}
      </section>
      {details ? (
        <ClientSummaryDetailsModal
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          user={user}
          memberId={memberId}
          details={details}
        />
      ) : null}
    </>
  );
};

function Avatar({ user, size }: { user: ClientIdentity; size: string }) {
  if (hasPicture(user.picture)) {
    return (
      <img
        src={String(user.picture)}
        alt=""
        className={`${size} shrink-0 object-cover ${size.includes('rounded-none') ? '' : 'rounded-full'}`}
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center bg-[#F8D7D7] font-semibold text-[#C45C5C] ${size.includes('rounded-none') ? '' : 'rounded-full text-sm'}`}
    >
      {initials(user.name || 'Client')}
    </div>
  );
}
