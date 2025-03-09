/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import SvgIcon from '../../../utils/svgIcon';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import MainModal from '../../MainModal';
import QuestionaryModalContent from './components/QuestionaryModalContent';
import TableNoPaginateForForms from './components/TableNoPaginate';

interface FormsQuestionaryProps {
  showModalQuestionary: boolean;
  setShowModalQuestionary: (value: boolean) => void;
  editModeModalQuestionary: boolean;
  setEditModeModalQuestionary: (value: boolean) => void;
  repositionModeModalQuestionary: boolean;
  setRepositionModeModalQuestionary: (value: boolean) => void;
  questionaryListModal: Array<any>;
  setQuestionaryListModal: (value: any) => void;
  setQuestionaryLists: (value: any) => void;
  questionaryLists: Array<any>;
  setQuestionaryListEditValue: (value: any) => void;
  questionaryListEditValue: any;
  mainTitleQuestionary: string;
  setMainTitleQuestionary: (value: string) => void;
  step: number;
  setStep: (value: number) => void;
}

const FormsQuestionary: FC<FormsQuestionaryProps> = ({
  setShowModalQuestionary,
  showModalQuestionary,
  editModeModalQuestionary,
  setEditModeModalQuestionary,
  repositionModeModalQuestionary,
  setRepositionModeModalQuestionary,
  questionaryListModal,
  setQuestionaryListModal,
  questionaryLists,
  setQuestionaryLists,
  questionaryListEditValue,
  setQuestionaryListEditValue,
  mainTitleQuestionary,
  setMainTitleQuestionary,
  setStep,
  step,
}) => {
  return (
    <>
      {questionaryLists.length > 0 ? (
        <div className="flex flex-col w-full mt-4">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="text-Text-Primary font-medium text-sm">
              Questionary Forms
            </div>
            <ButtonSecondary
              ClassName="rounded-[20px] w-[152px]"
              onClick={() => {
                setQuestionaryListModal([]);
                setEditModeModalQuestionary(false);
                setShowModalQuestionary(true);
                setRepositionModeModalQuestionary(false);
                setStep(1);
              }}
            >
              <SvgIcon src="/icons/firstline.svg" color="#FFF" />
              Create New
            </ButtonSecondary>
          </div>
          <TableNoPaginateForForms
            classData={questionaryLists}
            setCheckInLists={setQuestionaryLists}
            setCheckInListEditValue={setQuestionaryListEditValue}
            setEditModeModal={setEditModeModalQuestionary}
            setShowModal={setShowModalQuestionary}
            setRepositionModeModal={setRepositionModeModalQuestionary}
            setStep={setStep}
          />
        </div>
      ) : (
        <>
          <img
            src="/icons/plant-device-floor.svg"
            alt="plant-device-floor"
            width="284.53px"
            height="190px"
            className="mt-16"
          />
          <div className="text-Text-Primary text-base font-medium mt-9">
            No questionary form existed yet.
          </div>
          <ButtonSecondary
            ClassName="rounded-[20px] w-[229px] mt-9"
            onClick={() => {
              setShowModalQuestionary(true);
              setStep(1);
            }}
          >
            <SvgIcon src="/icons/firstline.svg" color="#FFF" />
            Create New
          </ButtonSecondary>
        </>
      )}
      <MainModal
        isOpen={showModalQuestionary}
        onClose={() => {
          setShowModalQuestionary(false);
        }}
      >
        <QuestionaryModalContent
          setShowModalQuestionary={setShowModalQuestionary}
          questionaryListModal={questionaryListModal}
          setQuestionaryListModal={setQuestionaryListModal}
          setQuestionaryLists={setQuestionaryLists}
          editModeModalQuestionary={editModeModalQuestionary}
          questionaryListEditValue={questionaryListEditValue}
          setEditModeModalQuestionary={setEditModeModalQuestionary}
          mainTitleQuestionary={mainTitleQuestionary}
          setMainTitleQuestionary={setMainTitleQuestionary}
          repositionModeModalQuestionary={repositionModeModalQuestionary}
          setRepositionModeModalQuestionary={setRepositionModeModalQuestionary}
          setStep={setStep}
          step={step}
        />
      </MainModal>
    </>
  );
};

export default FormsQuestionary;
