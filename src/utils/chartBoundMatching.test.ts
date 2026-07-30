import { describe, expect, it } from 'vitest';
import {
  buildHistoricalBandLayout,
  findHistoricalBandLayoutEntry,
  findMatchingChartBoundIndex,
  getHistoricalPointY,
  resolveGlobalStatusPin,
  resolveStatusMarkerMode,
  sortChartBounds,
  type ChartBound,
} from './chartBoundMatching';

const glutathioneBounds: ChartBound[] = [
  { low: null, high: 0, status: 'DiseaseRange', label: 'Disease' },
  { low: 0, high: 1, status: 'BorderlineRange', label: 'Borderline' },
  { low: 1, high: null, status: 'OptimalRange', label: 'Optimal' },
  { low: 1, high: 1, status: 'HealthyRange', label: 'Healthy' },
];

const qualitativeBounds: ChartBound[] = [
  {
    low: 'negative',
    high: 'negative',
    status: 'OptimalRange',
    label: 'Negative',
  },
  { low: 'trace', high: 'trace', status: 'BorderlineRange', label: 'Trace' },
  {
    low: 'positive',
    high: 'positive',
    status: 'DiseaseRange',
    label: 'Positive',
  },
  { low: '1+', high: '4+', status: 'CriticalRange', label: 'High' },
];

describe('resolveStatusMarkerMode qualitative segment guard', () => {
  it('returns none for non-matched segments when value_kind is qualitative', () => {
    const status = ['OptimalRange'];
    const values = ['negative'];

    const modes = qualitativeBounds.map((bound, index) =>
      resolveStatusMarkerMode(
        bound,
        index,
        status,
        values,
        qualitativeBounds,
        'qualitative',
        0,
      ),
    );

    expect(modes.filter((mode) => mode !== 'none')).toHaveLength(1);
    expect(modes[0]).toBe('unique');
  });

  it('does not mark every segment inRange when status differs from matched bound', () => {
    const status = ['BorderlineRange'];
    const values = ['negative'];

    const modes = qualitativeBounds.map((bound, index) =>
      resolveStatusMarkerMode(
        bound,
        index,
        status,
        values,
        qualitativeBounds,
        'qualitative',
        0,
      ),
    );

    expect(modes.filter((mode) => mode !== 'none')).toHaveLength(1);
    expect(modes[0]).toBe('inRange');
  });
});

describe('resolveGlobalStatusPin', () => {
  it('returns exactly one pin for Glutathione 830 numeric off-scale ranges', () => {
    const pin = resolveGlobalStatusPin(
      ['OptimalRange'],
      ['830'],
      glutathioneBounds,
      'numeric',
      2,
    );

    expect(pin).not.toBeNull();
    expect(pin?.show).toBe(true);
    expect(pin?.segmentIndex).toBe(2);
    expect(pin?.mode).toBe('unique');
  });

  it('returns exactly one pin for qualitative urine-style bounds', () => {
    const pin = resolveGlobalStatusPin(
      ['OptimalRange'],
      ['negative'],
      qualitativeBounds,
      'qualitative',
      0,
    );

    expect(pin).not.toBeNull();
    expect(pin?.segmentIndex).toBe(0);
    expect(
      qualitativeBounds
        .map((bound, index) =>
          resolveStatusMarkerMode(
            bound,
            index,
            ['OptimalRange'],
            ['negative'],
            qualitativeBounds,
            'qualitative',
            0,
          ),
        )
        .filter((mode) => mode !== 'none'),
    ).toHaveLength(1);
  });

  it('returns null when value and status are missing', () => {
    expect(
      resolveGlobalStatusPin(
        undefined,
        undefined,
        glutathioneBounds,
        'numeric',
      ),
    ).toBeNull();
    expect(
      resolveGlobalStatusPin(
        ['OptimalRange'],
        [],
        glutathioneBounds,
        'numeric',
      ),
    ).toBeNull();
  });

  it('falls back to status segment when numeric value matches no bound', () => {
    const bounds: ChartBound[] = [
      { low: 0, high: 10, status: 'DiseaseRange', label: 'Low' },
      { low: 10, high: 20, status: 'HealthyRange', label: 'Mid' },
    ];
    const pin = resolveGlobalStatusPin(
      ['HealthyRange'],
      ['999'],
      bounds,
      'numeric',
    );

    expect(pin).not.toBeNull();
    expect(pin?.segmentIndex).toBe(1);
    expect(pin?.mode).toBe('unique');
  });

  it('findMatchingChartBoundIndex honors preferred index for backend matched_bound_index', () => {
    expect(findMatchingChartBoundIndex('830', glutathioneBounds, 2)).toBe(2);
  });
});

describe('historical chart layout', () => {
  const wideHealthyBand: ChartBound[] = [
    { low: 0, high: 10, status: 'DiseaseRange', label: 'Low' },
    { low: 10, high: 200, status: 'HealthyRange', label: 'Healthy' },
    { low: 200, high: 300, status: 'OptimalRange', label: 'Optimal' },
  ];

  it('assigns more vertical space to wider numeric bands', () => {
    const layout = buildHistoricalBandLayout(wideHealthyBand, 'numeric', 70);
    const healthy = layout.find((e) => e.bound.status === 'HealthyRange');
    const disease = layout.find((e) => e.bound.status === 'DiseaseRange');
    expect(healthy).toBeDefined();
    expect(disease).toBeDefined();
    expect(healthy!.height).toBeGreaterThan(disease!.height);
  });

  it('places different numeric values at different Y within the same band', () => {
    const layout = buildHistoricalBandLayout(wideHealthyBand, 'numeric', 70);
    const boundsAsc = sortChartBounds(wideHealthyBand, 'numeric');
    const y150 = getHistoricalPointY(150, 'HealthyRange', layout, boundsAsc, 'numeric');
    const y155 = getHistoricalPointY(155, 'HealthyRange', layout, boundsAsc, 'numeric');
    expect(y150).not.toBe(y155);
  });

  it('centers qualitative values in their band row', () => {
    const layout = buildHistoricalBandLayout(qualitativeBounds, 'qualitative', 70);
    const boundsAsc = sortChartBounds(qualitativeBounds, 'qualitative');
    const entry = findHistoricalBandLayoutEntry(
      'negative',
      'OptimalRange',
      layout,
      boundsAsc,
    );
    expect(entry).toBeDefined();
    const y = getHistoricalPointY(
      'negative',
      'OptimalRange',
      layout,
      boundsAsc,
      'qualitative',
    );
    expect(y).toBeCloseTo(entry!.top + entry!.height / 2, 5);
  });
});
