/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import LeftItemContent from './LeftItemContent';
import RightItemContent from './RightItemContent';

const CustomBrandingContent = () => {
  const [customTheme, setCustomTheme] = useState({
    primaryColor: '#6CC24A',
    secondaryColor: '#005F73',
    selectedImage: null as string | null,
    name: '',
    headLine: '',
  });
  const [defaultPrimaryColor] = useState('#6CC24A');
  const [defaultSecondaryColor] = useState('#005F73');
  const updateCustomTheme = (key: keyof typeof customTheme, value: any) => {
    setCustomTheme((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      updateCustomTheme('selectedImage', imageUrl);
    }
  };
  const handleResetTheme = () => {
    setCustomTheme({
      primaryColor: defaultPrimaryColor,
      secondaryColor: defaultSecondaryColor,
      name: '',
      headLine: '',
      selectedImage: null,
    });
  };
  return (
    <>
      <div className="flex items-center justify-between w-full h-[82vh] mt-6 mb-4">
        <LeftItemContent
          customTheme={customTheme}
          handleImageUpload={handleImageUpload}
          defaultPrimaryColor={defaultPrimaryColor}
          defaultSecondaryColor={defaultSecondaryColor}
          handleResetTheme={handleResetTheme}
          updateCustomTheme={updateCustomTheme}
        />
        <RightItemContent customTheme={customTheme} />
      </div>
    </>
  );
};

export default CustomBrandingContent;
