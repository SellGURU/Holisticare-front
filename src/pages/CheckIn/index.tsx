/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import {
  ArrangeCard,
  FeelingCard,
  RangeCard,
  RateCard,
  TextCard,
  YesNoCard,
} from './components';
import UploadCard from './components/UploadCard';
import CheckBoxCard from './components/CheckBoxCard';
import MultiChoice from './components/MultiChoiceCard';

interface CheckinProps {
  upData?: Array<checkinType>;
  onChange?: (questions: Array<any>) => void;
}

const Checkin: React.FC<CheckinProps> = ({ upData, onChange }) => {

  
  const [chekinData, setCheckinData] = useState<Array<checkinType>>([]);
  console.log(chekinData);
  useEffect(() => {
    if (upData) {
      setCheckinData(upData);
      console.log('Updated checkinData:', upData);
    }
  }, [upData]);
  useEffect(() => {
    if (onChange) {
      onChange(chekinData);
    }
  }, [chekinData]);
  const updateResponse = (index: number, response: any) => {
    setCheckinData((pre) => {
      const newData = [...pre];
      return newData.map((el, ind) => {
        if (ind == index) {
          return {
            ...el,
            response: response,
          };
        } else {
          return el;
        }
      });
    });
  };
  const resolveQuestionCard = (item: any, index: number) => {
    switch (item.type) {
      case 'Yes/No':
        return (
          <YesNoCard
            index={index}
            question={item.question}
            value={item.response}
          ></YesNoCard>
        );
      case 'Scale':
        return (
          <RangeCard
            index={index}
            question={item.question}
            value={item.response}
          ></RangeCard>
        );

      case 'paragraph':
        return (
          <TextCard
            index={index}
            placeHolder={item.placeHolder}
            question={item.question}
            value={item.response}
            onChange={(value) => {
              updateResponse(index - 1, value);
            }}
          ></TextCard>
        );
      case 'Star Rating':
        return (
          <RateCard
            index={index}
            question={item.question}
            value={item.response}
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
      case 'File Uploader':
        return (
          <UploadCard
            index={index}
            question={item.question}
            value={item.value}
            onSubmit={(values) => {
              console.log(values);
            }}
          ></UploadCard>
        );
      case 'Emojis':
        return (
          <FeelingCard
            index={index}
            question={item.question}
            value={item.response}
          ></FeelingCard>
        );

      case 'checkbox':
        return (
          <MultiChoice
            index={index}
            question={item.question}
            value={item.response}
            options={item.options}
            onChange={(value) => {
              updateResponse(index - 1, value);
            }}
          ></MultiChoice>
        );
      case 'multiple_choice':
        return (
          <CheckBoxCard
            index={index}
            question={item.question}
            value={item.response}
            options={item.options}
            onChange={(value) => {
              updateResponse(index - 1, value);
            }}
          ></CheckBoxCard>
        );
    }
  };
  return (
    <>
       <div className="px-6 py-4 grid gap-3 pb-4">
      {chekinData.map((el: any, index: number) => (
        <div key={index+1}>{resolveQuestionCard(el, index)}</div>
      ))}
    </div>
    </>
  );
};

export default Checkin;
