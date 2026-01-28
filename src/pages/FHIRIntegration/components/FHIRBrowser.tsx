import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FHIRApi, {
  FHIRServer,
  FHIRPatient,
  formatFHIRPatientName,
  formatFHIRDate,
} from '../../../api/fhir';
import Application from '../../../api/app';
import FHIRPatientForm from './FHIRPatientForm';
import BiomarkersSection from '../../../Components/RepoerAnalyse/UploadTestV2/BiomarkersSection';

interface FHIRBrowserProps {
  server: FHIRServer;
  onBack: () => void;
}

// Step types for the new 4-step flow
type Step = 'search' | 'patient-form' | 'biomarkers' | 'confirm';

interface PreparedData {
  patient: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    phone_number: string;
    address: string;
    fhir_id: string;
  };
  conditions: string[];
  medications: string[];
  allergies: string[];
  biomarkers: Array<{
    biomarker_id: string;
    biomarker: string;
    original_biomarker_name: string;
    value: string;
    unit: string;
    original_value: string;
    original_unit: string;
    loinc_code?: string;
    fhir_id?: string;
    effective_date?: string;
  }>;
  counts: {
    observations: number;
    conditions: number;
    medications: number;
    allergies: number;
  };
}

interface PatientFormData {
  patient_data: {
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth: string;
    gender: string;
    phone_number: string;
    address: string;
    timezone: string;
    picture: string;
  };
  conditions: string[];
  medications: string[];
  allergies: string[];
  goals: string;
}

const FHIRBrowser: React.FC<FHIRBrowserProps> = ({ server, onBack }) => {
  const [step, setStep] = useState<Step>('search');
  const [loading, setLoading] = useState(false);
  
  // Search state
  const [searchName, setSearchName] = useState('');
  const [searchIdentifier, setSearchIdentifier] = useState('');
  const [patients, setPatients] = useState<FHIRPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<FHIRPatient | null>(null);
  const [patientCounts, setPatientCounts] = useState<Record<string, { observations: number; conditions: number }>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [filterHasData, setFilterHasData] = useState(false);
  
  // Prepared data from FHIR
  const [preparedData, setPreparedData] = useState<PreparedData | null>(null);
  
  // Patient form data (user-edited)
  const [patientFormData, setPatientFormData] = useState<PatientFormData | null>(null);
  
  // Biomarkers (user-edited) - for BiomarkersSection
  const [biomarkers, setBiomarkers] = useState<any[]>([]);
  const [dateOfTest, setDateOfTest] = useState<Date | null>(new Date());
  const [isScaling, setIsScaling] = useState(true);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [biomarkersLoading, setBiomarkersLoading] = useState(false);
  
  // Created patient info (after step 2 confirmation)
  const [createdPatientId, setCreatedPatientId] = useState<number | null>(null);
  const [createdMemberId, setCreatedMemberId] = useState<number | null>(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  
  // Import result
  const [importResult, setImportResult] = useState<any>(null);
  
  // Saving state for biomarkers
  const [btnLoading, setBtnLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchName.trim() && !searchIdentifier.trim()) {
      toast.warning('Please enter a name or identifier to search');
      return;
    }

    setLoading(true);
    setPatientCounts({});
    try {
      const response = await FHIRApi.searchPatients({
        server_id: server.id,
        name: searchName.trim() || undefined,
        identifier: searchIdentifier.trim() || undefined,
      });

      if (response.data.success) {
        const foundPatients = response.data.patients || [];
        setPatients(foundPatients);
        if (foundPatients.length === 0) {
          toast.info('No patients found');
        } else {
          fetchPatientCounts(foundPatients.map((p: FHIRPatient) => p.id));
        }
      } else {
        toast.error(response.data.error || 'Search failed');
      }
    } catch (error: any) {
      console.error('Search failed:', error);
      toast.error(error.response?.data?.detail || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientCounts = async (patientIds: string[]) => {
    if (patientIds.length === 0) return;
    
    setLoadingCounts(true);
    try {
      const response = await FHIRApi.getPatientCounts(server.id, patientIds);
      if (response.data.success) {
        setPatientCounts(response.data.counts || {});
      }
    } catch (error) {
      console.error('Failed to fetch patient counts:', error);
    } finally {
      setLoadingCounts(false);
    }
  };

  const handleSelectPatient = async (patient: FHIRPatient) => {
    setSelectedPatient(patient);
    setLoading(true);
    
    try {
      // Fetch all FHIR data for this patient
      const response = await FHIRApi.prepareImport(server.id, patient.id);
      
      if (response.data.success) {
        setPreparedData(response.data);
        const fhirBiomarkers = response.data.biomarkers || [];
        
        // Set biomarkers directly - the BiomarkersSection component handles 
        // standardization internally when users edit values
        setBiomarkers(fhirBiomarkers);
        setStep('patient-form');
      } else {
        toast.error('Failed to fetch patient data');
      }
    } catch (error: any) {
      console.error('Failed to prepare import:', error);
      toast.error(error.response?.data?.detail || 'Failed to fetch patient data');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: When user submits patient form, show confirmation
  const handlePatientFormSubmit = (data: PatientFormData) => {
    setPatientFormData(data);
    setShowCreateConfirm(true);
  };

  // Step 2: After user confirms, create the patient
  const handleConfirmCreatePatient = async () => {
    if (!patientFormData) return;
    
    setLoading(true);
    setShowCreateConfirm(false);
    
    try {
      toast.info('Creating patient...');
      const createResponse = await FHIRApi.createPatient({
        patient_data: patientFormData.patient_data,
        conditions: patientFormData.conditions,
        medications: patientFormData.medications,
        allergies: patientFormData.allergies,
        goals: patientFormData.goals,
      });

      if (!createResponse.data.success) {
        throw new Error(createResponse.data.message || 'Failed to create patient');
      }

      // Store the created patient info
      setCreatedPatientId(createResponse.data.patients_id);
      setCreatedMemberId(createResponse.data.member_id);
      
      toast.success(`Patient "${patientFormData.patient_data.first_name} ${patientFormData.patient_data.last_name}" created successfully!`);
      
      // Move to biomarkers step
      setStep('biomarkers');
      
    } catch (error: any) {
      console.error('Failed to create patient:', error);
      toast.error(error.response?.data?.detail || error.message || 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  const handleBiomarkersNext = () => {
    setStep('confirm');
  };

  // Step 4: Save biomarkers (same flow as index.tsx)
  const handleSaveBiomarkers = async () => {
    if (!createdMemberId) {
      toast.error('Patient not created yet');
      return;
    }

    setBtnLoading(true);
    
    try {
      // Format date timestamp like index.tsx
      const dateTimestamp = dateOfTest 
        ? Date.UTC(dateOfTest.getFullYear(), dateOfTest.getMonth(), dateOfTest.getDate()).toString()
        : null;
      
      // Map biomarkers for validation
      const mappedBiomarkers = biomarkers.map(b => ({
        biomarker_id: b.biomarker_id,
        biomarker: b.biomarker,
        value: b.value || b.original_value || '',
        unit: b.unit || b.original_unit || '',
      }));

      // Call validateBiomarkers (same as index.tsx onSave)
      await Application.validateBiomarkers({
        modified_biomarkers_list: mappedBiomarkers,
        added_biomarkers_list: [],
        modified_biomarkers_date_of_test: dateTimestamp,
        added_biomarkers_date_of_test: dateTimestamp,
        modified_lab_type: 'more_info',
        modified_file_id: '',
        member_id: createdMemberId,
      });

      // Success - show result
      setImportResult({
        success: true,
        patient_id: createdPatientId,
        member_id: createdMemberId,
        conditions_count: patientFormData?.conditions.length || 0,
        medications_count: patientFormData?.medications.length || 0,
        allergies_count: patientFormData?.allergies.length || 0,
        biomarkers: { imported: mappedBiomarkers.length },
      });
      
      setRowErrors({});
      toast.success('Biomarkers saved successfully!');

    } catch (error: any) {
      console.error('Save failed:', error);
      
      // Parse validation errors like index.tsx
      const detail = error?.detail || error?.response?.data?.detail;
      if (detail) {
        let parsedDetail: any = {};
        if (typeof detail === 'string') {
          try {
            parsedDetail = JSON.parse(detail);
          } catch {
            toast.error(detail);
            setBtnLoading(false);
            return;
          }
        } else {
          parsedDetail = detail;
        }

        // Set row errors
        const modifiedErrors: Record<number, string> = {};
        parsedDetail.modified_biomarkers_list?.forEach((item: any) => {
          modifiedErrors[item.index] = item.detail;
        });

        if (Object.keys(modifiedErrors).length > 0) {
          setRowErrors(modifiedErrors);
          toast.error('Validation errors found. Please fix them and try again.');
        } else {
          toast.error(error.message || 'Failed to save biomarkers');
        }
      } else {
        toast.error(error.response?.data?.detail || error.message || 'Failed to save biomarkers');
      }
    } finally {
      setBtnLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'search', label: 'Search', number: 1 },
      { key: 'patient-form', label: 'Patient', number: 2 },
      { key: 'biomarkers', label: 'Biomarkers', number: 3 },
      { key: 'confirm', label: 'Import', number: 4 },
    ];
    
    const currentIndex = steps.findIndex(s => s.key === step);
    
    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${i < currentIndex ? 'bg-green-500 text-white' : ''}
                ${i === currentIndex ? 'bg-blue-600 text-white' : ''}
                ${i > currentIndex ? 'bg-gray-200 text-gray-500' : ''}
              `}>
                {i < currentIndex ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : s.number}
              </div>
              <span className={`ml-2 text-sm ${i === currentIndex ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${i < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderSearchStep = () => (
    <div className="space-y-6">
      {/* Tip for finding patients */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-medium text-amber-800">Tip: Finding Patients with Data</h4>
            <p className="text-sm text-amber-700 mt-1">
              On HAPI FHIR test server, try: <strong>smart</strong>, <strong>Chalmers</strong>, or <strong>example</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Search Patients</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g., smart, Chalmers, example"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identifier (MRN)</label>
            <input
              type="text"
              value={searchIdentifier}
              onChange={(e) => setSearchIdentifier(e.target.value)}
              placeholder="e.g., 12345"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      {patients.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-800">Found {patients.length} Patient(s)</h3>
              {loadingCounts && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading data counts...
                </span>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filterHasData}
                onChange={(e) => setFilterHasData(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-600">Show only patients with data</span>
            </label>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {patients
              .filter((patient) => {
                if (!filterHasData) return true;
                const counts = patientCounts[patient.id];
                return counts && (counts.observations > 0 || counts.conditions > 0);
              })
              .map((patient) => {
                const counts = patientCounts[patient.id];
                const hasData = counts && (counts.observations > 0 || counts.conditions > 0);
                
                return (
                  <div
                    key={patient.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${hasData ? 'bg-green-50/50' : ''}`}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{formatFHIRPatientName(patient)}</p>
                        {hasData && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Has Data
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {patient.gender} | DOB: {formatFHIRDate(patient.birth_date)} | ID: {patient.id}
                      </p>
                      {counts && (
                        <div className="flex gap-3 mt-1">
                          <span className={`text-xs ${counts.observations > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                            {counts.observations} observation{counts.observations !== 1 ? 's' : ''}
                          </span>
                          <span className={`text-xs ${counts.conditions > 0 ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                            {counts.conditions} condition{counts.conditions !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );

  const renderPatientFormStep = () => {
    if (!preparedData) return null;
    
    return (
      <>
        <FHIRPatientForm
          initialData={preparedData.patient}
          conditions={preparedData.conditions}
          medications={preparedData.medications}
          allergies={preparedData.allergies}
          onSubmit={handlePatientFormSubmit}
          onBack={() => setStep('search')}
          loading={loading}
        />
        
        {/* Confirmation Modal */}
        {showCreateConfirm && patientFormData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Patient Creation</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">You are about to create a new patient:</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {patientFormData.patient_data.first_name} {patientFormData.patient_data.last_name}</p>
                  <p><strong>Email:</strong> {patientFormData.patient_data.email}</p>
                  <p><strong>DOB:</strong> {patientFormData.patient_data.date_of_birth}</p>
                  <p><strong>Gender:</strong> {patientFormData.patient_data.gender}</p>
                  {patientFormData.conditions.length > 0 && (
                    <p><strong>Conditions:</strong> {patientFormData.conditions.length}</p>
                  )}
                  {patientFormData.medications.length > 0 && (
                    <p><strong>Medications:</strong> {patientFormData.medications.length}</p>
                  )}
                  {patientFormData.allergies.length > 0 && (
                    <p><strong>Allergies:</strong> {patientFormData.allergies.length}</p>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                This will create the patient in Holisticare. You can then review and import their biomarkers.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreateConfirm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreatePatient}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Create Patient
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderBiomarkersStep = () => (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Review Biomarkers</h2>
        <p className="text-sm text-gray-500">Edit biomarker names, values, and units before importing. Uses the same validation as Lab Data upload.</p>
      </div>

      {/* Info banner */}
      {biomarkers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-blue-700">
              <strong>{biomarkers.length} biomarker(s)</strong> loaded from FHIR. Review and edit the values below.
            </span>
          </div>
        </div>
      )}

      {/* BiomarkersSection or empty state */}
      <div>
        {biomarkers.length > 0 ? (
          <BiomarkersSection
            biomarkers={biomarkers}
            onChange={setBiomarkers}
            uploadedFile={{ file_id: `fhir-import-${Date.now()}`, status: 'completed' }}
            dateOfTest={dateOfTest}
            setDateOfTest={setDateOfTest}
            fileType="more_info"
            loading={biomarkersLoading}
            isScaling={isScaling}
            setIsScaling={setIsScaling}
            rowErrors={rowErrors}
            setrowErrors={setRowErrors}
            showOnlyErrors={showOnlyErrors}
            setShowOnlyErrors={setShowOnlyErrors}
            progressBiomarkerUpload={100}
          />
        ) : (
          <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">No biomarkers found from FHIR</p>
            <p className="text-sm mt-1">This patient doesn't have any observations in the FHIR server</p>
            <p className="text-sm mt-2">You can still continue to import the patient without biomarkers.</p>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-6 mt-6 border-t">
        <button
          onClick={() => setStep('patient-form')}
          className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleBiomarkersNext}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors"
        >
          Continue to Import
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderConfirmStep = () => {
    if (importResult) {
      return (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Import Successful!</h2>
            <p className="text-green-700">Patient data has been imported into Holisticare</p>
            
            <div className="mt-4 text-sm text-green-600">
              <p>Patient ID: {importResult.patient_id}</p>
              <p>Conditions: {importResult.conditions_count}</p>
              <p>Medications: {importResult.medications_count}</p>
              <p>Allergies: {importResult.allergies_count}</p>
              <p>Biomarkers: {importResult.biomarkers?.imported || 0}</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Save Biomarkers</h2>
            <p className="text-sm text-gray-500">Review the summary and save biomarkers to the patient's profile</p>
          </div>
        </div>

        {/* Patient Created Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-green-800">Patient Created Successfully</h4>
              <p className="text-sm text-green-700">
                {patientFormData?.patient_data.first_name} {patientFormData?.patient_data.last_name} ({patientFormData?.patient_data.email})
              </p>
            </div>
          </div>
        </div>

        {/* No biomarkers info */}
        {biomarkers.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800">No Biomarkers to Import</h4>
                <p className="text-sm text-yellow-700">
                  This FHIR patient has no observations/biomarkers. You can complete the import with just the patient information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Import Summary</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Patient Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {patientFormData?.patient_data.first_name} {patientFormData?.patient_data.last_name}</p>
                <p><strong>Email:</strong> {patientFormData?.patient_data.email}</p>
                <p><strong>DOB:</strong> {patientFormData?.patient_data.date_of_birth}</p>
                <p><strong>Gender:</strong> {patientFormData?.patient_data.gender}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Medical Data</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Conditions:</strong> {patientFormData?.conditions.length || 0}</p>
                <p><strong>Medications:</strong> {patientFormData?.medications.length || 0}</p>
                <p><strong>Allergies:</strong> {patientFormData?.allergies.length || 0}</p>
                <p><strong>Biomarkers to save:</strong> {biomarkers.length > 0 ? biomarkers.length : <span className="text-gray-400">None</span>}</p>
                {biomarkers.length > 0 && (
                  <p><strong>Date of Test:</strong> {dateOfTest?.toLocaleDateString() || 'Today'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center py-4 mt-4 border-t">
          <button
            onClick={() => setStep('biomarkers')}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Back
          </button>
          
          {biomarkers.length === 0 ? (
            // No biomarkers - show Done button
            <button
              onClick={() => {
                setImportResult({
                  success: true,
                  patient_id: createdPatientId,
                  member_id: createdMemberId,
                  conditions_count: patientFormData?.conditions.length || 0,
                  medications_count: patientFormData?.medications.length || 0,
                  allergies_count: patientFormData?.allergies.length || 0,
                  biomarkers: { imported: 0 },
                });
                toast.success('Patient import completed!');
              }}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Complete Import
            </button>
          ) : (
            // Has biomarkers - show Save Biomarkers button
            <button
              onClick={handleSaveBiomarkers}
              disabled={btnLoading}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 transition-colors"
            >
              {btnLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save Biomarkers
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">FHIR Data Browser</h1>
          <p className="text-sm text-gray-500">{server.name} - {server.base_url}</p>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Loading Overlay */}
      {loading && step === 'search' && (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {/* Step Content */}
      {!loading && step === 'search' && renderSearchStep()}
      {step === 'patient-form' && renderPatientFormStep()}
      {step === 'biomarkers' && renderBiomarkersStep()}
      {step === 'confirm' && renderConfirmStep()}
    </div>
  );
};

export default FHIRBrowser;
