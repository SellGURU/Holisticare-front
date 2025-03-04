/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { RangeCard, YesNoCard } from './components';

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
  ]);

  const resolveQuestionCard = (item: any) => {
    switch (item.type) {
      case 'yes/no':
        return (
          <YesNoCard question={item.question} value={item.value}></YesNoCard>
        );
      case 'range':
        return (
          <RangeCard question={item.question} value={item.value}></RangeCard>
        );
    }
  };
  return (
    <>
      <div className=" px-6 py-4 grid gap-3">
        {chekinData.map((el: any) => {
          return <>{resolveQuestionCard(el)}</>;
        })}
      </div>
    </>
  );
};

export default Checkin;
