export type LibraryDomainType = 'RISK' | 'SCORING' | 'AGING';

export type FormulaLibraryTemplate = {
  id: string;
  domain_type: LibraryDomainType | string;
  name: string;
  display_name: string;
  description?: string;
  category?: string | null;
  formula_code: string;
  biomarker_dependencies: string[];
  catalog_ok: boolean;
  missing_biomarkers: string[];
  already_imported: boolean;
  icon?: string;
  icon_color?: string;
  error_message?: string | null;
};

export function splitLibraryByDomainType<T extends { domain_type: string }>(
  templates: T[],
): { risk: T[]; score: T[]; age: T[] } {
  return {
    risk: templates.filter((item) => item.domain_type === 'RISK'),
    score: templates.filter((item) => item.domain_type === 'SCORING'),
    age: templates.filter((item) => item.domain_type === 'AGING'),
  };
}
