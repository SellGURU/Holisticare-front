/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import LeftItemContent from './LeftItemContent';
import RightItemContent from './RightItemContent';
import Application from '../../../api/app';
import { blobToBase64 } from '../../../help';
import Circleloader from '../../../Components/CircleLoader';

const CustomBrandingContent = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [customTheme, setCustomTheme] = useState({
    primaryColor: '#6CC24A',
    secondaryColor: '#005F73',
    selectedImage: null as string | null,
    name: '',
    headLine: '',
    lastUpdate: '',
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
      blobToBase64(file).then((resolve: any) => {
        updateCustomTheme('selectedImage', resolve);
      });
    }
  };
  const handleResetTheme = () => {
    setCustomTheme((prevTheme) => ({
      ...prevTheme,
      primaryColor: defaultPrimaryColor,
      secondaryColor: defaultSecondaryColor,
      headLine: '',
      selectedImage: null,
    }));
  };
  const getShowBrandInfo = () => {
    Application.getShowBrandInfo().then((res) => {
      setCustomTheme({
        headLine: res.data.brand_elements.headline,
        primaryColor:
          res.data.brand_elements.primary_color || defaultPrimaryColor,
        secondaryColor:
          res.data.brand_elements.secondary_color || defaultSecondaryColor,
        name: res.data.brand_elements.name,
        selectedImage: res.data.brand_elements.logo,
        lastUpdate: res.data.brand_elements.last_update,
      });
      setPageLoading(false);
    });
  };
  useEffect(() => {
    getShowBrandInfo();
  }, []);
  const [loading, setLoading] = useState(false);
  const onSave = () => {
    setLoading(true);
    if (customTheme.name) {
      const data: any = {
        logo: customTheme.selectedImage || '',
        name: customTheme.name,
        headline: customTheme.headLine,
        primary_color: customTheme.primaryColor,
        secondary_color: customTheme.secondaryColor,
      };
      Application.saveBrandInfo(data).then(() => {
        getShowBrandInfo();
        setLoading(false);
      });
    }
  };
  return (
    <>
      {pageLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )}
      <div className="flex items-center justify-between w-full h-[84vh] mt-6 pb-6">
        <LeftItemContent
          customTheme={customTheme}
          handleImageUpload={handleImageUpload}
          defaultPrimaryColor={defaultPrimaryColor}
          defaultSecondaryColor={defaultSecondaryColor}
          handleResetTheme={handleResetTheme}
          updateCustomTheme={updateCustomTheme}
          onSave={onSave}
          loading={loading}
        />
        <RightItemContent customTheme={customTheme} />
      </div>
    </>
  );
};

export default CustomBrandingContent;
