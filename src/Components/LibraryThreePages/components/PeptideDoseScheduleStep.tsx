/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Application from '../../../api/app';
import SearchBox from '../../SearchBox';
import SpinnerLoader from '../../SpinnerLoader';

interface PeptideDoseScheduleStepProps {
  selectedSchedules: any[];
  selectedCheckins: any[];
  onSchedulesChange: (schedules: any[]) => void;
  onCheckinsChange: (checkins: any[]) => void;
  showValidation?: boolean;
}

const PeptideDoseScheduleStep: React.FC<PeptideDoseScheduleStepProps> = ({
  selectedSchedules,
  selectedCheckins,
  onSchedulesChange,
  onCheckinsChange,
  showValidation,
}) => {
  // Dose Schedules state
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<any[]>([]);
  const [scheduleSearchValue, setScheduleSearchValue] = useState('');
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Check-ins state
  const [allCheckins, setAllCheckins] = useState<any[]>([]);
  const [filteredCheckins, setFilteredCheckins] = useState<any[]>([]);
  const [checkinSearchValue, setCheckinSearchValue] = useState('');
  const [loadingCheckins, setLoadingCheckins] = useState(false);

  // Fetch dose schedules
  useEffect(() => {
    setLoadingSchedules(true);
    Application.getAllDoseSchedules()
      .then((res) => {
        const schedules = res.data || [];
        setAllSchedules(schedules);
        setFilteredSchedules(schedules);
      })
      .catch((err) => {
        console.error('Error getting dose schedules:', err);
        setAllSchedules([]);
        setFilteredSchedules([]);
      })
      .finally(() => {
        setLoadingSchedules(false);
      });
  }, []);

  // Fetch check-in forms
  useEffect(() => {
    setLoadingCheckins(true);
    Application.getCheckinFormsList()
      .then((res) => {
        const checkins = res.data || [];
        setAllCheckins(checkins);
        setFilteredCheckins(checkins);
      })
      .catch((err) => {
        console.error('Error getting check-in forms:', err);
        setAllCheckins([]);
        setFilteredCheckins([]);
      })
      .finally(() => {
        setLoadingCheckins(false);
      });
  }, []);

  // Filter schedules
  useEffect(() => {
    if (scheduleSearchValue) {
      const filtered = allSchedules.filter(
        (schedule) =>
          schedule.Title?.toLowerCase().includes(scheduleSearchValue.toLowerCase()) ||
          schedule.Dose?.toLowerCase().includes(scheduleSearchValue.toLowerCase())
      );
      setFilteredSchedules(filtered);
    } else {
      setFilteredSchedules(allSchedules);
    }
  }, [scheduleSearchValue, allSchedules]);

  // Filter check-ins
  useEffect(() => {
    if (checkinSearchValue) {
      const filtered = allCheckins.filter(
        (checkin) =>
          checkin.title?.toLowerCase().includes(checkinSearchValue.toLowerCase())
      );
      setFilteredCheckins(filtered);
    } else {
      setFilteredCheckins(allCheckins);
    }
  }, [checkinSearchValue, allCheckins]);

  const toggleSchedule = (schedule: any) => {
    const scheduleId = schedule.Schedule_Id || schedule.Pds_Id;
    const isSelected = selectedSchedules.some(
      (s) => (s.Schedule_Id || s.Pds_Id) === scheduleId
    );
    if (isSelected) {
      onSchedulesChange(selectedSchedules.filter((s) => 
        (s.Schedule_Id || s.Pds_Id) !== scheduleId
      ));
    } else {
      onSchedulesChange([...selectedSchedules, schedule]);
    }
  };

  const toggleCheckin = (checkin: any) => {
    const checkinId = checkin.id || checkin.checkin_form_id;
    const isSelected = selectedCheckins.some(
      (c) => (c.id || c.checkin_form_id) === checkinId
    );
    if (isSelected) {
      onCheckinsChange(selectedCheckins.filter((c) => 
        (c.id || c.checkin_form_id) !== checkinId
      ));
    } else {
      onCheckinsChange([...selectedCheckins, checkin]);
    }
  };

  const formatFrequency = (schedule: any) => {
    if (!schedule.Frequency_Type) return '-';
    const type = schedule.Frequency_Type;
    const days = schedule.Frequency_Days || [];
    
    if (type === 'daily') return 'Daily';
    if (type === 'weekly') {
      if (days.length === 0) return 'Weekly';
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return `Weekly: ${days.map((d: number) => dayNames[(d - 1) % 7]).join(', ')}`;
    }
    if (type === 'monthly') {
      if (days.length === 0) return 'Monthly';
      return `Monthly: Days ${days.join(', ')}`;
    }
    return type;
  };

  const isScheduleValid = selectedSchedules.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Dose Schedules Section - REQUIRED */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-Text-Primary">
            Select Dose Schedules <span className="text-Red">*</span>
          </div>
          {allSchedules.length > 0 && (
            <SearchBox
              ClassName="rounded-xl h-6 !py-[0px] !px-3 !shadow-[unset] w-[180px]"
              placeHolder="Search schedules..."
              onSearch={(query) => setScheduleSearchValue(query)}
            />
          )}
        </div>

        {showValidation && !isScheduleValid && (
          <div className="text-Red text-[10px] mb-2">
            At least one dose schedule is required
          </div>
        )}

        {loadingSchedules ? (
          <div className="text-center py-4">
            <SpinnerLoader />
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className={`text-center py-4 text-xs ${showValidation && !isScheduleValid ? 'text-Red' : 'text-Text-Quadruple'}`}>
            {allSchedules.length === 0
              ? 'No dose schedules found. Create dose schedules first in the "Dose Schedule" tab.'
              : 'No schedules match your search.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
            {filteredSchedules.map((schedule) => {
              const scheduleId = schedule.Schedule_Id || schedule.Pds_Id;
              const isSelected = selectedSchedules.some(
                (s) => (s.Schedule_Id || s.Pds_Id) === scheduleId
              );
              return (
                <div
                  key={scheduleId}
                  onClick={() => toggleSchedule(schedule)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-Primary-DeepTeal bg-[#E2F1F8]'
                      : showValidation && !isScheduleValid
                        ? 'border-Red bg-white hover:border-Primary-DeepTeal'
                        : 'border-Gray-50 bg-white hover:border-Primary-DeepTeal'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-Text-Primary">
                        {schedule.Title || 'Unnamed Schedule'}
                      </div>
                      <div className="text-[10px] text-Text-Quadruple">
                        {formatFrequency(schedule)}
                        {schedule.Dose && ` • Dose: ${schedule.Dose}`}
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-Primary-DeepTeal bg-Primary-DeepTeal'
                          : 'border-Gray-50'
                      }`}
                    >
                      {isSelected && (
                        <img
                          src="/icons/tick-circle.svg"
                          alt=""
                          className="w-2.5 h-2.5 filter brightness-0 invert"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedSchedules.length > 0 && (
          <div className="mt-2 p-2 bg-[#F4F4F4] rounded-lg">
            <div className="text-[10px] font-medium text-Text-Primary mb-1">
              Selected ({selectedSchedules.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedSchedules.map((schedule) => {
                const scheduleId = schedule.Schedule_Id || schedule.Pds_Id;
                return (
                  <div
                    key={scheduleId}
                    className="px-2 py-0.5 bg-Primary-DeepTeal text-white text-[10px] rounded flex items-center gap-1"
                  >
                    {schedule.Title || 'Unnamed'}
                    <img
                      src="/icons/close-circle.svg"
                      alt=""
                      className="w-3 h-3 cursor-pointer filter brightness-0 invert"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSchedule(schedule);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-Gray-50"></div>

      {/* Check-ins Section - OPTIONAL */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-Text-Primary">
            Select Connected Check-ins <span className="text-Text-Quadruple">(Optional)</span>
          </div>
          {allCheckins.length > 0 && (
            <SearchBox
              ClassName="rounded-xl h-6 !py-[0px] !px-3 !shadow-[unset] w-[180px]"
              placeHolder="Search check-ins..."
              onSearch={(query) => setCheckinSearchValue(query)}
            />
          )}
        </div>

        {loadingCheckins ? (
          <div className="text-center py-4">
            <SpinnerLoader />
          </div>
        ) : filteredCheckins.length === 0 ? (
          <div className="text-center py-4 text-Text-Quadruple text-xs">
            {allCheckins.length === 0
              ? 'No check-in forms found. Create check-in forms first in the Forms section.'
              : 'No check-ins match your search.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
            {filteredCheckins.map((checkin) => {
              const checkinId = checkin.id || checkin.checkin_form_id;
              const isSelected = selectedCheckins.some(
                (c) => (c.id || c.checkin_form_id) === checkinId
              );
              return (
                <div
                  key={checkinId}
                  onClick={() => toggleCheckin(checkin)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-Primary-DeepTeal bg-[#E2F1F8]'
                      : 'border-Gray-50 bg-white hover:border-Primary-DeepTeal'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-Text-Primary">
                        {checkin.title || 'Unnamed Check-in'}
                      </div>
                      <div className="text-[10px] text-Text-Quadruple">
                        {checkin.questions || 0} questions
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-Primary-DeepTeal bg-Primary-DeepTeal'
                          : 'border-Gray-50'
                      }`}
                    >
                      {isSelected && (
                        <img
                          src="/icons/tick-circle.svg"
                          alt=""
                          className="w-2.5 h-2.5 filter brightness-0 invert"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedCheckins.length > 0 && (
          <div className="mt-2 p-2 bg-[#F4F4F4] rounded-lg">
            <div className="text-[10px] font-medium text-Text-Primary mb-1">
              Selected ({selectedCheckins.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedCheckins.map((checkin) => {
                const checkinId = checkin.id || checkin.checkin_form_id;
                return (
                  <div
                    key={checkinId}
                    className="px-2 py-0.5 bg-Primary-DeepTeal text-white text-[10px] rounded flex items-center gap-1"
                  >
                    {checkin.title || 'Unnamed'}
                    <img
                      src="/icons/close-circle.svg"
                      alt=""
                      className="w-3 h-3 cursor-pointer filter brightness-0 invert"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheckin(checkin);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeptideDoseScheduleStep;
