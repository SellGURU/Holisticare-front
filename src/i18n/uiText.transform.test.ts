import { describe, expect, it } from 'vitest';

import { formatClientSummarySubtitle } from '../Components/RepoerAnalyse/UploadTestV2/biomarkerCountCopy';
import { i18n } from './index';
import { phraseLanguage, uiText } from './uiText';
import { transformUiText } from '../../vite-plugin-ui-text';

describe('ui text transform', () => {
  it('translates visible text and leaves identifiers and component props alone', () => {
    const source = `
export function Demo({ title, item }: { title: string; item: { label: string } }) {
  const kept = "Health";
  return (
    <div title="Health">
      <span>Cancel</span>
      <input placeholder="Search" />
      <Card title="Health Planning Issues" />
      {title}
      {item.label}
      {item.subcategory}
      {kept === "Health" ? "Save" : "Edit"}
    </div>
  );
}
`;
    const transformed = transformUiText(source, 'Demo.tsx');
    expect(transformed).toContain('__uiText("Health")');
    expect(transformed).toContain('<__UiText value={"Cancel"} />');
    expect(transformed).toContain('__uiText("Search")');
    expect(transformed).toContain('<__UiText value={title} />');
    expect(transformed).toContain('<__UiText value={item.label} />');
    expect(transformed).toContain('<__UiText value={item.subcategory} />');
    expect(transformed).toContain('<__UiText value={"Save"} />');
    expect(transformed).toContain('<__UiText value={"Edit"} />');
    expect(transformed).toContain('const kept = "Health"');
    expect(transformed).toContain('kept === "Health"');
    expect(transformed).toContain('<Card title="Health Planning Issues" />');
    expect(transformed).toContain(
      "import { UiText as __UiText, uiText as __uiText } from '#ui-text';",
    );
  });

  it('keeps quotes inside a JavaScript expression so JSX still parses', () => {
    const source = `
export function Quoted({ questionType }: { questionType: string }) {
  return (
    <p>
      Question type "{questionType}" is not supported in this preview.
      <span>"Need Focus" Biomarkers</span>
    </p>
  );
}
`;
    const transformed = transformUiText(source, 'Quoted.tsx');
    expect(transformed).toContain('value={"Question type \\""}');
    expect(transformed).toContain('value={"\\"Need Focus\\" Biomarkers"}');
  });

  it('keeps units and tailwind text unchanged', () => {
    const source = `
export function Units() {
  return <div>mg/dL<span className="h-4 w-4">gr</span></div>;
}
`;
    expect(transformUiText(source, 'Units.tsx')).toBeNull();
  });
});

describe('phrase language', () => {
  it('maps region tags onto wave-1 languages and leaves English untouched', async () => {
    expect(phraseLanguage('fr-CA')).toBe('fr');
    expect(phraseLanguage('es-MX')).toBe('es');
    expect(phraseLanguage('ar-SA')).toBe('ar');
    expect(phraseLanguage('fa-IR')).toBe('fa');
    expect(phraseLanguage('en-GB')).toBe('en');
    expect(uiText('Cancel')).toBe('Cancel');
    expect(uiText(4)).toBe(4);
    await i18n.changeLanguage('es');
    expect(uiText('Cancel')).toBe('Cancelar');
    expect(uiText('Apply Changes')).toBe('Aplicar cambios');
    expect(uiText('Archived')).toBe('Archivados');
    expect(uiText('mg/dL')).toBe('mg/dL');
    expect(uiText('Not a catalogued sentence.')).toBe(
      'Not a catalogued sentence.',
    );
    await i18n.changeLanguage('fa');
    expect(uiText('Save')).toBe('ذخیره');
    expect(uiText('Apply Changes')).toBe('اعمال تغییرات');
    expect(uiText('High-Priority')).toBe('اولویت بالا');
    expect(uiText('Archived')).toBe('بایگانی');
    expect(uiText('Settings')).toBe('تنظیمات');
    expect(uiText('Settings')).not.toBe('الإعدادات');
    expect(uiText('Client summary')).toBe('خلاصه مراجع');
    expect(uiText('Urine Test Parameters')).toBe('پارامترهای آزمایش ادرار');
    expect(uiText('"Need Focus"')).toBe('«نیازمند توجه»');
    expect(formatClientSummarySubtitle(22, 2)).toBe(
      '22 نشانگر حیاتی در 2 دسته',
    );
    await i18n.changeLanguage('en');
    expect(formatClientSummarySubtitle(22, 2)).toBe(
      '22 biomarkers in 2 categories',
    );
  });
});
