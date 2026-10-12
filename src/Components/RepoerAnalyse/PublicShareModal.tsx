import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Application from '../../api/app';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { copyText } from '../../utils/clipboard';
import SpinnerLoader from '../SpinnerLoader';
import Toggle from './Boxs/Toggle';

interface PublicShareModalProps {
  isOpen: boolean;
  memberId?: string | number | null;
  onClose: () => void;
}

interface PublicShareState {
  enabled: boolean;
  enabled_at?: string | null;
  share_path?: string;
}

const fallbackSharePath = (memberId?: string | number | null) =>
  memberId ? `/html-previewer/${memberId}` : '';

export const PublicShareModal: FC<PublicShareModalProps> = ({
  isOpen,
  memberId,
  onClose,
}) => {
  const { t } = useTranslation('share');
  const modalReference = useRef(null);
  const [shareState, setShareState] = useState<PublicShareState>({
    enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useModalAutoClose({
    refrence: modalReference,
    close: onClose,
  });

  const sharePath = shareState.share_path || fallbackSharePath(memberId);
  const shareUrl = useMemo(() => {
    if (!sharePath) return '';
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  useEffect(() => {
    if (!isOpen || !memberId) return;
    setLoading(true);
    setError('');
    setCopied(false);
    Application.getPublicShareState({ member_id: memberId })
      .then((res) => {
        setShareState({
          enabled: Boolean(res.data?.enabled),
          enabled_at: res.data?.enabled_at || null,
          share_path: res.data?.share_path || fallbackSharePath(memberId),
        });
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || t('errors.loadFailed'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, memberId, t]);

  if (!isOpen) return null;

  const applyShareEnabled = (nextEnabled: boolean) => {
    if (!memberId || saving) return;
    if (nextEnabled === shareState.enabled) return;
    const previousState = shareState;
    setShareState({
      ...shareState,
      enabled: nextEnabled,
      share_path: shareState.share_path || fallbackSharePath(memberId),
    });
    setSaving(true);
    setError('');
    setCopied(false);
    Application.setPublicShareEnabled({
      member_id: memberId,
      enabled: nextEnabled,
    })
      .then((res) => {
        setShareState({
          enabled: Boolean(res.data?.enabled),
          enabled_at: res.data?.enabled_at || null,
          share_path: res.data?.share_path || fallbackSharePath(memberId),
        });
      })
      .catch((err) => {
        setShareState(previousState);
        setError(err?.response?.data?.detail || t('errors.updateFailed'));
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    const didCopy = await copyText(shareUrl);
    setCopied(didCopy);
    if (!didCopy) {
      setError(t('errors.copyFailed'));
    }
  };

  const handleOpen = () => {
    if (!shareUrl) return;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="w-full min-h-screen fixed z-[120] top-0 left-0 flex items-center justify-center px-4">
        <div
          ref={modalReference}
          className="w-full max-w-[560px] rounded-[20px] bg-white shadow-800 p-6"
        >
          <div className="flex items-start justify-between gap-4 border-b border-Gray-50 pb-4">
            <div className="min-w-0 text-start">
              <div className="text-base font-semibold text-Text-Primary">
                {t('title')}
              </div>
              <div className="mt-1 text-xs text-Text-Secondary text-justify">
                {t('subtitle')}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 text-xl leading-none text-[#909090]"
              aria-label={t('closeModal')}
            >
              x
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-[170px] items-center justify-center">
              <SpinnerLoader color="#005F73" />
            </div>
          ) : (
            <div className="pt-5">
              <div className="flex items-start justify-between gap-3 rounded-2xl border border-Gray-50 bg-[#F8FBFC] p-4">
                <div className="min-w-0 flex-1 text-start">
                  <div className="text-sm font-medium text-Text-Primary">
                    {t('toggleLabel')}
                  </div>
                  <div className="mt-1 text-xs text-Text-Secondary text-justify leading-relaxed">
                    {shareState.enabled ? t('sharingOn') : t('sharingOff')}
                  </div>
                </div>
                <div
                  className={`shrink-0 pt-0.5 ${saving || !memberId ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <Toggle
                    checked={shareState.enabled}
                    setChecked={(next) => applyShareEnabled(next)}
                  />
                </div>
              </div>

              {shareState.enabled && (
                <div className="mt-5">
                  <label className="text-xs font-medium text-Text-Secondary">
                    {t('publicLink')}
                  </label>
                  <div className="mt-2 flex flex-col gap-2 md:flex-row">
                    <input
                      readOnly
                      dir="ltr"
                      value={shareUrl}
                      className="min-w-0 flex-1 rounded-xl border border-Gray-50 bg-white px-3 py-2 text-xs text-Text-Primary outline-none"
                      onFocus={(event) => event.target.select()}
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="rounded-xl bg-[#005F73] px-4 py-2 text-xs font-semibold text-white"
                    >
                      {copied ? t('copied') : t('copyLink')}
                    </button>
                    <button
                      type="button"
                      onClick={handleOpen}
                      className="rounded-xl border border-[#005F73] px-4 py-2 text-xs font-semibold text-[#005F73]"
                    >
                      {t('open')}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl bg-[#FFF3F3] px-3 py-2 text-xs text-[#B42318] text-start">
                  {error}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-medium text-[#005F73]"
                >
                  {t('done')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="fixed left-0 top-0 z-[100] h-full min-h-screen w-full bg-black opacity-30" />
    </>
  );
};
