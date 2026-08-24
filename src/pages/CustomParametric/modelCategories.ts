export type ModelCategoryKey = 'risk' | 'age' | 'health' | 'parametric';

export const MODEL_CATEGORIES: Array<{
  key: ModelCategoryKey;
  tab: string;
  name: string;
  description: string;
  imageSrc: string;
}> = [
  {
    key: 'risk',
    tab: 'risk',
    name: 'Risk Assessments',
    description: 'Predictive risk scoring models',
    imageSrc:
      'https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/237f23b5-c258-4212-9768-773ab044f0e9/anthropic.webp',
  },
  {
    key: 'age',
    tab: 'aging',
    name: 'Age Clocks',
    description: 'Biological age estimation models',
    imageSrc:
      'https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/72fa6f8c-fd99-45ba-a417-9fabdc2611e3/anthropic.webp',
  },
  {
    key: 'health',
    tab: 'scoring',
    name: 'Health Scores',
    description: 'Composite health index models',
    imageSrc:
      'https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/fd3aafbb-d093-49aa-985c-bb280d2a4a96/anthropic.webp',
  },
  {
    key: 'parametric',
    tab: 'biomarkers',
    name: 'Parametric Biomarkers',
    description: 'Attach a formula to an existing catalog biomarker',
    imageSrc:
      'https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/237f23b5-c258-4212-9768-773ab044f0e9/anthropic.webp',
  },
];
