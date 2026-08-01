/* eslint-disable @typescript-eslint/no-explicit-any */

const blobToBase64 = (blob: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const decodeAccessUser = (key: string) => {
  const data = [
    { name: 'Client Summary', checked: true },
    { name: 'Need Focus Biomarker', checked: true },
    { name: 'Concerning Result', checked: true },
    { name: 'Detailed Analysis', checked: true },
    { name: 'Holistic Plan', checked: true },
    { name: 'Action Plan', checked: true },
  ];

  return data.map((item) => {
    if (item.checked && isAccessNameAndKey(key, item.name)) {
      return { ...item, checked: true };
    } else {
      return { ...item, checked: false };
    }
  });
};

const decodeNameAndKey = (name: string) => {
  if (name == 'Client Summary') {
    return 'ZXCV';
  }
  if (name == 'Need Focus Biomarker') {
    return 'MNBB';
  }
  if (name == 'Concerning Result') {
    return 'OPIU';
  }
  if (name == 'Detailed Analysis') {
    return 'ASDF';
  }
  if (name == 'Holistic Plan') {
    return 'LKJH';
  }
  if (name == 'Action Plan') {
    return 'RTYU';
  }
};
const isAccessNameAndKey = (key: string, name: string) => {
  return key.includes(decodeNameAndKey(name) as string);
};

const splitInstructions = (instruction: string) => {
  const positiveMatch = instruction?.match(
    /Key Benefits:\s*(.+?)(?=\s*Key Risks:|$)/,
  );
  const negativeMatch = instruction?.match(/Key Risks:\s*(.+)/);
  return {
    positive: positiveMatch ? positiveMatch[1].trim() : '',
    negative: negativeMatch ? negativeMatch[1].trim() : '',
  };
};

const resolveCategoryName = (name: string) => {
  if (name == 'Medical Peptide Therapy') {
    return 'Peptide';
  }
  return name;
};

const resolveCategoryIcon = (category: string) => {
  switch (category) {
    case 'Diet':
      return '/icons/diet.svg';
    case 'Mind':
      return '/icons/mind.svg';
    case 'Activity':
      return '/icons/weight.svg';
    case 'Supplement':
      return '/icons/Supplement.svg';
    case 'Medical Peptide Therapy':
      return '/icons/peptidescolor.svg';
    case 'Lifestyle':
      return '/icons/LifeStyle2.svg';

    default:
      return '/icons/others.svg';
  }
};

export {
  resolveCategoryIcon,
  blobToBase64,
  decodeAccessUser,
  resolveCategoryName,
  splitInstructions,
};
