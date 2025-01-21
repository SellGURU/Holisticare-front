import React, { useState, useRef } from 'react';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
interface PlanModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  onCancel,
  onConfirm,
}) => {
  // const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const modalRef = useRef<HTMLDivElement | null>(null);
  useModalAutoClose({
    refrence: modalRef,
    close: onCancel,
  });
  const [isMonthly, setIsMonthly] = useState(true);

  const toggleBillingCycle = () => {
    setIsMonthly(!isMonthly);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#4E4E4E66] bg-opacity-40 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl py-6 px-8 shadow-800 w-[550px] text-Text-Primary"
      >
        <div className="flex w-full justify-between items-center">
          {' '}
          <h2 className="text-xl  mb-4">Downgrade Plan</h2>
          <p className="text-xs text-Text-Secondary font-medium mb-4">
            Last update: 2024/02/02
          </p>
        </div>

        <div className="mb-10">
          <p className="text-sm font-medium mb-2 text-center">
            Your current Plan:
          </p>
          <div
            style={{
              background:
                'linear-gradient(to right, #005F73 25%, #6CC24A 100%)',
            }}
            className=" rounded-lg p-4 text-white relative text-center overflow-hidden"
          >
            <img
              className="absolute inset-0 w-full"
              src="/images/billingBg.svg"
              alt=""
            />
            <p className="text-lg text-white">Pro</p>
            <p className="text-[10px] text-white">Since September 27th, 2024</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-center text-Text-Primary mb-4">
            Your Downgrade options
          </p>
          <div className="flex justify-center items-center mb-4 gap-3">
            <span className="text-sm text-Text-Secondary">Yearly</span>
            <div
              className="w-10 h-5 flex items-center bg-Primary-DeepTeal rounded-full p-1 cursor-pointer"
              onClick={toggleBillingCycle}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                  isMonthly ? 'translate-x-0' : 'translate-x-4'
                }`}
              />
            </div>
            <span className="text-sm text-Text-Secondary">Monthly</span>
          </div>
          <div className="flex flex-col space-y-4">
            <label
              style={{
                background:
                  'linear-gradient(to right, #005F73 25%, #6CC24A 100%)',
              }}
              className={`flex items-center justify-between p-4 rounded-2xl text-white `}
            >
              <div className="flex items-start relative cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  value="basic"
                  checked={selectedPlan === 'basic'}
                  onChange={() => setSelectedPlan('basic')}
                  className="mr-2 mt-[6px] appearance-none bg-transparent border border-white rounded-full w-4 h-4   peer"
                />
                {selectedPlan === 'basic' && (
                  <span className="absolute left-[4px] top-[10px] w-[7px] h-[7px] bg-white rounded-full"></span>
                )}
                <div>
                  <span className="font-medium text-base">Basic</span>
                  <p className="text-xs">Create Your AI Twin</p>
                </div>
              </div>
              <span className="text-sm font-medium">
                {' '}
                <span className="text-2xl font-bold">£99</span> /Month
              </span>
            </label>
            <label
              style={{
                background:
                  'linear-gradient(to right, #005F73 25%, #6CC24A 100%)',
              }}
              className={`flex items-center justify-between p-4 rounded-2xl text-white`}
            >
              <div className="flex items-start relative cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  value="elite"
                  checked={selectedPlan === 'elite'}
                  onChange={() => setSelectedPlan('elite')}
                  className="mr-2 mt-[6px] appearance-none bg-transparent border border-white rounded-full w-4 h-4   peer"
                />

                {selectedPlan === 'elite' && (
                  <span className="absolute left-[4px] top-[10px] w-[7px] h-[7px] bg-white rounded-full"></span>
                )}

                <div>
                  <span className="font-meidum text-base">Elite</span>
                  <p className="text-xs">Create Your AI Twin</p>
                </div>
              </div>
              <span className="font-meidum text-sm">
                <span className="text-2xl font-bold">£499</span> /Month
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 ">
          <ButtonSecondary
            onClick={onCancel}
            ClassName="shadow-100"
            style={{
              backgroundColor: '#FDFDFD',
              color: '#005F73',
              width: '100%',
            }}
          >
            Cancel
          </ButtonSecondary>
          <ButtonSecondary style={{ width: '100%' }} onClick={onConfirm}>
            Confirm
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
};
