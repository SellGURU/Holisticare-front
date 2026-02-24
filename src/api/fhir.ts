/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from './api';

// Type definitions for FHIR integration
export interface FHIRServer {
  id: number;
  clinic_id: number;
  name: string;
  base_url: string;
  auth_type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
  is_active: boolean;
  created_at: string;
}

export interface FHIRServerConfig {
  name: string;
  base_url: string;
  auth_type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
    api_key?: string;
    header_name?: string;
  };
}

export interface FHIRPatient {
  id: string;
  identifier: Array<{ system?: string; value?: string }>;
  name: Array<{ given?: string[]; family?: string }>;
  display_name: string;
  gender?: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  address: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

export interface FHIRObservation {
  id: string;
  status: string;
  display_name: string;
  loinc_code?: string;
  value: any;
  unit?: string;
  effective_date_time?: string;
  interpretation: any[];
  reference_range: any[];
  category: any[];
  code: any;
}

export interface FHIRCondition {
  id: string;
  display_name: string;
  status: string;
  snomed_code?: string;
  icd_code?: string;
  onset_date_time?: string;
  recorded_date?: string;
  category: any[];
  code: any;
}

export interface CleaningOptions {
  cutoff_months?: number;
  remove_duplicates?: boolean;
  filter_relevance?: boolean;
  include_unknown?: boolean;
}

export interface CleaningStats {
  original_count: number;
  final_count: number;
  total_removed: number;
  operations: Array<{
    operation: string;
    stats: any;
  }>;
}

export interface ImportResult {
  success: boolean;
  message?: string;
  results?: {
    patient_id: number;
    fhir_patient_id: string;
    observations?: {
      fetched: number;
      after_cleaning: number;
      mapped: number;
      imported: number;
      failed: number;
      cleaning_stats: CleaningStats;
      mapping_stats: any;
    };
    conditions?: {
      fetched: number;
      after_cleaning: number;
      mapped: number;
      imported: number;
      failed: number;
      cleaning_stats: CleaningStats;
      mapping_stats: any;
    };
  };
}

export interface ImportHistoryEntry {
  id: number;
  clinic_id: number;
  server_id: number;
  patient_id: number;
  resource_type: string;
  fhir_resource_id: string;
  import_status: string;
  cleaning_applied: any;
  imported_at: string;
}

class FHIRApi extends Api {
  // Server Management

  /**
   * Get all configured FHIR servers for the clinic
   */
  static getServers() {
    return this.get('/fhir/servers');
  }

  /**
   * Add a new FHIR server configuration
   */
  static addServer(config: FHIRServerConfig) {
    return this.post('/fhir/servers', config);
  }

  /**
   * Update an existing FHIR server configuration
   */
  static updateServer(
    serverId: number,
    updates: Partial<FHIRServerConfig> & { is_active?: boolean },
  ) {
    return this.post(`/fhir/servers/${serverId}`, updates);
  }

  /**
   * Delete (deactivate) a FHIR server configuration
   */
  static deleteServer(serverId: number) {
    return this.post(`/fhir/servers/${serverId}/delete`, {});
  }

  /**
   * Test connection to a FHIR server
   */
  static testServer(serverId: number) {
    return this.post(`/fhir/servers/${serverId}/test`, {});
  }

  // Patient Search

  /**
   * Search for patients on a FHIR server
   */
  static searchPatients(params: {
    server_id: number;
    name?: string;
    identifier?: string;
    birthdate?: string;
    gender?: string;
    count?: number;
    offset?: number;
  }) {
    return this.post('/fhir/search/patients', {
      server_id: params.server_id,
      name: params.name || null,
      identifier: params.identifier || null,
      birthdate: params.birthdate || null,
      gender: params.gender || null,
      count: params.count || 50,
      offset: params.offset || 0,
    });
  }

  /**
   * Get detailed information for a specific FHIR patient
   */
  static getPatient(serverId: number, fhirPatientId: string) {
    return this.get(`/fhir/patient/${fhirPatientId}?server_id=${serverId}`);
  }

  /**
   * Get data counts (observations, conditions) for multiple patients
   * Helps identify which patients have data before selecting them
   */
  static getPatientCounts(serverId: number, patientIds: string[]) {
    return this.post('/fhir/patients/counts', {
      server_id: serverId,
      patient_ids: patientIds,
    });
  }

  // Observation Search

  /**
   * Search for observations (lab results, vitals) on a FHIR server
   */
  static searchObservations(params: {
    server_id: number;
    patient_id: string;
    category?: string;
    code?: string;
    date_from?: string;
    date_to?: string;
    count?: number;
    offset?: number;
  }) {
    return this.post('/fhir/search/observations', {
      server_id: params.server_id,
      patient_id: params.patient_id,
      category: params.category || null,
      code: params.code || null,
      date_from: params.date_from || null,
      date_to: params.date_to || null,
      count: params.count || 100,
      offset: params.offset || 0,
    });
  }

  // Condition Search

  /**
   * Search for conditions (diagnoses) on a FHIR server
   */
  static searchConditions(params: {
    server_id: number;
    patient_id: string;
    clinical_status?: string;
    category?: string;
    onset_date_from?: string;
    count?: number;
    offset?: number;
  }) {
    return this.post('/fhir/search/conditions', {
      server_id: params.server_id,
      patient_id: params.patient_id,
      clinical_status: params.clinical_status || null,
      category: params.category || null,
      onset_date_from: params.onset_date_from || null,
      count: params.count || 100,
      offset: params.offset || 0,
    });
  }

  // Data Cleaning Preview

  /**
   * Preview cleaned FHIR data before import
   */
  static previewCleanedData(params: {
    server_id: number;
    fhir_patient_id: string;
    cleaning_options?: CleaningOptions;
  }) {
    return this.post('/fhir/preview/cleaned', {
      server_id: params.server_id,
      fhir_patient_id: params.fhir_patient_id,
      cleaning_options: params.cleaning_options || null,
    });
  }

  // Import

  /**
   * Import FHIR data into Holisticare
   */
  static importData(params: {
    server_id: number;
    fhir_patient_id: string;
    holisticare_patient_id?: number;
    create_patient_if_not_found?: boolean;
    import_observations?: boolean;
    import_conditions?: boolean;
    cleaning_options?: CleaningOptions;
  }) {
    return this.post('/fhir/import', {
      server_id: params.server_id,
      fhir_patient_id: params.fhir_patient_id,
      holisticare_patient_id: params.holisticare_patient_id || null,
      create_patient_if_not_found: params.create_patient_if_not_found || false,
      import_observations: params.import_observations !== false,
      import_conditions: params.import_conditions !== false,
      cleaning_options: params.cleaning_options || null,
    });
  }

  /**
   * Get FHIR import history
   */
  static getImportHistory(params?: {
    patient_id?: number;
    resource_type?: string;
    limit?: number;
  }) {
    let url = '/fhir/import/history';
    const queryParams: string[] = [];

    if (params?.patient_id) {
      queryParams.push(`patient_id=${params.patient_id}`);
    }
    if (params?.resource_type) {
      queryParams.push(`resource_type=${params.resource_type}`);
    }
    if (params?.limit) {
      queryParams.push(`limit=${params.limit}`);
    }

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }

    return this.get(url);
  }

  /**
   * Get LOINC to biomarker name mapping
   */
  static getLoincMapping() {
    return this.get('/fhir/loinc-mapping');
  }

  // New User-Controlled Import Flow

  /**
   * Prepare all FHIR data for user review before import
   * Returns patient demographics, conditions, medications, allergies, and biomarkers
   */
  static prepareImport(serverId: number, fhirPatientId: string) {
    return this.post('/fhir/prepare-import', {
      server_id: serverId,
      fhir_patient_id: fhirPatientId,
    });
  }

  /**
   * Import user-reviewed and edited FHIR data
   * Uses existing add_patient and biomarker processing pipelines
   */
  static importUserControlled(params: {
    patient_data: {
      first_name: string;
      last_name: string;
      email: string;
      date_of_birth: string;
      gender: string;
      phone_number?: string;
      address?: string;
      timezone?: string;
      picture?: string;
    };
    conditions: string[];
    medications: string[];
    allergies: string[];
    goals?: string;
    biomarkers: Array<{
      biomarker_id: string;
      biomarker: string;
      value: string;
      unit: string;
    }>;
    date_of_test?: string;
    holisticare_patient_id?: number;
    create_new_patient: boolean;
  }) {
    return this.post('/fhir/import/user-controlled', params);
  }

  /**
   * Create patient from FHIR data - returns member_id for validation
   * Step 1 of the new flow: Create patient first to get member_id
   */
  static createPatient(params: {
    patient_data: {
      first_name: string;
      last_name: string;
      email: string;
      date_of_birth: string;
      gender: string;
      phone_number?: string;
      address?: string;
      timezone?: string;
      picture?: string;
    };
    conditions: string[];
    medications: string[];
    allergies: string[];
    goals?: string;
  }) {
    return this.post('/fhir/create-patient', params);
  }

  /**
   * Validate FHIR biomarkers - doesn't require file_id like regular validate_biomarkers
   */
  static validateBiomarkers(params: {
    member_id: number;
    biomarkers: Array<{
      biomarker_id: string;
      biomarker: string;
      value: string;
      unit: string;
    }>;
    date_of_test?: string;
  }) {
    return this.post('/fhir/validate-biomarkers', params);
  }

  /**
   * Process biomarkers for existing patient - after validation passes
   * Step 3 of the new flow: Process biomarkers after validateBiomarkers passes
   */
  static processBiomarkers(params: {
    member_id: number;
    biomarkers: Array<{
      biomarker_id: string;
      biomarker: string;
      value: string;
      unit: string;
    }>;
    date_of_test?: string;
  }) {
    return this.post('/fhir/process-biomarkers', params);
  }
}

export default FHIRApi;

// Helper functions for FHIR data formatting

/**
 * Format a FHIR patient's name for display
 */
export function formatFHIRPatientName(patient: FHIRPatient): string {
  if (patient.display_name) {
    return patient.display_name;
  }
  if (patient.name && patient.name.length > 0) {
    const name = patient.name[0];
    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    return `${given} ${family}`.trim();
  }
  return `Patient/${patient.id}`;
}

/**
 * Format a date string for display
 */
export function formatFHIRDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

/**
 * Get default cleaning options
 */
export function getDefaultCleaningOptions(): CleaningOptions {
  return {
    cutoff_months: 12,
    remove_duplicates: true,
    filter_relevance: true,
    include_unknown: false,
  };
}

/**
 * Format observation value for display
 */
export function formatObservationValue(obs: FHIRObservation): string {
  if (obs.value === null || obs.value === undefined) {
    return 'N/A';
  }
  if (typeof obs.value === 'number') {
    const unit = obs.unit ? ` ${obs.unit}` : '';
    return `${obs.value}${unit}`;
  }
  return String(obs.value);
}

/**
 * Get interpretation color class
 */
export function getInterpretationColor(interpretation: any[]): string {
  if (!interpretation || interpretation.length === 0) {
    return 'text-gray-600';
  }
  const code = interpretation[0]?.coding?.[0]?.code?.toLowerCase() || '';
  if (code === 'h' || code === 'hh' || code === 'high') {
    return 'text-red-600';
  }
  if (code === 'l' || code === 'll' || code === 'low') {
    return 'text-blue-600';
  }
  if (code === 'n' || code === 'normal') {
    return 'text-green-600';
  }
  return 'text-gray-600';
}
