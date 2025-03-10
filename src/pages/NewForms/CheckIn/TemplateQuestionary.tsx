/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import FormsApi from '../../../api/Forms';
import Circleloader from '../../../Components/CircleLoader';

interface TemplateQuestinaryProps {
  onselect: (data: any) => void;
}

const TemplateQuestinary: React.FC<TemplateQuestinaryProps> = ({
  onselect,
}) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    FormsApi.getCheckinTemplates().then((res) => {
      setTemplates(res.data);
      setIsLoading(false);
    });
  }, []);
  return (
    <>
      <div className="flex flex-col justify-between bg-white w-[664px] rounded-[20px] p-4">
        <div className="w-full h-full">
          <div className="flex justify-start items-center">
            <div className="text-Text-Primary font-medium">
              Ready-made Questionnaire Templates
            </div>
          </div>
          <div className="w-full h-[1px] bg-Boarder my-3"></div>
          {isLoading ? (
            <div className="h-[150px] flex justify-center items-center">
              <Circleloader></Circleloader>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-6">
              {templates.map((el: any) => {
                return (
                  <>
                    <div
                      className="flex flex-col items-center w-[193px] cursor-pointer"
                      onClick={() => {
                        onselect(el);
                      }}
                    >
                      <img
                        src="/images/forms/initial-Questionnaire.png"
                        alt=""
                      />
                      <div className="flex items-center gap-1 mt-2 text-Text-Primary text-xs font-medium w-full">
                        <img
                          src="/icons/book-green.svg"
                          alt=""
                          className="w-4 h-4"
                        />
                        {el.title}
                      </div>
                      <div className="text-[10px] text-Text-Quadruple mt-2">
                        {el.description}
                      </div>
                      <div className="w-full">
                        <div className="w-[64px] h-[16px] rounded-xl bg-Primary-DeepTeal bg-opacity-10 text-[8px] text-Primary-DeepTeal flex items-center justify-center mt-2">
                          {el.questions.length} Questions
                        </div>
                      </div>
                    </div>
                  </>
                );
              })}
              <div
                className="flex flex-col opacity-40 items-center w-[193px]"
                onClick={() => {}}
              >
                <img src="/images/forms/PAR-Q.png" alt="" />
                <div className="flex items-center gap-1 mt-2 text-Text-Primary text-xs font-medium w-full">
                  <img
                    src="/icons/activity-green.svg"
                    alt=""
                    className="w-4 h-4"
                  />
                  PAR-Q
                </div>
                <div className="text-[10px] text-Text-Quadruple mt-2">
                  A form to access the user`s physical activity readiness
                </div>
                <div className="w-full">
                  <div className="w-[64px] h-[16px] rounded-xl bg-Primary-DeepTeal bg-opacity-10 text-[8px] text-Primary-DeepTeal flex items-center justify-center mt-2">
                    11 Questions
                  </div>
                </div>
              </div>
              <div
                className="flex flex-col items-center opacity-40 w-[193px] "
                onClick={() => {}}
              >
                <img src="/images/forms/feedback-Form.png" alt="" />
                <div className="flex items-center gap-1 mt-2 text-Text-Primary text-xs font-medium w-full">
                  <img src="/icons/star-green.svg" alt="" className="w-4 h-4" />
                  Feedback Form
                </div>
                <div className="text-[10px] text-Text-Quadruple mt-2">
                  A form to collect user`s feedback and satisfaction
                </div>
                <div className="w-full">
                  <div className="w-[64px] h-[16px] rounded-xl bg-Primary-DeepTeal bg-opacity-10 text-[8px] text-Primary-DeepTeal flex items-center justify-center mt-2">
                    08 Questions
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TemplateQuestinary;
