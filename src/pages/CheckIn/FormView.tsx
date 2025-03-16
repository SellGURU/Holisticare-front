/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import Checkin from '.';
import { useEffect, useState } from 'react';
import Mobile from '../../api/mobile';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import Circleloader from '../../Components/CircleLoader';

const FormView = () => {
  const { encode, id } = useParams();
  const [isLoading, setIsLaoding] = useState(false);
  // const formData = {
  //   title: 'Daily Check in',
  //   questions: [
  //     {
  //       type: 'paragraph',
  //       question: 'Did you stick to the Meal Plan?',
  //       required: false,
  //       response: '',
  //       placeHolder: 'Write the snacks you took ...',
  //     },
  //     {
  //       type: 'Scale',
  //       question: 'How many hours did you sleep yesterday?',
  //       required: false,
  //       response: '',
  //     },
  //     {
  //       type: 'Emojis',
  //       question: 'How are you feeling today?',
  //       required: false,
  //       response: '',
  //     },
  //     {
  //       type: 'Star Rating',
  //       question: 'Rate your workout.',
  //       required: false,
  //       response: '',
  //     },
  //     {
  //       type: 'File Uploader',
  //       question: 'Upload your progress pictures.',
  //       required: false,
  //       response: '',
  //     },
  //     {
  //       type: 'paragraph',
  //       question: 'What snacks did you take today?',
  //       required: false,
  //       response: '',
  //       placeHolder: 'Write the snacks you took ...',
  //     },
  //     {
  //       type: 'paragraph',
  //       question: 'How many hours did you work today?(Dropdown sample)',
  //       required: false,
  //       response: '',
  //       placeHolder: 'Write the snacks you took ...',
  //     },
  //   ],
  // };
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    setIsLaoding(true);
    Mobile.getQuestionaryEmpty({
      encoded_mi: encode as string,
      unique_id: id as string,
    }).then((e) => {
      setData(e.data);
      setIsLaoding(false);
    });
  }, []);
  return (
    <>
      <div className="w-full py-3 px-4 h-svh overflow-y-scroll">
        {isLoading ? (
          <>
            <div className="flex justify-center items-center mt-20">
              <Circleloader></Circleloader>
            </div>
          </>
        ) : (
          <>
            <Checkin upData={data?.questions}></Checkin>
            <div className="w-full flex justify-center my-2">
              <ButtonSecondary>save</ButtonSecondary>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default FormView;
