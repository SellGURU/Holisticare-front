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
  const resolveStapImage = (ste: string) => {
    // ""
    switch (ste) {
      case 'Feedback Form':
        return '/images/forms/feedback-Form.png';
      case 'Physical Activity Readiness Questionnaire (PAR-Q)':
        return '/images/forms/PAR-Q.png';
      case 'Health and Lifestyle Profile':
        return '/images/forms/initial-Questionnaire.png';
      case 'Emotional Health and Motivation Assessment':
        return '/images/forms/emotional-health.png';
      case 'Fitness Test Results':
        return '/images/forms/fitness-test.png';
    }
  };
  return (
    <>
      <div className="flex flex-col justify-between bg-white w-[93vw] md:w-[864px] rounded-[20px] p-4">
        <div className="w-full h-full">
          <div className="flex justify-start items-center">
            <div className="text-Text-Primary font-medium">
              Questionnaire Forms
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
                      className="flex flex-col items-center h-[352px] w-[193px] cursor-pointer"
                      onClick={() => {
                        onselect(el);
                      }}
                    >
                      <img src={resolveStapImage(el.title)} alt="" />
                      <div className="flex gap-1 mt-2 text-Text-Primary text-xs font-medium w-full">
                        <img
                          src="/icons/book-green.svg"
                          alt=""
                          className="w-4 h-4"
                        />
                        {el.title}
                      </div>
                      <div className="text-[10px] text-justify  text-Text-Quadruple mt-2">
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
                className="flex flex-col items-center h-[352px] w-[193px] cursor-pointer"
                onClick={() => {
                  onselect(null);
                }}
              >
                <div className="flex flex-col justify-center items-center w-[193px] h-[140px] border-dashed border-2 border-[#005F73] rounded-[8px]">
                  <img src={'./icons/EmptyStateForm.svg'} alt="" />
                  <div className="text-[#005F73] text-xs font-medium">
                    {' '}
                    Create Your Form
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-Text-Primary text-xs font-medium w-full">
                  <img src="/icons/book-green.svg" alt="" className="w-4 h-4" />
                  Personal Form
                  {/* {el.title} */}
                </div>
                <div className="text-[10px] text-justify  text-Text-Quadruple mt-2">
                  {/* {el.description} */}A personalized form to track users'
                  activities
                </div>
                <div className="w-full">
                  <div className="w-[93px] h-[16px] rounded-xl bg-Primary-DeepTeal bg-opacity-10 text-[8px] text-Primary-DeepTeal flex items-center justify-center mt-2">
                    {/* {el.questions.length} Questions */}
                    Unlimited Questions
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
