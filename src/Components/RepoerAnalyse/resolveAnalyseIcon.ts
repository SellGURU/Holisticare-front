const resolveAnalyseIcon = (name: string) => {
  if (name == 'Blood Health') {
    return '/icons/biomarkers/red-blood-cells.svg';
  }
  if (name == 'Blood') {
    return '/icons/biomarkers/heart.svg';
  }
  if (name == 'Bone and Mineral Health') {
    return '/icons/biomarkers/bones.svg';
  }
  if (name == 'Liver Health') {
    return '/icons/biomarkers/kidney.svg';
  }
  if (name == 'Cardiovascular Health') {
    return '/icons/biomarkers/heart.svg';
  }
  if (name == 'Metabolism and Energy') {
    return '/icons/biomarkers/metabolism.svg';
  }
  if (name == 'Vitamins & Minerals') {
    return '/icons/biomarkers/vitamins.svg';
  }
  if (name == 'Vitamins') {
    return '/icons/biomarkers/vitamins.svg';
  }
  if (name == 'Inflammation & Coagulation') {
    return '/icons/biomarkers/inflammation.svg';
  }
  if (name == 'Trace Essential Minerals') {
    return '/icons/biomarkers/Urine.svg';
  }
  if (name == 'Kidney Health') {
    return '/icons/biomarkers/kidney.svg';
  }

  if (name == 'Metabolic Health') {
    return '/icons/biomarkers/Abdominal.svg';
  }
  if (name == 'Major Essential Minerals') {
    return '/icons/biomarkers/Abdominal.svg';
  }
  if (name == 'Immune System Health') {
    return '/icons/biomarkers/Cells.svg';
  }
  // "./images/report/vitamine.svg",
  // :"./images/report/bone.svg",
  // ./images/report/heart_rate_02.svg
  //  "icon":"./images/report/heart.svg",
  // "icon":"./images/report/kidney.svg",
  // "./images/report/readBlod.svg",
  // ./images/report/abdomil.svg",
  return '/icons/biomarkers/red-blood-cells.svg';
};

export default resolveAnalyseIcon;
