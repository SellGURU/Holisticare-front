import { useState, useEffect, useRef } from 'react';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import MainModal from '../../MainModal';
import DashboardApi from '../../../api/Dashboard';
import Application from '../../../api/app';
interface Staff {
  picture: string;
  user_name: string;
  role: string;
  ["clients assigned"]:number
  user_id:number
}

// const mockEmployees: Employee[] = [
//   {
//     picture: '',
//     user_name: 'Sarah Thompson',
//     role: 'Doctor',
//   },
//   {
//     picture: '',
//     user_name: 'John Doe',
//     role: 'Admin',
//   },
//   {
//     picture: '',
//     user_name: 'Emi Thompson',
//     role: 'Admin',
//   },
//   {
//     picture: '',
//     user_name: 'Sarah Jonas',
//     role: 'Admin',
//   },
//   {
//     picture: '',
//     user_name: 'David Smith',
//     role: 'Admin',
//   },
// ];
interface Client {
  picture:string
  ["Client Name"]: string;
  ID: number;
  Age: number;
  Gender: string;
  ["Enroll Date"]: string;
  ["Assign Date"]: string;
  Status: string;
}


const Employes: React.FC = () => {
  const [Employees, setEmployees] = useState<Staff[]>([]);
  useEffect(() => {
    DashboardApi.getStaffList({})
      .then((Response) => {
        setEmployees(Response.data);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, []);
 
  return (
    <div className="w-full h-[320px] overflow-hidden bg-white rounded-2xl shadow-200 p-4 ">
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
      {Employees.length < 1 ? (
        <div className=" w-full h-full flex flex-col items-center justify-center">
          <img src="/icons/NoClient.svg" alt="" />
          <div className="text-xs text-Text-Primary -mt-4 text-center">
            No Staff Found
          </div>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[260px] overflow-auto pr-1 ">
          {Employees.map((employee, index) => (
            <EmployeeRow
              employee={employee}
              index={index}
            ></EmployeeRow>
          ))}
        </ul>
      )}
    </div>
  );
};
const EmployeeRow: React.FC<{
  employee: Staff;
  index: number;
}> = ({ employee, index }) => {
  const [showModal, setshowModal] = useState(false);
  const modalRef = useRef(null);
  useModalAutoClose({
    refrence: modalRef,
    close: () => setshowModal(false),
  });
  const [showRemoveStaffModal, setshowRemoveStaffModal] = useState(false);
  const [isConfirm, setisConfirm] = useState(false);
  const [showAssignListModal, setshowAssignListModal] = useState(false);
  const [AssignedClients, setAssignedClients] = useState<Client[]>([])
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
                src="/icons/EmptyState-bg.svg"
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
                  Application.RemoveUserStaff({
                    user_id: employee.user_id
                  }).then(()=>{setisConfirm(true)})
                  
                  
                }}
                className="text-sm font-medium text-Primary-DeepTeal cursor-pointer"
              >
                Confirm
              </div>
            </div>
          </div>
        )}
      </MainModal>
      <MainModal
        isOpen={showAssignListModal}
        onClose={() => setshowAssignListModal(false)}
      >
        <div className="bg-white rounded-2xl p-6 pb-8 shadow-800 w-[706px] h-[416px]">
          <div className="w-full border-b pb-2 border-Gray-50 text-sm font-medium">
            Assign List
          </div>
          <div className="h-[256px] overflow-auto mt-4 w-full">
            <table className="w-full  ">
              <thead>
                <tr className="text-left text-[10px] bg-[#E9F0F2] text-Text-Primary border-Gray-50  ">
                  <th className="py-2 pl-3 w-[120px] rounded-tl-2xl">
                    Client Name
                  </th>
                  <th className="py-2 w-[80px] text-center ">ID</th>
                  <th className="py-2 w-[40px] text-center ">Age</th>
                  <th className="py-2 w-[40px] text-center ">Gender</th>
                  <th className="py-2 w-[80px] text-center ">Enroll Date</th>
                  <th className="py-2 w-[80px] text-center">Assign Date</th>
                  <th className="py-2 w-[70px] text-center rounded-tr-2xl">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="border border-t-0 border-[#E9F0F2] w-full">
                {AssignedClients.map((client, index) => (
                  <tr
                    key={index}
                    className={` ${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-sm text-Text-Primary border-b w-full `}
                  >
                    <td className=" w-[120px] py-2 pl-3 flex items-center text-[10px] text-Text-Primary">
                      <img
                        src={`https://ui-avatars.com/api/?name=${client['Client Name']}`}
                        alt={client['Client Name']}
                        className="w-8 h-8 rounded-full mr-[6px] border border-Primary-DeepTeal"
                      />
                      {client['Client Name']}
                    </td>
                    <td className="py-2  text-center text-[10px] text-[#888888] ">
                      {client.ID}
                    </td>
                    <td className="py-2 text-[10px] text-center text-[#888888]">
                      {client.Age}
                    </td>
                    <td className="py-2 text-[10px] text-center text-[#888888]">
                      {client.Gender}
                    </td>
                    <td className="py-2 text-[10px] text-center text-[#888888]">
                      {client['Enroll Date']}
                    </td>
                    <td className="py-2 text-[10px] text-center text-[#888888]">
                      {client['Assign Date']}
                    </td>
                    <td className="py-2 text-[10px]   text-[#888888] w-[70px]   ">
                      <div
                        className={`px-2 rounded-full w-fit text-[8px] ${client.Status == 'Waiting' ? 'bg-[#F9DEDC]' : client.Status == 'In progress' ? 'bg-[#E9F0F2]' : 'bg-[#DEF7EC]'}  flex items-center justify-center gap-[2px] ml-8 text-Text-Primary`}
                      >
                        <div
                          className={`size-2 rounded-full ${client.Status == 'Waiting' ? 'bg-[#FFAB2C]' : client.Status == 'In progress' ? 'bg-[#4C88FF]' : 'bg-[#06C78D]'}`}
                        ></div>{' '}
                        {client.Status}
                      </div>
                    </td>

                    {/* <td
                  onClick={() => {
                    if (checkIn.status !== 'Reviewed') {
                      onCheckIn();
                    }
                  }}
                  className="py-2"
                >
                  <span
                    className={`text-[8px]  w-[65px] h-[14px] font-medium pb-[2px] py-1 px-2 rounded-full flex items-center justify-center gap-1 ${
                      checkIn.status === 'Review Now'
                        ? 'text-[#FFBD59] underline cursor-pointer'
                        : 'bg-[#DEF7EC] '
                    }`}
                  >
                    <img
                      className={`${checkIn.status !== 'Reviewed' && 'hidden'}`}
                      src="/icons/tick-green.svg"
                      alt=""
                    />
                    {checkIn.status}
                  </span>
                </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            onClick={() => setshowAssignListModal(false)}
            className="w-full text-end mt-10 text-sm font-medium text-[#909090] cursor-pointer"
          >
            close
          </div>
        </div>
      </MainModal>
      <li key={index} className=" relative flex items-center justify-between">
        <div className="flex items-center ">
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
            className="absolute top-5 right-[16px] z-[90] w-[155px] rounded-[16px] px-4 py-2 bg-white border border-Gray-50 shadow-200 flex flex-col gap-3"
          >
            <div
              onClick={() => {
                setshowRemoveStaffModal(true)
              }}
              className="flex items-center gap-1 TextStyle-Body-2 text-xs text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer"
            >
              <img src="/icons/user-minus.svg" alt="" />
              Remove
            </div>
            <div
              onClick={() => 
                Application.getStaffAssignedClients({
                  user_id:employee.user_id
                }).then((res)=>{
                  setAssignedClients(res.data)
                  setshowAssignListModal(true)
                })
                }
              className="flex items-center gap-1 TextStyle-Body-2 text-xs text-Text-Primary pb-1  cursor-pointer"
            >
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
