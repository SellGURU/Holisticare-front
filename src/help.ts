/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

const useConstructor = (callBack = () => {}) => {
  const [hasBeenCalled, setHasBeenCalled] = useState(false);
  if (hasBeenCalled) {
    return;
  }
  callBack();
  setHasBeenCalled(true);
};

const blobToBase64 = (blob: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const resolveAccesssUser = (access: Array<any>) => {
  let keyText = '';
  access
    .filter((el) => el.checked == true)
    .forEach((el) => {
      keyText = keyText + decodeNameAndKey(el.name);
    });
  return keyText;
};
const decodeAccessUser = (key: string) => {
  const data = [
    { name: 'Client Summary', checked: true },
    { name: 'Needs Focus Biomarker', checked: true },
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
  if (name == 'Needs Focus Biomarker') {
    return 'MNBB';
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

export { useConstructor, blobToBase64, resolveAccesssUser, decodeAccessUser };
