/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import SvgIcon from '../../../utils/svgIcon';
import FormsApi from '../../../api/Forms';
import TableForm from './TableForm';
import { MainModal } from '../../../Components';
// import AddCheckIn from "./AddCheckIn";
import CheckInControllerModal from './CheckInControllerModal';
import CheckInPreview from './CheckInPreview';
import TemplateQuestinary from './TemplateQuestionary';

interface CheckInFormProps {
  isQuestionary?: boolean;
}

const CheckInForm: React.FC<CheckInFormProps> = ({ isQuestionary }) => {
  const [checkInList, setCheckInList] = useState<Array<CheckInDataRowType>>([]);
  const [showaddModal, setShowAddModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editFormId, setEditFormId] = useState('');
  const [showReposition, setShowReposition] = useState(false);
  const [showTemplates,setShowTemplates] = useState(false)
  const [showFeedback,setShowFeedBack] = useState(false)
  const [,setSelectedTemplate] = useState(null)
  const getChechins = () => {
    FormsApi.getCheckinList().then((res) => {
      setCheckInList(res.data);
    });
  };
  const getQuestionary = () => {
    FormsApi.getQuestionaryList().then((res) => {
      setCheckInList(res.data);
    });
  };
  useEffect(() => {
    if (isQuestionary) {
      getQuestionary();
    } else {
      getChechins();
    }
  }, [isQuestionary]);
  const resolveMode = () => {
    // editFormId != '' ? 'Edit' : 'Add'
    if (editFormId == '') {
      return 'Add';
    }
    if (showReposition) {
      return 'Reposition';
    }
    return 'Edit';
  };
  const onsave = (values: any) => {
    if (showReposition) {
      FormsApi.checkInReposition({
        unique_id: editFormId,
        questions: values.questions.map((el: any, index: number) => {
          return {
            ...el,
            order: index + 1,
          };
        }),
      }).then(() => {
        getChechins();
        setShowAddModal(false);
        setShowReposition(false);
      });
    } else if (editFormId != '') {
      FormsApi.editCheckIn({
        unique_id: editFormId,
        ...values,
      }).then(() => {
        getChechins();
        setShowAddModal(false);
      });
    } else {
      FormsApi.addCheckin(values).then(() => {
        getChechins();
        setShowAddModal(false);
      });
    }
  };
  return (
    <>
      {checkInList.length > 0 ? (
        <>
          <div className="flex flex-col w-full mt-4">
            <div className="w-full flex items-center justify-between mb-3">
              <div className="text-Text-Primary font-medium text-sm">
                {isQuestionary ? 'Questionary Forms' : 'Check-In Forms'}
              </div>
              <ButtonSecondary
                ClassName="rounded-[20px] w-[152px]"
                onClick={() => {
                  setShowAddModal(true);
                  // setCheckInList([]);
                  // setMainTitle('');
                  // setEditModeModal(false);
                  // setShowModal(true);
                  // setRepositionModeModal(false);
                }}
              >
                <SvgIcon src="/icons/firstline.svg" color="#FFF" />
                Create New
              </ButtonSecondary>
            </div>
            <TableForm
              classData={checkInList}
              onDelete={(id) => {
                if (isQuestionary) {
                  FormsApi.deleteQuestionary(id).then(() => {
                    getQuestionary();
                  });
                } else {
                  FormsApi.deleteCheckin(id).then(() => {
                    getChechins();
                  });
                }
              }}
              onEdit={(id) => {
                setShowAddModal(true);
                setEditFormId(id);
              }}
              onPreview={(id) => {
                setShowPreview(true);
                setEditFormId(id);
              }}
              onReposition={(id) => {
                setShowReposition(true);
                setEditFormId(id);
              }}
            ></TableForm>
          </div>
        </>
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
            {isQuestionary
              ? 'No questionary form existed yet.'
              : 'No check-in form existed yet.'}
          </div>
          <ButtonSecondary
            ClassName="rounded-[20px] w-[229px] mt-9"
            onClick={() => {
              // setShowModal(true);
              if(isQuestionary){
                setShowTemplates(true)
              }else {
                setShowAddModal(true);

              }
            }}
          >
            <SvgIcon src="/icons/firstline.svg" color="#FFF" />
            Create New
          </ButtonSecondary>
        </>
      )}
      <MainModal
        isOpen={showaddModal || showReposition}
        onClose={() => {
          // setShowModal(false);
          setEditFormId('');
          setShowReposition(false);
          setShowAddModal(false);
        }}
      >
        <CheckInControllerModal
          editId={editFormId}
          onClose={() => {
            setShowReposition(false);
            setShowAddModal(false);
          }}
          onSave={(values) => {
            onsave(values);
          }}
          mode={resolveMode()}
        ></CheckInControllerModal>
      </MainModal>

      <MainModal
        onClose={() => {
          setShowPreview(false);
          setEditFormId('');
        }}
        isOpen={showPreview}
      >
        <>
          <CheckInPreview
            id={editFormId}
            onClose={() => {
              setShowPreview(false);
              setEditFormId('');
            }}
          ></CheckInPreview>
        </>
      </MainModal>

      <MainModal isOpen={showTemplates} onClose={() => {setShowTemplates(false)}}>
        <TemplateQuestinary onselect={(values) =>{
          setShowTemplates(false)
          setSelectedTemplate(values)
          setShowFeedBack(true)
        }}></TemplateQuestinary>
      </MainModal>
      
      <MainModal isOpen={showFeedback} onClose={() => {
        setShowFeedBack(false)
      }}>
        <>
        </>

      </MainModal>
    </>
  );
};

export default CheckInForm;
