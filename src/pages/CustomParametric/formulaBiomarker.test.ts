import { describe, expect, it } from 'vitest';
import {
  catalogNameToToken,
  extractBiomarkerTokens,
  insertBiomarkerToken,
  shouldOfferBiomarkerSuggestions,
  toInsertableBiomarkers,
  tokenMatchesCatalogName,
  unknownBiomarkerTokens,
} from './formulaBiomarker';

describe('formulaBiomarker', () => {
  it('turns spaced catalog names into formula tokens', () => {
    expect(catalogNameToToken('Body Mass Index')).toBe('Body_Mass_Index');
    expect(catalogNameToToken('LDL')).toBe('LDL');
  });

  it('matches Body_Mass_Index to Body Mass Index', () => {
    expect(tokenMatchesCatalogName('Body_Mass_Index', 'Body Mass Index')).toBe(
      true,
    );
    expect(tokenMatchesCatalogName('Weight', 'Weight')).toBe(true);
  });

  it('extracts biomarker tokens from a formula', () => {
    expect(
      extractBiomarkerTokens(
        'round(Biomarker.Weight / ((Biomarker.Height / 100) ** 2), 2)',
      ),
    ).toEqual(['Weight', 'Height']);
  });

  it('flags typos and names missing from the catalog', () => {
    const catalog = ['Weight', 'Height', 'Body Mass Index'];
    expect(
      unknownBiomarkerTokens('Biomarker.Weigth / Biomarker.Height', catalog),
    ).toEqual(['Weigth']);
    expect(unknownBiomarkerTokens('Biomarker.Glucose', catalog)).toEqual([
      'Glucose',
    ]);
    expect(
      unknownBiomarkerTokens(
        'Biomarker.Weight / Biomarker.Height',
        catalog,
      ),
    ).toEqual([]);
  });

  it('treats Height and Weight as reserved even if omitted from catalog', () => {
    expect(unknownBiomarkerTokens('Biomarker.Height + Biomarker.Weight', [])).toEqual(
      [],
    );
  });

  it('replaces a partial Biomarker. prefix at the caret', () => {
    const formula = 'round(Biomarker.We';
    const result = insertBiomarkerToken(formula, formula.length, 'Weight');
    expect(result.next).toBe('round(Biomarker.Weight');
  });

  it('hides suggestions after a biomarker name is complete', () => {
    const items = toInsertableBiomarkers([]);
    const filled =
      'round(Biomarker.Weight / ((Biomarker.Height/ 100) ** 2), 2)';
    const afterHeight = filled.indexOf('Height') + 'Height'.length;
    expect(shouldOfferBiomarkerSuggestions(filled, afterHeight, items)).toBe(
      false,
    );
    expect(shouldOfferBiomarkerSuggestions('Biomarker.', 11, items)).toBe(true);
    expect(shouldOfferBiomarkerSuggestions('Biomarker.Hei', 14, items)).toBe(
      true,
    );
  });

  it('keeps suggestions when a longer catalog name still matches', () => {
    const items = toInsertableBiomarkers([
      { name: 'Aspartic Acid' },
      { name: 'Aspartic Acid Urine' },
    ]);
    expect(
      shouldOfferBiomarkerSuggestions('Biomarker.Aspartic_Acid', 24, items),
    ).toBe(true);
  });
});
