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

interface CheckinProps {
  upData?:Array<checkinType>
}

const Checkin:React.FC<CheckinProps> = ({
  upData
}) => {
  const [chekinData,setCheckinData] = useState<Array<checkinType>>([]);
  useEffect(() => {
    if(upData){
      setCheckinData(upData)
    }
  },[upData])
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

      case 'Text':
        return (
          <TextCard
            index={index}
            placeHolder={item.placeHolder}
            question={item.question}
            value={item.response}
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
    }
  };
  return (
    <>
      <div className=" px-6 py-4 grid gap-3 max-h-svh overflow-y-auto pb-4">
        {chekinData.map((el: any, index: number) => {
          return <>{resolveQuestionCard(el, index + 1)}</>;
        })}
      </div>
    </>
  );
};

export default Checkin;
