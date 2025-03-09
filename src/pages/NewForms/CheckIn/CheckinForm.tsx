import { useEffect, useState } from 'react';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import SvgIcon from '../../../utils/svgIcon';
import FormsApi from '../../../api/Forms';
import TableForm from './TableForm';
import { MainModal } from '../../../Components';
// import AddCheckIn from "./AddCheckIn";
import CheckInControllerModal from './CheckInControllerModal';
import CheckInPreview from './CheckInPreview';

const CheckInForm = () => {
  const [checkInList, setCheckInList] = useState<Array<CheckInDataRowType>>([]);
  const [showaddModal, setShowAddModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editFormId, setEditFormId] = useState('');
  const getChechins = () => {
    FormsApi.getCheckinList().then((res) => {
      setCheckInList(res.data);
    });
  };
  useEffect(() => {
    getChechins();
  }, []);
  return (
    <>
      {checkInList.length > 0 ? (
        <>
          <div className="flex flex-col w-full mt-4">
            <div className="w-full flex items-center justify-between mb-3">
              <div className="text-Text-Primary font-medium text-sm">
                Check-In Forms
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
              onDelete={() => {
                getChechins();
              }}
              onEdit={(id) => {
                setShowAddModal(true);
                setEditFormId(id);
              }}
              onPreview={(id) => {
                setShowPreview(true);
                setEditFormId(id);
              }}
              setCheckInListEditValue={() => {}}
              setCheckInLists={() => {}}
              setEditModeModal={() => {}}
              setRepositionModeModal={() => {}}
              setShowModal={() => {}}
              setShowModalSchedule={() => {}}
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
            No check-in form existed yet.
          </div>
          <ButtonSecondary
            ClassName="rounded-[20px] w-[229px] mt-9"
            onClick={() => {
              // setShowModal(true);
              setShowAddModal(true);
            }}
          >
            <SvgIcon src="/icons/firstline.svg" color="#FFF" />
            Create New
          </ButtonSecondary>
        </>
      )}
      <MainModal
        isOpen={showaddModal}
        onClose={() => {
          // setShowModal(false);
          setEditFormId('');
          setShowAddModal(false);
        }}
      >
        <CheckInControllerModal
          editId={editFormId}
          onClose={() => {
            setShowAddModal(false);
            setEditFormId('');
          }}
          onSave={(values) => {
            if (editFormId != '') {
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
          }}
          mode={editFormId != '' ? 'Edit' : 'Add'}
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
    </>
  );
};

export default CheckInForm;
