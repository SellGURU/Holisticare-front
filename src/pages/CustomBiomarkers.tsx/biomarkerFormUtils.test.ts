import { describe, expect, it } from 'vitest';
import { prepareBiomarkerForApi } from './biomarkerFormUtils';

describe('prepareBiomarkerForApi', () => {
  it('trims strings and fills Definition when empty', () => {
    const payload = prepareBiomarkerForApi(
      {
        Biomarker: '  HDL  ',
        'Benchmark areas': '  Lipids ',
        Definition: '   ',
        unit: ' mg/dL ',
        biomarker_type: 'blood',
        thresholds: { male: {}, female: {} },
      },
      'add',
    );

    expect(payload.Biomarker).toBe('HDL');
    expect(payload['Benchmark areas']).toBe('Lipids');
    expect(payload.unit).toBe('mg/dL');
    expect(payload.Definition).toBe('HDL');
    expect((payload as { source?: string }).source).toBe('Custom');
  });

  it('replaces invalid default threshold rows with backend-safe defaults', () => {
    const payload = prepareBiomarkerForApi(
      {
        Biomarker: 'Test Marker',
        'Benchmark areas': 'General',
        thresholds: {
          male: {
            '18-100': [
              {
                label: '',
                status: '',
                low: null,
                high: null,
                color: '',
              },
            ],
          },
          female: {},
        },
      },
      'add',
    );

    const maleRanges = payload.thresholds?.male?.['18-100'];
    expect(maleRanges?.length).toBe(1);
    expect(maleRanges?.[0].status).toBe('OptimalRange');
    expect(maleRanges?.[0].low).toBe(0);
    expect(maleRanges?.[0].high).toBe(100);
    expect(Object.keys(payload.thresholds?.female || {}).length).toBeGreaterThan(
      0,
    );
  });
});
