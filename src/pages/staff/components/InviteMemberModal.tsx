/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import Application from '../../../api/app';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';

interface InviteMemberModalProps {
  setShowModal: (value: boolean) => void;
  getStaffs: () => void;
  roles: string[];
}

const InviteMemberModal: FC<InviteMemberModalProps> = ({
  setShowModal,
  getStaffs,
  roles,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [openRoll, setOpenRoll] = useState(false);
  const [role, setRole] = useState('Staff');
  const [step, setStep] = useState(1);
  const [registered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const onSave = (values: any) => {
    setLoading(true);
    Application.inviteStaffMember(values).then(() => {
      setLoading(false);
      setRole('Staff');
      setStep(3);
      getStaffs();
    });
  };
  return (
    <>
      {step === 1 ? (
        <div className="flex flex-col justify-between bg-white w-[500px] rounded-[16px] p-6">
          <div className="w-full h-full">
            <div className="flex justify-start items-center">
              <div className="text-Text-Primary font-medium">Invite Member</div>
            </div>
            <div className="w-full h-[1px] bg-Boarder my-3"></div>
            <div className="w-full mb-4 ">
              <div className="text-Text-Primary text-[12px] font-medium mb-1">
                Full Name
              </div>
              <input
                placeholder="Write the full name ..."
                className={`w-full h-[28px] border ${showValidation && fullName.length == 0 ? 'border-red-500' : 'border-Gray-50'} border-Gray-50 bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold outline-none`}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {fullName.length == 0 && showValidation && (
                <div className="text-[10px] mt-1 ml-2 text-red-500">
                  This field is required.
                </div>
              )}
            </div>
            <div className="w-full flex items-baseline gap-2">
              <div className="flex flex-col">
                <div className="text-Text-Primary text-[12px] font-medium mb-1">
                  E-mail
                </div>
                <input
                  placeholder="Write the email ..."
                  className={`w-[222px] h-[28px] border ${!email.includes('@') && email.length > 0 ? 'border-red-500' : 'border-Gray-50'} bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold outline-none`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {!email.includes('@') && email.length > 0 ? (
                  <div className="text-[10px] mt-1 ml-2 text-red-500">
                    This field is required.
                  </div>
                ) : (
                  ''
                )}
              </div>
              <div
                className={`flex flex-col w-full ${!email.includes('@') && role.length > 0 ? 'mb-[0px]' : ''}`}
              >
                <div className="text-Text-Primary text-[12px] font-medium mb-1">
                  Role
                </div>
                <div className="relative inline-block w-full font-normal">
                  <select
                    onClick={() => setOpenRoll(!openRoll)}
                    onBlur={() => setOpenRoll(false)}
                    onChange={(e) => {
                      // setOpenRoll(false);
                      setRole(e.target.value);
                    }}
                    className="block appearance-none w-full bg-backgroundColor-Card border py-2 px-4 pr-8 rounded-2xl leading-tight focus:outline-none text-[10px] text-Text-Primary"
                  >
                    {roles.map((role) => (
                      <option
                        onClick={() => {
                          setOpenRoll(false);
                        }}
                        value={role}
                      >
                        {role}
                      </option>
                    ))}
                    {/* <option value="staff">Staff</option>
                    <option value="admin">Admin</option> */}
                  </select>
                  <img
                    className={`w-3 h-3 object-contain opacity-80 absolute top-2.5 right-2.5 transition-transform duration-200 ${
                      openRoll ? 'rotate-180' : ''
                    }`}
                    src="/icons/arow-down-drop.svg"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex justify-end items-center p-2 mt-5">
              <div
                className="text-Disable text-sm font-medium mr-4 cursor-pointer"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Cancel
              </div>
              <div
                className={`${email.includes('@') && role && fullName ? 'text-Primary-DeepTeal' : 'text-Text-Fivefold'} text-sm font-medium cursor-pointer`}
                onClick={() => {
                  setShowValidation(true);
                  if (email.includes('@') && role && fullName) {
                    setStep(2);
                    setShowValidation(false);
                  }
                }}
              >
                Invite
              </div>
            </div>
          </div>
        </div>
      ) : step === 2 ? (
        <div className="flex flex-col justify-between bg-white w-[500px] rounded-[16px] p-6">
          <div className="w-full h-full">
            <div className="flex justify-start items-center">
              <div className="text-Text-Primary font-medium">Manage Member</div>
            </div>
            <div className="w-full h-[1px] bg-Boarder my-3"></div>
            <div className="flex justify-between bg-bg-color border border-Gray-50 w-full p-4 rounded-2xl">
              <div className="w-[208px] h-[56px] rounded-xl border border-Gray-50 bg-white p-2 flex items-center">
                <img src="/images/staff/avatar-black.png" alt="" />
                <div className="flex flex-col justify-center ml-2 gap-1 w-full">
                  <div className="text-Text-Primary text-xs font-medium">
                    {email.length > 20 ? email.substring(0, 20) + '...' : email}
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <div className="text-Text-Primary text-[10px]">{role}</div>
                    {registered ? (
                      <div className="w-[66px] h-[14px] rounded-3xl bg-[#DEF7EC] flex items-stretch justify-center text-[8px] text-Text-Primary">
                        <img
                          src="/icons/success-green.svg"
                          alt=""
                          className="w-[8px] mr-1"
                        />
                        Registered
                      </div>
                    ) : (
                      <div className="w-[83px] h-[14px] rounded-3xl bg-[#FFD8E4] flex items-stretch justify-center text-[8px] text-Text-Primary">
                        <img
                          src="/icons/cancel-red.svg"
                          alt=""
                          className="w-[8px] mr-1"
                        />
                        Not Registered
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-[208px] h-[244px] rounded-xl border border-Gray-50 bg-white p-4 flex items-center flex-col">
                <div className="text-wrap text-Text-Primary text-sm font-medium text-center">
                  Some of the Project members are suspended
                </div>
                <div className="text-wrap text-center text-Text-Quadruple text-[10px] mt-4">
                  Us To activate their access please click on the following link
                  to visit their invoice.
                </div>
                <div className="text-center text-Text-Primary text-xs font-medium mt-5">
                  Invoice amount:
                </div>
                <div className="text-center text-Text-Primary text-xl font-medium">
                  Free
                </div>
                {/* <div className="text-Primary-DeepTeal text-xs font-medium text-center mt-5 cursor-pointer">
                  Learn more
                </div> */}
              </div>
            </div>
            <div className="w-full flex justify-end items-center p-2 mt-5">
              <div
                className="text-Disable text-sm font-medium mr-4 cursor-pointer"
                onClick={() => {
                  setShowModal(false);
                  setStep(1);
                }}
              >
                Cancel
              </div>
              <div
                className={`${loading ? 'text-Disable' : 'text-Primary-DeepTeal'} text-sm font-medium cursor-pointer`}
                onClick={() => {
                  if (email && role && fullName) {
                    onSave({
                      email: email,
                      role: role,
                      full_name: fullName,
                    });
                  }
                }}
              >
                Check out
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between bg-white rounded-[16px] p-4">
          <div className="w-full h-full flex flex-col items-center">
            <img src="/icons/tick-circle-background-new.svg" alt="" />
            <div className="text-xs font-medium text-Text-Primary text-center">
              Your invitation process has been successfully completed.
            </div>
            <div className="text-xs text-Text-Quadruple mt-2 text-nowrap flex items-center gap-1">
              The invitation link has been sent to this email:
              <div className="text-Primary-DeepTeal">{email}</div>
            </div>
            <ButtonPrimary
              ClassName="mt-5 w-[150px]"
              onClick={() => {
                setShowModal(false);
                setEmail('');
              }}
            >
              Got it
            </ButtonPrimary>
          </div>
        </div>
      )}
    </>
  );
};

export default InviteMemberModal;
