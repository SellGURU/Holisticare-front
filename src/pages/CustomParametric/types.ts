export type RiskDomainSource = 'Pre-defined' | 'Custom';

export interface RiskResultCategory {
  min?: number;
  max?: number;
  label?: string;
  color?: string;
}

export interface ClinicBiomarkerOption {
  biomarker_uid?: string | null;
  name: string;
  unit?: string;
  benchmark_area?: string;
  has_parametric?: boolean;
  selectable?: boolean;
}

export interface RiskDomainViewModel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string | null;
  iconKey: string;
  iconColor: string;
  domainType: string;
  outputType: string;
  formulaCode: string;
  clinicalDescription: string | null;
  biomarkers: string[];
  profileDeps: string[];
  contextDeps: string[];
  resultCategories: RiskResultCategory[];
  timeHorizon: string | null;
  assignedGroups: string[];
  isEnabled: boolean;
  isSystemDefault: boolean;
  source: RiskDomainSource;
  biomarkerCount: number;
  catalogBiomarkerUid: string | null;
  catalogStatus: string | null;
  catalogStatusLabel: string | null;
  catalogName: string | null;
  catalogUnit: string | null;
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      return asStringArray(JSON.parse(value));
    } catch {
      return [];
    }
  }
  return [];
}

export function mapHealthRiskDomain(raw: any): RiskDomainViewModel {
  const biomarkers = asStringArray(raw.biomarker_dependencies);
  return {
    id: String(raw.id),
    name: raw.name,
    displayName: raw.display_name || raw.name,
    description: raw.description || raw.clinical_description || '',
    category: raw.category ?? null,
    iconKey: raw.icon || 'Activity',
    iconColor: raw.icon_color || '#10B981',
    domainType: raw.domain_type,
    outputType: raw.output_type,
    formulaCode: raw.formula_code || '',
    clinicalDescription: raw.clinical_description ?? null,
    biomarkers,
    profileDeps: asStringArray(raw.profile_dependencies),
    contextDeps: asStringArray(raw.context_dependencies),
    resultCategories: Array.isArray(raw.result_categories)
      ? raw.result_categories
      : [],
    timeHorizon: raw.time_horizon ?? null,
    assignedGroups: asStringArray(raw.assigned_groups),
    isEnabled: raw.is_enabled ?? true,
    isSystemDefault: raw.is_system_default ?? false,
    source: raw.is_system_default ? 'Pre-defined' : 'Custom',
    biomarkerCount: raw.biomarker_count ?? biomarkers.length,
    catalogBiomarkerUid: raw.catalog_biomarker_uid ?? null,
    catalogStatus: raw.catalog_status ?? null,
    catalogStatusLabel: raw.catalog_status_label ?? null,
    catalogName: raw.catalog_name ?? null,
    catalogUnit: raw.catalog_unit ?? null,
  };
}
