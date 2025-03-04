import { useState, useEffect, useRef } from 'react';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import Application from '../../../api/app';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import MainModal from '../../MainModal';
interface Employee {
  picture: string;
  user_name: string;
  role: string;
}

const mockEmployees: Employee[] = [
  {
    picture: '',
    user_name: 'Sarah Thompson',
    role: 'Doctor',
  },
  {
    picture: '',
    user_name: 'John Doe',
    role: 'Admin',
  },
  {
    picture: '',
    user_name: 'Emi Thompson',
    role: 'Admin',
  },
  {
    picture: '',
    user_name: 'Sarah Jonas',
    role: 'Admin',
  },
  {
    picture: '',
    user_name: 'David Smith',
    role: 'Admin',
  },
];

const Employes: React.FC = () => {
  const [Employees, setEmployees] = useState<Employee[]>(mockEmployees);
  useEffect(() => {
    Application.dashboardStaff()
      .then((Response) => {
        setEmployees(Response.data);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, []);
  return (
    <div className="w-full h-[320px] overflow-hidden bg-white rounded-2xl shadow-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm text-Text-Primary font-medium">Staffs</h2>

        <ButtonPrimary
          style={{ backgroundColor: '#fff', color: '#005F73' }}
          size="small"
        >
          view all{' '}
          <img
            className="rotate-180 w-4 h-4 object-contain"
            src="/icons/arrow-back.svg"
            alt=""
          />
        </ButtonPrimary>
      </div>
      <ul className="space-y-3  ">
        {Employees.map((employee, index) => (
          <EmployeeRow employee={employee} index={index}></EmployeeRow>
        ))}
      </ul>
    </div>
  );
};
const EmployeeRow: React.FC<{ employee: Employee; index: number }> = ({
  employee,
  index,
}) => {
  const [showModal, setshowModal] = useState(false);
  const modalRef = useRef(null);
  useModalAutoClose({
    refrence: modalRef,
    close: () => setshowModal(false),
  });
  const [showRemoveStaffModal, setshowRemoveStaffModal] = useState(false);
  const [isConfirm, setisConfirm] = useState(false);
  return (
    <>
      <MainModal
        isOpen={showRemoveStaffModal}
        onClose={() => {
          setshowRemoveStaffModal(false);
          setisConfirm(false);
        }}
      >
        {isConfirm ? (
          <div className="bg-white w-[293px] h-[196px] rounded-2xl p-4 shadow-800 text-Text-Primary">
            <div className=" w-full flex flex-col items-center gap-4 -mt-3">
              <img
                className="object-contain"
                src="/public/icons/EmptyState-bg.svg"
                alt=""
              />
              <div className="text-xs font-medium text-center -mt-6">
                {employee.user_name} has been successfully removed.
              </div>
              <div className="w-full flex justify-center ">
                <ButtonPrimary
                  onClick={() => {
                    setisConfirm(false);
                    setshowRemoveStaffModal(false);
                  }}
                >
                  {' '}
                  <div className="w-[150px]">Got it</div>{' '}
                </ButtonPrimary>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white w-[500px] h-[212px] rounded-2xl p-6 pb-8 shadow-800 text-Text-Primary">
            <div className="w-full flex items-center gap-2 text-sm font-medium border-b pb-2 border-Gray-50 mb-6">
              <img src="/icons/danger.svg" alt="" />
              Remove Staff
            </div>
            <div className="text-center text-xs font-medium">
              Are you sure you want to Remove {employee.user_name}?
            </div>
            <div className="text-xs text-center text-[#888888] mt-4">
              By removing her, she will no longer have access to her portal.
            </div>
            <div className="w-full mt-8 flex justify-end items-center gap-3">
              <div
                onClick={() => {
                  setshowRemoveStaffModal(false);
                }}
                className="text-sm font-medium text-[#909090] cursor-pointer"
              >
                Cancel
              </div>
              <div
                onClick={() => {
                  setisConfirm(true);
                }}
                className="text-sm font-medium text-Primary-DeepTeal cursor-pointer"
              >
                Confirm
              </div>
            </div>
          </div>
        )}
      </MainModal>
      <li key={index} className=" relative flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={
              employee.picture ||
              `https://ui-avatars.com/api/?name=${employee.user_name}`
            }
            alt={`${employee.user_name}'s avatar`}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="text-[10px] text-[#383838]">{employee.user_name}</p>
            <p className="text-[8px] text-[#888888]">Clients Assigned: 2</p>
          </div>
        </div>
        <img
          onClick={() => setshowModal(!showModal)}
          className={'cursor-pointer'}
          src="/icons/client-card/more.svg"
          alt=""
        />
        {showModal && (
          <div
            ref={modalRef}
            className="absolute top-5 right-[16px] z-20 w-[155px] rounded-[16px] px-4 py-2 bg-white border border-Gray-50 shadow-200 flex flex-col gap-3"
          >
            <div
              onClick={() => setshowRemoveStaffModal(true)}
              className="flex items-center gap-1 TextStyle-Body-2 text-xs text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer"
            >
              <img src="/icons/user-minus.svg" alt="" />
              Remove
            </div>
            <div className="flex items-center gap-1 TextStyle-Body-2 text-xs text-Text-Primary pb-1  cursor-pointer">
              <img src="/icons/firstline.svg" alt="" />
              Show Assign List
            </div>
          </div>
        )}
      </li>
    </>
  );
};
export default Employes;
