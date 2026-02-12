// constants.ts
export type JsonType =
  | 'more_info'
  | 'categories'
  | 'unit_mapping'
  | 'biomarker_mapping';

export const JSON_TYPE_LABELS: Record<JsonType, string> = {
  more_info: 'More Info (more_info_rules.json)',
  categories: 'Categories (benchmark areas.json)',
  unit_mapping: 'Unit Mapping (unit_mapping.json)',
  biomarker_mapping: 'Biomarker Mapping (biomarker_mapping.json)',
};

export const TEMPLATES: Record<JsonType, any> = {
  categories: [{ name: '', position: '', description: '' }],
  more_info: [
    {
      'Benchmark areas': '',
      Biomarker: '',
      Definition: '',
      unit: '',
      thresholds: {},
      source: '',
      update_source: '',
      'show_in_maual_entry ': true,
    },
  ],
  unit_mapping: {
    unit_conversions: {},
    common_prefixes: {},
    case_sensitive_units: [],
    common_unit_aliases: {},
    biomarker_specific: [],
  },
  biomarker_mapping: {
    mappings: [], // ✅ empty by default
  },
};
