import { publish } from '../../../utils/event';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import SpinnerLoader from '../../SpinnerLoader';

interface HolisticShareProps {
  isHtmlReportExists: boolean;
  isShareModalSuccess: boolean;
  dateShare: string | null;
  handleGetHtmlReport: () => void;
  loadingHtmlReport: boolean;
  shareable: boolean;
}

const HolisticShare: React.FC<HolisticShareProps> = ({
  isHtmlReportExists,
  shareable,
  isShareModalSuccess,
  dateShare,
  handleGetHtmlReport,
  loadingHtmlReport,
}) => {
  return (
    <>
      <div className="flex items-center gap-6">
        {isHtmlReportExists && (
          <>
            {isShareModalSuccess ? (
              <div className="flex flex-col items-center">
                <div className="text-Text-Quadruple text-xs font-medium flex items-center gap-1">
                  <img src="/icons/tick-circle-gray.svg" alt="" />
                  Shared with Client
                </div>
                <div className="text-Text-Fivefold text-[10px]">
                  on{' '}
                  {dateShare
                    ? new Date(dateShare as string).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )
                    : 'just now'}
                </div>
              </div>
            ) : (
              <>
                {shareable && (
                  <div className="rounded-[20px] flex items-center justify-center w-[168px] h-[26px] bg-gradient-to-r from-Primary-DeepTeal to-Primary-EmeraldGreen">
                    <ButtonPrimary
                      ClassName="
    relative z-10 !w-[166px] !h-[24px] !rounded-[20px]
    !bg-backgroundColor-Main !font-medium
    !text-Primary-DeepTeal !text-xs !text-nowrap
    !border-none flex items-center justify-center gap-1
    "
                      onClick={() => {
                        // setIsShareModalOpen(true);
                        publish('openShareModalHolisticPlan', {});
                      }}
                    >
                      <img
                        src="/icons/document-upload.svg"
                        alt=""
                        className="w-4 h-4"
                      />
                      Share with Client
                    </ButtonPrimary>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div className="flex flex-col items-center gap-1">
          <div
            className="text-Primary-DeepTeal text-xs font-medium cursor-pointer flex items-center gap-1"
            onClick={() => {
              if (isHtmlReportExists) {
                handleGetHtmlReport();
              }
            }}
          >
            {isHtmlReportExists || loadingHtmlReport ? (
              <>
                <img className="w-5 h-5" src="/icons/monitor.svg" alt="" />
                View Holistic Plan
              </>
            ) : (
              <>
                <SpinnerLoader color="#005F73"></SpinnerLoader>
              </>
            )}
          </div>
          {!isHtmlReportExists && (
            <div className="text-[10px] text-Primary-DeepTeal">
              Your report is currently being prepared.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HolisticShare;
