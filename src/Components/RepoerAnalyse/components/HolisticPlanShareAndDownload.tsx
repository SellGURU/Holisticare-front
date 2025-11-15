/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { publish, subscribe } from "../../../utils/event";
import { ButtonPrimary } from "../../Button/ButtonPrimary";
import SpinnerLoader from "../../SpinnerLoader";

interface HolisticPlanShareAndDownloadProps {
    isHtmlReportExists:boolean;
    loadingHtmlReport:boolean;
    handleGetHtmlReport:(url?:string) => void;
}

const HolisticPlanShareAndDownload = ({isHtmlReportExists,loadingHtmlReport,handleGetHtmlReport}:HolisticPlanShareAndDownloadProps) => {
    const [activeTreatment, setActiveTreatment] = useState<any>(null);
    useEffect(() => {
        subscribe('holisticPlanactiveChange', (data:any) => {
            setActiveTreatment(data.detail.data);
        });
    },[])


    const resolveisSharedButtonUi =() => {
        return (
            <>
              <div className="flex flex-col items-center">
                <div className="text-Text-Quadruple text-xs font-medium flex items-center gap-1">
                  <img src="/icons/tick-circle-gray.svg" alt="" />
                  Shared with Client
                </div>
                <div className="text-Text-Fivefold text-[10px]">
                  on{' '}
                  { new Date(activeTreatment.shared_report_with_client_date as string).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )
                }
                </div>
              </div>            
            </>
        )
    }
    const resolveisNotSharedButtonUi = () => {
        const disabled = !isHtmlReportExists;
        return (
            <>
                <div
                className={`rounded-[20px] flex items-center justify-center w-[168px] h-[26px] ${disabled ? 'border-Primary-DeepTeal border' : 'bg-gradient-to-r from-Primary-DeepTeal to-Primary-EmeraldGreen'}`}
                >
                <ButtonPrimary
                    disabled={disabled}
                    ClassName={`
                    relative z-10 !w-[166px] !h-[24px] !rounded-[20px]
                    !bg-backgroundColor-Main !font-medium
                    !text-Primary-DeepTeal !text-xs !text-nowrap
                    !border-none flex items-center justify-center gap-1
                    
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => {
                        console.log(activeTreatment);
                        publish('openShareModalHolisticPlan', {
                            treatmentId: activeTreatment.t_plan_id,
                        });
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
            </>
        )
    }
    const resolveShareButtonHadler = () => {
        const isShared = activeTreatment?.shared_report_with_client;
        if(isShared){
            return resolveisSharedButtonUi();
        }
        return activeTreatment?.state == 'On Going'? resolveisNotSharedButtonUi() : '';
    }


    const resolveDownloadButtonHadler = () => {
        return (
            <>
            <div className="flex flex-col items-center gap-1">
              <div
                className="text-Primary-DeepTeal text-xs font-medium cursor-pointer flex items-center gap-1"
                onClick={() => {
                  if (isHtmlReportExists || activeTreatment?.readonly_html_url!='') {
                    if(activeTreatment.readonly_html_url!=''){
                      handleGetHtmlReport(activeTreatment.readonly_html_url);
                    }else{
                      handleGetHtmlReport();
                    }
                    // handleGetHtmlReport();
                  }
                }}
              >
                {(isHtmlReportExists || loadingHtmlReport || activeTreatment?.readonly_html_url!='') ? (
                  <>
                    <img className="w-5 h-5" src="/icons/monitor.svg" alt="" />
                    View Holistic Plan
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <SpinnerLoader color="#005F73"></SpinnerLoader>
                    <div className="text-[10px] text-Primary-DeepTeal">
                      Your report is currently being prepared.
                    </div>
                  </div>
                )}
              </div>
              {/* {!isHtmlReportExists && (
              )} */}
            </div>            
            </>
        )
    }
    return (
        <>
            <div
                className={`flex  items-center  gap-6`}
            >
                {resolveShareButtonHadler()}
                {resolveDownloadButtonHadler()}
            </div>        
        </>
    )
}

export default HolisticPlanShareAndDownload;