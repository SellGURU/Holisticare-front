import InfoToltip from '../InfoToltip';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';
import { uiText } from '../../i18n/uiText';

type ClientIdentity = {
  name?: string;
  picture?: string;
  sex?: string;
  age?: string | number;
  medication?: string;
  conditions?: string;
  allergy?: string;
};

type ClientIdentityHeaderProps = {
  user: ClientIdentity | null;
  compact?: boolean;
  isShare?: boolean;
};

const CLINICAL_ROWS = [
  { key: 'medication', label: 'Medication', icon: '/icons/pill.svg' },
  {
    key: 'conditions',
    label: 'Medical Condition',
    icon: '/icons/healtcare.svg',
  },
  { key: 'allergy', label: 'Allergy', icon: '/icons/allergy.svg' },
] as const;

function PageIcon({ src, className }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-4 shrink-0 ${className ?? 'bg-Primary-DeepTeal'}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
}

function profilePictureSrc(user: ClientIdentity) {
  const picture = String(user.picture || '');
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name || 'Client',
  )}`;
  if (picture.startsWith('data:image/') || picture.startsWith('http')) {
    return picture;
  }
  return fallback;
}

function profileChips(value: unknown): string[] {
  if (value == null) return [];
  return String(value)
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter((part) => {
      const token = part.toLowerCase();
      return (
        part !== '' && token !== '-' && token !== 'null' && token !== 'none'
      );
    });
}

export const ClientIdentityHeader = ({
  user,
  compact = false,
  isShare = false,
}: ClientIdentityHeaderProps) => {
  if (!user) return null;

  const avatarSize = compact ? 'size-8' : 'size-12';
  const clinicalRows = CLINICAL_ROWS.map((row) => ({
    ...row,
    chips: profileChips(user[row.key]),
  })).filter((row) => row.chips.length > 0);

  return (
    <div
      className={
        compact
          ? 'min-w-0'
          : 'flex min-w-0 w-full flex-1 flex-col rounded-[6px] border border-Primary-DeepTeal border-opacity-10 bg-Primary-DeepTeal bg-opacity-[0.06] px-4 py-3 shadow-100'
      }
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {user.name && (
            <div
              className={`${avatarSize} shrink-0 overflow-hidden rounded-full border border-Primary-DeepTeal`}
            >
              <img
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || 'Client',
                  )}`;
                }}
                src={profilePictureSrc(user)}
                alt=""
              />
            </div>
          )}
          <div className="min-w-0">
            <div
              className={`font-medium text-Text-Primary ${
                compact ? 'text-sm' : 'text-base'
              }`}
            >
              <TooltipTextAuto
                maxWidth={compact ? '140px' : '240px'}
                tooltipPlace="bottom"
                tooltipClassName="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999] !break-words"
              >
                {user.name || ''}
              </TooltipTextAuto>
            </div>
            {!compact && (user.sex || user.age) && (
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-Text-Secondary">
                {user.sex && <span>{String(uiText(user.sex))}</span>}
                {user.sex && user.age && (
                  <span className="h-3 w-px bg-Primary-DeepTeal bg-opacity-30" />
                )}
                {user.age && (
                  <span>
                    {String(uiText('Age'))} {user.age}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {!compact && (
          <div className="hidden shrink-0 md:block">
            <InfoToltip isShare={isShare} />
          </div>
        )}
      </div>
      {!compact && clinicalRows.length > 0 && (
        <div className="mt-3 flex flex-col border-t border-Primary-DeepTeal border-opacity-10">
          {clinicalRows.map((row) => (
            <div
              key={row.key}
              className="flex flex-col gap-1.5 border-b border-Primary-DeepTeal border-opacity-10 py-2.5 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
            >
              <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-Primary-DeepTeal sm:min-w-[156px] sm:pt-1">
                <PageIcon src={row.icon} />
                {String(uiText(row.label))}
              </div>
              <div className="flex min-w-0 flex-wrap gap-1.5 sm:justify-end">
                {row.chips.map((chip, index) => (
                  <span
                    key={`${row.key}-${index}`}
                    className="max-w-full break-words rounded-[6px] bg-white px-2 py-1 text-xs leading-4 text-Text-Primary"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
