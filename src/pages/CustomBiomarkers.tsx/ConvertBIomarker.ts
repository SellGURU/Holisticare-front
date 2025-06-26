type Threshold = [number, number];

interface StatusCondition {
  condition: string;
  threshold: Threshold;
}

interface StatusMap {
  [key: string]: StatusCondition;
}

interface AgeGroup {
  gender: string;
  min_age: number;
  max_age: number;
  status: StatusMap;
}

interface BiomarkerInput {
  unit: string;
  Category: string;
  Biomarker: string;
  Definition: string;
  age_groups: AgeGroup[];
  'Benchmark areas': string;
  label_mapping_chart: {
    [key: string]: string;
  };
}

interface OutputStatusRange {
  range: Threshold[];
  label: string;
}

interface OutputChartBounds {
  [key: string]: OutputStatusRange;
}

interface OutputAgeGroup {
  min_age: number;
  max_age: number;
  gender: string;
  unit: string;
  values: string[];
  status: string[];
  chart_bounds: OutputChartBounds;
}

interface OutputBiomarker {
  Biomarker: string;
  age_groups: OutputAgeGroup[];
}

interface FinalOutput {
  'Benchmark areas': string;
  biomarkers: OutputBiomarker[];
}

function transformData(data: BiomarkerInput[]): FinalOutput[] {
  return data.map((item) => {
    const biomarker: OutputBiomarker = {
      Biomarker: item.Biomarker,
      age_groups: item.age_groups.map((group) => {
        const chart_bounds: OutputChartBounds = {};

        for (const statusKey in group.status) {
          const threshold = group.status[statusKey].threshold;
          chart_bounds[statusKey] = {
            range: [threshold],
            label: item.label_mapping_chart[statusKey] || 'Unknown',
          };
        }

        return {
          min_age: group.min_age,
          max_age: group.max_age,
          gender: group.gender,
          unit: item.unit || '',
          values: ['unset'],
          status: ['unset'],
          chart_bounds,
        };
      }),
    };

    return {
      'Benchmark areas': item['Benchmark areas'],
      biomarkers: [biomarker],
    };
  });
}

export default transformData;
