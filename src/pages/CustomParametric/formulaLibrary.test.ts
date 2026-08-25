import { describe, expect, it } from 'vitest';
import { splitLibraryByDomainType } from './formulaLibrary';

describe('splitLibraryByDomainType', () => {
  it('splits Risk vs Score templates by domain_type', () => {
    const split = splitLibraryByDomainType([
      { id: 'risk.cardiovascular', domain_type: 'RISK' },
      { id: 'score.glycemic', domain_type: 'SCORING' },
      { id: 'score.lipid', domain_type: 'SCORING' },
      { id: 'risk.liver', domain_type: 'RISK' },
    ]);
    expect(split.risk.map((item) => item.id)).toEqual([
      'risk.cardiovascular',
      'risk.liver',
    ]);
    expect(split.score.map((item) => item.id)).toEqual([
      'score.glycemic',
      'score.lipid',
    ]);
    expect(split.age.map((item) => item.id)).toEqual([]);
  });

  it('splits Age Clock templates', () => {
    const split = splitLibraryByDomainType([
      { id: 'age.phenoage', domain_type: 'AGING' },
      { id: 'score.glycemic', domain_type: 'SCORING' },
    ]);
    expect(split.age.map((item) => item.id)).toEqual(['age.phenoage']);
    expect(split.score.map((item) => item.id)).toEqual(['score.glycemic']);
  });
});
