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
import QuestionaryControllerModal from './QuestionaryControllerModal';
import Circleloader from '../../../Components/CircleLoader';
interface CheckInFormProps {
  isQuestionary?: boolean;
  search?: string;
}

const CheckInForm: React.FC<CheckInFormProps> = ({ isQuestionary, search }) => {
  const [loading, setLoading] = useState(true);
  const [checkInList, setCheckInList] = useState<Array<CheckInDataRowType>>([]);
  const [showaddModal, setShowAddModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editFormId, setEditFormId] = useState('');
  const [showReposition, setShowReposition] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFeedback, setShowFeedBack] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [errorCheckIn, setErrorCheckIn] = useState('');
  const [errorQuestionary, setErrorQuestionary] = useState('');
  const getChechins = () => {
    setLoading(true);
    FormsApi.getCheckinList().then((res) => {
      setCheckInList(res.data);
      setLoading(false);
    });
  };
  const getQuestionary = () => {
    setLoading(true);
    FormsApi.getQuestionaryList().then((res) => {
      setCheckInList(res.data);
      setLoading(false);
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
      FormsApi.addCheckin(values)
        .then(() => {
          getChechins();
          setShowAddModal(false);
          setErrorCheckIn('');
        })
        .catch((err) => {
          setErrorCheckIn(err.detail);
        });
    }
  };
  const onsaveQuestionary = (values: any) => {
    if (showReposition) {
      FormsApi.QuestionaryReposition({
        unique_id: editFormId,
        questions: values.questions.map((el: any, index: number) => {
          return {
            ...el,
            order: index + 1,
          };
        }),
      }).then(() => {
        getQuestionary();
        setShowFeedBack(false);
        setShowReposition(false);
        setEditFormId('');
        setSelectedTemplate(null);
      });
    } else if (editFormId != '') {
      FormsApi.editQuestionary({
        unique_id: editFormId,
        ...values,
      }).then(() => {
        getQuestionary();
        setShowFeedBack(false);
      });
    } else {
      FormsApi.addQuestionary(values)
        .then(() => {
          getQuestionary();
          setShowFeedBack(false);
          setErrorQuestionary('');
          setEditFormId('');
          setSelectedTemplate(null);
        })
        .catch((err) => {
          setErrorQuestionary(err.detail);
        });
    }
  };
  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-[50]">
          <Circleloader></Circleloader>
        </div>
      )}
      {checkInList.length > 0 ? (
        <>
          <div className="flex flex-col w-full mt-4">
            {checkInList.filter((el) =>
              el.title.toLowerCase().includes(search?.toLowerCase() || ''),
            ).length ? (
              <div className="w-full flex items-center justify-between mb-3">
                <div className="text-Text-Primary font-medium text-sm">
                  {isQuestionary ? 'Questionnaire Forms' : 'Check-in Forms'}
                </div>
                <ButtonSecondary
                  ClassName="rounded-[20px] w-[152px]"
                  onClick={() => {
                    if (isQuestionary) {
                      setShowTemplates(true);
                    } else {
                      setShowAddModal(true);
                    }
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
            ) : (
              ''
            )}
            <TableForm
              classData={checkInList.filter((el) =>
                el.title.toLowerCase().includes(search?.toLowerCase() || ''),
              )}
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
                if (isQuestionary) {
                  setShowFeedBack(true);
                } else {
                  setShowAddModal(true);
                }
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
            />
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
              ? ' No questionnaire form exists yet.'
              : 'No check-in form exists yet.'}
          </div>
          <ButtonSecondary
            ClassName="rounded-[20px] w-[229px] mt-9"
            onClick={() => {
              // setShowModal(true);
              if (isQuestionary) {
                setShowTemplates(true);
              } else {
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
        isOpen={(showaddModal || showReposition) && !isQuestionary}
        onClose={() => {
          // setShowModal(false);
          setEditFormId('');
          setShowReposition(false);
          setShowAddModal(false);
          setErrorCheckIn('')
        }}
      >
        <CheckInControllerModal
          editId={editFormId}
          onClose={() => {
            setEditFormId('');
            setShowReposition(false);
            setShowAddModal(false);
            setErrorCheckIn('')
          }}
          onSave={(values) => {
            onsave(values);
          }}
          error={errorCheckIn}
          setError={setErrorCheckIn}
          mode={resolveMode()}
        />
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
            isQuestionary={isQuestionary}
            onClose={() => {
              setShowPreview(false);
              setEditFormId('');
            }}
          ></CheckInPreview>
        </>
      </MainModal>

      <MainModal
        isOpen={showTemplates}
        onClose={() => {
          setShowTemplates(false);
        }}
      >
        <TemplateQuestinary
          onselect={(values) => {
            setShowTemplates(false);
            setSelectedTemplate(values);
            setShowFeedBack(true);
          }}
        ></TemplateQuestinary>
      </MainModal>

      <MainModal
        isOpen={(showFeedback || showReposition) && isQuestionary}
        onClose={() => {
          setErrorQuestionary('')
          setShowFeedBack(false);
          setEditFormId('');
          setSelectedTemplate(null);
          setShowReposition(false);
        }}
      >
        <QuestionaryControllerModal
          templateData={selectedTemplate}
          onClose={() => {
            setShowFeedBack(false);
            setEditFormId('');
            setSelectedTemplate(null);
            setShowReposition(false);
            setErrorQuestionary('')
          }}
          onSave={(values) => {
            onsaveQuestionary(values);
          }}
          editId={editFormId}
          error={errorQuestionary}
          mode={resolveMode()}
        ></QuestionaryControllerModal>
      </MainModal>
    </>
  );
};

export default CheckInForm;
