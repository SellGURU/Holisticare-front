/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { MainModal } from '../../Components';
import { TextField } from '../../Components/UnitComponents';
import Application from '../../api/app';
import ValidationForms from '../../utils/ValidationForms';
import Circleloader from '../../Components/CircleLoader';

interface DoseScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scheduleData: any) => void;
  scheduleId?: string;
  isEdit?: boolean;
  loadingCall: boolean;
  clearData: boolean;
  handleClearData: (value: boolean) => void;
}

const DoseScheduleModal: React.FC<DoseScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  scheduleId,
  isEdit,
  loadingCall,
  clearData,
  handleClearData,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    frequency_type: '',
    frequency_days: [] as number[],
    dose: '',
    connected_checkins: [] as number[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDaysValues = [1, 2, 3, 4, 5, 6, 7]; // Map to numeric values
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1); // 1-31

  useEffect(() => {
    if (isOpen) {
      // Get check-ins list if needed in the future
      // Application.getCheckinList()...
    }
  }, [isOpen]);

  useEffect(() => {
    if (isEdit && scheduleId && isOpen) {
      setIsLoading(true);
      Application.showPeptideDoseScheduleDetails(scheduleId)
        .then((res) => {
          const data = res.data;
          setFormData({
            title: data.Title || '',
            frequency_type: data.Frequency_Type || '',
            frequency_days: data.Frequency_Days || [],
            dose: data.Dose || '',
            connected_checkins: data.Connected_Checkins || [],
          });
        })
        .catch((err) => {
          console.error('Error getting dose schedule details:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isEdit, scheduleId, isOpen]);

  useEffect(() => {
    if (clearData) {
      setFormData({
        title: '',
        frequency_type: '',
        frequency_days: [],
        dose: '',
        connected_checkins: [],
      });
      setShowValidation(false);
      handleClearData(false);
    }
  }, [clearData, handleClearData]);

  const updateFormData = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleFrequencyDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      frequency_days: prev.frequency_days.includes(day)
        ? prev.frequency_days.filter((d) => d !== day)
        : [...prev.frequency_days, day].sort(),
    }));
  };

  const validateForm = () => {
    if (!ValidationForms.IsvalidField('Title', formData.title)) {
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    setShowValidation(true);
    if (!validateForm()) {
      return;
    }

    const submitData: any = {
      Title: formData.title,
    };

    if (formData.frequency_type) {
      submitData.Frequency_Type = formData.frequency_type;
    }
    if (formData.frequency_days.length > 0) {
      submitData.Frequency_Days = formData.frequency_days;
    }
    if (formData.dose) {
      submitData.Dose = formData.dose;
    }
    if (formData.connected_checkins.length > 0) {
      submitData.Connected_Checkins = formData.connected_checkins;
    }
    if (isEdit && scheduleId) {
      submitData.Schedule_Id = scheduleId;
    }

    onSubmit(submitData);
  };

  return (
    <>
      {/* {isLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-[50]">
          <SpinnerLoader />
        </div>
      )} */}
      <MainModal isOpen={isOpen} onClose={onClose}>
        <div className="flex relative flex-col justify-between bg-white w-[320px] xs:w-[350px] sm:w-[500px] rounded-[16px] p-6 max-h-[85vh] overflow-y-auto">
          {isLoading ? (
            <div className="h-full bg-white flex justify-center items-center min-h-[310px] relative">
              <Circleloader></Circleloader>
            </div>
          ) : (
            <>
              <div className="w-full h-full border-b border-Boarder pb-3 mb-3">
                <div className="flex justify-start items-center font-medium text-sm text-Text-Primary">
                  {isEdit ? 'Edit' : 'Add'} Dose Schedule
                </div>
              </div>

              <div className="overflow-y-auto h-[70%] pr-2">
                {/* Title */}
                <TextField
                  label="Title"
                  placeholder="Enter schedule name (e.g., Weekly GLP-1 Protocol)"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  isValid={
                    showValidation
                      ? ValidationForms.IsvalidField('Title', formData.title)
                      : true
                  }
                  validationText={
                    showValidation
                      ? ValidationForms.ValidationText('Title', formData.title)
                      : ''
                  }
                  margin="mt-0"
                />

                {/* Frequency Type */}
                <div className="mt-4">
                  <label className="text-xs font-medium text-Text-Primary">
                    Frequency
                  </label>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        id="daily"
                        name="frequency"
                        value="daily"
                        checked={formData.frequency_type === 'daily'}
                        onChange={(e) => {
                          updateFormData('frequency_type', e.target.value);
                          updateFormData('frequency_days', []);
                        }}
                        className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
                      />
                      <label
                        htmlFor="daily"
                        className={`text-xs cursor-pointer ${
                          formData.frequency_type === 'daily'
                            ? 'text-Primary-DeepTeal'
                            : 'text-Text-Quadruple'
                        }`}
                      >
                        Daily
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        id="weekly"
                        name="frequency"
                        value="weekly"
                        checked={formData.frequency_type === 'weekly'}
                        onChange={(e) => {
                          updateFormData('frequency_type', e.target.value);
                          updateFormData('frequency_days', []);
                        }}
                        className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
                      />
                      <label
                        htmlFor="weekly"
                        className={`text-xs cursor-pointer ${
                          formData.frequency_type === 'weekly'
                            ? 'text-Primary-DeepTeal'
                            : 'text-Text-Quadruple'
                        }`}
                      >
                        Weekly
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        id="monthly"
                        name="frequency"
                        value="monthly"
                        checked={formData.frequency_type === 'monthly'}
                        onChange={(e) => {
                          updateFormData('frequency_type', e.target.value);
                          updateFormData('frequency_days', []);
                        }}
                        className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
                      />
                      <label
                        htmlFor="monthly"
                        className={`text-xs cursor-pointer ${
                          formData.frequency_type === 'monthly'
                            ? 'text-Primary-DeepTeal'
                            : 'text-Text-Quadruple'
                        }`}
                      >
                        Monthly
                      </label>
                    </div>
                  </div>
                </div>

                {/* Frequency Days (for weekly) */}
                {formData.frequency_type === 'weekly' && (
                  <div className="mt-4">
                    <div className="text-xs text-Text-Quadruple mb-2">
                      Please select the days of the week you prefer:
                    </div>
                    <div className="flex">
                      {weekDays.map((day, index) => (
                        <div
                          key={index}
                          onClick={() =>
                            toggleFrequencyDay(weekDaysValues[index])
                          }
                          className={`cursor-pointer capitalize border border-Gray-50 ${
                            index === weekDays.length - 1 && 'rounded-r-[4px]'
                          } ${
                            index === 0 && 'rounded-l-[4px]'
                          } py-2 px-2 text-xs text-center flex-1 ${
                            formData.frequency_days.includes(
                              weekDaysValues[index],
                            )
                              ? 'bg-gradient-to-r from-[#99C7AF] to-[#AEDAA7] text-Primary-DeepTeal'
                              : 'text-Text-Secondary bg-backgroundColor-Card'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Frequency Days (for monthly) */}
                {formData.frequency_type === 'monthly' && (
                  <div className="mt-4">
                    <div className="text-xs text-Text-Quadruple mb-2">
                      Please select the days of the month you prefer:
                    </div>
                    <div className="flex flex-col">
                      <div className="flex">
                        {monthDays.slice(0, 16).map((day, index) => (
                          <div
                            key={index}
                            onClick={() => toggleFrequencyDay(day)}
                            className={`w-[27px] h-[32px] flex items-center justify-center cursor-pointer border border-b-0 border-Gray-50 ${
                              index === 15 && 'rounded-tr-[8px]'
                            } ${index === 0 && 'rounded-tl-[8px]'} text-xs text-center ${
                              formData.frequency_days.includes(day)
                                ? 'bg-gradient-to-r from-[#99C7AF] to-[#AEDAA7] text-Primary-DeepTeal'
                                : 'text-Text-Secondary bg-backgroundColor-Card'
                            }`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        {monthDays.slice(16, 31).map((day, index) => (
                          <div
                            key={index}
                            onClick={() => toggleFrequencyDay(day)}
                            className={`w-[27px] h-[32px] flex items-center justify-center cursor-pointer border border-Gray-50 ${
                              index === 14 && 'rounded-br-[8px]'
                            } ${index === 0 && 'rounded-bl-[8px]'} text-xs text-center ${
                              formData.frequency_days.includes(day)
                                ? 'bg-gradient-to-r from-[#99C7AF] to-[#AEDAA7] text-Primary-DeepTeal'
                                : 'text-Text-Secondary bg-backgroundColor-Card'
                            }`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dose */}
                <TextField
                  label="Dose"
                  placeholder="Enter dose (e.g., 0.5-1.0 mg)"
                  value={formData.dose}
                  onChange={(e) => updateFormData('dose', e.target.value)}
                  isValid={true}
                  validationText=""
                  margin="mt-4"
                />
              </div>

              <div className="w-full flex justify-end items-center p-2 mt-5">
                <div
                  className="text-Disable text-sm font-medium mr-4 cursor-pointer"
                  onClick={onClose}
                >
                  Cancel
                </div>
                <div
                  className="text-Primary-DeepTeal text-sm font-medium cursor-pointer"
                  onClick={handleSubmit}
                >
                  {loadingCall ? (
                    <div className="flex items-center gap-2">
                      {/* <Circleloader /> */}
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save'
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </MainModal>
    </>
  );
};

export default DoseScheduleModal;
