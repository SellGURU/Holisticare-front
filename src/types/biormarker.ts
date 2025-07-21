// src/types/biomarker.ts

import * as yup from 'yup';

// --- API Data Structures (What your backend expects) ---
export interface ApiThresholdRange {
  label: string;
  status: string;
  low: number | null;
  high: number | null;
  color: string | null;
}

export interface ApiThresholds {
  male?: Record<string, ApiThresholdRange[]>; // Object with dynamic keys
  female?: Record<string, ApiThresholdRange[]>; // Object with dynamic keys
}

export interface ApiBiomarkerData {
  'Benchmark areas': string;
  Biomarker: string;
  Definition?: string;
  unit?: string;
  thresholds?: {
    male?: Record<string, ApiThresholdRange[]>;
    female?: Record<string, ApiThresholdRange[]>;
  };
}

// --- Form Data Structures (What react-hook-form will manage) ---
// This uses arrays for age ranges to work with useFieldArray
export interface FormAgeRangeThreshold {
  ageRange: string;
  ranges: ApiThresholdRange[]; // Reuses the API's range structure
}

export interface FormThresholds {
  ageRange: string;
  ranges: ApiThresholdRange[];
}

export interface FormBiomarkerData {
  'Benchmark areas': string;
  Biomarker: string;
  Definition?: string;
  unit?: string;
  thresholds?: {
    male?: FormThresholds[];
    female?: FormThresholds[];
  };
}

// --- Yup Schemas for Form Data ---
export const thresholdRangeSchema = yup.object().shape({
  label: yup.string().required('Label is required'),
  status: yup.string().required('Status is required'),
  // Ensure default(null) is used for optional nullable numbers
  low: yup.number().nullable().default(null).notRequired(),
  high: yup.number().nullable().default(null).notRequired(),
  color: yup.string().notRequired().default(''), // Ensure default for strings
});

export const ageRangeThresholdSchema = yup.object().shape({
  ageRange: yup.string().required('Age range is required (e.g., 18-100)'),
  ranges: yup
    .array(thresholdRangeSchema)
    .min(1, 'At least one range threshold is required for this age group')
    .required(),
});

export const formBiomarkerSchema = yup.object().shape({
  'Benchmark areas': yup.string().required('Benchmark area is required'),
  Biomarker: yup.string().required('Biomarker name is required'),
  Definition: yup.string().notRequired().default(''), // Default empty string for optional strings
  unit: yup.string().notRequired().default(''), // Default empty string for optional strings
  thresholds: yup
    .object()
    .shape({
      male: yup
        .array(ageRangeThresholdSchema)
        .nullable()
        .notRequired()
        .default(null), // Default null for optional arrays
      female: yup
        .array(ageRangeThresholdSchema)
        .nullable()
        .notRequired()
        .default(null), // Default null for optional arrays
    })
    .nullable()
    .notRequired()
    .default(null), // Default null for optional object
});
