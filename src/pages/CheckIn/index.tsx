/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  ArrangeCard,
  FeelingCard,
  RangeCard,
  RateCard,
  TextCard,
  YesNoCard,
} from './components';
import UploadCard from './components/UploadCard';

const Checkin = () => {
  const [chekinData] = useState([
    {
      type: 'yes/no',
      question: 'Did you stick to the Meal Plan?',
      value: 'Yes',
    },
    {
      type: 'range',
      question: 'How many hours did you sleep yesterday?',
      value: '4',
    },
    {
      type: 'feeling',
      question: 'How are you feeling today?',
      value: 'Neutral',
    },    
    {
      type: 'rate',
      question: 'Rate your workout.',
      value: '4.5',
    },    
    {
      type: 'upload',
      question: 'Upload your progress pictures.',
      value: {
        frontal:"",
        Back:"",
        side:""        
      },
    },    
    {
      type: 'text',
      question: 'What snacks did you take today?',
      value: '',
      placeHolder: 'Write the snacks you took ...',
    },

    {
      type: 'arrange',
      question: 'Weight',
      value: '60',
    },


  ]);

  const resolveQuestionCard = (item: any, index: number) => {
    switch (item.type) {
      case 'yes/no':
        return (
          <YesNoCard
            index={index}
            question={item.question}
            value={item.value}
          ></YesNoCard>
        );
      case 'range':
        return (
          <RangeCard
            index={index}
            question={item.question}
            value={item.value}
          ></RangeCard>
        );

      case 'text':
        return (
          <TextCard
            index={index}
            placeHolder={item.placeHolder}
            question={item.question}
            value={item.value}
          ></TextCard>
        );
      case 'rate':
        return (
          <RateCard
            index={index}
            question={item.question}
            value={item.value}
          ></RateCard>
        );
      case 'arrange':
        return (
          <ArrangeCard
            index={index}
            question={item.question}
            value={item.value}
          ></ArrangeCard>
        );
      case 'upload':
        return (
          <UploadCard
            index={index}
            question={item.question}
            value={item.value}
            onSubmit={(values) => {
              console.log(values)
            }}
          ></UploadCard>
        );
      case 'feeling':
        return (
          <FeelingCard
            index={index}
            question={item.question}
            value={item.value}
          ></FeelingCard>
        );
    }
  };
  return (
    <>
      <div className=" px-6 py-4 grid gap-3 h-svh overflow-y-auto pb-4">
        {chekinData.map((el: any, index: number) => {
          return <>{resolveQuestionCard(el, index + 1)}</>;
        })}
      </div>
    </>
  );
};

export default Checkin;
