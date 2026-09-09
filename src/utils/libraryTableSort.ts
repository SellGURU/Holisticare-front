export const LIBRARY_SORT_LABELS: Record<string, string> = {
  title_asc: 'Title (A → Z)',
  title_desc: 'Title (Z → A)',
  instruction_asc: 'Instruction (A → Z)',
  instruction_desc: 'Instruction (Z → A)',
  recommendation_asc: 'Recommendation (A → Z)',
  recommendation_desc: 'Recommendation (Z → A)',
  dose_asc: 'Dose (Low → High)',
  dose_desc: 'Dose (High → Low)',
  value_asc: 'Value (Low → High)',
  value_desc: 'Value (High → Low)',
  fda_asc: 'FDA Status (A → Z)',
  fda_desc: 'FDA Status (Z → A)',
  type_asc: 'Type (A → Z)',
  type_desc: 'Type (Z → A)',
  macros_asc: 'Macros Goal (Low → High)',
  macros_desc: 'Macros Goal (High → Low)',
  section_asc: 'Section (A → Z)',
  section_desc: 'Section (Z → A)',
  priority_asc: 'Priority Weight (Low → High)',
  priority_desc: 'Priority Weight (High → Low)',
  guidance_asc: 'Clinical Guidance (A → Z)',
  guidance_desc: 'Clinical Guidance (Z → A)',
  added_desc: 'Added on (Newest first)',
  added_asc: 'Added on (Oldest first)',
};

export function toggleLibrarySort(current: string, column: string): string {
  if (column === 'added') {
    return current === 'added_desc' ? 'added_asc' : 'added_desc';
  }
  if (current === `${column}_asc`) return `${column}_desc`;
  return `${column}_asc`;
}

export function isLibrarySortColumn(sortId: string, column: string): boolean {
  return sortId === `${column}_asc` || sortId === `${column}_desc`;
}

export function isLibrarySortDesc(sortId: string): boolean {
  return sortId.endsWith('_desc');
}

export function sortColumnFromHeader(header: unknown): string | null {
  switch (header) {
    case 'Subject':
      return 'title';
    case 'Instruction':
      return 'instruction';
    case 'Recommendation':
      return 'recommendation';
    case 'Dose':
      return 'dose';
    case 'Value':
      return 'value';
    case 'FDA Status':
      return 'fda';
    case 'Type':
      return 'type';
    case 'Macros Goal':
      return 'macros';
    case 'Section':
      return 'section';
    case 'Priority Weight':
      return 'priority';
    case 'Clinical Guidance':
      return 'guidance';
    case 'Added on':
      return 'added';
    default:
      return null;
  }
}

function compareText(a: unknown, b: unknown): number {
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, {
    sensitivity: 'base',
  });
}

function parseNum(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function parseDate(value: unknown): number {
  if (!value) return 0;
  const t = new Date(value as string).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function getLibraryAddedDate(item: any): number {
  return parseDate(
    item['Added on'] ??
      item['Added On'] ??
      item.AddedOn ??
      item.CreatedAt ??
      item.Created,
  );
}

function macrosTotal(item: any): number {
  const macros = item['Total Macros'] || {};
  return (
    parseNum(macros.Carbs) + parseNum(macros.Protein) + parseNum(macros.Fats)
  );
}

function sectionsText(item: any): string {
  const sections = item.Sections;
  if (Array.isArray(sections)) return sections.join(' ');
  return String(sections ?? '');
}

export function sortLibraryRows<T>(rows: T[], sortId: string): T[] {
  const data = [...rows];
  const direction = sortId.endsWith('_desc') ? -1 : 1;
  const column = sortId.replace(/_asc$|_desc$/, '');

  data.sort((a: any, b: any) => {
    let cmp = 0;
    switch (column) {
      case 'title':
        cmp = compareText(a.Title, b.Title);
        break;
      case 'instruction':
        cmp = compareText(a.Instruction, b.Instruction);
        break;
      case 'recommendation':
        cmp = compareText(a.Recommendation, b.Recommendation);
        break;
      case 'dose':
        cmp = parseNum(a.Dose ?? a.Dosage) - parseNum(b.Dose ?? b.Dosage);
        break;
      case 'value':
        cmp = parseNum(a.Value) - parseNum(b.Value);
        break;
      case 'fda':
        cmp = compareText(a.Fda_status, b.Fda_status);
        break;
      case 'type':
        cmp = compareText(a.Type, b.Type);
        break;
      case 'macros':
        cmp = macrosTotal(a) - macrosTotal(b);
        break;
      case 'section':
        cmp = compareText(sectionsText(a), sectionsText(b));
        break;
      case 'priority':
        cmp =
          parseNum(a.Base_Score ?? a.PriorityWeight ?? a.Priority ?? a.Weight) -
          parseNum(b.Base_Score ?? b.PriorityWeight ?? b.Priority ?? b.Weight);
        break;
      case 'guidance':
        cmp = compareText(a.Ai_note, b.Ai_note);
        break;
      case 'added':
        cmp = getLibraryAddedDate(a) - getLibraryAddedDate(b);
        break;
      default:
        return 0;
    }
    return cmp * direction;
  });

  return data;
}

export function getLibrarySortOptions(
  pageType: string,
): { id: string; label: string }[] {
  const columns: string[] = ['title', 'instruction'];
  if (pageType !== 'Exercise') columns.push('recommendation');
  if (pageType === 'Supplement') columns.push('dose');
  if (pageType === 'Lifestyle') columns.push('value');
  if (pageType === 'Peptide') columns.push('fda');
  if (pageType === 'Other') columns.push('type');
  if (pageType === 'Diet') columns.push('macros');
  if (pageType === 'Activity') columns.push('section');
  columns.push('priority');
  if (pageType !== 'Exercise') columns.push('guidance');
  columns.push('added');

  const options: { id: string; label: string }[] = [];
  for (const column of columns) {
    if (column === 'added') {
      options.push({
        id: 'added_desc',
        label: LIBRARY_SORT_LABELS.added_desc,
      });
      options.push({
        id: 'added_asc',
        label: LIBRARY_SORT_LABELS.added_asc,
      });
      continue;
    }
    options.push({
      id: `${column}_asc`,
      label: LIBRARY_SORT_LABELS[`${column}_asc`],
    });
    options.push({
      id: `${column}_desc`,
      label: LIBRARY_SORT_LABELS[`${column}_desc`],
    });
  }
  return options;
}
