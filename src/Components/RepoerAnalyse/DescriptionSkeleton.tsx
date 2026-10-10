import { useTranslation } from 'react-i18next';

const pulse = (delayMs: number) => ({
  animationDelay: `${delayMs}ms`,
});

type DescriptionSkeletonProps = {
  className?: string;
};

const DescriptionSkeleton = ({ className = '' }: DescriptionSkeletonProps) => {
  const { t } = useTranslation('reportChrome');
  return (
    <div
      className={`animate-pulse space-y-2 min-h-[80px] mt-4 ${className}`}
      role="status"
      aria-label={t('generatingDescription')}
    >
      <div className="h-2.5 w-full rounded bg-Gray-100" />
      <div className="h-2.5 w-5/6 rounded bg-Gray-100" style={pulse(60)} />
      <div className="h-2.5 w-4/6 rounded bg-Gray-100" style={pulse(120)} />
      <div className="h-2.5 w-3/6 rounded bg-Gray-100" style={pulse(180)} />
      <span className="sr-only">{t('generatingDescription')}</span>
    </div>
  );
};

export default DescriptionSkeleton;
