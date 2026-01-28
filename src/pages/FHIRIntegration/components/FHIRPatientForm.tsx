import React, { useState, useEffect, useRef } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import CustomTimezoneField from '../../../Components/CustomTimezoneField/CustomTimezoneField';

interface PatientFormData {
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: string;
  phone_number: string;
  address: string;
  timezone: string;
  picture: string;
}

interface FHIRPatientFormProps {
  initialData: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    phone_number: string;
    address: string;
  };
  conditions: string[];
  medications: string[];
  allergies: string[];
  onSubmit: (data: {
    patient_data: PatientFormData;
    conditions: string[];
    medications: string[];
    allergies: string[];
    goals: string;
  }) => void;
  onBack: () => void;
  loading?: boolean;
}

// Editable Tag List Component
const EditableTagList: React.FC<{
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder: string;
  colorClass: string;
  label: string;
}> = ({ items, onItemsChange, placeholder, colorClass, label }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      onItemsChange([...items, trimmed]);
      setInputValue('');
    }
  };

  const handleRemove = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-gray-400 font-normal ml-2">({items.length} items)</span>
      </label>
      
      {/* Tags display */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${colorClass}`}
            >
              <span className="max-w-[200px] truncate">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* Input row */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};

const FHIRPatientForm: React.FC<FHIRPatientFormProps> = ({
  initialData,
  conditions: initialConditions,
  medications: initialMedications,
  allergies: initialAllergies,
  onSubmit,
  onBack,
  loading = false,
}) => {
  // Patient data state
  const [firstName, setFirstName] = useState(initialData.first_name || '');
  const [lastName, setLastName] = useState(initialData.last_name || '');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(initialData.date_of_birth || '');
  const [gender, setGender] = useState(initialData.gender || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData.phone_number || '');
  const [address, setAddress] = useState(initialData.address || '');
  const [timezone, setTimezone] = useState('Europe/London');
  const [goals, setGoals] = useState('');

  // Medical data state - initialize from props
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);

  // Initialize medical data from props on mount
  useEffect(() => {
    console.log('Initial conditions from FHIR:', initialConditions);
    console.log('Initial medications from FHIR:', initialMedications);
    console.log('Initial allergies from FHIR:', initialAllergies);
    
    if (initialConditions && Array.isArray(initialConditions)) {
      setConditions([...initialConditions]);
    }
    if (initialMedications && Array.isArray(initialMedications)) {
      setMedications([...initialMedications]);
    }
    if (initialAllergies && Array.isArray(initialAllergies)) {
      setAllergies([...initialAllergies]);
    }
  }, [initialConditions, initialMedications, initialAllergies]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!gender || gender === 'unset') newErrors.gender = 'Gender is required';

    // Check age >= 18
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = Math.floor((today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) newErrors.dateOfBirth = 'Patient must be at least 18 years old';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSubmit({
      patient_data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        date_of_birth: dateOfBirth,
        gender: gender,
        phone_number: phoneNumber,
        address: address.trim(),
        timezone: timezone,
        picture: '',
      },
      conditions,
      medications,
      allergies,
      goals: goals.trim(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Review Patient Information</h2>
          <p className="text-sm text-gray-500">Review and edit the patient data before importing</p>
        </div>
      </div>

      {/* Patient Details Section */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Patient Details
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : ''}`}
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : ''}`}
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            <p className="text-xs text-gray-500 mt-1">Required for patient account login</p>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
            />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.gender ? 'border-red-500' : ''}`}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <PhoneInput
              country={'gb'}
              value={phoneNumber}
              onChange={(phone) => setPhoneNumber('+' + phone)}
              inputClass="!w-full !h-[42px] !pl-12 !border !rounded-lg"
              containerClass="!w-full"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <CustomTimezoneField
              value={timezone}
              onChange={(tz: string) => setTimezone(tz)}
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Enter patient's address"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Medical Information Section */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Medical Information (from FHIR)
        </h3>

        <div className="space-y-6">
          {/* Conditions */}
          <EditableTagList
            items={conditions}
            onItemsChange={setConditions}
            placeholder="Type a condition and press Enter or click Add..."
            colorClass="bg-purple-100 text-purple-800"
            label="Conditions / Diagnoses"
          />

          {/* Medications */}
          <EditableTagList
            items={medications}
            onItemsChange={setMedications}
            placeholder="Type a medication and press Enter or click Add..."
            colorClass="bg-blue-100 text-blue-800"
            label="Medications"
          />

          {/* Allergies */}
          <EditableTagList
            items={allergies}
            onItemsChange={setAllergies}
            placeholder="Type an allergy and press Enter or click Add..."
            colorClass="bg-red-100 text-red-800"
            label="Allergies"
          />

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Goals</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
              placeholder="Enter client's health goals..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center py-4 mt-4 border-t">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              Continue to Biomarkers
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FHIRPatientForm;
