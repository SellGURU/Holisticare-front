/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import SearchBox from '../../SearchBox';
import LibBox from './LibBox';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import SpinnerLoader from '../../SpinnerLoader';
import ActionCard from './ActionCard';
import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
import { AlertModal } from '../../AlertModal';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import ActionEditModal from './ActionEditModal';
import BasedOnModal from './BasedOnModal';

interface StadioProps {
  data: Array<any>;
  actions: Array<any>;
  setActions: (data: any) => void;
  setData: (values: any) => void;
  setCalendarView: (value: boolean) => void;
}

const Stadio: React.FC<StadioProps> = ({
  data,
  setData,
  setActions,
  actions,
  setCalendarView,
}) => {
  const [selectCategory, setSelectedCategory] = useState('Diet');
  const [haveConflic, setHaveConflic] = useState(false);
  const [haveConflicText, setHaveConflicText] = useState('');
  const AllCategories = ['Diet', 'Activity', 'Supplement', 'Lifestyle'];
  const [searchValue, setSearchValue] = useState('');
  const [isAutoGenerate, setIsAutoGenerate] = useState(false);
  const addToActions = (item: any) => {
    setActions((prev: any) => [item, ...prev]);
    setData((prev: Array<any>) => {
      const oldCategory = [...prev];
      const itemindex = prev.findIndex(
        (el: any) => JSON.stringify(el) === JSON.stringify(item),
      );
      return oldCategory.filter((_el, inde) => inde != itemindex);
    });
  };
  const removeFromActions = (item: any) => {
    setActions((prev: any) => {
      const updatedActions = prev.filter(
        (el: any) => JSON.stringify(el) !== JSON.stringify(item),
      );
      return updatedActions;
    });

    setData((prev: Array<any>) => [item, ...prev]);
  };
  const { id } = useParams<{ id: string }>();
  const AutoGenerate = () => {
    setIsAutoGenerate(true);
    Application.getActionPlanGenerateActionPlanTaskNew({
      member_id: id,
      tasks: data,
    })
      .then((res) => {
        setActions(res.data);
      })
      .finally(() => {
        setIsAutoGenerate(false);
      });
  };
  const conflicCheck = () => {
    if (actions.length > 1) {
      Application.checkConflicActionPlan({
        member_id: id,
        tasks: actions,
      }).then((res) => {
        if (res.data.conflicts != 'No conflicts detected.') {
          setHaveConflic(true);
          setHaveConflicText(res.data.conflicts);
        } else {
          setHaveConflic(false);
        }
      });
    }
  };
  useEffect(() => {
    conflicCheck();
  }, [actions]);
  const filteredData = data.filter(
    (el) =>
      el.Category == selectCategory &&
      el.Recommendation.toLowerCase().includes(searchValue.toLowerCase()),
  );
  const [showAddModal, setshowAddModal] = useState(false);
  const [showBasedOn, setShowBasedOn] = useState(false);
  const [valueBasedOn, setValueBasedOn] = useState([]);

  return (
    <>
      <ActionEditModal
        isAdd
        isOpen={showAddModal}
        onClose={() => {
          setshowAddModal(false);
        }}
        onAddNotes={() => {}}
        onSubmit={(addData) => {
          const newData = {
            Category: addData.Category,
            Recommendation: addData.Recommendation || '',
            'Based on': '',
            'Practitioner Comments': addData['Practitioner Comments'] || [],
            Instruction: addData.Instruction || '',
            Times: addData.Times || [],
            Dose: addData.Dose || null,
            'Client Notes': addData['Client Notes'] || [],
            Score: 10,
            Days: addData.Days || [],
            Layers: {
              first_layer: '',
              second_layer: '',
              third_layer: '',
            },
          };
          setData((prevData: any) => [...prevData, newData]);
          setshowAddModal(false);
        }}
      />
      <div className="flex px-6 gap-4">
        <div className="flex-grow">
          {/* alert */}
          {haveConflic && (
            <div className="w-full  my-2 ">
              <AlertModal
                heading="Alert heading"
                text={haveConflicText}
                onClose={() => {
                  setHaveConflic(false);
                }}
              />
            </div>
          )}
          <div className="w-full flex justify-end mb-2">
            {actions.length !== 0 && (
              <div
                className="flex items-center gap-1 text-xs font-medium text-Primary-DeepTeal mr-4 cursor-pointer"
                onClick={() => setCalendarView(true)}
              >
                <img src="/icons/calendar-date.svg" alt="" className="w-5" />
                Calendar View
              </div>
            )}
            <ButtonPrimary onClick={() => setshowAddModal(true)}>
              {' '}
              <img src="/icons/add-square.svg" alt="" /> Add
            </ButtonPrimary>
          </div>
          <div
            className={`w-full min-h-[450px] bg-white rounded-[24px] border border-gray-50 shadow-100   ${actions.length != 0 && ''} `}
          >
            {actions.length == 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-[450px]">
                <img
                  src="/icons/document-text.svg"
                  alt=""
                  className="w-[87px] h-[87px]"
                />
                <div className="text-Text-Primary font-medium text-base mt-2">
                  No action to show
                </div>
                <ButtonSecondary
                  ClassName="rounded-[20px] mt-8"
                  onClick={() => {
                    AutoGenerate();
                  }}
                >
                  {isAutoGenerate ? (
                    <SpinnerLoader />
                  ) : (
                    <>
                      <img
                        src="/icons/tree-start-white.svg"
                        alt=""
                        className="mr-2"
                      />
                      Auto Generate
                    </>
                  )}
                </ButtonSecondary>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 py-3 min-h-[420px]">
                  {actions.map((act: any, index: number) => {
                    return (
                      <>
                        <ActionCard
                          data={act}
                          onRemove={() => removeFromActions(act)}
                          setActions={setActions}
                          key={index}
                          index={index}
                        />
                      </>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
        <div className=" w-[342px] ">
          <div className="w-[342px] sticky top-[190px] p-4 h-[490px] bg-white rounded-[24px] border border-gray-50 shadow-100">
            <SearchBox
              ClassName="rounded-2xl border shadow-none h-[40px] bg-white md:min-w-full"
              placeHolder="Search for actions ..."
              onSearch={(value) => {
                setSearchValue(value);
              }}
            ></SearchBox>
            <div>
              <div className="flex w-full gap-2 text-center items-center justify-between mt-2 flex-wrap">
                {AllCategories.map((cat) => {
                  return (
                    <>
                      <div
                        className={`${selectCategory === cat ? 'bg-[linear-gradient(89.73deg,_rgba(0,95,115,0.5)_-121.63%,_rgba(108,194,74,0.5)_133.18%)] text-Primary-DeepTeal' : 'bg-backgroundColor-Main text-Text-Primary'} px-4 py-2 rounded-2xl text-[10px] flex-grow cursor-pointer`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </div>
                    </>
                  );
                })}
              </div>
              <div className="w-full h-[390px] overflow-y-auto">
                <div className="mt-2 grid gap-2">
                  {filteredData.map((value: any) => {
                    return (
                      <>
                        <LibBox
                          onAdd={() => addToActions(value)}
                          data={value}
                          setShowBasedOn={setShowBasedOn}
                          setValueBasedOn={setValueBasedOn}
                        />
                      </>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BasedOnModal
        value={valueBasedOn}
        setShowModal={setShowBasedOn}
        showModal={showBasedOn}
      />
    </>
  );
};

export default Stadio;
